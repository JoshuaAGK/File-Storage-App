import { client } from "../config/mongodb";
import HTTPResponse from "../interfaces/httpResponse";
const jwt = require('jsonwebtoken');
import { ObjectId } from "mongodb";
import User from "../classes/user";
import File from "../classes/file";


/**
 * Get or set passhash of a file.
 * @param {string} fileID
 * @param {string} token
 * @param {string?} passhash
 * @returns {Promise<HTTPResponse>}
 */
async function filePasshash(fileID: string, token: string, passhash?: string): Promise<HTTPResponse> {
    let file = new File;
    let user = new User;

    // Get user details from JWT
    jwt.verify(token, process.env.TOKEN_SECRET, (err: any, verifiedJwt: any) => {
        if(!err) {
            user.teamName = verifiedJwt.teamName;
            user._id = verifiedJwt.uid;
        } else {
            return {
                responseCode: 401,
                data: false
            }
        }
    })

    // Find file in given team's files
    const filesCollection = await client.db(user.teamName).collection("files");
    const foundFile = await filesCollection.findOne({ _id: fileID });
    if (foundFile) {
        file = foundFile;
    }

    // Check file was found
    if (!file) {
        return {
            responseCode: 404,
            data: false
        }
    }

    // Check if logged-in user is authorised
    const usersCollection = await client.db(user.teamName).collection("users");
    const foundUser = await usersCollection.findOne({ _id: new ObjectId(String(user._id)) });


    // If passhash was provided, attempt to upsert passhash to file
    // Otherwise, return passhash of file
    if (typeof passhash === "undefined") {
        // Check user has permission to see passhash of file
        if (foundUser.permissions.read) {
            return {
                responseCode: 200,
                data: file.passhash ?? null
            }
        } else {
            return {
                responseCode: 403,
                data: false
            }
        }
    } else {
        // Check user has permission to modify passhash of file
        if (foundUser.permissions.write) {
            // Set passhash, or unset if nullable
            const setData = passhash ? { $set: { ["passhash"]: passhash } } : { $unset: { ["passhash"]: null } };
            await filesCollection.updateOne({ _id: fileID }, setData)
            return {
                responseCode: 200,
                data: true
            }
        } else {
            return {
                responseCode: 403,
                data: false
            }
        }
    }
}


export default filePasshash;