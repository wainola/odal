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
}

module.exports = Base;
