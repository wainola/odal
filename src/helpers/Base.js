require('dotenv').config();
const fs = require('fs');
const { promisify } = require('util');
const moment = require('moment');
const Postgres = require('./Postgres');
const { pgcryptoQuery, registryTableQuery } = require('../constants');

const { NODE_ENV } = process.env;

class Base {
  constructor() {
    this.registryPath =
      NODE_ENV !== 'test'
        ? `${process.cwd()}/migrations/registry`
        : `${process.cwd()}/src/__tests__/registry`;

    this.readFile = promisify(fs.readFile);
    this.exists = promisify(fs.exists);
    this.writeFile = promisify(fs.writeFile);
    this.mkdir = promisify(fs.mkdir);
    this.readDir = promisify(fs.readdir);
  }

  // eslint-disable-next-line class-methods-use-this
  async createPGCryptoExtensionOnInit() {
    return Postgres.connect()
      .then(async () => {
        try {
          const q = await Postgres.queryToExec(pgcryptoQuery);
          return q;
        } catch (err) {
          return err;
        }
      })
      .catch(err => err);
  }

  // eslint-disable-next-line class-methods-use-this
  async createRegistryTableOnInit() {
    return Postgres.connect()
      .then(async () => {
        try {
          const q = await Postgres.queryToExec(registryTableQuery);
          return q;
        } catch (err) {
          return err;
        }
      })
      .catch(err => err);
  }

  // eslint-disable-next-line class-methods-use-this
  async updateRegistryTable(content) {
    return Postgres.connect().then(async () => {
      try {
        const query = `UPDATE registry set migratedat='${moment().format()}' WHERE migration_name='${content}';`;
        const qToExec = await Postgres.queryToExec(query);
        return qToExec;
      } catch (err) {
        return err;
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async getRegistryTableInfo() {
    return Postgres.connect().then(async () => {
      try {
        const query = 'SELECT migration_name, createdat, migratedat from REGISTRY;';
        const q = await Postgres.queryToExec(query);
        return q;
      } catch (err) {
        return err;
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async updateRegistry() {
    return Postgres.connect().then(async () => {
      try {
        const query = 'UPDATE REGISTRY SET migratedat=null;';
        const q = await Postgres.queryToExec(query);
        return q;
      } catch (err) {
        return err;
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async removeRegistryTable() {
    return Postgres.connect()
      .then(async () => {
        try {
          const query = 'SELECT migratedat FROM REGISTRY';
          const q = await Postgres.queryToExec(query);

          if (!Array.isArray(q)) {
            const dropQueryOnError = 'DROP TABLE registry;';
            await Postgres.queryToExec(dropQueryOnError);
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
          const q2 = await Postgres.queryToExec(dropQuery);

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
