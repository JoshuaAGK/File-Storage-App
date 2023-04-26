const express = require('express');
const multer = require('multer');
import { Router } from 'express';
const router: Router = express.Router();
import login from '../services/login';
import getfile from '../services/getfile';
import uploadFile from '../services/uploadfile';
import signup from '../services/signup';
import UploadFileProps from '../interfaces/uploadFileProps';
const jwt = require('jsonwebtoken');

router.post("/uploadfile", multer().any(), async (req: any, res: any) => {
    const props: UploadFileProps = {
        fileName: req.files[0].originalname,
        fileBuffer: req.files[0].buffer,
        teamName: req.body.teamName,
        uid: req.body.uid
    }

    const response = await uploadFile(props);
    res.status(response.responseCode).send(response.data);
})

router.get("/getfile/:fileID", async (req: any, res: any) => {
    const fileID = req.params.fileID;
    const filePasshash = req.query.passhash;
    const token = req.cookies.jwt;

    const response = await getfile(fileID, filePasshash, token);

    if (response.responseCode === 200) {
        // File was found so set appropriate headers
        res.set({
            'Content-Disposition': `attachment; filename="${response.extras}"`,
        });
    }

    res.status(response.responseCode).send(response.data);
})

router.post("/login", async (req: any, res: any) => {
    const email = req.body.email.toLowerCase();
    const passhash = req.body.passhash;

    const response = await login(email, passhash);
    res.status(response.responseCode).send(response.data);
})

router.post("/logout", async (req: any, res: any) => {
    res.status(301).send("/");
})

router.post("/signup", async (req: any, res: any) => {
    const fname = req.body.fname ?? "Fname";
    const lname = req.body.lname ?? "Lname";
    const email = req.body.email.toLowerCase();
    const passhash = req.body.passhash;

    const response = await signup(fname, lname, email, passhash);

    res.status(response.responseCode).send(response.data);
})

router.get("/", async (req: any, res: any) => {
    const token = req.cookies.jwt;
    let props: { tokenData?: {} } = {};

    jwt.verify(token, process.env.TOKEN_SECRET, (err: any, verifiedJwt: any) => {
        if(!err) {
            props.tokenData = verifiedJwt
        }
    })

    res.render("index", { layout: "main", ...props });
});

export default router;