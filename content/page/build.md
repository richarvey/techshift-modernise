+++
title= "The build"
description= ""
draft = false
weight = -110
+++
### First deployment

In this workshop we are going to build an ittrative approach to a photo gallery solution. We'll start out with a simple application built on EC2 as a monolith and then break it down into a more cloud ready approach that can be deployed easily. The initial architecture is pretty simple:

![/img/arch/arch1.png](/img/arch/arch1.png)

### Target Architecture

Over the course of the labs and over the two days we'll split out the application components, such as the database, static assets and key functions. We'll then use a modern cloud approach to solving these solutions by integrating services such as Amazon Aurora, S3 + CloudFront and Lambda. This will all be built using tools for source control (CodeCommit) and a CodePipeline to build a CI/CD solution. The final architecture moves us more towards a microservices architecture and mordern cloud deployment.

![/img/arch/arch8.png](/img/arch/arch8.png)
