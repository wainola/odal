require('dotenv').config();
const moment = require('moment');
const Base = require('./Base');
const Logger = require('./Logger');
const Postgres = require('./Postgres');
const { partition, sortData } = require('../utils');

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

  async returnMigrationResults(data, migrationType) {
    switch (migrationType) {
      case 'up':
        return Promise.all(
          data
            .filter(item => !item.migratedat)
            .map(async migration => {
              console.log('migration', migration);
              const isMigrated = await this.runSingleMigration(
                migration.migration_name,
                migrationType
              );
              const updateRegistryTable = await this.updateRegistryTable(
                migration.migration_name,
                migrationType
              );

              return {
                response: isMigrated,
                file: migration.migration_name,
                update: updateRegistryTable
              };
            })
        );
      case 'down':
        return Promise.all(
          data.map(async migration => {
            const isMigrated = await this.runSingleMigration(
              migration.migration_name,
              migrationType
            );
            const updateRegistryTable = await this.updateRegistryTable(
              migration.migration_name,
              migrationType
            );

            return {
              response: isMigrated,
              file: migration.migration_name,
              update: updateRegistryTable
            };
          })
        );
      default:
        break;
    }
  }

  returnSortedData(data) {
    const processDataToSort = data.map(item => ({
      ...item,
      fileTimestamp: item.migration_name.split('_')[0]
    }));
    const dataSorted = sortData(processDataToSort);
    return dataSorted;
  }

  async migrate() {
    return this.getRegistryTableInfo()
      .then(dataNotSorted => this.returnSortedData(dataNotSorted))
      .then(data => this.returnMigrationResults(data, 'up'))
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
      .then(data => this.returnMigrationResults(data, 'down'))
      .then(() => Logger.printInfo('Success on removing all the tables!'))
      .then(() => process.exit())
      .catch(err => Logger.printError(err));
  }

  async undoLast() {
    return this.getRegistryTableInfo()
      .then(data => this.processRegistryTableData(data))
      .then(dataProcessed => {
        console.log(dataProcessed);
      });
  }

  async processRegistryTableData(data) {
    console.log('data::', data);
    const [_, migrated] = this.dataPartition(data);
    if (migrated.length) {
      return this.computeDateOnMigrationsToResolveLast(migrated);
    }
  }

  dataPartition(data) {
    return partition(data);
  }

  computeDateOnMigrationsToResolveLast(migratedArr) {
    const formatDates = migratedArr.reduce((acc, item) => {
      const [year, month, day, hour, minute, seconds] = moment(item.migratedat)
        .format('YYYY MM DD HH mm ss')
        .split(' ');
      acc = [
        ...acc,
        {
          year,
          month,
          day,
          hour,
          minute,
          seconds
        }
      ];
      return acc;
    }, []);
    // console.log('formated', formatDates);
  }
}

module.exports = new Reader(Postgres);
