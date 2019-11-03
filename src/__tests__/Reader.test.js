const Reader = require('../helpers/Reader');
const Postgres = require('../helpers/Postgres');

jest.mock('../helpers/Postgres.js');

const data = [
  {
    migration_name: '1572411302_migration1.js',
    createdat: '2019-10-30T04:55:02.000Z',
    migratedat: null
  },
  {
    migration_name: '1572411341_migration3.js',
    createdat: '2019-10-30T04:55:41.000Z',
    migratedat: null
  },
  {
    migration_name: '1572411338_migration2.js',
    createdat: '2019-10-30T04:55:38.000Z',
    migratedat: null
  }
];

describe('Reader', () => {
  it(' <returnMigrationResults> Should process the migration results, process the array of adata and return the state of the migrations', async () => {
    Reader.runSingleMigration = jest.fn(() => Promise.resolve({ isMigrated: true }));
    Reader.updateRegistryTable = jest.fn(() => Promise.resolve({ success: true }));

    const expectedKeys = ['response', 'file', 'update'];

    const r = await Reader.returnMigrationResults(data);

    const keys = r.map(item => Object.keys(item));
    keys.forEach(e => expect(e).toEqual(expectedKeys));
  });
});
