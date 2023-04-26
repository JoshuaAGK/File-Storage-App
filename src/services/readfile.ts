const fs = require('fs');

function readFile(path: string, encoding: string | null = null): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(path, encoding, (err: string, data: string) => {
            if (!err) {
                resolve(data);
            }
            reject(err);
        })
    })
}

export default readFile;