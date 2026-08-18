output "cloudfront_domain_name" {
  description = "Domain name distribusi CloudFront (Akses Web Utama)"
  value       = aws_cloudfront_distribution.cf_distribution.domain_name
}

output "ec2_frontend_public_ip" {
  description = "Public IP EC2 Frontend (untuk SSH / GitHub Actions)"
  value       = aws_instance.ec2_frontend.public_ip
}

output "ec2_frontend_private_ip" {
  description = "Private IP EC2 Frontend di VPC Frontend"
  value       = aws_instance.ec2_frontend.private_ip
}

output "ec2_backend_public_ip" {
  description = "Public IP EC2 Backend (untuk SSH / GitHub Actions)"
  value       = aws_instance.ec2_backend.public_ip
}

output "ec2_backend_private_ip" {
  description = "Private IP EC2 Backend di VPC Backend"
  value       = aws_instance.ec2_backend.private_ip
}

output "rds_endpoint" {
  description = "Endpoint Database RDS / Aurora (Private)"
  value       = aws_db_instance.klinik_db.endpoint
}

output "vpc_ids" {
  description = "ID dari ketiga VPC yang dibuat"
  value = {
    frontend = aws_vpc.vpc_frontend.id
    backend  = aws_vpc.vpc_backend.id
    database = aws_vpc.vpc_database.id
  }
}

output "peering_connection_ids" {
  description = "ID VPC Peering Connections"
  value = {
    frontend_to_backend = aws_vpc_peering_connection.peering_frontend_backend.id
    backend_to_database = aws_vpc_peering_connection.peering_backend_database.id
  }
}
