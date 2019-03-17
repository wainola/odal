class Utils {
  static async mapFields(fields) {
    // TODO => ADD VALIDATION
    return fields
      .map(item => item.split(':'))
      .reduce((acc, item) => {
        const formated = item.map(elem =>
          elem.includes('_') ? elem.replace(/_/, ' ').toUpperCase() : elem.toUpperCase()
        );
        acc.push(formated);
        return acc;
      }, []);
  }

  static async buildQuery(mappedFields) {
    return mappedFields.reduce((acc, item, idx, self) => {
      acc += `${item.join(' ')} ${(item[3] === 'PRIMARY KEY' && 'DEFAULT gen_random_uuid()') ||
        ''}${self.length - 1 === idx ? '' : ','}`;
      return acc;
    }, '');
  }

  static async buildMarkups() {
    const up = `--- UP`;
    const down = `--- DOWN`;
    return { up, down };
  }

  static async buildTableQuery(tableName, query) {
    const markups = await Utils.buildMarkups();

    const up = `CREATE TABLE ${tableName} (${query.trim()});`;
    const down = `DROP TABLE ${tableName};`;

    const result = `${markups.up}\n${up}\n${markups.down}\n${down}`;

    return result;
  }
}

module.exports = Utils;
