require('dotenv').config();
const fs = require('fs');
const { promisify } = require('util');
const Database = require('./services/database');

const { NODE_ENV } = process.env;

class Base {
  constructor(database) {
    this.registryPath =
      NODE_ENV !== 'test' ? `${process.cwd()}/registry` : `${process.cwd()}/src/__tests__/registry`;

    this.readFile = promisify(fs.readFile);
    this.exists = promisify(fs.exists);
    this.writeFile = promisify(fs.writeFile);
    this.database = database;
  }

  async checkIndexFileExists() {
    const checkIndexFileExists = await this.exists(`${this.registryPath}/odal_index`);

    // UNLIKE WRITER CLASS, WE JUST RETURN TRUE OR FALSE IF THE FILE EXITS
    if (!checkIndexFileExists) return { error: true, meta: 'Index file doesnt exists ' };

    return { error: false, meta: 'Index file exists' };
  }

  // CREATE INDEX FILE
  async createIndexFile(indexFilePath) {
    const checkIfIndexExists = await this.checkIndexFileExists();

    // IF THE INDEX FILE DOESNT EXISTS, CREATE IT
    if (checkIfIndexExists.error) {
      try {
        const r = await this.writeFile(`${this.registryPath}/odal_index`, '', { flag: 'wx' });
        return { error: false, meta: 'Odal file created' };
      } catch (err) {
        return { error: true, meta: err };
      }
    }

    return { error: false, meta: 'Index file already exists' };
  }
}

module.exports = new Base(Database);
