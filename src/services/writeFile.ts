const fs = require('fs');
import { v4 as uuidv4 } from 'uuid';

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