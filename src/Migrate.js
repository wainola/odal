class Migrate {
  static async runMigrations(database, migrations) {
    database.connect();
    return migrations.reduce(async (accumulator, { migration, filename }) => {
      try {
        const query = await database.queryToExec(migration);
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

  static async runSingleMigration({ database, data, meta }) {
    const dataToSend = await data;
    database.connect();
    try {
      const query = await database.queryToExec(dataToSend);
      return { success: query.success, meta };
    } catch (err) {
      return { error: err.error, meta: err.meta };
    }
  }
}

module.exports = Migrate;
