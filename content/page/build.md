+++
title= "The Labs"
description= ""
draft = false
weight = -110
+++

### The labs

The modernise lab's are intended to guide you through AWS products and services that will allow your business to deliver its services to your customers in a smooth and streamlined way whilst minimising the overhead of running large scale systems, through operational excellence and efficieny. They are split into two main sections:

- Theory
- Labs

The theory sections are designed to quickly introduce or remind you of core concepts and products from AWS in modern cloud applications. If you feel confident with those topics feel free to read ahead.

The labs are hands on sessions in which you'll put the tehory to use and deploy through itterative cloudformation templates a full solution.

#### Layout of documents

The site is designed to hightlight code blocks in a simple way. They are shown as below:

```
This is a code block

```

Important informationis highlighted as __Notes:__

Lists are defined as:

- item 1
- item 2
- etc.....

### First deployment

In this workshop we are going to build an ittrative approach to a photo gallery solution. We'll start out with a simple application built on EC2 as a monolith and then break it down into a more cloud ready approach that can be deployed easily. The initial architecture is pretty simple:

![/img/arch/arch1.png](/img/arch/arch1.png)

### Target Architecture

Over the course of the labs and over the two days we'll split out the application components, such as the database, static assets and key functions. We'll then use a modern cloud approach to solving these solutions by integrating services such as Amazon Aurora, S3 + CloudFront and Lambda. This will all be built using tools for source control (CodeCommit) and a CodePipeline to build a CI/CD solution. The final architecture moves us more towards a microservices architecture and mordern cloud deployment.

![/img/arch/arch8.png](/img/arch/arch8.png)
