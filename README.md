# Caps-cloud

A cloud-based version of the CAPS system utilizing AWS Services: SQS, SNS, and Node.js client applications.

## UML Diagram

The UML diagram showcases the architecture of our cloud-based CAPS delivery system. The system makes use of AWS SNS Topics and SQS Queues to orchestrate the flow of delivery orders and notifications between vendors and drivers.

- [UML](./UML19.png)

## Console Screenshot

The following image displays how the system responds to events, capturing the console output. This provides a visual representation of the flow of data and operations in real-time.

- [Console](./Console19.png)

## Data and Program Flow

- Vendor posts a pickup request to SNS Topic.
- The request is moved to the SQS packages FIFO Queue.
- A driver polls the queue, retrieves the order, and after a delay, sends a delivery notification to the vendor's SQS Queue using the supplied URL in the order.
- The vendor's application polls their SQS Queue to check for delivery notifications and logs the details.

## Contributers

- Ekaterina Khoroshilova
- ChatGPT