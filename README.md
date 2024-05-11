# DynamoDB Indexer

A simple template to build a vector index on a DynamoDB table using SvectorDB. 

This template uses DynamoDB streams and a Lambda function to subscribe for changes in the table and update the index accordingly.

Records in the index contain only the partition and sort key of document, however the script can be easily modified to include other attributes.

## Requirements

* The SvectorDB CloudFormation extensions must be enabled in your account. This can be done by following the instructions in the [SvectorDB documentation](https://www.svectordb.com/docs/Integrations/CloudFormation/getting-started).

* The source DynamoDB table must have DynamoDB streams enabled

## Usage

1. Download the latest compiled code from the [releases page](https://github.com/svectordb/dynamodb-indexer/releases/download/1.0/lambda-source.zip) or compile the source code yourself. To compile the source code, run the following commands:

    ```bash
    cd code
    npm install
    npm run build
    ```

2. Upload the compiled code to an S3 bucket in your account

3. Deploy the CloudFormation stack using the provided template. The template requires the following parameters:

    * `DynamoDbStreamArn` - The name of the DynamoDB stream to subscribe to
    * `SvectorDbIntegrationId` - The ID in your SvectorDB dashboard for the CloudFormation integration (ensure you've added your account ID to the allowed accounts list). See the [SvectorDB documentation](https://www.svectordb.com/docs/Integrations/CloudFormation/getting-started) for more information
    * `VectorDimension` - The dimension of the vector index
    * `VectorDistanceMetric` - The distance metric to use for the index
    * `VectorFieldToIndex` - The name of the field in the source table to use as the document's vector. This field must be a list of numbers
    * `DatabaseType` - The tier of database to create, sandbox is the free tier
    * `LambdaBucket` - The name of the S3 bucket where the Lambda code is stored
    * `LambdaKey` - The key of the Lambda code in the S3 bucket

Once the stack has been created, the index will be updated in real-time as records are added, updated or deleted from the source table

See the `code/src/demo.ts` file for an example of how to use the index to perform a nearest neighbour search.

Visit the [SvectorDB Quick Start guide](https://www.svectordb.com/docs) for more information on how to use the index.