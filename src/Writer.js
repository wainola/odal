require('dotenv').config();
const fs = require('fs');
const { promisify } = require('util');
const Base = require('./Base');

const { NODE_ENV } = process.env;

class Writer {
  constructor() {
    this.registryPath =
      NODE_ENV !== 'test' ? `${process.cwd()}/registry` : `${process.cwd()}/src/__tests__/registry`;

    this.exists = promisify(fs.exists);
    this.mkdir = promisify(fs.mkdir);
    this.writeFile = promisify(fs.writeFile);
    this.readFile = promisify(fs.readFile);
  }

  // CHECK IF REGISTRY DIRECTORY EXISTS => RETURN BOOLEAN
  async checkIfRegistryDirectoryExits() {
    try {
      const exitsRegistryFolder = await this.exists(`${this.registryPath}/registry`);

      if (!exitsRegistryFolder) return this.createRegistryFolder(this.registryPath);

      return { error: false, meta: 'directory already exists' };
    } catch (err) {
      return { error: true, meta: err };
    }
  }

  // CHECK IF INDEX FILE EXISTS => RETURN BOOLEAN
  // async checkIfIndexFileExists(indexFilePath) {
  //   const checkIndexFile = await this.exists(`${indexFilePath}/odal_index`);
  //   if (!checkIndexFile) return { error: true, meta: 'Index file doesnt exists' };
  //   return { error: false, meta: 'Index file exist' };
  // }

  // CREATE INDEX FILE
  async createIndexFile(indexFilePath) {
    const checkIfIndexExists = await this.checkIfIndexFileExists(indexFilePath);

    // IF THE INDEX FILE DOESNT EXISTS, CREATE IT
    if (checkIfIndexExists.error) {
      try {
        const r = await this.writeFile(`${indexFilePath}/odal_index`, '', { flag: 'wx' });
        return { error: false, meta: 'Odal file created' };
      } catch (err) {
        return { error: true, meta: err };
      }
    }

    return { error: false, meta: 'Index file already exists' };
  }

  // WRITE ON THE INDE FILE
  async writeIndexFile(filepath, dataToWrite) {
    try {
      const dataWroted = await this.readFile(filepath, 'utf8');
      const dToW = `${dataWroted}\n${dataToWrite}`;

      await this.writeFile(filepath, dToW);

      return { error: false, meta: `${dataToWrite}.sql wroted successfully` };
    } catch (err) {
      return { error: true, meta: err };
    }
  }

  // CREATE REGISTRY DIRECTORY
  async createRegistryFolder(registryPath) {
    try {
      await this.mkdir(`${registryPath}`);

      return { error: false, meta: 'registry folder successfully created' };
    } catch (err) {
      return { error: true, meta: 'registry folder already exists' };
    }
  }

  async writeData(dataToWrite, filename, tablename) {
    try {
      this.writeFile(`${this.registryPath}/${filename}.sql`, dataToWrite);

      return {
        error: false,
        meta: `Migration file for table ${tablename} wroted successfully!`
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
      .then(dataWroted => {
        if (!dataWroted.error) {
          return this.checkIfIndexFileExists(this.registryPath);
        }
        return dataWroted.meta;
      })
      .then(checkedIndexFile => {
        if (!checkedIndexFile.error) {
          return this.writeIndexFile(`${this.registryPath}/odal_index`, filename);
        }
      })
      .catch(err => err);
  }

  // WRITE FILE
  async writeMigrationFile(tablename, filename, dataToWrite) {
    // CHECK IF FOLDER REGISTRY EXISTS
    return (
      this.checkIfRegistryDirectoryExits()
        .then(registryFolderResponse => {
          return registryFolderResponse;
        })
        // IF FOLDER IS CREATED THEN WE CREATE THE MIGRATON FILE
        .then(async data => {
          if (!data.error) {
            return this.writeData(dataToWrite, filename, tablename);
          }

          // IF THE FOLDER ALREADY EXISTS, CREATE THE MIGRATION FILE AND
          // WE WRITE ON THE INDEX FILE
          return this.writeData(dataToWrite, filename, tablename);
        })
        // NOW WE WROTE TO THE INDEX FILE
        .then(async migrationFileWroted => {
          if (!migrationFileWroted.error) {
            try {
              const checkIndexFile = await this.checkIfIndexFileExists(this.registryPath);
              return checkIndexFile;
            } catch (err) {
              return err;
            }
          }
        })
        // IF THE INDEX FILE DOESNT EXISTS, WE CREATE IT
        .then(async indexFileChecked => {
          if (indexFileChecked.error) {
            try {
              const createIndexFile = await this.createIndexFile(this.registryPath);
              return createIndexFile;
            } catch (err) {
              return err;
            }
          }

          // IF THE INDEX FILE EXISTS, return
          return indexFileChecked;
        })
        .then(async indexFilecreated => {
          if (!indexFilecreated.error) {
            try {
              const wIndex = await this.writeIndexFile(`${this.registryPath}/odal_index`, filename);
              return wIndex;
            } catch (err) {
              return err;
            }
          }
        })
        .then(wrotedToIndex => wrotedToIndex)
        .catch(err => console.log('Some error', err))
    );
  }
}

module.exports = new Writer();
