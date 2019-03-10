require('dotenv').config();
const fs = require('fs');
const { promisify } = require('util');

const { NODE_ENV } = process.env;

class Reader {
  constructor() {
    this.registryPath =
      NODE_ENV !== 'test' ? `${process.cwd()}/registry` : `${process.cwd()}/src/__tests__/registry`;

    this.readFile = promisify(fs.readFile);
    this.exists = promisify(fs.exists);
  }

  async checkIndexFileExists(registryPath) {
    const checkIndexFileExists = await this.exists(`${registryPath}/odal_index`);

    // UNLIKE WRITER CLASS, WE JUST RETURN TRUE OR FALSE IF THE FILE EXITS
    if (!checkIndexFileExists) return { error: true, meta: 'Index file doesnt exists ' };

    return { error: false, meta: 'Index file exists' };
  }

  async readOdalIndexFile(registryPath) {
    const readedFile = this.readFile(`${registryPath}/odal_index`, 'utf8');

    return { error: false, meta: readedFile };
  }

  async migrate() {
    const checkOdalIndexFile = await this.checkIndexFileExists(this.registryPath);

    if (checkOdalIndexFile.error) {
      return { error: true, meta: 'No migrations to run' };
    }
  }
}

module.exports = new Reader();
