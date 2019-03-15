require('dotenv').config();
const fs = require('fs');
const { promisify } = require('util');
const Database = require('./services/database');
const Migrate = require('./Migrate');

const { NODE_ENV } = process.env;

class Reader {
  constructor(database) {
    this.registryPath =
      NODE_ENV !== 'test' ? `${process.cwd()}/registry` : `${process.cwd()}/src/__tests__/registry`;

    this.readFile = promisify(fs.readFile);
    this.exists = promisify(fs.exists);
    this.database = database;
  }

  async checkIndexFileExists(registryPath) {
    const checkIndexFileExists = await this.exists(`${registryPath}/odal_index`);

    // UNLIKE WRITER CLASS, WE JUST RETURN TRUE OR FALSE IF THE FILE EXITS
    if (!checkIndexFileExists) return { error: true, meta: 'Index file doesnt exists ' };

    return { error: false, meta: 'Index file exists' };
  }

  async readOdalIndexFile(registryPath) {
    const readedFile = this.readFile(`${registryPath}/odal_index`, 'utf8');

    return { error: false, meta: readedFile };
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
    console.log('MMMM:::', migrations);
    return Migrate.runMigrations(this.database, migrations);
  }

  async getLastMigration(migrationData) {
    return migrationData.pop();
  }

  async checkIfFileEmpty(lastMigration) {
    return this.readMigrationFile(lastMigration.filename)
      .then(dataReaded => {
        if (dataReaded !== '') {
          return this.runSingleMigration(dataReaded);
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

  async runSingleMigration({ data, meta }) {
    return Migrate.runSingleMigration({ data, meta });
  }

  async migrate() {
    const checkOdalIndexFile = await this.checkIndexFileExists(this.registryPath);

    if (checkOdalIndexFile.error) {
      return { error: true, meta: 'No migrations to run' };
    }

    return this.readOdalIndexFile(this.registryPath)
      .then(indexFileContent => indexFileContent.meta)
      .then(dataWroted => {
        console.log(dataWroted.split('\n').shift());
        const filenames = dataWroted.split('\n');
        return filenames;
      })
      .then(filenames => filenames.filter(e => e !== ''))
      .then(filenamesProcessed => this.processMigrationFiles(filenamesProcessed))
      .then(p => {
        console.log('p:::', p);
        return p;
      })
      .then(migrationProcessed => this.runMigrations(migrationProcessed))
      .then(resultOfMigration =>
        resultOfMigration.forEach(dataMigrated =>
          console.log(`Succesfully applied migration for ${dataMigrated.meta}.sql`)
        )
      )
      .then(() => process.exit())
      .catch(err => console.log(err));
  }

  async migrateLast() {
    return this.checkIndexFileExists(this.registryPath)
      .then(async indexFileChecked => {
        if (!indexFileChecked.error) {
          try {
            return this.readOdalIndexFile(this.registryPath);
          } catch (err) {
            return { error: true, meta: 'No migrations to run' };
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
          return `Success on running the migration file for ${fileReaded.meta}`;
        }
      })
      .catch(err => err);
  }
}

module.exports = new Reader(Database);
