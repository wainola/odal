require('dotenv').config();
const moment = require('moment');
const Base = require('./Base');
const Logger = require('./Logger');
const Postgres = require('./Postgres');

class Reader extends Base {
  constructor(databaseInstance) {
    super(databaseInstance);
  }

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

  async executeQueryMigration(migration) {
    return this.databaseInstance.connect().then(async connected => {
      if (!connected.error) {
        try {
          const query = await this.databaseInstance.queryToExec(migration);
          return query;
        } catch (err) {
          return err;
        }
      }
    });
  }

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

  async returnMigrationResults(data) {
    return Promise.all(
      data
        .filter(item => !item.migratedat)
        .map(async migration => {
          const isMigrated = await this.runSingleMigration(migration.migration_name, 'up');
          const updateRegistryTable = await this.updateRegistryTable(migration.migration_name);

          return {
            response: isMigrated,
            file: migration.migration_name,
            update: updateRegistryTable
          };
        })
    );
  }

  async migrate() {
    return this.getRegistryTableInfo()
      .then(data => this.returnMigrationResults(data))
      .then(async migrationResult => {
        migrationResult.forEach(item => {
          if (item.response.error) {
            Logger.printError(`Error on migration the file ${item.file}: ${item.response.meta}`);
          } else {
            Logger.printInfo(`Success on migrating the file ${item.file}`);
          }
        });
      })
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
    return this.databaseInstance
      .connect()
      .then(() => this.readDir(this.registryPath))
      .then(async contents => {
        const registryArray = [];
        if (Array.isArray(contents)) {
          for (const content of contents) {
            try {
              const query = `INSERT INTO registry (migration_name, createdat) VALUES ('${content}', '${moment().format()}');`;
              const q = await Postgres.queryToExec(query);
              registryArray.push({ success: q.success, filename: content });
            } catch (err) {
              return err;
            }
          }
        }
        return registryArray;
      })
      .then(queryResult => {
        queryResult.forEach(item =>
          Logger.printSuccess(`${item.filename} succesfully addded to the registry table`)
        );
        return process.exit();
      })
      .catch(err => Logger.printError(err));
  }
}

module.exports = new Reader(Postgres);
