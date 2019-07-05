+++
title= "Containers in production"
description= ""
draft = false
weight = -95
+++
### Recap

Before the last lab we looked at why containers are useful and popular. Here is a quick reminder:

- Portable
- Lightweight
- Standardised
- Easy to deploy
- Along with containers, comes the "monolith to microservices" story: containers and microservices go hand in hand.

It is easy to see how moving your code round in this portable, repeatable package is powerful, even from testing on different development laptops.
 
### Running locally

Running docker locally is one thing. You simply use the docker CLI (command line interface). You can either build your container locally from code or download from a docker repository. A simple approach is to use ECR as your repository with a command such as:

```bash
$(aws ecr get-login --no-include-email --region us-east-1)
```

This executes the ```docker login``` command and smooths your work flow. You may want to set these up as aliases in your ```.bash_profile``` or equivilant.

### The challenge of scale

When you come to run the containers in production you are faced with managing a fleet of servers as your resource pool. You could simply SSH into each host and place your work loads manually using the docker CLI. However this is not going to scale as you develop more applications and deploy more resources. Also consider how you manage efficient use of resources so you do not overload one server and underutilise others. This is where the orchestration engines come into their own.

### Orchestration

Orchestration engines have eased the challenges of running docker at scale. They are responsible for:

- Placing the docker container workload
  - This can also take into consideration contraints of placement (eg. do you need a GPU instance)
  - Exclusion of services running on the same host
- Best managing resources in a pool of servers
  - Make sure there is sufficent resources on a host to run a workload
  - Autoscale infrastructure underneath to add and rmeove capacity
- Monitoring the health of a running container
  - If a container fails, replace it and maintain a min number of running versions.

There are maany orchestration systems in the wild and many are open source. Here we'll quickly talk about the 3 major players.

### ECS, EKS and Fargate

#### Amazon Elastic Container Service (ECS)

Amazon Elastic Container Service (Amazon ECS) is a highly scalable, high-performance container orchestration service that supports Docker containers and allows you to easily run and scale containerised applications on AWS. Amazon ECS eliminates the need for you to install and operate your own container orchestration software, AWS run and maintain the management control plane for you, meaning you only need to manage the worker nodes, this removes much of the heavy lifting of running an orchestration system.

Due to its tight integration with AWS services, you can with simple API calls launch and stop Docker-enabled applications, query the complete state of your application, and access many familiar features such as IAM roles, security groups, load balancers, Amazon CloudWatch Events, AWS CloudFormation templates, and AWS CloudTrail logs.

#### Amazon Elastic Kubernetes Service (EKS)

Amazon Elastic Kubernetes Service (Amazon EKS) makes it easy to deploy, manage, and scale containerised applications using Kubernetes on AWS.

Kubernetes is an Open Source platform that is hugely popular in the community and has many great features you may wish to use.

Amazon EKS runs the Kubernetes management infrastructure for you across multiple AWS availability zones to eliminate a single point of failure. Amazon EKS is certified Kubernetes conformant so you can use existing tooling and plugins from partners and the Kubernetes community. Applications running on any standard Kubernetes environment are fully compatible and can be easily migrated to Amazon EKS.

You can also run kubernetes on EC2 using tools like KOPS, however in this case you also have the responsibility of running the management control plane, so EKS may be a better option to help remove the management overhead required to operate Kubernetes at scale.

One thing to note is that EKS provides a vanilla Kubernetes experience, so does not have native integrations with AWS services out of the box. You can add many native integration features using Kubernetes plugins. e.g. Support for IAM & AWS Application Load Balancer

#### Fargate

AWS Fargate is a compute engine for Amazon ECS that allows you to run containers without having to manage servers or clusters/worker nodes. With AWS Fargate, you no longer have to provision, configure, and scale clusters of virtual machines to run containers. This removes the need to choose server types, decide when to scale your clusters, or optimize cluster packing. AWS Fargate removes the need for you to interact with or think about servers or clusters. Fargate lets you focus on designing and building your applications instead of managing the infrastructure that runs them.

Basically just give AWS your container and we will run and scale it for you!

In the next lab we will be using Fargate to run your application, so we will cover some some basic concepts around these services next.

### ECS/Fargate Constructs

#### How it works

![/img/fargate.png](/img/fargate.png)

#### Running containers

To run a container in ECS or in Fargate you can use two constructs, Tasks and Services, below we will define what the role of each of these constructs are. ECS and Fargate use the same definition files and you can even run an ECS cluster that supports both EC2 instances and serverless containers in Fargate mode. This hybrid approach is useful in some situations where you need to have special conditions on the host machine. Next lets look at Task, Services and the placement strategies.

#### Tasks

A task definition is required to run Docker containers in Amazon ECS. Some of the parameters you can specify in a task definition include:

- The Docker image to use with each container in your task

- How much CPU and memory to use with each task or each container within a task

- The launch type to use, which determines the infrastructure on which your tasks are hosted

- The Docker networking mode to use for the containers in your task

- The logging configuration to use for your tasks

- Whether the task should continue to run if the container finishes or fails

- The command the container should run when it is started

- Any data volumes that should be used with the containers in the task

- The IAM role that your tasks should use

You can define multiple containers in a task definition. The parameters that you use depend on the launch type you choose for the task. Not all parameters are valid. For more information about the parameters available and which launch types they are valid for in a task definition, see Task Definition Parameters.

Your entire application stack does not need to exist on a single task definition, and in most cases it should not. Your application can span multiple task definitions by combining related containers into their own task definitions, each representing a single component.


#### Services

Amazon ECS allows you to run and maintain a specified number of instances of a task definition simultaneously in an Amazon ECS cluster. This is called a service. If any of your tasks should fail or stop for any reason, the Amazon ECS service scheduler launches another instance of your task definition to replace it and maintain the desired count of tasks in the service depending on the scheduling strategy used.

In addition to maintaining the desired count of tasks in your service, you can optionally run your service behind a load balancer. The load balancer distributes traffic across the tasks that are associated with the service. 

#### Scheduling Tasks

When a task that uses the EC2 launch type is launched, Amazon ECS must determine where to place the task based on the requirements specified in the task definition, such as CPU and memory. Similarly, when you scale down the task count, Amazon ECS must determine which tasks to terminate. You can apply task placement strategies and constraints to customize how Amazon ECS places and terminates tasks. Task placement strategies and constraints are not supported for tasks using the Fargate launch type. By default, Fargate tasks are spread across Availability Zones.

A task placement strategy is an algorithm for selecting instances for task placement or tasks for termination. For example, Amazon ECS can select instances at random or it can select instances such that tasks are distributed evenly across a group of instances.

A task placement constraint is a rule that is considered during task placement. For example, you can use constraints to place tasks based on Availability Zone or instance type. You can also associate attributes, which are name/value pairs, with your container instances and then use a constraint to place tasks based on attribute.

__Note__

Task placement strategies are a best effort. Amazon ECS still attempts to place tasks even when the most optimal placement option is unavailable. However, task placement constraints are binding, and they can prevent task placement.

You can use task placement strategies and constraints together. For example, you can distribute tasks across Availability Zones and bin pack tasks based on memory within each Availability Zone, but only for G2 instances.

When Amazon ECS places tasks, it uses the following process to select container instances:

- Identify the instances that satisfy the CPU, memory, and port requirements in the task definition.

- Identify the instances that satisfy the task placement constraints.

- Identify the instances that satisfy the task placement strategies.

- Select the instances for task placement.

##### Amazon ECS Task Placement Strategies

A task placement strategy is an algorithm for selecting instances for task placement or tasks for termination. Task placement strategies can be specified when either running a task or creating a new service. For more information, see Amazon ECS Task Placement.
Strategy Types

Amazon ECS supports the following task placement strategies:

__binpack__

- Place tasks based on the least available amount of CPU or memory. This minimizes the number of instances in use.

__random__

- Place tasks randomly.

__spread__

- Place tasks evenly based on the specified value. Accepted values are attribute key-value pairs, instanceId, or host. Service tasks are spread based on the tasks from that service. Standalone tasks are spread based on the tasks from the same task group.

##### Amazon ECS Task Placement Constraints

A task placement constraint is a rule that is considered during task placement. For more information, see Amazon ECS Task Placement.
Constraint Types

Amazon ECS supports the following types of task placement constraints:

__distinctInstance__

- Place each task on a different container instance. This task placement constraint can be specified when either running a task or creating a new service.

__memberOf__

- Place tasks on container instances that satisfy an expression. For more information about the expression syntax for constraints, see Cluster Query Language.

- The memberOf task placement constraint can be specified with the following actions:

  - Running a task
  - Creating a new service
  - Creating a new task definition
  - Creating a new revision of an existing task definition

### Wrap up

Using these constructs we can place and run container workloads in AWS easily and take advantage of other AWS service integration. Using Fargate we do not have to manage any infrastructure so our focus can yet again be on the application and the container it runs within.
