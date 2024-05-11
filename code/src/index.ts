import { AttributeValue, DynamoDBRecord, DynamoDBStreamEvent } from "aws-lambda";
import { containsValidField, getLogger, parseVector, requireEnv, shaSum } from "./helper";
import { Context } from "vm";
import { DatabaseService } from "@svector/client";

const ENDPOINT_URL = process.env.ENDPOINT_URL ?? "https://us-east-2.api.svectordb.com";
const DATABASE_ID = requireEnv("DATABASE_ID");
const API_KEY = requireEnv("API_KEY");
const FIELD_NAME = requireEnv("FIELD_NAME");
const FIELD_DIMENSION = parseInt(requireEnv("FIELD_DIMENSION"));

const database = new DatabaseService({
    endpoint: ENDPOINT_URL,
    apiKey: API_KEY
});

export async function handler(event: DynamoDBStreamEvent, context: Context) {
    const logger = getLogger(event, context);

    for (const record of event.Records) {
        const keys = record.dynamodb?.Keys;
        const svectorKey = shaSum(JSON.stringify(keys)); // Keys are limited to 256 bytes, hashing ensures we don't exceed this limit; This may be more useful as `${partitionKey}-${sortKey}` depending on your use case
        const oldImageContainsVector = containsValidField(FIELD_NAME, FIELD_DIMENSION, record.dynamodb?.OldImage);
        const newImageContainsVector = containsValidField(FIELD_NAME, FIELD_DIMENSION, record.dynamodb?.NewImage);

        const RECORD_DOES_NOT_CONTAIN_VECTOR = !oldImageContainsVector && !newImageContainsVector;
        const VECTOR_WAS_REMOVED = oldImageContainsVector && !newImageContainsVector;

        if (RECORD_DOES_NOT_CONTAIN_VECTOR) {
            logger.info({ keys }, "Skipping record without valid vector");
            continue;
        }

        if (VECTOR_WAS_REMOVED) {
            logger.info({ keys }, "Removing vector from index");
            await database.deleteItem({ databaseId: DATABASE_ID, key: svectorKey });

            continue;
        }

        logger.info({ keys }, "Adding vector to index");
        await database.setItem({
            databaseId: DATABASE_ID,
            key: svectorKey,
            value: Buffer.from(JSON.stringify(keys)),
            vector: parseVector(record.dynamodb!.NewImage!)
        });
    }
}