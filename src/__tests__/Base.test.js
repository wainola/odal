const fs = require('fs');
const { promisify } = require('util');
const Base = require('../helpers/Base');
const Postgres = require('../helpers/Postgres');

const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);
const rmDir = promisify(fs.rmdirSync);
const unlink = promisify(fs.unlink);
const writeFile = promisify(fs.writeFile);

const registryDirPath = `${process.cwd()}/src/__tests__/registry`;

let BaseInstance;
const configTemplate = `module.exports = {
  databaseUrl: 'postgresql://postgres:password@localhost:5432/odal_db'
}`;

describe('Base', () => {
  beforeAll(async () => {
    const existsRegistryDir = await exists(registryDirPath);

    if (!existsRegistryDir) {
      await mkdir(registryDirPath);
      await mkdir(`${registryDirPath}/migrations`);
    }

    BaseInstance = new Base(Postgres);
  });

  // afterAll(async () => {
  //   fs.rmdirSync(`${registryDirPath}/migrations`);
  //   fs.rmdirSync(registryDirPath);
  // });
  it.only('Setup correctly the data for the instance', async () => {
    const expectedKeys = [
      'registryPath',
      'readFile',
      'exists',
      'writeFile',
      'mkdir',
      'readDir',
      'databaseInstance'
    ];
    expect(Object.keys(BaseInstance)).toEqual(expectedKeys);
  });
});
