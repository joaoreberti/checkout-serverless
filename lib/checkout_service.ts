import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as parameterStore from "aws-cdk-lib/aws-ssm";

export class CheckoutService extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const bucket = new s3.Bucket(this, "CheckoutStore");

    const handler = new lambda.Function(this, "CheckoutHandler", {
      runtime: lambda.Runtime.NODEJS_14_X, // So we can use async in widget.js
      code: lambda.Code.fromAsset("resources"),
      handler: "checkout.main",
      environment: {
        BUCKET: bucket.bucketName,
      },
    });
    const queue2 = new sqs.Queue(this, "SecondQueue", {
      visibilityTimeout: cdk.Duration.seconds(30),
      queueName: "TheSecondQueue",
    });


    handler.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: [queue2.queueArn],
      actions: ["*"],
    }))

    handler.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['arn:aws:ssm:eu-central-1:841038399187:*'],
      actions: ["*" ],
    }));

    bucket.grantReadWrite(handler); // was: handler.role);

    const api = new apigateway.RestApi(this, "checkout-api", {
      restApiName: "Checkout Service",
      description: "This service handles new checkout orders.",
    });

    const postCheckoutIntegration = new apigateway.LambdaIntegration(handler, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' },
    });

    api.root.addMethod("POST", postCheckoutIntegration); // POST /
    
  }
}
