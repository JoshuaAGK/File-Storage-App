const fs = require('fs');

function writeFile(path: string, fileName: string, content: any) {
    if (!fs.existsSync(path)){
        fs.mkdirSync(path, { recursive: true });
    }
    
    return new Promise<string | void>((resolve, reject) => {
        fs.writeFile(path + fileName, content, (err: string) => {
            if (!err) {
                resolve();
            }
            reject(err);
        })
    })
}

export default writeFile;