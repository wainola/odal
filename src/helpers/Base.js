require('dotenv').config();
const fs = require('fs');
const { promisify } = require('util');
const moment = require('moment');
const { pgcryptoQuery, registryTableQuery } = require('../constants');

const { NODE_ENV } = process.env;

class Base {
  constructor(databaseInstance) {
    this.registryPath =
      NODE_ENV !== 'test'
        ? `${process.cwd()}/migrations/registry`
        : `${process.cwd()}/src/__tests__/registry`;

    this.readFile = promisify(fs.readFile);
    this.exists = promisify(fs.exists);
    this.writeFile = promisify(fs.writeFile);
    this.mkdir = promisify(fs.mkdir);
    this.readDir = promisify(fs.readdir);
    this.databaseInstance = databaseInstance;
  }

  async closeConnection() {
    return this.databaseInstance.closeConnection();
  }

  async createPGCryptoExtensionOnInit() {
    return this.databaseInstance
      .connect()
      .then(async () => {
        try {
          const q = await this.databaseInstance.queryToExec(pgcryptoQuery);
          return q;
        } catch (err) {
          return err;
        }
      })
      .catch(err => err);
  }

  async createRegistryTableOnInit() {
    return this.databaseInstance
      .connect()
      .then(async () => {
        try {
          const q = await this.databaseInstance.queryToExec(registryTableQuery);
          return q;
        } catch (err) {
          return err;
        }
      })
      .catch(err => err);
  }

  async updateRegistryTable(content, migrationType) {
    return this.databaseInstance.connect().then(async () => {
      switch (migrationType) {
        case 'up':
          try {
            const query = `UPDATE registry set migratedat='${moment().format()}' WHERE migration_name='${content}';`;
            const qToExec = await this.databaseInstance.queryToExec(query);
            return qToExec;
          } catch (error) {
            return error;
          }
        case 'down':
          try {
            const query = 'UPDATE REGISTRY SET MIGRATEDAT=NULL;';
            const qToExec = await this.databaseInstance.queryToExec(query);
            return qToExec;
          } catch (error) {
            return error;
          }
        default:
          break;
      }
    });
  }

  async getRegistryTableInfo() {
    return this.databaseInstance.connect().then(async () => {
      try {
        const query = 'SELECT migration_name, createdat, migratedat from REGISTRY;';
        const q = await this.databaseInstance.queryToExec(query);
        return q;
      } catch (err) {
        return err;
      }
    });
  }

  async updateRegistry() {
    return this.databaseInstance.connect().then(async () => {
      try {
        const query = 'UPDATE REGISTRY SET migratedat=null;';
        const q = await this.databaseInstance.queryToExec(query);
        return q;
      } catch (err) {
        return err;
      }
    });
  }

  async removeRegistryTable() {
    return this.databaseInstance
      .connect()
      .then(async () => {
        try {
          const query = 'SELECT migratedat FROM REGISTRY';
          const q = await this.databaseInstance.queryToExec(query);

          if (!Array.isArray(q)) {
            const dropQueryOnError = 'DROP TABLE registry;';
            await this.databaseInstance.queryToExec(dropQueryOnError);
            throw new Error('There are not migrations on the table. Removing empty table');
          }

          return q;
        } catch (err) {
          return Promise.reject(err);
        }
      })
      .then(async resultOfQuery => {
        try {
          const areNotMigrated = resultOfQuery.every(item => item.migratedat === null);

          if (!areNotMigrated) {
            return new Error(
              'There are migrations on the database. Undo them all and the run this command'
            );
          }

          const dropQuery = 'DROP TABLE registry;';
          const q2 = await this.databaseInstance.queryToExec(dropQuery);

          if (q2.success) {
            return 'Registry table removed';
          }
        } catch (err) {
          return Promise.reject(err);
        }
      })
      .catch(err => Promise.reject(err));
  }
}

module.exports = Base;
