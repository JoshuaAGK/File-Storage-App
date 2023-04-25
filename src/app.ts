
import { client } from "./config/mongodb";

async function main() {
    console.clear();

    await client.connect();
    console.log("Connected successfully to MongoDB.");
}

main();