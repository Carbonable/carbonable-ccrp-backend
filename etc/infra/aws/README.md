# CCRP - Infrastructure as Code

[Getting Started with Terraform & AWS](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

First you need to install :

- [ ] Terraform
- [ ] AWS CLI

Connect to [AWS IAM console](https://us-east-1.console.aws.amazon.com/iam/home?region=eu-west-3#/home) and create an account for cli usage named `carbonable_deployer`
Connect to [Github.com](https://github.com/settings/tokens) and create a new access token **with admin:hooks** roles(required to create amplify app for frontend to work) **TOKEN HAS TO BE CREATED BY ORG ADMIN**
Add this token to the `.tfvars` file

Then under `Users > Security Credentials` create new access key and configure them with the access key id and secret access key they give you.

```bash
aws configure --profile carbonable_deployer
```

Create the backend bucket :

```bash
aws s3api create-bucket --bucket carbonable-deployments-backends --region eu-west-3  --profile carbonable_deployer
```

Init backend :

```bash
AWS_PROFILE=carbonable_deployer terraform init -backend-config=${client}.backend-config.tfvars
```

Update backend : (when you changes infrastructure files)

```bash
AWS_PROFILE=carbonable_deployer terraform plan -var-file=${client}.tfvars
AWS_PROFILE=carbonable_deployer terraform apply -var-file=${client}.tfvars
```

When applying changes to `src` directory will trigger a new build of docker version. Applying terraform changes will subsequently trigger a new deploy of the application.

```bash
AWS_PROFILE=carbonable_deployer terraform apply -var-file=${client}.tfvars
```

### Logging

Application logs are available in the AWS CloudWatch console under `/aws/elasticbeanstalk/{client}-{env}-eb-environment/var/log/eb-docker/containers/eb-current-app/stdouterr.log` log group
Also keep in mind that you can access all the logs of the deployment / container creation under `Elastic Beanstalk > Environment > Logs > Request logs (full)` and download the bundle

### Considerations

When updating infrastructure configuration files, you may need to update zip files by hand, as this may not be taken in account in the apply command.
For further configuration of the Elastic Beanstalk environment you may want to read the following section.

### Extend AWS Elastic Beanstalk environment

Check informations described here : [https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/platforms-linux-extend.html](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/platforms-linux-extend.html)

- <https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/environments-cfg-softwaresettings.html>
- <https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_docker.container.console.html>
- <https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/ebextensions.html>
- <https://github.com/awsdocs/elastic-beanstalk-samples/tree/main/configuration-files>

### AWS EB cli

Install eb cli :

```bash
brew install awsebcli
```

Init env :

```bash
eb init
```

and follow the instructions
