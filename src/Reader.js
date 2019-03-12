require('dotenv').config();
const fs = require('fs');
const { promisify } = require('util');
const Database = require('./services/database');

const { NODE_ENV } = process.env;

class Reader {
  constructor(database) {
    this.registryPath =
      NODE_ENV !== 'test' ? `${process.cwd()}/registry` : `${process.cwd()}/src/__tests__/registry`;

    this.readFile = promisify(fs.readFile);
    this.exists = promisify(fs.exists);
    this.database = database;
  }

  async checkIndexFileExists(registryPath) {
    const checkIndexFileExists = await this.exists(`${registryPath}/odal_index`);

    // UNLIKE WRITER CLASS, WE JUST RETURN TRUE OR FALSE IF THE FILE EXITS
    if (!checkIndexFileExists) return { error: true, meta: 'Index file doesnt exists ' };

    return { error: false, meta: 'Index file exists' };
  }

  async readOdalIndexFile(registryPath) {
    const readedFile = this.readFile(`${registryPath}/odal_index`, 'utf8');

    return { error: false, meta: readedFile };
  }

  async processMigrationFiles(filenames) {
    return filenames.reduce(async (resolved, filename) => {
      try {
        const migrationFile = `${this.registryPath}/${filename}.sql`;
        const fileRead = await this.readFile(migrationFile, 'utf8');
        const fileProcessed = fileRead.replace(/\n/, '');

        return resolved.then(arrayResolved => [
          ...arrayResolved,
          { migration: fileProcessed, filename }
        ]);
      } catch (err) {
        return [{ error: true, meta: err }];
      }
    }, Promise.resolve([]));
  }

  async runMigrations(migrations) {
    this.database.connect();
    return migrations.reduce(async (accumulator, { migration, filename }) => {
      try {
        const query = await this.database.queryToExec(migration);
        if (query.success) {
          return accumulator.then(arr => [...arr, { error: query.success, meta: filename }]);
        }
      } catch (err) {
        return { error: true, meta: err };
      }
    }, Promise.resolve([]));
  }

  async getLastMigration(migrationData) {
    return migrationData.pop();
  }

  async checkIfFileEmpty(lastMigration) {
    // READ THE FILE
    // CHECK IF EMPTY
    // RETURN BOOLEAN
  }

  async migrate() {
    const checkOdalIndexFile = await this.checkIndexFileExists(this.registryPath);

    if (checkOdalIndexFile.error) {
      return { error: true, meta: 'No migrations to run' };
    }

    return this.readOdalIndexFile(this.registryPath)
      .then(indexFileContent => indexFileContent.meta)
      .then(dataWroted => {
        console.log(dataWroted.split('\n').shift());
        const filenames = dataWroted.split('\n');
        return filenames;
      })
      .then(filenames => filenames.filter(e => e !== ''))
      .then(filenamesProcessed => this.processMigrationFiles(filenamesProcessed))
      .then(migrationProcessed => this.runMigrations(migrationProcessed))
      .then(resultOfMigration =>
        resultOfMigration.forEach(dataMigrated =>
          console.log(`Succesfully applied migration for ${dataMigrated.meta}.sql`)
        )
      )
      .then(() => process.exit())
      .catch(err => console.log(err));
  }

  async migrateLast() {
    return this.checkIndexFileExists(this.registryPath)
      .then(async indexFileChecked => {
        if (!indexFileChecked.error) {
          try {
            return this.readOdalIndexFile(this.registryPath);
          } catch (err) {
            return { error: true, meta: 'No migrations to run' };
          }
        }
      })
      .then(odalIndexFileContent => odalIndexFileContent.meta)
      .then(dataWroted => dataWroted.split('\n'))
      .then(filenames => filenames.filter(e => e !== ''))
      .then(filenamesProccessed => this.processMigrationFiles(filenamesProccessed))
      .then(migrationData => this.getLastMigration(migrationData))
      .then(lastMigration => this.checkIfFileEmpty(lastMigration))
      .catch(err => err);
  }
}

module.exports = new Reader(Database);
