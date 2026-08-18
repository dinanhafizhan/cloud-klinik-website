terraform {
  required_version = ">= 1.3.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ==============================================================================
# DATA SOURCES
# ==============================================================================
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
  owners = ["099720109477"] # Canonical
}

# ==============================================================================
# 1. VPC FRONTEND (Layer Presentasi)
# ==============================================================================
resource "aws_vpc" "vpc_frontend" {
  cidr_block           = var.vpc_frontend_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-vpc-frontend"
    Environment = "production"
    Tier        = "frontend"
  }
}

resource "aws_subnet" "subnet_frontend" {
  vpc_id                  = aws_vpc.vpc_frontend.id
  cidr_block              = var.subnet_frontend_cidr
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-subnet-frontend"
    Tier = "public-frontend"
  }
}

resource "aws_internet_gateway" "igw_frontend" {
  vpc_id = aws_vpc.vpc_frontend.id

  tags = {
    Name = "${var.project_name}-igw-frontend"
  }
}

# ==============================================================================
# 2. VPC BACKEND (Layer Aplikasi / Bisnis)
# ==============================================================================
resource "aws_vpc" "vpc_backend" {
  cidr_block           = var.vpc_backend_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-vpc-backend"
    Environment = "production"
    Tier        = "backend"
  }
}

resource "aws_subnet" "subnet_backend" {
  vpc_id                  = aws_vpc.vpc_backend.id
  cidr_block              = var.subnet_backend_cidr
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-subnet-backend"
    Tier = "app-backend"
  }
}

resource "aws_internet_gateway" "igw_backend" {
  vpc_id = aws_vpc.vpc_backend.id

  tags = {
    Name = "${var.project_name}-igw-backend"
  }
}

# ==============================================================================
# 3. VPC DATABASE (Layer Database - Terisolasi Private)
# ==============================================================================
resource "aws_vpc" "vpc_database" {
  cidr_block           = var.vpc_database_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-vpc-database"
    Environment = "production"
    Tier        = "database"
  }
}

resource "aws_subnet" "subnet_db_priv_1" {
  vpc_id                  = aws_vpc.vpc_database.id
  cidr_block              = var.subnet_db_priv_1_cidr
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = false

  tags = {
    Name = "${var.project_name}-subnet-db-priv-1"
    Tier = "private-db-a"
  }
}

resource "aws_subnet" "subnet_db_priv_2" {
  vpc_id                  = aws_vpc.vpc_database.id
  cidr_block              = var.subnet_db_priv_2_cidr
  availability_zone       = data.aws_availability_zones.available.names[1]
  map_public_ip_on_launch = false

  tags = {
    Name = "${var.project_name}-subnet-db-priv-2"
    Tier = "private-db-b"
  }
}

resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [aws_subnet.subnet_db_priv_1.id, aws_subnet.subnet_db_priv_2.id]

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# ==============================================================================
# 4. VPC PEERING CONNECTIONS
# ==============================================================================
# Peering 1: Frontend <-> Backend
resource "aws_vpc_peering_connection" "peering_frontend_backend" {
  vpc_id      = aws_vpc.vpc_frontend.id
  peer_vpc_id = aws_vpc.vpc_backend.id
  auto_accept = true

  tags = {
    Name = "${var.project_name}-peering-frontend-backend"
  }
}

# Peering 2: Backend <-> Database
resource "aws_vpc_peering_connection" "peering_backend_database" {
  vpc_id      = aws_vpc.vpc_backend.id
  peer_vpc_id = aws_vpc.vpc_database.id
  auto_accept = true

  tags = {
    Name = "${var.project_name}-peering-backend-database"
  }
}

# ==============================================================================
# 5. ROUTE TABLES & ASSOCIATIONS
# ==============================================================================
# Route Table Frontend: 0.0.0.0/0 -> IGW Frontend, 10.1.0.0/16 -> Peering Backend
resource "aws_route_table" "rt_frontend" {
  vpc_id = aws_vpc.vpc_frontend.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw_frontend.id
  }

  route {
    cidr_block                = var.vpc_backend_cidr
    vpc_peering_connection_id = aws_vpc_peering_connection.peering_frontend_backend.id
  }

  tags = {
    Name = "${var.project_name}-rt-frontend"
  }
}

resource "aws_route_table_association" "rta_frontend" {
  subnet_id      = aws_subnet.subnet_frontend.id
  route_table_id = aws_route_table.rt_frontend.id
}

# Route Table Backend: 0.0.0.0/0 -> IGW Backend, 10.0.0.0/16 -> Peering Frontend, 10.2.0.0/16 -> Peering DB
resource "aws_route_table" "rt_backend" {
  vpc_id = aws_vpc.vpc_backend.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw_backend.id
  }

  route {
    cidr_block                = var.vpc_frontend_cidr
    vpc_peering_connection_id = aws_vpc_peering_connection.peering_frontend_backend.id
  }

  route {
    cidr_block                = var.vpc_database_cidr
    vpc_peering_connection_id = aws_vpc_peering_connection.peering_backend_database.id
  }

  tags = {
    Name = "${var.project_name}-rt-backend"
  }
}

resource "aws_route_table_association" "rta_backend" {
  subnet_id      = aws_subnet.subnet_backend.id
  route_table_id = aws_route_table.rt_backend.id
}

# Route Table Database: 10.1.0.0/16 -> Peering Backend (TIDAK ADA AKSES INTERNET / NO IGW)
resource "aws_route_table" "rt_database" {
  vpc_id = aws_vpc.vpc_database.id

  route {
    cidr_block                = var.vpc_backend_cidr
    vpc_peering_connection_id = aws_vpc_peering_connection.peering_backend_database.id
  }

  tags = {
    Name = "${var.project_name}-rt-database"
  }
}

resource "aws_route_table_association" "rta_db_1" {
  subnet_id      = aws_subnet.subnet_db_priv_1.id
  route_table_id = aws_route_table.rt_database.id
}

resource "aws_route_table_association" "rta_db_2" {
  subnet_id      = aws_subnet.subnet_db_priv_2.id
  route_table_id = aws_route_table.rt_database.id
}

# ==============================================================================
# 6. NETWORK ACLs (NACL)
# ==============================================================================
resource "aws_network_acl" "nacl_frontend" {
  vpc_id     = aws_vpc.vpc_frontend.id
  subnet_ids = [aws_subnet.subnet_frontend.id]

  # Allow all inbound
  ingress {
    rule_no    = 100
    protocol   = "-1"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 0
    to_port    = 0
  }

  # Allow all outbound
  egress {
    rule_no    = 100
    protocol   = "-1"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 0
    to_port    = 0
  }

  tags = {
    Name = "${var.project_name}-nacl-frontend"
  }
}

resource "aws_network_acl" "nacl_backend" {
  vpc_id     = aws_vpc.vpc_backend.id
  subnet_ids = [aws_subnet.subnet_backend.id]

  ingress {
    rule_no    = 100
    protocol   = "-1"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 0
    to_port    = 0
  }

  egress {
    rule_no    = 100
    protocol   = "-1"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 0
    to_port    = 0
  }

  tags = {
    Name = "${var.project_name}-nacl-backend"
  }
}

resource "aws_network_acl" "nacl_database" {
  vpc_id     = aws_vpc.vpc_database.id
  subnet_ids = [aws_subnet.subnet_db_priv_1.id, aws_subnet.subnet_db_priv_2.id]

  # Allow inbound MySQL dari Backend VPC
  ingress {
    rule_no    = 100
    protocol   = "tcp"
    action     = "allow"
    cidr_block = var.vpc_backend_cidr
    from_port  = 3306
    to_port    = 3306
  }

  # Allow outbound return traffic ke Backend VPC
  egress {
    rule_no    = 100
    protocol   = "tcp"
    action     = "allow"
    cidr_block = var.vpc_backend_cidr
    from_port  = 1024
    to_port    = 65535
  }

  tags = {
    Name = "${var.project_name}-nacl-database"
  }
}

# ==============================================================================
# 7. SECURITY GROUPS (SG)
# ==============================================================================
# Security Group Frontend
resource "aws_security_group" "sg_frontend" {
  name        = "${var.project_name}-sg-frontend"
  description = "Security Group untuk EC2 Frontend (Web Tier)"
  vpc_id      = aws_vpc.vpc_frontend.id

  # HTTP
  ingress {
    description = "Allow HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    description = "Allow HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # SSH
  ingress {
    description = "Allow SSH Administration"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound ke mana saja (termasuk VPC Backend via Peering)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg-frontend"
  }
}

# Security Group Backend
resource "aws_security_group" "sg_backend" {
  name        = "${var.project_name}-sg-backend"
  description = "Security Group untuk EC2 Backend (API Tier)"
  vpc_id      = aws_vpc.vpc_backend.id

  # Inbound API traffic dari VPC Frontend
  ingress {
    description = "Allow HTTP / API dari VPC Frontend"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [var.vpc_frontend_cidr]
  }

  ingress {
    description = "Allow port 5000 dari VPC Frontend"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = [var.vpc_frontend_cidr]
  }

  # SSH
  ingress {
    description = "Allow SSH Administration"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound All (Database, GCP Storage, Gemini AI, DockerHub)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg-backend"
  }
}

# Security Group Database
resource "aws_security_group" "sg_database" {
  name        = "${var.project_name}-sg-database"
  description = "Security Group untuk RDS / Aurora Database"
  vpc_id      = aws_vpc.vpc_database.id

  # MySQL Port 3306 HANYA dari VPC Backend (TIDAK BISA DARI FRONTEND ATAU INTERNET)
  ingress {
    description = "Allow MySQL Port 3306 HANYA dari VPC Backend"
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = [var.vpc_backend_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg-database"
  }
}

# ==============================================================================
# 8. DATABASE (AWS RDS MySQL / Aurora: klinik-db)
# ==============================================================================
resource "aws_db_instance" "klinik_db" {
  identifier             = "${var.project_name}-db"
  allocated_storage      = 20
  max_allocated_storage  = 50
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = var.db_instance_class
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.sg_database.id]
  skip_final_snapshot    = true
  publicly_accessible    = false

  tags = {
    Name = "${var.project_name}-db"
  }
}

# ==============================================================================
# 9. EC2 INSTANCES (Frontend & Backend)
# ==============================================================================
# EC2 Frontend
resource "aws_instance" "ec2_frontend" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = var.key_name
  subnet_id                   = aws_subnet.subnet_frontend.id
  vpc_security_group_ids      = [aws_security_group.sg_frontend.id]
  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker.io docker-compose-v2
              systemctl enable docker
              systemctl start docker
              usermod -aG docker ubuntu

              mkdir -p /home/ubuntu/cloud-klinik-website/frontend
              cat > /home/ubuntu/cloud-klinik-website/docker-compose.yml << 'COMPOSE'
              services:
                frontend:
                  image: ${var.dockerhub_username}/klinikpemweb-frontend:latest
                  container_name: klinikpemweb_frontend
                  ports:
                    - "80:3000"
                  restart: always
              COMPOSE
              docker compose -f /home/ubuntu/cloud-klinik-website/docker-compose.yml up -d
              EOF

  tags = {
    Name = "${var.project_name}-ec2-frontend"
    Role = "frontend"
  }
}

# EC2 Backend
resource "aws_instance" "ec2_backend" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = var.key_name
  subnet_id                   = aws_subnet.subnet_backend.id
  vpc_security_group_ids      = [aws_security_group.sg_backend.id]
  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker.io docker-compose-v2
              systemctl enable docker
              systemctl start docker
              usermod -aG docker ubuntu

              mkdir -p /home/ubuntu/cloud-klinik-website/Backend
              cat > /home/ubuntu/cloud-klinik-website/Backend/.env << 'ENVFILE'
              PORT=5000
              DB_HOST=${aws_db_instance.klinik_db.address}
              DB_USER=${var.db_username}
              DB_PASSWORD=${var.db_password}
              DB_NAME=${var.db_name}
              DB_DIALECT=mysql
              GEMINI_API_KEY=${var.gemini_api_key}
              GCP_PROJECT_ID=${var.gcp_project_id}
              GCP_BUCKET_NAME=${var.gcp_bucket_name}
              GCP_KEY_FILE_PATH=/app/gcs-key.json
              ENVFILE

              cat > /home/ubuntu/cloud-klinik-website/docker-compose.yml << 'COMPOSE'
              services:
                backend:
                  image: ${var.dockerhub_username}/klinikpemweb-backend:latest
                  container_name: klinikpemweb_backend
                  ports:
                    - "80:5000"
                  restart: always
                  volumes:
                    - ./Backend/gcs-key.json:/app/gcs-key.json
                  env_file:
                    - ./Backend/.env
              COMPOSE
              EOF

  tags = {
    Name = "${var.project_name}-ec2-backend"
    Role = "backend"
  }

  depends_on = [aws_db_instance.klinik_db]
}

# ==============================================================================
# 10. AMAZON CLOUDFRONT DISTRIBUTION
# ==============================================================================
resource "aws_cloudfront_distribution" "cf_distribution" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CloudFront Distribution untuk Klinik Pemweb"
  default_root_object = "index.html"

  # Origin 1: Frontend EC2
  origin {
    domain_name = aws_instance.ec2_frontend.public_dns != "" ? aws_instance.ec2_frontend.public_dns : aws_instance.ec2_frontend.public_ip
    origin_id   = "EC2-Frontend-Origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Origin 2: Backend EC2
  origin {
    domain_name = aws_instance.ec2_backend.public_dns != "" ? aws_instance.ec2_backend.public_dns : aws_instance.ec2_backend.public_ip
    origin_id   = "EC2-Backend-Origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Default Cache Behavior (Frontend Static & SPA)
  default_cache_behavior {
    target_origin_id       = "EC2-Frontend-Origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
    compress    = true
  }

  # Ordered Cache Behavior 1: Path /api/* diarahkan ke Backend
  ordered_cache_behavior {
    path_pattern           = "/api/*"
    target_origin_id       = "EC2-Backend-Origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = true
      headers      = ["*"]
      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
    compress    = true
  }

  # Ordered Cache Behavior 2: Path /auth/* diarahkan ke Backend
  ordered_cache_behavior {
    path_pattern           = "/auth/*"
    target_origin_id       = "EC2-Backend-Origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = true
      headers      = ["*"]
      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
    compress    = true
  }

  # SPA Routing Handler: Return 200 index.html for 404 / 403
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${var.project_name}-cloudfront"
  }
}
