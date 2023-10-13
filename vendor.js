'use strict';

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const sns = new AWS.SNS();
const sqs = new AWS.SQS();

const topicArn = 'arn:aws:sns:us-west-2:804990920200:pickup.fifo';
const vendorQueueUrl = 'https://sqs.us-west-2.amazonaws.com/804990920200/vendor';

// Publish a message to SNS topic
function publishToTopic() {
    const orderId = Math.floor(Math.random() * 1000);
    
    const params = {
      Message: JSON.stringify({
        orderId: orderId,
        customer: 'Kat',
        vendorUrl: vendorQueueUrl
      }),
      TopicArn: topicArn,
      MessageGroupId: 'OrderGroup', 
      MessageDeduplicationId: `Order_${orderId}` 
    };
  
    sns.publish(params).promise()
      .then(data => {
        console.log(`Message sent to topic, ID: ${data.MessageId}`);
      })
      .catch(err => {
        console.error('Error while sending message to topic:', err);
      });
  }

// Send a message to SQS queue
// function sendMessageToQueue() {
//   const params = {
//     MessageBody: JSON.stringify({
//       someData: 'example data',
//     }),
//     QueueUrl: vendorQueueUrl,
//   };

//   sqs.sendMessage(params).promise()
//     .then(data => {
//       console.log(`Message sent to queue, ID: ${data.MessageId}`);
//     })
//     .catch(err => {
//       console.error('Error while sending message to queue:', err);
//     });
// }

// Publish a message to the topic every 5 seconds
setInterval(publishToTopic, 5000);

// Send a message to the queue every 10 seconds (optional)
// setInterval(sendMessageToQueue, 10000);

function pollVendorQueue() {
    const params = {
        QueueUrl: vendorQueueUrl,
        MaxNumberOfMessages: 1,
        VisibilityTimeout: 10,
        WaitTimeSeconds: 20
    };

    sqs.receiveMessage(params).promise()
        .then(data => {
            if (data.Messages && data.Messages.length > 0) {
                const message = JSON.parse(data.Messages[0].Body);
                console.log('Received delivery notification:', message);

                // Delete the message after processing
                sqs.deleteMessage({
                    QueueUrl: vendorQueueUrl,
                    ReceiptHandle: data.Messages[0].ReceiptHandle
                }).promise()
                .catch(err => console.error('Error deleting message:', err));
            }
        })
        .catch(err => console.error('Error polling vendor queue:', err));
}

setInterval(pollVendorQueue, 5000);
