const fs = require('fs');

function readFile(path: string, encoding: string | null = "utf8") {
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