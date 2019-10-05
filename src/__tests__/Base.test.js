const fs = require('fs');
const { promisify } = require('util');
const Base = require('../helpers/Base');
const Postgres = require('../helpers/Postgres');

const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

const registryDirPath = `${process.cwd()}/src/__tests__/registry`;

let BaseInstance;

describe('Base', () => {
  beforeAll(async () => {
    const existsRegistryDir = await exists(registryDirPath);

    if (!existsRegistryDir) {
      await mkdir(registryDirPath);
      await mkdir(`${registryDirPath}/migrations`);
    }

    BaseInstance = new Base(Postgres);
  });

  afterAll(async () => {
    fs.rmdirSync(`${registryDirPath}/migrations`);
    fs.rmdirSync(registryDirPath);
  });
  it('Setup correctly the data for the instance', async () => {
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
