const Utils = require('./utils');

class Migrate {
  static async runMigrations(database, migrations) {
    database.connect();
    return migrations.reduce(async (accumulator, { upMigration, filename }) => {
      try {
        const query = await database.queryToExec(upMigration);
        if (query.success) {
          return accumulator.then(arr => {
            return [...arr, { error: query.success, meta: filename }];
          });
        }
      } catch (err) {
        return { error: true, meta: err };
      }
      return accumulator;
    }, Promise.resolve([]));
  }

  static async runDownMigrations(database, downMigrations) {
    await database.connect();
    return downMigrations.reduce(async (accumulator, { downMigration, filename }) => {
      try {
        const query = await database.queryToExec(downMigration);
        if (query.success) {
          return accumulator.then(arr => {
            return [...arr, { error: query.success, meta: filename }];
          });
        }
      } catch (err) {
        return { error: true, meta: err };
      }

      return accumulator;
    }, Promise.resolve([]));
  }

  static async runSingleMigration({ database, upMigration, filename }) {
    database.connect();
    try {
      const query = await database.queryToExec(upMigration);
      return { success: query.success, filename };
    } catch (err) {
      return { error: err.error, meta: err.meta };
    }
  }

  static async getUpMigration(migrationData) {
    const sentences = migrationData.map(data => data.migration);
    const upSentences = await Utils.getUpSentences(sentences);
    const upMigrationsProcessed = upSentences.reduce((acc, item, idx) => {
      acc.push({ upMigration: item, filename: migrationData[idx].filename });
      return acc;
    }, []);
    return upMigrationsProcessed;
  }

  static async getDownMigration(migrationData) {
    const sentences = migrationData.map(data => data.migration);
    const downSentences = await Utils.getDownSentences(sentences);
    const downMigrationProcessed = downSentences.reduce((acc, item, idx) => {
      acc.push({ downMigration: item, filename: migrationData[idx].filename });
      return acc;
    }, []);

    return downMigrationProcessed;
  }
}

module.exports = Migrate;
