
import { client } from "./config/mongodb";
import app from "./server";
app.listen(3000);
console.clear();

async function main() {
    await client.connect();
    console.log("Connected successfully to MongoDB.");
}

main();