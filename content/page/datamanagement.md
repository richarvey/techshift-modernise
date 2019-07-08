+++
title= "Data Management"
description= ""
draft = false
weight = -101
+++
#### Getting data into AWS

Getting data into AWS and into RDS is simple. There is a tool just for this purpose called the AWS Database Migration Service (DMS). DMS allows you move data from on-prem systems easily, securely and reliably. It supports a host of features:

- Simple migration (e.g. MySQL to RDS/Aurora MySQL)
- Schema Conversion (e.g. Oracle to PostgreSQL Aurora)
- DB Consolidation (multiple DB's into one)
- Change Data Capture (CDC) - Continuous Replication

##### Homogeneous Database Migrations

![/img/dms-1.png](/img/dms-1.png)

##### Heterogeneous Database Migrations

![/img/dms-2.png](/img/dms-2.png)

#### Running your DB in the Cloud (RDS / Aurora and Aurora Serverless)

It is possible to run your database on EC2, however if you do this you need to address several challenges:

- How do you scale?
 - Multi-master and failover
 - Read capacity
- Patch management
- Backup

All these factors add challenges to your daily operational routine and removes your focus from innovating in your application.

This is where RDS, Aurora and Aurora Serverless comes in. These are fully managed services that allow you to deploy databases at the click of a button. All the above challenges are in-built features in the services so you can get back to focusing on your application rather than building and managing your own solution. 

#### RDS

Amazon Relational Database Service (Amazon RDS) makes it easy to set up, operate, and scale a relational database in the cloud. It provides cost-efficient and resizable capacity while automating time-consuming administration tasks such as hardware provisioning, database setup, patching and backups. It frees you to focus on your applications so you can give them the fast performance, high availability, security and compatibility they need.

Amazon RDS is available on several database instance types - optimized for memory, performance or I/O - and provides you with six familiar database engines to choose from, including Amazon Aurora, PostgreSQL, MySQL, MariaDB, Oracle Database, and SQL Server. You can use the AWS Database Migration Service to easily migrate or replicate your existing databases to Amazon RDS.

#####  Amazon RDS database engines

![/img/rds.png](/img/rds.png)

#### Aurora

Amazon Aurora is a MySQL and PostgreSQL-compatible relational database built for the cloud, that combines the performance and availability of traditional enterprise databases with the simplicity and cost-effectiveness of open source databases.

Amazon Aurora is up to five times faster than standard MySQL databases and three times faster than standard PostgreSQL databases. It provides the security, availability, and reliability of commercial databases at 1/10th the cost. Amazon Aurora is fully managed by Amazon Relational Database Service (RDS), which automates time-consuming administration tasks like hardware provisioning, database setup, patching, and backups.

Amazon Aurora features a distributed, fault-tolerant, self-healing storage system that auto-scales up to 64TB per database instance. It delivers high performance and availability with up to 15 low-latency read replicas, point-in-time recovery, continuous backup to Amazon S3, and replication across three Availability Zones (AZs).

Visit the Amazon RDS Management Console to create your first Aurora database instance and start migrating your MySQL and PostgreSQL databases.

#### Benefits

##### High Performance and Scalability

Get 5X the throughput of standard MySQL and 3X the throughput of standard PostgreSQL. This performance is on par with commercial databases, at 1/10th the cost. You can easily scale your database deployment up and down from smaller to larger instance types as your needs change, or let Aurora Serverless handle scaling automatically for you. To scale read capacity and performance, you can add up to 15 low latency read replicas across three Availability Zones. Amazon Aurora automatically grows storage as needed, up to 64TB per database instance.

##### High Availability and Durability

Amazon Aurora is designed to offer greater than 99.99% availability, replicating 6 copies of your data across 3 Availability Zones and backing up your data continuously to Amazon S3. It transparently recovers from physical storage failures; instance failover typically takes less than 30 seconds. You can also backtrack within seconds to a previous point in time, to recover from user errors. With Global Database, a single Aurora database can span multiple AWS regions to enable fast local reads and quick disaster recovery.

##### Highly Secure

Amazon Aurora provides multiple levels of security for your database. These include network isolation using Amazon VPC, encryption at rest using keys you create and control through AWS Key Management Service (KMS) and encryption of data in transit using SSL. On an encrypted Amazon Aurora instance, data in the underlying storage is encrypted, as are the automated backups, snapshots, and replicas in the same cluster. 

##### MySQL and PostgreSQL Compatible

The Amazon Aurora database engine is fully compatible with existing MySQL and PostgreSQL open source databases, and adds compatibility for new releases regularly. This means you can easily migrate MySQL or PostgreSQL databases to Aurora using standard MySQL or PostgreSQL import/export tools or snapshots. It also means the code, applications, drivers, and tools you already use with your existing databases can be used with Amazon Aurora with little or no change. 

##### Fully Managed

Amazon Aurora is fully managed by Amazon Relational Database Service (RDS). You no longer need to worry about database management tasks such as hardware provisioning, software patching, setup, configuration, or backups. Aurora automatically and continuously monitors and backs up your database to Amazon S3, enabling granular point-in-time recovery. You can monitor database performance using Amazon CloudWatch, Enhanced Monitoring, or Performance Insights, an easy-to-use tool that helps you quickly detect performance problems. 

##### Migration Support

MySQL and PostgreSQL compatibility make Amazon Aurora a compelling target for database migrations to the cloud. If you are migrating from MySQL or PostgreSQL, see our migration documentation for a list of tools and options. To migrate from commercial database engines, you can use the AWS Database Migration Service for a secure migration with minimal downtime.

#### Aurora Serverless

Amazon Aurora Serverless is an on-demand, auto-scaling configuration for Amazon Aurora (MySQL-compatible edition), where the database will automatically start up, shut down, and scale capacity up or down based on your application's needs. It enables you to run your database in the cloud without managing any database instances. It's a simple, cost-effective option for infrequent, intermittent, or unpredictable workloads.

Manually managing database capacity can take up valuable time and can lead to inefficient use of database resources. With Aurora Serverless, you simply create a database endpoint, optionally specify the desired database capacity range, and connect your applications. You pay on a per-second basis for the database capacity you use when the database is active, and migrate between standard and serverless configurations with a few clicks in the Amazon RDS Management Console.

#### Benefits

##### Simple

Removes the complexity of managing database instances and capacity. The database will automatically start up, shut down, and scale to match your application's needs.

##### Scalable

Seamlessly scale compute and memory capacity as needed, with no disruption to client connections.

##### Cost-Effective

Pay only for the database resources you consume, on a per-second basis. You don't pay for the database instance unless it's actually running.

##### Highly Available

Built on distributed, fault-tolerant, self-healing Aurora storage with 6-way replication to protect against data loss.
