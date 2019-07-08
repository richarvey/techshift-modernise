+++
title= "The Labs"
description= ""
draft = false
weight = -110
+++

### The labs

The modernise labs are intended to guide you through AWS products and services that will allow your business to deliver its own services to your customers in a smooth and streamlined way whilst minimising the overhead of running large scale systems, through operational excellence and efficiency. The content is split into two main sections:

- Theory
- Labs

The theory sections are designed to quickly introduce or remind you of core concepts and products from AWS in modern cloud applications. If you feel confident with those topics feel free to read ahead.

The labs are hands on sessions in which you will put the theory to use in practice and deploy a full solution through a series of iterative AWS CloudFormation templates.

#### Layout of documents

The site is designed to hightlight code blocks in a simple way. They are shown as below:

```
This is a code block

```

Important information is highlighted as __Notes:__

Lists are defined as:

- item 1
- item 2
- etc.....

### First deployment

In this workshop we are going to iteratively build a photo gallery solution. We will start out with a simple application built on EC2 as a monolith and then break it down into a more cloud ready application that can be deployed easily. The initial architecture is pretty simple:

![/img/arch/arch1.png](/img/arch/arch1.png)

### Target Architecture

Over the course of the labs and over the two days we will split out the application components, such as the database, static assets and key functions. We will then use a modern cloud approach to solving these solutions by integrating services such as Amazon Aurora, Amazon S3 + Amazon CloudFront and AWS Lambda. This will all be built using tools for source control, AWS CodeCommit and a Code Pipeline using AWS CodePipeline to build a CI/CD solution. The final architecture towards a microservices architecture and modern cloud deployment.

![/img/arch/arch8.png](/img/arch/arch8.png)
