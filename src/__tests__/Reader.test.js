const Reader = require('../Reader');

describe('Reader', () => {
  it('test Reader class', () => {
    console.log(Reader.getRegistryPath());
  });

  it('checks if index file exits', async () => {
    const existRegistryPath = await Reader.checkIndexFileExists();

    expect(existRegistryPath.error).toBe(true);
  });

  it("if index file doesn't exists, it creates it", async () => {});
});
