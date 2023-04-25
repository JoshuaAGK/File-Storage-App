const express = require('express');
import { Router } from 'express';
const router: Router = express.Router();
const multer = require('multer');
import writeFile from '../services/writeFile';
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
        path: path,
        fileName: fileName,
        uuid: response,
        uploadedOn: new Date().toISOString(),
        uploader: uid
    });

    res.send("ok");
})

export default router;