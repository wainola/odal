require('dotenv').config();
const moment = require('moment');
const Base = require('./Base');
const Logger = require('./Logger');
const Postgres = require('./Postgres');

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

  // eslint-disable-next-line class-methods-use-this
  async runUpMigration(up) {
    return Postgres.connect().then(async connected => {
      if (!connected.error) {
        try {
          const query = await Postgres.queryToExec(up);
          return query;
        } catch (err) {
          return err;
        }
      }
    });
  }

  async runSingleMigration(migrationFile) {
    try {
      const pathToFile = `${this.registryPath}/${migrationFile}`;

      const { up } = require(pathToFile);
      return this.runUpMigration(up);
    } catch (err) {
      return err;
    }
  }

  async migrate() {
    return this.readDir(`${this.registryPath}`)
      .then(async contents => {
        const migrationResult = [];
        for (const content of contents) {
          const migrated = await this.runSingleMigration(content);
          const updateRegistryTable = await this.updateRegistryTable(content);
          migrationResult.push({ response: migrated, file: content });
        }
        return migrationResult;
      })
      .then(migrationResult =>
        migrationResult.forEach(item => {
          if (item.response.error) {
            Logger.printError(`Error on migration the file ${item.file}: ${item.response.meta}`);
          } else {
            Logger.printInfo(`Success on migrating the file ${item.file}`);
          }
        })
      )
      .then(() => process.exit())
      .catch(err => Logger.printError(err));
  }
}

module.exports = new Reader();
