require('dotenv').config();
const fs = require('fs');
const { promisify } = require('util');

const { NODE_ENV } = process.env;

class Writer {
  constructor() {
    this.registryPath =
      NODE_ENV !== 'test' ? `${process.cwd()}/registry` : `${process.cwd()}/src/__tests__/registry`;

    this.exists = promisify(fs.exists);
    this.mkdir = promisify(fs.mkdir);
  }

  // CHECK => RETURN BOOLEAN
  async checkIfRegistryDirectoryExits() {
    try {
      const exitsRegistryFolder = await this.exists(`${this.registryPath}/registry`);

      if (!exitsRegistryFolder) return this.createRegistryFolder(this.registryPath);

      return { error: false, meta: 'directory already exists' };
    } catch (err) {
      return { error: true, meta: err };
    }
  }

  async checkIfIndexFileExists() {}

  // CREATE REGISTRY DIRECTORY
  async createRegistryFolder(registryPath) {
    try {
      await this.mkdir(`${registryPath}`);

      return { error: false, meta: 'registry folder successfully created' };
    } catch (err) {
      return { error: true, meta: 'registry folder already exists' };
    }
  }

  // WRITE FILE
  async writeFile(path, dataToWrite) {}

  // WRITE INDEX FILE
  async writeFileIndex(filename) {}
}

module.exports = new Writer();
