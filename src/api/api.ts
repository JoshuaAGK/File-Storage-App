const express = require('express');
const multer = require('multer');
import { Router } from 'express';
const router: Router = express.Router();
const jwt = require('jsonwebtoken');
import login from '../services/login';
import getfile from '../services/getfile';
import uploadFile from '../services/uploadfile';
import signup from '../services/signup';
import UploadFileProps from '../interfaces/uploadFileProps';
import getfiles from '../services/getfiles';
import deletefile from '../services/deletefile';
import filePasshash from '../services/filePasshash';


/**
 * Upload a file to /filestore and save its details in MongoDB.
 * @route GET /uploadfile
 * @param {string} fileName
 * @param {Buffer} fileBuffer
 * @param {string} teamName
 * @param {string} uid
 * @param {number} size
 */
router.post("/uploadfile", multer().any(), async (req: any, res: any) => {
    const props: UploadFileProps = {
        fileName: req.files[0].originalname,
        fileBuffer: req.files[0].buffer,
        teamName: req.body.teamName,
        uid: req.body.uid,
        size: req.files[0].size
    }

    const response = await uploadFile(props);
    res.status(response.responseCode).send(response.data);
})


/**
 * Get a specific file by ID.
 * @route GET /getfile/:fileID
 * @param {string} fileID
 * @param {string} userProvidedPasshash
 * @param {string} token
 */
router.get("/getfile/:fileID", async (req: any, res: any) => {
    const fileID = req.params.fileID;
    const userProvidedPasshash = req.query.passhash;
    const token = req.cookies.jwt;
    const accept = req.headers["accept"];

    const response = await getfile(fileID, userProvidedPasshash, token);

    // Different download page for accessing through browser vs GET
    if (accept.includes("text/html") && response.responseCode === 200) {

        let props: { tokenData?: {}, fileID: string, fileName: string, userProvidedPasshash: string } = {
            fileID,
            fileName: response.extras,
            userProvidedPasshash
        };

        jwt.verify(token, process.env.TOKEN_SECRET, (err: any, verifiedJwt: any) => {
            if(!err) {
                props.tokenData = verifiedJwt
            }
        })

        res.render("download", { layout: "main", title: response.extras, ...props });
    } else {
        if (response.responseCode === 200) {
            // Set appropriate headers for downloading files
            res.set({
                'Content-Disposition': `attachment; filename="${response.extras}"`,
            });
        }
        
        res.status(response.responseCode).send(response.data);
    }
})


/**
 * Delete a specific file by ID.
 * @route ALL /deletefile/:fileID
 * @param {string} fileID
 * @param {string} token
 */
router.all("/deletefile/:fileID", async (req: any, res: any) => {
    const fileID = req.params.fileID;
    const token = req.cookies.jwt;

    const response = await deletefile(fileID, token);

    res.status(response.responseCode).send(response.data);
})


/**
 * Login a user by email and passhash.
 * @route POST /login
 * @param {string} email
 * @param {string} passhash
 */
router.post("/login", async (req: any, res: any) => {
    const email = req.body.email.toLowerCase();
    const passhash = req.body.passhash;

    const response = await login(email, passhash);
    res.status(response.responseCode).send(response.data);
})


/**
 * Log out a user.
 * @route POST /logout
 */
router.post("/logout", async (req: any, res: any) => {
    res.status(301).send("/");
})


/**
 * Register a new user with their details.
 * @route POST /signup
 * @param {string} fname
 * @param {string} lname
 * @param {string} email
 * @param {string} passhash
 */
router.post("/signup", async (req: any, res: any) => {
    const fname = req.body.fname ?? "Fname";
    const lname = req.body.lname ?? "Lname";
    const email = req.body.email.toLowerCase();
    const passhash = req.body.passhash;

    const response = await signup(fname, lname, email, passhash);

    res.status(response.responseCode).send(response.data);
})


/**
 * Get properties of all files belonging to team user is in.
 * @route POST /getfiles
 * @param {string} token
 */
router.get("/getfiles", async (req: any, res: any) => {
    const token = req.cookies.jwt;
    const response = await getfiles(token);
    res.status(response.responseCode).send(response.data);
})


/**
 * Get or set passhash of a file.
 * @route POST /passhash/:fileID
 * @route GET /passhash/:fileID
 * @param {string} fileID
 * @param {string} token
 * @param {string?} passhash
 */
router.all("/passhash/:fileID", async (req: any, res: any) => {
    const fileID = req.params.fileID;
    const token = req.cookies.jwt;
    const passhash = req.body.passhash;

    const response = await filePasshash(fileID, token, passhash);

    res.status(response.responseCode).send(response.data);
})

export default router;