require('dotenv').config();
const Base = require('./Base');

class Writer extends Base {
  async createPGCryptoExtension() {
    return this.createPGCryptoExtensionOnInit();
  }

  async createRegistryTable() {
    return this.createRegistryTableOnInit();
  }

  // WRITE ON THE INDE FILE
  async writeIndexFile(dataToWrite) {
    try {
      const dataWroted = await this.readFile(`${this.registryPath}/odal_index`, 'utf8');
      const dToW = `${dataWroted}\n${dataToWrite}`;

      await this.writeFile(`${this.registryPath}/odal_index`, dToW);

      return { error: false, meta: `${dataToWrite}.sql wroted successfully` };
    } catch (err) {
      return { error: true, meta: err };
    }
  }

  async writeData(dataToWrite, filename, tablename) {
    try {
      this.writeFile(`${this.registryPath}/${filename}.sql`, dataToWrite);

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

  async writeClean(filename, migrationName, template) {
    return this.writeData(template, filename, migrationName)
      .then(migrationFileWrote => this.writeIndexFile(migrationFileWrote.dataToWrite))
      .catch(err => err);
  }

  // WRITE FILE
  async writeMigrationFile(tablename, filename, dataToWrite) {
    return this.writeData(dataToWrite, filename, tablename)
      .then(migrationMetaData => this.updateRegistryTable(migrationMetaData))
      .then(migrationFileWrote => this.writeIndexFile(migrationFileWrote.dataToWrite))
      .catch(err => err);
  }
}

module.exports = new Writer();
