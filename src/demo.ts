import { DatabaseService } from "@svector/client";
import { requireEnv } from "./helper";

const ENDPOINT_URL = process.env.ENDPOINT_URL ?? "https://us-east-2.api.svectordb.com";
const DATABASE_ID = requireEnv("DATABASE_ID");
const API_KEY = requireEnv("API_KEY");

const database = new DatabaseService({
    endpoint: ENDPOINT_URL,
    apiKey: API_KEY
});

(async () => {
    console.log(await searchByVector([0.1, 0.2, 0.3, 0.4]));
})();


async function searchByVector(vector: number[]) {
    const { results } = await database.query({
        databaseId: DATABASE_ID,
        query: {
            vector,
        },
        maxResults: 10
    })

    return results!
        .map(x => ({
            value: Buffer.from(x.value!).toString('utf8'),
            vector: x.vector,
            distance: x.distance
        }));
}