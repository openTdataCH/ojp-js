const fs = require('fs');
const path = require('path');

const processPath = process.cwd();
const fixturesPath = processPath + '/tests/ojp-fixtures';

export class FileHelpers {
    // relativePath to ./tests/ojp-fixtures folder
    public static loadMockXML(relativePath: string) {
        const mockPath = path.join(fixturesPath, '/' + relativePath);
        const mockXML = fs.readFileSync(mockPath, { encoding: 'utf8' });

        return mockXML;
    }
}