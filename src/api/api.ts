const express = require('express');
import { Router } from 'express';
const router: Router = express.Router();
const multer = require('multer');
import writeFile from '../services/writeFile';

router.post("/uploadfile", multer().any(), async (req: any, res: any) => {
    console.log(req.body);
    console.log(req.files);
    res.send("ok");
    const fileName = req.files[0].originalname;
    const fileBuffer = req.files[0].buffer;
    const teamName = req.body.team;
    const path = `filestore/${teamName}/`;
    await writeFile(path, fileName, fileBuffer);
})

export default router;