
import { client } from "./config/mongodb";
import app from "./server";

console.clear();

// Start Express server on port 3000
const port = 3000;
app.listen(port, () => {
    console.log(`Express listening on port ${port}.`)
})


/**
 * Asynchronously connect to MongoDB client
 */
async function main() {
    await client.connect();
    console.log("Connected successfully to MongoDB.");
}

main();