const jwt = require('jsonwebtoken');
import User from "../classes/user";

function generateJWT(user: User): string {
    const props = {
        fname: user.fname,
        lname: user.lname,
        teamName: user.teamName,
        uid: String(user._id),
        email: user.email
    }
    const token = jwt.sign(props, process.env.TOKEN_SECRET);
    return token;
}

export default generateJWT;