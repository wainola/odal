const fs = require('fs');
const { promisify } = require('util');
const Writer = require('../Writer');
const Database = require('../services/database');

let WriterInstance;

const registryDirPath = `${process.cwd()}/src/__tests__/registry`;

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

describe('Writer', () => {
  beforeAll(() => {
    WriterInstance = new Writer(Database);
  });
  afterAll(() => {});

  it('has to be an instance of Base Class and has all the properties', async () => {
    const expectedKeys = ['registryPath', 'readFile', 'exists', 'writeFile', 'mkdir', 'database'];
    expect(Object.keys(WriterInstance)).toEqual(expectedKeys);
  });

  it('write data', async () => {
    mkdir(registryDirPath)
      .then(() => writeFile(`${registryDirPath}/odal_index`, '', { flag: 'wx' }))
      .catch(err => console.log('err:', err));
  });
});
