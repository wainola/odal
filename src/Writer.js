require('dotenv').config();
const fs = require('fs');
const { promisify } = require('util');

const { NODE_ENV } = process.env;

class Writer {
  constructor() {
    this.registryPath =
      NODE_ENV !== 'test' ? `${process.cwd()}/registry` : `${process.cwd()}/src/__tests__`;

    this.exists = promisify(fs.exists);
    this.mkdir = promisify(fs.mkdir);
  }

  async checkIfRegistryDirectoryExits() {
    try {
      console.log('nodeEnv', NODE_ENV);
      const exitsRegistryFolder = await this.exists(`${this.registryPath}/registry`);

      console.log('exits', exitsRegistryFolder);

      if (!exitsRegistryFolder) return this.createRegistryFolder(this.registryPath);

      return { error: false, meta: 'directory already exists' };
    } catch (err) {
      return { error: true, meta: err };
    }
  }

  async createRegistryFolder(registryPath) {
    try {
      await this.mkdir(`${registryPath}/registry`);

      return { error: false, meta: 'registry folder successfully created' };
    } catch (err) {
      console.log('Some error creating directory', err);
      return { error: true, meta: err };
    }
  }

  async writeFile(path, dataToWrite) {}
}

module.exports = new Writer();
