const express = require('express');
import { Router } from 'express';
const router: Router = express.Router();
const jwt = require('jsonwebtoken');

router.get("/", async (req: any, res: any) => {
    const token = req.cookies.jwt;
    let props: { tokenData?: {} } = {};

    jwt.verify(token, process.env.TOKEN_SECRET, (err: any, verifiedJwt: any) => {
        if(!err) {
            props.tokenData = verifiedJwt
        }
    })

    res.render("landing", { layout: "main", title: "Application", ...props });
})

router.get("/login", async (req: any, res: any) => {
    const token = req.cookies.jwt;
    let props: { tokenData?: {} } = {};

    jwt.verify(token, process.env.TOKEN_SECRET, (err: any, verifiedJwt: any) => {
        if(!err) {
            props.tokenData = verifiedJwt
        }
    })

    res.render("login", { layout: "main", title: "Log in", ...props });
})

router.get("/register", async (req: any, res: any) => {
    const token = req.cookies.jwt;
    let props: { tokenData?: {} } = {};

    jwt.verify(token, process.env.TOKEN_SECRET, (err: any, verifiedJwt: any) => {
        if(!err) {
            props.tokenData = verifiedJwt
        }
    })

    res.render("register", { layout: "main", title: "Register", ...props });
})

router.get("/app", async (req: any, res: any) => {
    const token = req.cookies.jwt;
    let props: { tokenData?: {} } = {};

    jwt.verify(token, process.env.TOKEN_SECRET, (err: any, verifiedJwt: any) => {
        if(!err) {
            props.tokenData = verifiedJwt
        }
    })

    res.render("app", { layout: "main", title: "App", ...props });
})

export default router;