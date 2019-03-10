const moment = require('moment');
const Writer = require('./Writer');
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

    // console.log(mappedFields, query, date, filename, sqlQuery);

    return Writer.writeMigrationFile(tableName, filename, sqlQuery)
      .then(migration => console.log(migration.meta))
      .catch(err => console.log('Error on creating the migration file', err.meta));
  }
}

module.exports = Odal;
