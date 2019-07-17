+++
title= "Static Hosting on S3"
description= ""
draft = false
weight = -103
+++
### Static hosting benefits

When we talk about static website hosting we are talking about a website that has no server side code such as PHP, .Net or Ruby. When you have server side code, the server is responsible for processing code and returning HTML to the end user. The problem with this is one of scale. To serve thousands of users you need to scale the systems and have efficient code to keep up with demand.

Static websites however deliver code to be run on the client side. This will be HTML, CSS, JavaScript, Images and Video/Media. This is an excellent use of resources as the server just has to hand out data without processing.

Static websites are very low cost, provide high-levels of reliability, require no server administration, and scale to handle enterprise-level traffic with no additional work.

Best for:

- Websites that do not contain server-side scripting, like PHP or ASP.NET 
- Websites that change infrequently with few authors
- Websites need to scale for occasional intervals of high traffic
- Customers who do not want to manage infrastructure

#### What is S3?

Amazon Simple Storage Service (Amazon S3) is an object storage service that offers industry-leading scalability, data availability, security, and performance. This means customers of all sizes and industries can use it to store and protect any amount of data for a range of use cases, such as websites, mobile applications, backup and restore, archive, enterprise applications, IoT devices, and big data analytics. Amazon S3 provides easy-to-use management features so you can organize your data and configure finely-tuned access controls to meet your specific business, organizational, and compliance requirements. Amazon S3 is designed for 99.999999999% (11 9's) of durability, and stores data for millions of applications for companies all around the world.

So its super reliable and highly concurrent. You can also enable static web hosting on it and int his lab we'll do this to offload assets and the site saving compute resources.

##### Scaling this further

S3 web hosting can be linked with Amazon CloudFront. Amazon CloudFront is a fast content delivery network (CDN) service that securely delivers data, videos, applications, and APIs to customers globally with low latency, high transfer speeds, all within a developer-friendly environment. CloudFront is integrated with AWS – both physical locations that are directly connected to the AWS global infrastructure, as well as other AWS services. CloudFront works seamlessly with services including AWS Shield for DDoS mitigation, Amazon S3, Elastic Load Balancing or Amazon EC2 as origins for your applications, and Lambda@Edge to run custom code closer to customers’ users and to customize the user experience. Lastly, if you use AWS origins such as Amazon S3, Amazon EC2 or Elastic Load Balancing, you don’t pay for any data transferred between these services and CloudFront.