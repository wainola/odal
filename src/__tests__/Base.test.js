const fs = require('fs');
const { promisify } = require('util');
const Base = require('../Base');

const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);
const rmDir = promisify(fs.rmdirSync);
const unlink = promisify(fs.unlink);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);

const registryDirPath = `${process.cwd()}/src/__tests__/registry`;

describe('Base', () => {
  beforeAll(async () => {
    const existsRegistryDir = await exists(registryDirPath);

    if (!existsRegistryDir) {
      await mkdir(registryDirPath);
    }
  });

  afterAll(async () => {
    try {
      const deleteIndex = await unlink(`${registryDirPath}/odal_index`);
      const deleteDirectory = await rmDir(registryDirPath);
      console.log('deletedFile', deleteIndex, deleteDirectory);
    } catch (err) {
      console.log('err:', err);
    }
  });

  it('Setup correctly the data for the instance', async () => {
    const expectedKeys = ['registryPath', 'readFile', 'exists', 'writeFile', 'database'];
    expect(Object.keys(Base)).toEqual(expectedKeys);
  });

  it('check the registry directory exists', async () => {
    Base.checkIfRegistryDirectoryExits().then(response =>
      expect(typeof response.error).toBe('boolean')
    );
  });

  it('test checkIndexFileExits method', async () => {
    try {
      const existsRegistryFile = await Base.checkIndexFileExists();
      expect(typeof existsRegistryFile.error).toBe('boolean');
    } catch (err) {
      console.log('test checkIndexFileExits method error', err);
    }
  });

  it('test createIndexFile method', async () => {
    const eOdalIndex = await exists(`${registryDirPath}/odal_index`);

    if (eOdalIndex) {
      await unlink(`${registryDirPath}/odal_index`);

      Base.createIndexFile()
        .then(response => {
          expect(response.error).toBe(false);
        })
        .then(async () => unlink(`${registryDirPath}/odal_index`));
    }
  });

  it('doesnt create index file because already exists', () => {
    writeFile(`${registryDirPath}/odal_index`, '', { flag: 'wx' }).then(async () => {
      try {
        const createIndexFile = await Base.createIndexFile();
        expect(createIndexFile.error).toBe(true);
      } catch (err) {
        console.log('err:', err);
      }
    });
  });
});
