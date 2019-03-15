class Migrate {
  static async runMigrations(database, migrations) {
    database.connect();
    return migrations.reduce(async (accumulator, { migration, filename }) => {
      console.log('m::::', migration);
      console.log('f:::', filename);
      try {
        const query = await database.queryToExec(migration);
        console.log('query:::::', query);
        if (query.success) {
          return accumulator.then(arr => {
            console.log('arr:::', arr);
            return [...arr, { error: query.success, meta: filename }];
          });
        }
      } catch (err) {
        return { error: true, meta: err };
      }
      return accumulator;
    }, Promise.resolve([]));
  }

  static async runSingleMigration({ data, meta }) {
    const dataToSend = await data;
    this.database.connect();
    try {
      const query = await this.database.queryToExec(dataToSend);
      return { success: query.success, meta };
    } catch (err) {
      return { error: err.error, meta: err.meta };
    }
  }
}

module.exports = Migrate;
