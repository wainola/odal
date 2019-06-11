require('dotenv').config();
const moment = require('moment');
const Base = require('./Base');
const Migrate = require('./Migrate');
const Database = require('./services/database');
const Logger = require('./Logger');
const ErrorsDictionary = require('./Errors');
const Utils = require('./utils');

class Reader extends Base {
  async getStatus() {
    return this.getRegistryTableInfo()
      .then(data => {
        console.log('MIGRATION STATUS');
        console.log();
        console.log(`#\tMigration Name\t\t\tCreated at\t\tMigrated at`);
        data.forEach((item, idx) => {
          console.log(
            `${idx + 1}\t${item.migration_name}\t\t${moment(item.createat).format(
              'DD/MM/YYYY HH:mm:ss'
            )}\t${
              item.migratedat !== null
                ? moment(item.migratedat).format('DD/MM/YYYY HH:mm:ss')
                : 'Not migrated'
            }`
          );
        });
      })
      .catch(err => Logger.printError(err));
  }

  getRegistryPath() {
    return this.registryPath;
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
    return Migrate.runMigrations(this.database, migrations);
  }

  async runDownMigrations(downMigrations) {
    return Migrate.runDownMigrations(this.database, downMigrations);
  }

  async getLastMigration(migrationData) {
    return migrationData.pop();
  }

  async checkIfFileEmpty(lastMigration) {
    return this.readMigrationFile(lastMigration.filename)
      .then(async dataReaded => {
        const content = await dataReaded.data;

        if (content !== '') {
          const upMigration = await Migrate.getUpMigration([
            { migration: content, filename: dataReaded.meta }
          ]);
          return this.runSingleMigration(upMigration);
        }

        return dataReaded;
      })
      .catch(err => err);
  }

  async readMigrationFile(filename) {
    try {
      const readFile = this.readFile(`${this.registryPath}/${filename}.sql`, 'utf8');
      return { data: readFile, meta: filename };
    } catch (err) {
      return { error: true, meta: err.meta };
    }
  }

  async runSingleMigration([{ upMigration, filename }]) {
    return Migrate.runSingleMigration({ database: this.database, upMigration, filename });
  }

  async migrate() {
    return this.readOdalIndexFile(this.registryPath)
      .then(dataWroted => {
        const filenames = dataWroted.split('\n');
        const filteredFilenames = filenames.filter(e => e !== '');
        return filteredFilenames;
      })
      .then(filenamesProcessed => this.processMigrationFiles(filenamesProcessed))
      .then(resultedFilenames => Migrate.getUpMigration(resultedFilenames))
      .then(migrationProcessed => this.runMigrations(migrationProcessed))
      .then(resultOfMigration =>
        resultOfMigration.forEach(dataMigrated =>
          Logger.printSuccess(`Succesfully applied migration for ${dataMigrated.meta}.sql`)
        )
      )
      .then(() => process.exit())
      .catch(err => Logger.printError(err));
  }

  async migrateLast() {
    return this.checkIndexFileExists(this.registryPath)
      .then(async indexFileChecked => {
        if (!indexFileChecked.error) {
          try {
            return this.readOdalIndexFile(this.registryPath);
          } catch (err) {
            return ErrorsDictionary['no-migrations'];
          }
        }
      })
      .then(odalIndexFileContent => odalIndexFileContent.meta)
      .then(dataWroted => dataWroted.split('\n'))
      .then(filenames => filenames.filter(e => e !== ''))
      .then(filenamesProccessed => this.processMigrationFiles(filenamesProccessed))
      .then(migrationData => this.getLastMigration(migrationData))
      .then(lastMigration => this.checkIfFileEmpty(lastMigration))
      .then(fileReaded => {
        // I THINK THAT THIS IF IS USELESS
        if (fileReaded.success) {
          return `Success on running the migration file for ${fileReaded.filename}`;
        }
      })
      .catch(err => err);
  }

  async remove() {
    return this.checkIndexFileExists()
      .then(async indexFileChecked => {
        if (!indexFileChecked.error) {
          try {
            return this.readOdalIndexFile();
          } catch (err) {
            return ErrorsDictionary['no-migrations'];
          }
        }
      })
      .then(odalIndexFileContent => odalIndexFileContent)
      .then(indexFileContent => Utils.filterFileNames(indexFileContent))
      .then(filteredFilenames => this.processMigrationFiles(filteredFilenames))
      .then(migrationData => Migrate.getDownMigration(migrationData))
      .then(downMigrations => this.runDownMigrations(downMigrations))
      .then(resultOfMigrations => {
        resultOfMigrations.forEach(dataMigrated => {
          Logger.printSuccess(`Success on applying down migration on ${dataMigrated.meta}.sql`);
        });
      })
      .then(() => process.exit())
      .catch(err => Logger.printError(err));
  }
}

module.exports = new Reader(Database);
