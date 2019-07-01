+++
title= "Stateless Servers"
description= "Managing Sessions"
draft = false
weight = -99
+++

### Scaling your web application

When you scale your web application you are faced with an option of how to store session state. Let's for example think about using loadbalancers to help you scale multiple backend servers. You can opt to confugure them to always send the traffic from one host to the same backend server by the use of cookies. This is called sticky sessions. However there is a danger that you unevenly load the visitors on your website on a small group of backend servers, this could cause a slow down and a poor user experience. The way to get around this is to allow traffic to hit any backend server and use an approach of offloading your sessions cache to a central place accessible via all the web application servers.

### The options

There is a choice to be made when considering offloading your session cache. We could use an in-memory database like redis or memcache for storing our sessions. Amazon offer both of these as a managed service in Amazon Elasticache.

#### Amazon Elasticache

Amazon ElastiCache offers fully managed Redis and Memcached. Seamlessly deploy, run, and scale popular open source compatible in-memory data stores. Build data-intensive apps or improve the performance of your existing apps by retrieving data from high throughput and low latency in-memory data stores. Amazon ElastiCache is a popular choice for Gaming, Ad-Tech, Financial Services, Healthcare, and IoT apps.

These options are particularly good if you are running server side code such as PHP. You can simply update the php.ini file on the server to use this cache and that way you do not have to make code changes.

#### Amazon Elasticache Engines

![/img/stateless.png](/img/stateless.png)

##### Benefits

##### Extreme performance

Amazon ElastiCache works as an in-memory data store and cache to support the most demanding applications requiring sub-millisecond response times. By utilizing an end-to-end optimized stack running on customer dedicated nodes, Amazon ElastiCache provides secure, blazing fast performance.

##### Fully Managed

You no longer need to perform management tasks such as hardware provisioning, software patching, setup, configuration, monitoring, failure recovery, and backups. ElastiCache continuously monitors your clusters to keep your workloads up and running so that you can focus on higher value application development.

##### Scalable

Amazon ElastiCache can scale-out, scale-in, and scale-up to meet fluctuating application demands.  Write and memory scaling is supported with sharding. Replicas provide read scaling.

#### NoSQL DB as storage for session

In our lab we are going to look at another way to achieve this. We can use Amazon DynamoDB to store session data. This is going to give us one real advantage over Elasticache. The DynamoDB pricing model is based on resource usage, that is to say its more elastic. Whereas Elasticache is built and scaled out and charged for the servers running underneath which may be underutilised.

There are many usecases of customers using this as a session cache because of the flexibility of the schemas you can use in DynamoDB. For example using the session data to store leaderscore boards ofr online gaming.

##### Amazon DynamoDB

Amazon DynamoDB is a key-value and document database that delivers single-digit millisecond performance at any scale. It's a fully managed, multiregion, multimaster database with built-in security, backup and restore, and in-memory caching for internet-scale applications. DynamoDB can handle more than 10 trillion requests per day and can support peaks of more than 20 million requests per second.

Many of the world's fastest growing businesses such as Lyft, Airbnb, and Redfin as well as enterprises such as Samsung, Toyota, and Capital One depend on the scale and performance of DynamoDB to support their mission-critical workloads.

Hundreds of thousands of AWS customers have chosen DynamoDB as their key-value and document database for mobile, web, gaming, ad tech, IoT, and other applications that need low-latency data access at any scale. Create a new table for your application and let DynamoDB handle the rest.

#### Benefits

#### Performance at scale

DynamoDB supports some of the world’s largest scale applications by providing consistent, single-digit millisecond response times at any scale. You can build applications with virtually unlimited throughput and storage. DynamoDB global tables replicate your data across multiple AWS Regions to give you fast, local access to data for your globally distributed applications. For use cases that require even faster access with microsecond latency, DynamoDB Accelerator (DAX) provides a fully managed in-memory cache.

#### Serverless

With DynamoDB, there are no servers to provision, patch, or manage and no software to install, maintain, or operate. DynamoDB automatically scales tables up and down to adjust for capacity and maintain performance. Availability and fault tolerance are built in, eliminating the need to architect your applications for these capabilities. DynamoDB provides both provisioned and on-demand capacity modes so that you can optimize costs by specifying capacity per workload, or paying for only the resources you consume.

#### Enterprise ready

DynamoDB supports ACID transactions to enable you to build business-critical applications at scale. DynamoDB encrypts all data by default and provides fine-grained identity and access control on all your tables. You can create full backups of hundreds of terabytes of data instantly with no performance impact to your tables, and recover to any point in time in the preceding 35 days with no downtime. DynamoDB is also backed by a service level agreement for guaranteed availability.

