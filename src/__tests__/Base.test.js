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

  // afterAll(async () => {
  //   const eOdalIndex = await exists(`${registryDirPath}/odal_index`);
  //   if (eOdalIndex) {
  //     unlink(`${registryDirPath}/odal_index`).then(() => rmDir(registryDirPath));
  //   }
  // });

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
    const existsRegistryFile = await Base.checkIndexFileExists();
    expect(typeof existsRegistryFile.error).toBe('boolean');
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

  it('doesnt create index file because already exists', async () => {
    writeFile(`${registryDirPath}/odal_index`, '', { flag: 'wx' }).then(async () => {
      const createIndexFile = await Base.createIndexFile();

      expect(createIndexFile.error).toBe(false);
    });
  });
});
