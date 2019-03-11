const Reader = require('../Reader');

describe('Reader:migrate', () => {
  it.only('should return error.true if not index file exists running the migrate method', async () => {
    const migrate = await Reader.migrate();

    expect(typeof migrate.error).toBe('boolean');
    expect(migrate.error).toBe(true);
  });

  it('should execute the migration on serial order', async () => {});
});

describe('Reader:migrate:last', () => {
  it('should run the last migration', async () => {});
});

describe('Reader:remove:last', () => {
  it('should remove the last migration', async () => {});
});

describe('Reader:remove:all', () => {
  it('should remove all the migrations file', async () => {});
});

describe('Reader:rollback', () => {
  it('should undo all the migrations', async () => {});
});

describe('Reader:rollback:last', () => {
  it('should undo the last migration', async () => {});
});
