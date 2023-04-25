const fs = require('fs');

function readFile(path: string) {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(path, 'utf8', (err: string, data: string) => {
            if (!err) {
                resolve(data);
            }
            reject(err);
        })
    })
}

export default readFile;