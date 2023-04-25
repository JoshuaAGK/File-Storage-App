const express = require('express');
import { Router } from 'express';
const router: Router = express.Router();
const multer = require('multer');

router.post("/uploadfile", multer().any(), (req: any, res: any) => {
    console.log(req.body);
    console.log(req.files);
    res.send("ok");
})

export default router;