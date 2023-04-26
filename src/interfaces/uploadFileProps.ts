interface UploadFileProps {
    fileName: string,
    fileBuffer: Buffer,
    teamName: string,
    uid: string,
    size: number
}

export default UploadFileProps;