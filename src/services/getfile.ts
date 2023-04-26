import { client } from "../config/mongodb";
import readFile from '../services/readfile';
import HTTPResponse from "../interfaces/httpResponse";

async function getfile(fileID: string, filePasshash: string): Promise<HTTPResponse> {
    let file: { _id: {}; path: string; fileName: string; uploadedOn: string; uploader: string; passhash?: string; } | undefined;

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
    if (file.passhash && file.passhash != filePasshash) {
        return {
            responseCode: 401,
            data: false
        }
    }

    const fullPath = file.path + file.fileName;
    const data = await readFile(fullPath);
    return {
        responseCode: 200,
        data: data,
        extras: file.fileName
    }
}

export default getfile;