output "ec2_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.web.public_ip
}

output "ssh_command" {
  description = "SSH command to connect to the EC2 instance"
  value       = "ssh -i ~/Downloads/week3-terraform-key.pem ec2-user@${aws_instance.web.public_ip}"
}

output "vpc_id" {
  description = "ID of the Terraform-managed VPC"
  value       = aws_vpc.main.id
}
