import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as checkout_service from "../lib/checkout_service";

export class CheckoutApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new checkout_service.CheckoutService(this, "Widgets");
  }
}

