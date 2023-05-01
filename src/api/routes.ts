const express = require('express');
import { Router } from 'express';
const router: Router = express.Router();
const jwt = require('jsonwebtoken');


/**
 * Landing page.
 * @route GET /
 */
router.get("/", async (req: any, res: any) => {
    routes("landing", "Application", req, res);
})


/**
 * Login page.
 * @route GET /login
 */
router.get("/login", async (req: any, res: any) => {
    routes("login", "Log in", req, res);
})


/**
 * Register page.
 * @route GET /register
 */
router.get("/register", async (req: any, res: any) => {
    routes("register", "Register", req, res);
})


/**
 * App page.
 * @route GET /app
 */
router.get("/app", async (req: any, res: any) => {
    routes("app", "App", req, res);
})


/**
 * Render Handlebars view using props, and verify JWT.
 * @route GET /app
 * @param {string} token
 */
async function routes(view: string, title: string, req: any, res: any) {
    const token = req.cookies.jwt;
    let props: { tokenData?: {} } = {};

    jwt.verify(token, process.env.TOKEN_SECRET, (err: any, verifiedJwt: any) => {
        if(!err) {
            props.tokenData = verifiedJwt
        }
    })

    res.render(view, { layout: "main", title: title, ...props });
}

export default router;