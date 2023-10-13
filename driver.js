'use strict';

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const sqs = new AWS.SQS();

const packagesQueueUrl = 'https://sqs.us-west-2.amazonaws.com/804990920200/packages.fifo'; 

function getPackage() {
  const params = {
    QueueUrl: packagesQueueUrl,
    MaxNumberOfMessages: 1,
  };

  sqs.receiveMessage(params).promise()
    .then(data => {
      if (data.Messages) {
        const message = JSON.parse(data.Messages[0].Body);
        console.log('Received package:', message);

        // Simulate a delivery delay and then notify the vendor
        setTimeout(() => {
          notifyVendor(message);
        }, 5000);  // 5-second delay

        // Code to delete the message from the queue
        const deleteParams = {
          QueueUrl: packagesQueueUrl,
          ReceiptHandle: data.Messages[0].ReceiptHandle,
        };

        return sqs.deleteMessage(deleteParams).promise();
      } else {
        console.log('No new packages at the moment.');
      }
    })
    .then(() => {
      if (arguments.length > 0) {  // Check if there is a return value from the previous then()
        console.log('Message deleted');
      }
    })
    .catch(err => {
      console.error('Receiving error:', err);
    });
}

function notifyVendor(message) {
    const parsedMessage = JSON.parse(message.Message);  // Parse the Message attribute from the received message
  
    const params = {
      MessageBody: JSON.stringify({
        deliveryStatus: 'Delivered',
        orderId: parsedMessage.orderId,
        customer: parsedMessage.customer,
      }),
      QueueUrl: parsedMessage.vendorUrl,  // Use the vendorUrl from the parsed Message
    };
  
    sqs.sendMessage(params).promise()
      .then(data => {
        console.log(`Notified vendor of delivery, ID: ${data.MessageId}`);
      })
      .catch(err => {
        console.error('Error while notifying vendor:', err);
      });
  }
  

// Poll the packages queue for new packages every 5 seconds
setInterval(getPackage, 5000);
