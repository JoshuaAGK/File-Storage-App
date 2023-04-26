import { client } from '../config/mongodb';
const jwt = require('jsonwebtoken');
import File from '../classes/file';
import User from '../classes/user';
import HTTPResponse from '../interfaces/httpResponse';

async function getfiles(token: string): Promise<HTTPResponse> {    
    let user = new User;

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

    const filesCollection = await client.db(user.teamName).collection("files");
    const foundFiles = await filesCollection.find({}).toArray();
    const mappedFiles = foundFiles.map((file: File) => { return { fileName: file.fileName, size: file.size } })

    return {
        responseCode: 200,
        data: mappedFiles
    }
}

export default getfiles;