require('dotenv').config();
const Base = require('./Base');
const Postgres = require('./Postgres');
const migrationTemplate = require('./migrationTemplate');

class Writer extends Base {
  async createPGCryptoExtension() {
    return this.createPGCryptoExtensionOnInit();
  }

  async createRegistryTable() {
    return this.createRegistryTableOnInit();
  }

  async writeData(filename, tablename) {
    try {
      await this.writeFile(`${this.registryPath}/${filename}.js`, migrationTemplate);

      return {
        error: false,
        meta: `Migration file for table ${tablename} wroted successfully!`,
        dataToWrite: filename
      };
    } catch (err) {
      return {
        error: true,
        meta: `Problems on making the migration file for ${tablename}`
      };
    }
  }

  // WRITE FILE
  async writeMigrationFile(tablename, filename) {
    return this.writeData(filename, tablename)
      .then(async data => {
        try {
          const q = await Postgres.queryToExec(
            `INSERT INTO REGISTRY(TABLE_NAME) VALUES('${data.dataToWrite}')`
          );
          return { success: q.success, ...data };
        } catch (err) {
          return err;
        }
      })
      .catch(err => err);
  }
}

module.exports = new Writer();
