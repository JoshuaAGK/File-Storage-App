const express = require('express');
import { Router } from 'express';
const router: Router = express.Router();
const multer = require('multer');
import writeFile from '../services/writeFile';
import readFile from '../services/readfile';
import { client } from "../config/mongodb";

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

router.get("/getfile/:fileID", multer().any(), async (req: any, res: any) => {
    const fileID = req.params.fileID;

    const databases = await client.db().admin().listDatabases();
    const globalDatabases = ["admin", "local"];
    const teamDatabases = databases.databases.filter((database: any) => !globalDatabases.includes(database.name.toLowerCase())).map((database: any) => database.name);

    let file: { path: string; fileName: string; uploadedOn: string; uploader: string; } | undefined;

    // Iterate through teams to find the requested file.
    for (const teamDatabase of teamDatabases) {
        const filesCollection = await client.db(teamDatabase).collection("files");
        const foundFile = await filesCollection.findOne({ _id: fileID });
        if (foundFile) {
            file = foundFile;
            break;
        }
    }

    if (!file) {
        res.send(404);
        return false;
    }

    const fullPath = file.path + file.fileName;
    
    res.set({
        'Content-Disposition': `attachment; filename="${file.fileName}"`,
    });

    const data = await readFile(fullPath, null);

    res.send(data);
})

export default router;