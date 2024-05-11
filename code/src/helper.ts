import { AttributeValue, DynamoDBStreamEvent } from "aws-lambda";
import pino from "pino";
import { Context } from "vm";

export function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}

export function getLogger(event: DynamoDBStreamEvent, context: Context) {
    return pino({ base: {
        awsRequestId: context.awsRequestId,
    }, serializers: { err: pino.stdSerializers.err }});
}

export function containsValidField(fieldName: string, fieldDimension: number, record: {[key: string]: AttributeValue}) {
    if (!record)
        return false;

    if (record[fieldName]?.L?.length !== fieldDimension)
        return false;

    return record[fieldName].L.filter(x => x.N == undefined).length === 0;
}

export function shaSum(data: string) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
}

export function parseVector(record: {[key: string]: AttributeValue}) {
    return record['vector'].L.map(x => parseFloat(x.N!));
}