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
            `${idx + 1}\t${item.migration_name}\t\t${moment(item.createdat).format(
              'DD/MM/YYYY HH:mm:ss'
            )}\t${
              item.migratedat !== null
                ? moment(item.migratedat).format('DD/MM/YYYY HH:mm:ss')
                : 'Not migrated'
            }`
          );
        });

        console.log('\n');
      })
      .then(() => process.exit())
      .catch(err => Logger.printError(err));
  }

  getRegistryPath() {
    return this.registryPath;
  }

  // eslint-disable-next-line class-methods-use-this
  async executeQueryMigration(migration) {
    return Postgres.connect().then(async connected => {
      if (!connected.error) {
        try {
          const query = await Postgres.queryToExec(migration);
          return query;
        } catch (err) {
          return err;
        }
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async runUpMigration(up) {
    return this.executeQueryMigration(up);
  }

  async runDownMigration(down) {
    return this.executeQueryMigration(down);
  }

  async runSingleMigration(migrationFile, type) {
    try {
      const pathToFile = `${this.registryPath}/${migrationFile}`;
      const { up, down } = require(pathToFile);

      if (type === 'up') {
        return this.runUpMigration(up);
      }

      if (type === 'down') {
        return this.runDownMigration(down);
      }
    } catch (err) {
      return err;
    }
  }

  async migrate() {
    return this.getRegistryTableInfo()
      .then(async data => {
        const migrationResult = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const item of data) {
          if (!item.migratedat) {
            const migrated = await this.runSingleMigration(item.migration_name, 'up');

            const updateRegistryTable = await this.updateRegistryTable(item.migration_name);

            migrationResult.push({
              response: migrated,
              file: item.migration_name,
              update: updateRegistryTable
            });
          }
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

  async undo() {
    return this.getRegistryTableInfo()
      .then(async data => {
        const migratedTables = data
          .filter(item => item.migratedat)
          .map(elem => elem.migration_name)
          .reverse();
        return migratedTables;
      })
      .then(async migratedTables => {
        const migrationResult = [];
        for (const migration of migratedTables) {
          const migrated = await this.runSingleMigration(migration, 'down');
          migrationResult.push(migrated);
        }
        const success = migrationResult.every(item => item.success);
        return success;
      })
      .then(success => {
        if (success) {
          return this.updateRegistry();
        }
      })
      .then(() => Logger.printInfo('Success on removing all the tables!'))
      .then(() => process.exit())
      .catch(err => Logger.printError(err));
  }

  async registryUpdate() {
    return Postgres.connect()
      .then(() => this.readDir(this.registryPath))
      .then(async contents => {
        if (Array.isArray(contents)) {
          for (const content of contents) {
            try {
              const query = `INSERT INTO registry (migration_name, createdat) VALUES ('${content}', NOW());`;
              const q = await Postgres.queryToExec(query);
              return q;
            } catch (err) {
              return err;
            }
          }
        }
      })
      .then(queryResult => console.log(queryResult))
      .catch(err => Logger.printError(err));
  }
}

module.exports = new Reader();
