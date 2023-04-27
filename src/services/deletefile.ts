import { client } from "../config/mongodb";
import HTTPResponse from "../interfaces/httpResponse";
const jwt = require('jsonwebtoken');
import { ObjectId } from "mongodb";
import User from "../classes/user";
import { unlink } from "fs";

async function deletefile(fileID: string, token: string): Promise<HTTPResponse> {
    let user = new User;

    // Get user details from JWT
    jwt.verify(token, process.env.TOKEN_SECRET, (err: any, verifiedJwt: any) => {
        if(!err) {
            user._id = verifiedJwt.uid;
            user.email = verifiedJwt.email;
            user.teamName = verifiedJwt.teamName;
        } else {
            return {
                responseCode: 403,
                data: false
            }
        }
    })

    // Check if logged-in user is authorised
    const usersCollection = await client.db(user.teamName).collection("users");
    const foundUser = await usersCollection.findOne({ _id: new ObjectId(String(user._id)) });

    if (!foundUser.permissions.write) {
        return {
            responseCode: 403,
            data: false
        }
    }

    // Check file exists
    const filesCollection = await client.db(user.teamName).collection("files");
    const foundFile = await filesCollection.findOne({ _id: fileID });

    if (!foundFile) {
        return {
            responseCode: 404,
            data: false
        }
    }

    console.log(foundFile);

    let deletedFile = { deletedCount: 0 };
    
    // Delete file
    unlink(foundFile.path + foundFile.fileName, async (err: any) => {
        deletedFile = await filesCollection.deleteOne({ _id: fileID });
    })

    return {
        responseCode: 200,
        data: true
    }
}

export default deletefile;