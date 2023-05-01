const fs = require('fs');

/**
 * Get the actual file contents from the storage directory
 * @param {string} path
 * @param {string | null} encoding - File text encoding (e.g. "utf8")
 * @returns {Promise<string>}
 */
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