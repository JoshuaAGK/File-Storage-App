const jwt = require('jsonwebtoken');

function generateJWT(props: { fname: string; lname: string; teamName: string; uid: string; email: string; }): string {
    const token = jwt.sign(props, process.env.TOKEN_SECRET);
    return token;
}

export default generateJWT;