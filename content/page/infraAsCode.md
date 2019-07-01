+++
title= "Infrastructure as Code"
description= ""
draft = false
weight = -107
+++

### What is Infrastructure as Code?

Infrastructure as code (IaC) is the process of managing and provisioning computer resources through machine-readable definition files. There are a few cloud native systems for deploying computer resources such as terraform and AWS CloudFormation. The definitions should be in a version control system such as git. In this workshop we'll be focusing on AWS CloudFormation.

#### Why is it a good idea?

IaC allows you to make repeatable environments, if you template your code correctly its often simple to deploy a new environment that exactly matches another, albeit with a different name. This allows you build dev/test/qa environments in a way that you know match your production environment, thus minamising the variables when releasing new software.

### What is CloudFormation?

AWS CloudFormation provides a common language for you to describe and provision all the infrastructure resources in your cloud environment. CloudFormation allows you to use a simple text file to model and provision, in an automated and secure manner, all the resources needed for your applications across all regions and accounts. This file serves as the single source of truth for your cloud environment.

AWS CloudFormation is available at no additional charge, and you pay only for the AWS resources needed to run your applications. 

### How it works

![/img/infraAsCode-1.png](/img/infraAsCode-1.png)

### Benefits

#### Model it all

AWS CloudFormation allows you to model your entire infrastructure in a text file. This template becomes the single source of truth for your infrastructure. This helps you to standardize infrastructure components used across your organization, enabling configuration compliance and faster troubleshooting. 

#### Automate and deploy

AWS CloudFormation provisions your resources in a safe, repeatable manner, allowing you to build and rebuild your infrastructure and applications, without having to perform manual actions or write custom scripts. CloudFormation takes care of determining the right operations to perform when managing your stack, and rolls back changes automatically if errors are detected. 

#### It's just code

Codifying your infrastructure allows you to treat your infrastructure as just code. You can author it with any code editor, check it into a version control system, and review the files with team members before deploying into production. 

