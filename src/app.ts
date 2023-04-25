
import { client } from "./config/mongodb";
import app from "./server";

async function main() {
    console.clear();

    await client.connect();
    console.log("Connected successfully to MongoDB.");
}

app.get("/", async (req: any, res: any) => {
    res.send("Hello World!");
});

main();