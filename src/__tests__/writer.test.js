require('dotenv').config();
const fs = require('fs');
const { promisify } = require('util');
const Writer = require('../Writer');

const { NODE_ENV } = process.env;

const rmdir = promisify(fs.rmdir);
const exists = promisify(fs.exists);

const registryTestPath =
  NODE_ENV !== 'test' ? `${process.cwd()}/registry` : `${process.cwd()}/src/__tests__/registry`;

describe('Writer', () => {
  it('should check if registry folder exists ann return a boolean', async () => {
    const existsRegistryDirectory = await Writer.checkIfRegistryDirectoryExits();
    expect(typeof existsRegistryDirectory.error).toBe('boolean');
  });

  it('shoudl check if registry folder exists and if not, create it', async () => {
    const regisytryFolder = await exists(registryTestPath);

    if (regisytryFolder) {
      await rmdir(registryTestPath);
    }

    const createRegistryFolder = await Writer.createRegistryFolder(registryTestPath);

    expect(createRegistryFolder.error).toBe(false);
    expect(createRegistryFolder.meta).toBeDefined();
  });

  it('work', () => {});
});
