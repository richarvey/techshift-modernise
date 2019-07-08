+++
title= "Introduction to Docker"
description= ""
draft = false
weight = -97
+++

### What is Docker?

Docker is a container run time engine. That means it is a way of packaging up Binaries, Libs, Dependencies, Configuration and Code into a package that runs anywhere docker is installed. It uses the system kernel unlike traditional virtual machines so there is no hypervisor, which makes it incredibly lightweight and fast to start as there is no hardware emulation.

The diagram below highlights that the docker image is smaller than a virtual machine because a virtual machine has to boot an entire guest OS, this is one reason for dockers' speed over virtual machines. As they are quick to start this makes them ideal for scaling your application.

![/img/docker.png](/img/docker.png)

Docker provides a standard way to run your applications this makes them portable. It allows you to develop locally on your laptop and then run in production with confidence that they will just work. It removes the age old barrier of development vs operations and "it works on my machine" which creates a smoother working environment.

#### Why use Docker

Using Docker lets you ship code faster, standardise application operations, seamlessly move code, and save money by improving resource utilisation. With Docker, you get a single object that can reliably run anywhere. Docker's simple and straightforward syntax gives you full control. Wide adoption means there's a robust ecosystem of tools and off-the-shelf applications that are ready to use with Docker.

![/img/docker-1.pg](/img/docker-1.png)

##### Ship More Software Faster

Docker users on average ship software 7x more frequently than non-Docker users. Docker enables you to ship isolated services as often as needed.

##### Standardize Operations

Small containerised applications make it easy to deploy, identify issues, and roll back for remediation.

##### Seamlessly Move

Docker-based applications can be seamlessly moved from local development machines to production deployments on AWS.

##### Save Money

Docker containers make it easier to run more code on each server, improving your utilisation and saving you money.

#### When to use Docker

You can use Docker containers as a core building block creating modern applications and platforms. Docker makes it easy to build and run distributed microservices architecures, deploy your code with standardized continuous integration and delivery pipelines, build highly-scalable data processing systems, and create fully-managed platforms for your developers.

![/img/docker-2.pg](/img/docker-2.png)

### Storing Docker images

In order to distribute docker images to many machines you need to use a docker registry. This stores the layered file system and references allowing the docker tools to download and run the image. AWS has a private docker registry called ECR.

#### Amazon ECR

Amazon Elastic Container Registry (ECR) is a fully-managed Docker container registry that makes it easy for developers to store, manage, and deploy Docker container images. Amazon ECR is integrated with Amazon Elastic Container Service (ECS), simplifying your development to production workflow. Amazon ECR eliminates the need to operate your own container repositories or worry about scaling the underlying infrastructure. Amazon ECR hosts your images in a highly available and scalable architecture, allowing you to reliably deploy containers for your applications. Integration with AWS Identity and Access Management (IAM) provides resource-level control of each repository. With Amazon ECR, there are no upfront fees or commitments. You pay only for the amount of data you store in your repositories and data transferred to the Internet.

#### Benefits

##### Fully managed

Amazon Elastic Container Registry eliminates the need to operate and scale the infrastructure required to power your container registry. There is no software to install and manage or infrastructure to scale. Just push your container images to Amazon ECR and pull the images using any container management tool when you need to deploy.

##### Secure

Amazon Elastic Container Registry transfers your container images over HTTPS and automatically encrypts your images at rest. You can configure policies to manage permissions and control access to your images using AWS Identity and Access Management (IAM) users and roles without having to manage credentials directly on your EC2 instances.

##### Highly available

Amazon Elastic Container Registry has a highly scalable, redundant, and durable architecture. Your container images are highly available and accessible, allowing you to reliably deploy new containers for your applications.

##### Simplified workflow

Amazon Elastic Container Registry integrates with Amazon ECS and the Docker CLI, allowing you to simplify your development and production workflows. You can easily push your container images to Amazon ECR using the Docker CLI from your development machine, and Amazon ECS can pull them directly for production deployments.

##### How it works

![/img/ecr.png](/img/ecr.png)

