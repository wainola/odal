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

  // CHECK IF REGISTRY DIRECTORY EXISTS => RETURN BOOLEAN
  async checkIfRegistryDirectoryExits() {
    try {
      const existsRegistryFolder = await this.exists(this.registryPath);

      if (!existsRegistryFolder) return this.createRegistryFolder(this.registryPath);

      return { error: false, meta: 'directory already exists' };
    } catch (err) {
      return { error: true, meta: err };
    }
  }

  // CREATE REGISTRY DIRECTORY
  async createRegistryFolder(registryPath) {
    try {
      await this.mkdir(`${registryPath}`);

      return { error: false, meta: 'registry folder successfully created' };
    } catch (err) {
      return { error: true, meta: 'registry folder already exists' };
    }
  }

  // CHECK INDEX FILE EXISTS
  async checkIndexFileExists() {
    const checkIndexFileExists = await this.exists(`${this.registryPath}/odal_index`);

    if (!checkIndexFileExists) return { error: true, meta: 'Index file doesnt exists ' };

    return { error: false, meta: 'Index file exists' };
  }

  // CREATE INDEX FILE
  async createIndexFile() {
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
