class Utils {
  static async mapFields(fields) {
    // TODO => ADD VALIDATION
    const validatedFields = await Utils.fieldsIncludeScaffoldNotation(fields);
    if (validatedFields.length !== 0) {
      return fields
        .map(item => {
          return item.split(':');
        })
        .reduce((acc, item) => {
          const formated = item.map(elem =>
            elem.includes('_') ? elem.replace(/_/, ' ').toUpperCase() : elem.toUpperCase()
          );
          acc.push(formated);
          return acc;
        }, []);
    }

    return fields.reduce((acc, item) => {
      acc.push([item.toUpperCase()]);
      return acc;
    }, []);
  }

  static async fieldsIncludeScaffoldNotation(fiels) {
    return fiels.map(e => e.includes(':')).filter(Boolean);
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
    const upSentence = justUp.map(e => {
      return e.split('\n').filter(elem => elem !== '')[1];
    });
    return upSentence;
  }

  static async getDownSentences(sentences) {
    const justDown = sentences.map(
      s =>
        s
          .split('---')
          .filter(e => e !== '')
          .map(downSentence => downSentence.trim())[1]
    );
    const downSentences = justDown.map(e => e.split('\n').filter(elem => elem !== '')[1]);
    return downSentences;
  }

  static async cleanTemplate() {
    const markups = await Utils.buildMarkups();
    return `${markups.up}\n${markups.down}`;
  }

  static async filterFileNames(dataWroted) {
    const filenames = dataWroted.split('\n');
    const filteredFilenames = filenames.filter(e => e !== '');
    return filteredFilenames;
  }

  static partition(data) {
    return data.reduce(
      (acc, item) => {
        if (!item.migratedat) {
          acc[0] = [...acc[0], item];
        } else {
          acc[1] = [...acc[1], item];
        }
        return acc;
      },
      [[], []]
    );
  }

  static sortData(data) {
    return data.sort((a, b) => {
      if (a.fileTimestamp < b.fileTimestamp) {
        return -1;
      }
      if (a.fileTimestamp > b.fileTimestamp) {
        return 1;
      }
      return 0;
    });
  }

  static sortYears(yearsArr, datesTree) {}

  static sortMonths(monthsArr, datesTree) {}

  static sortDays(daysArr, datesTree) {}

  static sortHours(hoursArr, datesTree) {}

  static sortMinutes(minutesArr, datesTree) {}
}

module.exports = Utils;
