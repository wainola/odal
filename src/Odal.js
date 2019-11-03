const moment = require('moment');
const fs = require('fs');
const { promisify } = require('util');
const Writer = require('./helpers/Writer');
const Reader = require('./helpers/Reader');
const Logger = require('./helpers/Logger');

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

class Odal {
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

  static async undo() {
    return Reader.undo();
  }

  static async undoLast() {
    return Reader.undoLast();
  }

  static async removeRegistryTable() {
    return Reader.removeRegistryTable()
      .then(data => Logger.printSuccess(data))
      .then(() => process.exit())
      .catch(err => {
        Logger.printError(err);
        return process.exit();
      });
  }

  static async createRegistryTable() {
    return Reader.createRegistryTableOnInit()
      .then(() => Logger.printSuccess('Success on creating registry table'))
      .then(() => process.exit())
      .catch(() => Logger.printError('Error on creating registry table'));
  }

  static async registryUpdate() {
    return Reader.registryUpdate();
  }

  static async createPgCrypto() {
    return Reader.createPGCryptoExtensionOnInit()
      .then(() => Logger.printSuccess('Success on creating pgcrypto extension'))
      .then(() => process.exit())
      .catch(err => Logger.printError('Error on creating pgcrypto extension'));
  }
}

module.exports = Odal;
