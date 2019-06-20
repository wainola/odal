const moment = require('moment');
const fs = require('fs');
const { promisify } = require('util');
const Writer = require('./helpers/Writer');
const Reader = require('./helpers/Reader');
const Utils = require('./utils');
const Logger = require('./helpers/Logger');

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

class Odal {
  constructor(databaseUrl) {
    this.database = databaseUrl;
  }

  static test() {
    console.log('this.database');
  }

  static async init() {
    Logger.printInfo('Setup everything for your migrations')
      .then(() => Logger.printInfo('Creating migrations directory'))
      .then(() => mkdir(`${process.cwd()}/migrations`))
      .then(() => Logger.printSetupConfigFile('Creating config file'))
      .then(() => writeFile(`${process.cwd()}/migrations/config.js`, '', { flag: 'wx' }))
      .then(() => Logger.printRegistryFolder('Generating registry folder'))
      .then(() => mkdir(`${process.cwd()}/migrations/registry`))
      .then(() => Logger.printSetupTerminated('You are ready to go!'))
      .catch(err => Logger.printError(err));
  }

  static async postgres() {
    return Logger.printInfo('Setup for postgres DB')
      .then(() => Logger.printInfo('Creating pgCrypto extension'))
      .then(() => Writer.createPGCryptoExtension())
      .then(() => Logger.printInfo('Creating registry table'))
      .then(() => Writer.createRegistryTable())
      .then(() => Logger.printInfo('You are ready to go with Postgres'))
      .then(() => process.exit())
      .catch(err => Logger.printError(err));
  }

  static async status() {
    return Reader.getStatus();
  }

  static async create(tableName) {
    const date = moment().unix();

    const filename = `${date}_${tableName}`;

    return Writer.writeMigrationFile(tableName, filename)
      .then(migration => Logger.printInfo(migration.meta))
      .then(() => process.exit())
      .catch(err => Logger.printError('Error on creating the migration file', err.meta));
  }

  static async migrate() {
    return Reader.migrate();
  }
}

module.exports = Odal;
