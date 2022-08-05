/* 
This code uses callbacks to handle asynchronous function responses.
It currently demonstrates using an async-await pattern. 
AWS supports both the async-await and promises patterns.
For more information, see the following: 
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises
https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/calling-services-asynchronously.html
https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html 
*/
const AWS = require("aws-sdk");
exports.main = async function (event, context) {
const ssm = new AWS.SSM();
const data = await ssm.getParameters({
  Names: [ /* required */
    '/checkout/production/QUEUE_URL',
    /* more items */
  ],
 }).promise();

 if(!data) {
  return {
    statusCode: 500,
    body: JSON.stringify({data})
  }
 }
const QUEUE_URL = data.Parameters[0].Value;

  try {
    var method = event.httpMethod;

    if (method === "POST") {
      if (event.path === "/") {
        var params = {
          DelaySeconds: 2,
          MessageAttributes: {
            Author: {
              DataType: "String",
              StringValue: "Karandeep Singh",
            },
          },
          MessageBody: "TEST of the SQS service.",
          QueueUrl: QUEUE_URL,
        };
        var sqs = new AWS.SQS({
          apiVersion: "2012-11-05",
          region: "eu-central-1",
        });
        let queueRes = await sqs.sendMessage(params).promise();
        const response = {
          statusCode: 200,
          body: JSON.stringify(queueRes),
        };

        return response;
      }
    } else {
      // We only accept GET for now
      return {
        statusCode: 400,
        headers: {},
        body: "We only accept POST /",
      };
    }
  } catch (error) {
    var body = error?.stack || JSON.stringify(error, null, 2);
    return {
      statusCode: 400,
      headers: {},
      body: JSON.stringify(body),
    };
  }
};
