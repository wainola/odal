const fs = require('fs');
const { promisify } = require('util');
const Base = require('../Base');

const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);
const rmDir = promisify(fs.rmdirSync);

const registryDirPath = `${process.cwd()}/src/__tests__/registry`;

describe('Base', () => {
  beforeAll(async () => {
    const existsRegistryDir = await exists(registryDirPath);

    console.log('e:', existsRegistryDir);
    if (!existsRegistryDir) {
      await mkdir(registryDirPath);
    }
  });

  afterAll(async () => {
    rmDir(registryDirPath).then(d => console.log('d:', d));
  });
  it('Setup correctly the data for the instance', () => {
    const expectedKeys = ['registryPath', 'readFile', 'exists', 'writeFile', 'database'];
    expect(Object.keys(Base)).toEqual(expectedKeys);
  });

  it('test checkIndexFileExits method', async () => {
    const exitsRegistryFile = await Base.checkIndexFileExists();
    expect(exitsRegistryFile.error).toBe(false);
  });

  it('test createIndexFile method', async () => {
    console.log(await Base.createIndexFile());
  });
});
