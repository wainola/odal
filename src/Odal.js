const moment = require('moment');
const Writer = require('./Writer');
const Reader = require('./Reader');
const Utils = require('./utils');

class Odal {
  static version() {
    console.log('Odal linux version 1.0.0');
  }

  static getInfo(info) {
    console.log('The info introduced is:', info);
  }

  static async create(tableName, fields) {
    const mappedFields = await Utils.mapFields(fields);

    const query = await Utils.buildQuery(mappedFields);

    const date = moment().unix();

    const filename = `${date}_${tableName}`;

    const sqlQuery = await Utils.buildTableQuery(tableName, query);

    return Writer.writeMigrationFile(tableName, filename, sqlQuery)
      .then(migration => console.log(migration.meta))
      .catch(err => console.log('Error on creating the migration file', err.meta));
  }

  static async migrate() {
    return Reader.migrate();
  }

  static async createClean(migrationName) {
    const date = moment().unix();

    const filename = `${date}_${migrationName}`;

    return Writer.writeClean('', filename, migrationName)
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
