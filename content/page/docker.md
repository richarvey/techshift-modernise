+++
title= "Introduction to Docker"
description= ""
draft = false
weight = -97
+++

### What is Docker?

Docker is a containe run time engine. That means its a way of packaging up Binaries, Libs, Dependancies, Confuguration and Code into a package that runs anywhere docke ris installed. It uses the system kernel unlike traditional VM's so theres no hypervisor, which makes this incredibly lightweight and fast to start as there is no hardware emulation.

The diagram below highlights that the docker image is smaller than a VM because a VM has to boot an entire guest OS, this is one reason for dockers speed over VM's. Because they are quick to start this makes them ideal for scaling your application.

![/img/docker.png](/img/docker.png)

Because docker provides a standard way to run your applications this makes them portable. It allows you to develop locally on your laptop and then run in production with convidence that it will just work. It removes the age old barrier of dev vs ops and "it works on my machine" which creates a smoother working environment.

#### Why use Docker

Using Docker lets you ship code faster, standardize application operations, seamlessly move code, and save money by improving resource utilization. With Docker, you get a single object that can reliably run anywhere. Docker's simple and straightforward syntax gives you full control. Wide adoption means there's a robust ecosystem of tools and off-the-shelf applications that are ready to use with Docker.

![/img/docker-1.pg](/img/docker-1.png)

##### Ship More Software Faster

Docker users on average ship software 7x more frequently than non-Docker users. Docker enables you to ship isolated services as often as needed.

##### Standardize Operations

Small containerized applications make it easy to deploy, identify issues, and roll back for remediation.

##### Seamlessly Move

Docker-based applications can be seamlessly moved from local development machines to production deployments on AWS.

##### Save Money

Docker containers make it easier to run more code on each server, improving your utilization and saving you money.

#### When to use Docker

You can use Docker containers as a core building block creating modern applications and platforms. Docker makes it easy to build and run distributed microservices architecures, deploy your code with standardized continuous integration and delivery pipelines, build highly-scalable data processing systems, and create fully-managed platforms for your developers.

![/img/docker-2.pg](/img/docker-2.png)
