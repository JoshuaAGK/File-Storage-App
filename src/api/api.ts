const express = require('express');
import { Router } from 'express';
const router: Router = express.Router();
const multer = require('multer');
import writeFile from '../services/writeFile';
import readFile from '../services/readfile';
import { client } from "../config/mongodb";
const jwt = require('jsonwebtoken');


router.post("/uploadfile", multer().any(), async (req: any, res: any) => {
    const fileName = req.files[0].originalname;
    const fileBuffer = req.files[0].buffer;
    const teamName = req.body.teamName;
    const uid = req.body.uid;
    const path = `filestore/${teamName}/`;
    const response = await writeFile(path, fileName, fileBuffer);

    // If writeFile failed, response will not be UUID. UUIDs are 36 characters long.
    if (response.length !== 36) {
        res.send(response);
        return response;
    }

    const filesCollection = client.db(teamName).collection("files");
    const insertResult = await filesCollection.insertOne({
        _id: response,
        path: path,
        fileName: fileName,
        uploadedOn: new Date().toISOString(),
        uploader: uid
    });

    res.send(insertResult);
})

router.get("/getfile/:fileID", async (req: any, res: any) => {
    const fileID = req.params.fileID;
    const filePasshash = req.query.passhash;

    let file: { _id: {}; path: string; fileName: string; uploadedOn: string; uploader: string; passhash?: string; } | undefined;

    // Get list of all teams
    const databases = await client.db().admin().listDatabases();
    const globalDatabases = ["admin", "local"];
    const teamDatabases = databases.databases.filter((database: any) => !globalDatabases.includes(database.name.toLowerCase())).map((database: any) => database.name);

    // Iterate through teams to find the requested file.
    for (const teamDatabase of teamDatabases) {
        const filesCollection = await client.db(teamDatabase).collection("files");
        const foundFile = await filesCollection.findOne({ _id: fileID });
        if (foundFile) {
            file = foundFile;
            break;
        }
    }

    // Check file was found
    if (!file) {
        res.sendStatus(404);
        return false;
    }
 
    // If file is password protected, check password is correct
    if (file.passhash && file.passhash != filePasshash) {
        res.sendStatus(401);
        return false;
    }

    // Send file
    res.set({
        'Content-Disposition': `attachment; filename="${file.fileName}"`,
    });
    const fullPath = file.path + file.fileName;
    const data = await readFile(fullPath);
    res.send(data);
})

router.post("/login", async (req: any, res: any) => {
    const email = req.body.email.toLowerCase();
    const passhash = req.body.passhash;

    let user: { _id: {}; fname: string, lname: string, role: string, permissions: { read: boolean; write: boolean; }; email: string; passhash: string } | undefined;
    let teamName = "";

    // Get list of all teams
    const databases = await client.db().admin().listDatabases();
    const globalDatabases = ["admin", "local"];
    const teamDatabases = databases.databases.filter((database: any) => !globalDatabases.includes(database.name.toLowerCase())).map((database: any) => database.name);

    // Iterate through teams to find the user to authenticate.
    for (const teamDatabase of teamDatabases) {
        const usersCollection = await client.db(teamDatabase).collection("users");
        const foundUser = await usersCollection.findOne({ email: email });
        if (foundUser) {
            teamName = teamDatabase;
            user = foundUser;
            break;
        }
    }

    // Check user was found
    if (!user) {
        res.sendStatus(404);
        return false;
    }

    // Check password is correct
    if (user.passhash != passhash) {
        res.sendStatus(401);
        return false;
    }

    const uid = String(user._id);
    const payload = { teamName, uid, email };
    const token = await generateJWT(payload);

    res.send(token);
})

function generateJWT(props: { teamName: string; uid: string; email: string; }) {
    const token = jwt.sign(props, process.env.TOKEN_SECRET);
    return token;
}

export default router;