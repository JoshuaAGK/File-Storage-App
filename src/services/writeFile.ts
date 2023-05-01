const fs = require('fs');
import { v4 as uuidv4 } from 'uuid';

/**
 * Write the actual file contents to the storage directory
 * @param {string} path
 * @param {string} fileName
 * @param {any} content
 * @returns {Promise<string>}
 */
function writeFile(path: string, fileName: string, content: any): Promise<string> {
    if (!fs.existsSync(path)){
        fs.mkdirSync(path, { recursive: true });
    }
    
    return new Promise<string>((resolve, reject) => {
        fs.writeFile(path + fileName, content, (err: string) => {
            if (!err) {
                resolve(uuidv4());
            }
            reject(err);
        })
    })
}

export default writeFile;