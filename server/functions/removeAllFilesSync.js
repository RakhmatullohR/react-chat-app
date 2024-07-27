import path from 'path';
import fs from 'fs';
export default async function removeAllFiles (directory) {
    const files = fs.readdir(directory);

    for (const file of files) {
        const filePath = path.join(directory, file);
        fs.unlink(filePath);
    }
}