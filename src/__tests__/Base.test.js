const Base = require('../helpers/Base');
const Postgres = require('../helpers/Postgres');

let BaseInstance;

describe('Base', () => {
  beforeAll(async () => {
    BaseInstance = new Base(Postgres);
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
  it('Should create the pgCrypto extension', async () => {
    const r = await BaseInstance.createPGCryptoExtensionOnInit();
    expect(r.success).toBe(true);
  });
  it('Should create the Registry Table', async () => {
    const r = await BaseInstance.createRegistryTableOnInit();
    expect(r.success).toBe(true);
  });
  it('Should update the Registry Table', async () => {
    const r1 = await Postgres.queryToExec(
      "INSERT INTO REGISTRY (MIGRATION_NAME) VALUES ('THE_TABLE_TO_UPDATE') RETURNING *;"
    );
    const r2 = await BaseInstance.updateRegistryTable('THE_TABLE_TO_UPDATE');
    expect(r2.success).toBe(true);
  });
  it('Should get the data of the Registry Table', async () => {
    const r = await BaseInstance.getRegistryTableInfo();
    const [data] = r;
    const keys = Object.keys(data);
    expect(keys).toEqual(['migration_name', 'createdat', 'migratedat']);
  });
  it('Should update the registry table and set the migratedat values as null before removing the Registry table', async () => {
    const r = await BaseInstance.updateRegistry();
    expect(r.success).toBe(true);
  });
  it('Should remove the registry table', async () => {
    const r = await BaseInstance.removeRegistryTable();
    expect(r).toBe('Registry table removed');
  });
});
