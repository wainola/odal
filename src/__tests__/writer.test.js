require('dotenv').config();
const fs = require('fs');
const { promisify } = require('util');
const Writer = require('../Writer');

const { NODE_ENV } = process.env;

const rmdir = promisify(fs.rmdir);
const exists = promisify(fs.exists);
const unlink = promisify(fs.unlink);

const registryTestPath =
  NODE_ENV !== 'test' ? `${process.cwd()}/registry` : `${process.cwd()}/src/__tests__/registry`;

describe('Writer', () => {
  it('should check if registry folder exists ann return a boolean', async () => {
    const existsRegistryDirectory = await Writer.checkIfRegistryDirectoryExits();

    expect(typeof existsRegistryDirectory.error).toBe('boolean');
  });

  it('shoudl check if registry folder exists and if not, create it', async () => {
    const regisytryFolder = await exists(registryTestPath);
    const existsIndexFile = await Writer.checkIfIndexFileExists(registryTestPath);

    if (regisytryFolder && !existsIndexFile.error) {
      unlink(`${registryTestPath}/odal_index`).catch(err =>
        console.log('Error removing the odal indexfile', err)
      );
      await rmdir(registryTestPath);
    } else if (regisytryFolder && existsIndexFile.error) {
      await rmdir(registryTestPath);
    }

    const createRegistryFolder = await Writer.createRegistryFolder(registryTestPath);

    expect(createRegistryFolder.error).toBe(false);

    expect(createRegistryFolder.meta).toBeDefined();
  });

  it('should check if index file exists', async () => {
    const existsIndexFile = await Writer.checkIfIndexFileExists(registryTestPath);

    expect(typeof existsIndexFile.error).toBe('boolean');
  });

  it.only('should create the indexfile provided that it doesnt exits', async () => {
    const existsIndexFile = await Writer.checkIfIndexFileExists(registryTestPath);

    if (!existsIndexFile.error) return await unlink(`${registryTestPath}/odal_index`);

    const createIndexFile = await Writer.createIndexFile(registryTestPath);

    expect(typeof createIndexFile.error).toBe('boolean');
    expect(createIndexFile.error).toBe(false);
  });

  it.only('should return error false if the odal index file exists', async () => {
    const existsIndexFile = await Writer.checkIfIndexFileExists(registryTestPath);

    expect(typeof existsIndexFile.error).toBe('boolean');
    expect(existsIndexFile.error).toBe(false);
  });

  it.only('should write on the index file provided that the file exists', async () => {
    const existsIndexFile = await Writer.checkIfIndexFileExists(registryTestPath);

    if (!existsIndexFile.error) return await unlink(`${registryTestPath}/odal_index`);
  });

  it('should write a file provided table name and fields', async () => {});

  it('should write the index for the migrations files', async () => {});
});
