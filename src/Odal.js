const moment = require('moment');
const fs = require('fs');
const { promisify } = require('util');
const Writer = require('./Writer');
const Reader = require('./Reader');
const Utils = require('./utils');
const Logger = require('./Logger');

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

class Odal {
  static async init() {
    Logger.printInfo('Setup everything for your migrations')
      .then(() => Logger.printInfo('Creating migrations directory'))
      .then(() => mkdir(`${process.cwd()}/migrations`))
      .then(() => Logger.printSetupConfigFile('Creating config file'))
      .then(() => writeFile(`${process.cwd()}/migrations/config.yml`, '', { flag: 'wx' }))
      .then(() => Logger.printRegistryFolder('Generating registry folder'))
      .then(() => mkdir(`${process.cwd()}/migrations/registry`))
      .then(() => Logger.printInfo('Creating odal_index file'))
      .then(() => writeFile(`${process.cwd()}/migrations/registry/odal_index`, '', { flag: 'wx' }))
      .then(() => Logger.printSetupTerminated('You are ready to go!'));
  }

  static async create(tableName, fields) {
    const mappedFields = await Utils.mapFields(fields);

    const query = await Utils.buildQuery(mappedFields);

    const date = moment().unix();

    const filename = `${date}_${tableName}`;

    const sqlQuery = await Utils.buildTableQuery(tableName, query);

    return Writer.writeMigrationFile(tableName, filename, sqlQuery)
      .then(migration => Logger.printInfo(migration.meta))
      .catch(err => Logger.printError('Error on creating the migration file', err.meta));
  }

  static async migrate() {
    return Reader.migrate();
  }

  static async createClean(migrationName) {
    const date = moment().unix();

    const filename = `${date}_${migrationName}`;

    const template = await Utils.cleanTemplate();

    return Writer.writeClean(filename, migrationName, template)
      .then(data => console.log(data.meta))
      .then(() => process.exit(1))
      .catch(err => console.log(err.meta));
  }

  static async migrateLast() {
    return Reader.migrateLast()
      .then(message => console.log(message))
      .then(() => process.exit(1))
      .catch(err => console.log(err));
  }

  static async remove() {}

  static async removeLast() {}

  static async getInfo() {}

  static async version() {}

  static async help() {}
}

module.exports = Odal;
