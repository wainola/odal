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
    const up = `--- UP\n`;
    const down = `--- DOWN\n`;
    return { up, down };
  }

  static async buildTableQuery(tableName, query) {
    const markups = await Utils.buildMarkups();

    const up = `CREATE TABLE ${tableName} (${query.trim()});`;
    const down = `DROP TABLE ${tableName};`;

    const result = `${markups.up}\n${up}\n${markups.down}\n${down}`;

    return result;
  }

  static async getUpSentences(sentences) {
    const justUp = sentences.map(s => s.split('---').filter(e => e !== '')[0]);
    const upSentence = justUp.map(e => e.split('\n')[1]);
    return upSentence;
  }
}

module.exports = Utils;
