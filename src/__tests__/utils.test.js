const Utils = require('../utils');

let input;

describe('Utils', () => {
  beforeEach(() => {
    input = ['id:uuid:not_null:primary_key', 'name:text:not_null', 'lastname:text:not_null'];
  });
  it('should map the fields to generate the keyword for the query', async () => {
    try {
      const mappedFieds = await Utils.mapFields(input);
      const r = await mappedFieds;
      expect(r).toHaveLength(3);
    } catch (e) {
      console.log('Some Error happened during the mapping', e);
    }
  });

  it('should generated the body of the query after create table statement', async () => {
    try {
      const expectedString =
        'ID UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),NAME TEXT NOT NULL ,LASTNAME TEXT NOT NULL ';
      const mappedFields = await Utils.mapFields(input);
      const result = await mappedFields;
      const queryBuilded = await Utils.buildQuery(result);
      const query = await queryBuilded;
      expect(query).toBe(expectedString);
    } catch (e) {
      console.log('Some error running the buildQuery method', e);
    }
  });

  it('should return the query for creating the table', async () => {
    try {
      const expectedQuery = `CREATE TABLE users (ID UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),NAME TEXT NOT NULL ,LASTNAME TEXT NOT NULL);`;
      const tableName = 'users';
      const query = await Utils.mapFields(input)
        .then(mappedFields => Utils.buildQuery(mappedFields))
        .then(queryBuilded => Utils.buildTableQuery(tableName, queryBuilded));
      const result = await query;
      expect(result).toBe(expectedQuery);
    } catch (e) {
      console.log(e);
    }
  });
});
