
import { client } from "./config/mongodb";
import app from "./server";
import readFile from "./services/readfile";

async function main() {
    console.clear();

    await client.connect();
    console.log("Connected successfully to MongoDB.");
}

app.get("/", async (req: any, res: any) => {
    const data = await readFile(`${__dirname}/client/private/views/index.html`);
    res.send(data);
});

main();