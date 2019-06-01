const Odal = require('../Odal');

describe('Odal', () => {
  it('test static version method', () => {
    const expectedVerson = '1.0.0';
    const getVersion = Odal.version();

    Odal.getInfo('pene').then(d => console.log('d:', d));

    expect(getVersion.version).toBe(expectedVerson);
  });

  it('create', () => {
    Odal.create('pene', 'poto').then(d => console.log(d));
  });
});
