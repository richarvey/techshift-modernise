+++
title= "Decoupling logic"
description= ""
draft = false
weight = -93
+++

### What is decoupling

A decoupled application architecture allows each component to perform its tasks independently (microservices), it allows components to remain completely autonomous and unaware of each other. A change in one service should not require a change in the other services. Applications communicate via message buses/queues in order to signal to other processes that something needs to be done.

#### Abstract thinking

Lets look at this in an abstract way to understand why its a great idea.

We have a warehouse with 8 workers to pick stock from the shelves. 4 of them have ladders to reach the high places and 4 do not.

Now an order comes into the warehouse and its for something low down on the shelve. Any worker can go and pick up the package and we can cope easily. In fact we can do 8 orders of picking low shelved items at once. The problem comes when the 9th order comes in. There is no one left to take the order! Now if this order was only to flash up on the screen until another order comes in we would run the risk of loosing that order if a 10th arrived and replaced it.

Now in real life, we would print the order and pop it in a tray, this order would be picked up when a worker returns to check if there are new orders. This tray is our queue in a decoupled system. We can also have two trays/queues, one for low picking items and one for higher up items, this would allow us to efficiently allocate jobs to the right worker.

Now lets think of this in terms of an e-commerce site. A user clicks to place an order > stock is checked > payment is taken > order is written to the DB > the user is acknowledged. If you think about that as a single process you are tying up server resources/a thread on a system till everything is processed.

In a decoupled version of this you would place the order in a queue and inform the user we will notify you when your order is accepted and ready. This frees up significant resources and allows you to take more orders than you have current capacity for as they are queued and processed as fast as you can. This way of dealing with processing can also help if your payment provider has a API limit for example, you can process without overwhelming their system and returning errors to your customers.

### Microservices

Microservices, also known as the microservice architecture is an architectural style that structures an application as a collection of services that are

- Highly maintainable and testable
- Loosely coupled
- Independently deployable, without effecting other services
- Organized around business capabilities

The microservice architecture enables the rapid, frequent and reliable delivery of large, complex applications. It also enables an organization to evolve its technology stack. 

#### Characteristics of Microservices

##### Autonomous

Each component service in a microservices architecture can be developed, deployed, operated, and scaled without affecting the functioning of other services. Services do not need to share any of their code or implementation with other services. Any communication between individual components happens via well-defined APIs.

##### Specialized

Each service is designed for a set of capabilities and focuses on solving a specific problem. If developers contribute more code to a service over time and the service becomes complex, it can be broken into smaller services.

#### Benefits of Microservices

##### Agility

Microservices foster an organization of small, independent teams that take ownership of their services. Teams act within a small and well understood context, and are empowered to work more independently and more quickly. This shortens development cycle times. You benefit significantly from the aggregate throughput of the organization.

##### Flexible Scaling

Microservices allow each service to be independently scaled to meet demand for the application feature it supports. This enables teams to right-size infrastructure needs, accurately measure the cost of a feature, and maintain availability if a service experiences a spike in demand.

##### Easy Deployment

Microservices enable continuous integration and continuous delivery, making it easy to try out new ideas and to roll back if something does not work. The low cost of failure enables experimentation, makes it easier to update code, and accelerates time-to-market for new features.

##### Technological Freedom

Microservices architectures don’t follow a “one size fits all” approach. Teams have the freedom to choose the best tool to solve their specific problems. As a consequence, teams building microservices can choose the best tool for each job.


##### Reusable Code

Dividing software into small, well-defined modules enables teams to use functions for multiple purposes. A service written for a certain function can be used as a building block for another feature. This allows an application to bootstrap off itself, as developers can create new capabilities without writing code from scratch.

##### Resilience

Service independence increases an application’s resistance to failure. In a monolithic architecture, if a single component fails, it can cause the entire application to fail. With microservices, applications handle total service failure by degrading functionality and not crashing the entire application.
