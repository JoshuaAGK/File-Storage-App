import writeFile from '../services/writeFile';
import { client } from "../config/mongodb";
import UploadFileProps from '../interfaces/uploadFileProps';
import HTTPResponse from '../interfaces/httpResponse';

async function uploadFile(props: UploadFileProps): Promise<HTTPResponse> {
    const fileName = props.fileName;
    const fileBuffer = props.fileBuffer;
    const teamName = props.teamName;
    const uid = props.uid;
    const path = `filestore/${teamName}/`;

    const response = await writeFile(path, fileName, fileBuffer);

    // If writeFile failed, response will not be UUID. UUIDs are 36 characters long.
    if (response.length !== 36) {
        return {
            responseCode: 500,
            data: false
        }
    }

    const filesCollection = client.db(teamName).collection("files");
    const insertResult = await filesCollection.insertOne({
        _id: response,
        path: path,
        fileName: fileName,
        uploadedOn: new Date().toISOString(),
        uploader: uid
    });

    return {
        responseCode: 200,
        data: insertResult
    }
}

export default uploadFile;