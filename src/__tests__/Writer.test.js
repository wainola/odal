const moment = require('moment');
const Writer = require('../helpers/Writer');
const Postgres = require('../helpers/Postgres');

jest.mock('../helpers/Postgres.js');

describe('Writer', () => {
  it('Should setup correctly the data for the instance', () => {
    const expectedKeys = [
      'registryPath',
      'readFile',
      'exists',
      'writeFile',
      'mkdir',
      'readDir',
      'databaseInstance'
    ];
    expect(Object.keys(Writer)).toEqual(expectedKeys);
  });
  it('Should write data when there is a filename and a table name provided', async () => {
    Writer.writeFile = jest.fn(() => Promise.resolve({}));

    const filename = `${moment().unix()}_foo_table`;
    const tableName = 'FOO';
    const r = await Writer.writeData(filename, tableName);

    expect(r.error).toBe(false);
  });
  it('Should write a file when there is a filename and a table name provided', async () => {
    Postgres.queryToExec.mockImplementation(data => Promise.resolve({ success: true, data }));

    Writer.writeFile = jest.fn(() => Promise.resolve({}));

    const filename = `${moment().unix()}_foo_table`;
    const tableName = 'FOO';
    const r = await Writer.writeMigrationFile(tableName, filename);
    const { success, error } = r;

    expect(success).toBe(true);
    expect(error).toBe(false);
  });
  it('Should return error true if there is a problem on writing the file', async () => {
    Writer.writeFile = jest.fn(() => Promise.reject({}));

    const filename = `${moment().unix()}__baz_table`;
    const tableName = 'BAZ';
    const r = await Writer.writeData(filename, tableName);
    const { error } = r;
    expect(error).toBe(true);
  });
});
