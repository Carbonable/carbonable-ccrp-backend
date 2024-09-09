# Create an organization per client to encapsulate application resources
# and have a better billing control
#resource "aws_organizations_organization" "org" {
#  aws_service_access_principals = [
#    "cloudwatch.amazonaws.com",
#    "cloudtrail.amazonaws.com",
#    "s3.amazonaws.com",
#    "rds.amazonaws.com",
#    "eb.awmazonaws.com",
#    "ec2.amazonaws.com",
#    "route53.amazonaws.com",
#    "sqs.amazonaws.com",
#    "ssm.amazonaws.com",
#  ]
#
#  feature_set = "ALL"
#}
