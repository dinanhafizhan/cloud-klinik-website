variable "aws_region" {
  description = "AWS Region untuk deployment"
  type        = string
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Nama prefix project untuk penamaan resource"
  type        = string
  default     = "klinikpemweb"
}

# --- CIDR Blocks ---
variable "vpc_frontend_cidr" {
  description = "CIDR block untuk VPC Frontend"
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnet_frontend_cidr" {
  description = "CIDR block untuk Subnet Frontend"
  type        = string
  default     = "10.0.1.0/24"
}

variable "vpc_backend_cidr" {
  description = "CIDR block untuk VPC Backend"
  type        = string
  default     = "10.1.0.0/16"
}

variable "subnet_backend_cidr" {
  description = "CIDR block untuk Subnet Backend"
  type        = string
  default     = "10.1.1.0/24"
}

variable "vpc_database_cidr" {
  description = "CIDR block untuk VPC Database"
  type        = string
  default     = "10.2.0.0/16"
}

variable "subnet_db_priv_1_cidr" {
  description = "CIDR block untuk Subnet DB Private 1 (AZ A)"
  type        = string
  default     = "10.2.1.0/24"
}

variable "subnet_db_priv_2_cidr" {
  description = "CIDR block untuk Subnet DB Private 2 (AZ B)"
  type        = string
  default     = "10.2.2.0/24"
}

# --- Compute (EC2) ---
variable "instance_type" {
  description = "Tipe instance EC2"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "Nama SSH Key Pair AWS EC2"
  type        = string
  default     = "klinik-keypair"
}

# --- Database (RDS / Aurora MySQL) ---
variable "db_instance_class" {
  description = "Tipe instance RDS Database"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Nama database MySQL"
  type        = string
  default     = "klinik"
}

variable "db_username" {
  description = "Username master database"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "Password master database"
  type        = string
  sensitive   = true
  default     = "KlinikSecurePassword123!"
}

# --- Docker & Apps ---
variable "dockerhub_username" {
  description = "Username DockerHub untuk image pulling"
  type        = string
  default     = "ariilalhafizh"
}

variable "gemini_api_key" {
  description = "Google Gemini API Key untuk AI Assistant Chatbot"
  type        = string
  sensitive   = true
  default     = ""
}

# --- GCP Cloud Storage ---
variable "gcp_project_id" {
  description = "Project ID Google Cloud Platform"
  type        = string
  default     = "klinik-cloud-storage"
}

variable "gcp_bucket_name" {
  description = "Nama Bucket GCP Cloud Storage"
  type        = string
  default     = "klinik-storage-bucket-app"
}
