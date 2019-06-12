require('dotenv').config();
const fs = require('fs');
const { promisify } = require('util');
const moment = require('moment');
const { pgcryptoQuery, registryTableQuery } = require('../constants');

const { NODE_ENV } = process.env;

class Base {
  constructor(database) {
    this.registryPath =
      NODE_ENV !== 'test'
        ? `${process.cwd()}/migrations/registry`
        : `${process.cwd()}/src/__tests__/registry`;

    this.readFile = promisify(fs.readFile);
    this.exists = promisify(fs.exists);
    this.writeFile = promisify(fs.writeFile);
    this.mkdir = promisify(fs.mkdir);
  }

  // CHECK IF REGISTRY DIRECTORY EXISTS => RETURN BOOLEAN
  async checkIfRegistryDirectoryExits() {
    try {
      const existsRegistryFolder = await this.exists(this.registryPath);

      if (!existsRegistryFolder) return this.createRegistryFolder();

      return { error: false, meta: 'directory already exists' };
    } catch (err) {
      return { error: true, meta: err };
    }
  }

  // CREATE REGISTRY DIRECTORY
  async createRegistryFolder() {
    try {
      await this.mkdir(`${this.registryPath}`);

      return { error: false, meta: 'registry folder successfully created' };
    } catch (err) {
      return { error: true, meta: 'registry folder already exists' };
    }
  }

  // CHECK INDEX FILE EXISTS
  async checkIndexFileExists() {
    const checkIndexFileExists = await this.exists(`${this.registryPath}/odal_index`);

    if (!checkIndexFileExists) return { error: true, meta: "Index file doesn't exists" };

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

  async readOdalIndexFile() {
    try {
      return this.readFile(`${this.registryPath}/odal_index`, 'utf8');
    } catch (err) {
      return err;
    }
  }

  async createPGCryptoExtensionOnInit() {
    await this.database.connect();
    try {
      const q = await this.database.queryToExec(pgcryptoQuery);
      return { success: q.success };
    } catch (err) {
      return { error: err.error, meta: err.meta };
    }
  }

  async createRegistryTableOnInit() {
    try {
      const q = await this.database.queryToExec(registryTableQuery);
      return { success: q.success };
    } catch (err) {
      return { error: err.error, meta: err.meta };
    }
  }

  async updateRegistryTable(migrationMetaData) {
    await this.database.connect();
    try {
      const q = await this.database.queryToExec(`
        INSERT INTO registry (migration_name) VALUES ('${
          migrationMetaData.dataToWrite
        }') RETURNING *;
      `);
      return migrationMetaData;
    } catch (err) {
      return err;
    }
  }

  async getRegistryTableInfo() {
    await this.database.connect();
    try {
      const q = await this.database.queryToExec(
        'SELECT migration_name, createat, migratedat FROM registry;'
      );
      return q;
    } catch (err) {
      return err;
    }
  }
}

module.exports = Base;
