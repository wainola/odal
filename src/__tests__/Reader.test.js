const Reader = require('../helpers/Reader');
const Base = require('../helpers/Base');
const Postgres = require('../helpers/Postgres');

jest.mock('../helpers/Base.js');
jest.mock('../helpers/Postgres.js');

describe('Reader', () => {
  it('Should have all the attributes as being instance of Base class', () => {
    Base.getRegistryTableInfo.mockImplementation(() =>
      Promise.resolve([
        { migration_name: 'migration 1', createdat: new Date(), migratedat: new Date() },
        { migration_name: 'migration 2', createdat: new Date(), migratedat: new Date() },
        { migration_name: 'migration 3', createdat: new Date(), migratedat: new Date() }
      ])
    );
  });
  it('Should return the info of the data of the Registry Table (getStatus method)', async () => {});
  it('Should execute a single migration', async () => {});
  it('Should run a up migration', async () => {});
  it('Should run a down migration', async () => {});
  it('Should run a single migration, provided a Migration file and a type', async () => {});
  it('Should run all the migrations', async () => {});
  it('Should undo the migrations', async () => {});
  it('Should update the Registry table', async () => {});
});
