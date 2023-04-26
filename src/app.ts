
import { client } from "./config/mongodb";
import app from "./server";
const jwt = require('jsonwebtoken');

async function main() {
    console.clear();

    await client.connect();
    console.log("Connected successfully to MongoDB.");
}

app.get("/", async (req: any, res: any) => {
    const token = req.cookies.jwt;
    let props: { tokenData?: {} } = {};

    jwt.verify(token, process.env.TOKEN_SECRET, (err: any, verifiedJwt: any) => {
        if(!err) {
            props.tokenData = verifiedJwt
        }
    })

    res.render("index", { layout: "main", ...props });
});

main();