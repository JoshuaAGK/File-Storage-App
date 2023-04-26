import { client } from "../config/mongodb";
import readFile from '../services/readfile';
import HTTPResponse from "../interfaces/httpResponse";
const jwt = require('jsonwebtoken');
import { ObjectId } from "mongodb";
import User from "../classes/user";
import File from "../classes/file";

async function getfile(fileID: string, filePasshash: string, token: string): Promise<HTTPResponse> {
    let file = new File;
    let user = new User;

    // Get list of all teams
    const databases = await client.db().admin().listDatabases();
    const globalDatabases = ["admin", "local"];
    const teamDatabases = databases.databases.filter((database: any) => !globalDatabases.includes(database.name.toLowerCase())).map((database: any) => database.name);

    // Iterate through teams to find the requested file.
    for (const teamDatabase of teamDatabases) {
        const filesCollection = await client.db(teamDatabase).collection("files");
        const foundFile = await filesCollection.findOne({ _id: fileID });
        if (foundFile) {
            file = foundFile;
            break;
        }
    }

    // Check file was found
    if (!file) {
        return {
            responseCode: 404,
            data: false
        }
    }

    // If file is password protected, check password is correct
    if (file.passhash && file.passhash === filePasshash) {
        return fileContents(file);
    }

    // Get user details from JWT
    jwt.verify(token, process.env.TOKEN_SECRET, (err: any, verifiedJwt: any) => {
        if(!err) {
            user.teamName = verifiedJwt.teamName;
            user._id = verifiedJwt.uid;
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

    if (foundUser.permissions.read) {
        return fileContents(file);
    }

    return {
        responseCode: 401,
        data: false
    }
}

async function fileContents(file: File): Promise<HTTPResponse> {
    const data = await readFile(file.path + file.fileName);
    return {
        responseCode: 200,
        data: data,
        extras: file.fileName
    }
}

export default getfile;