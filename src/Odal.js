class Odal {
  static version() {
    console.log('Odal linux version 1.0.0');
  }

  static getInfo(info) {
    console.log('The info introduced is:', info);
  }

  static async create(tableName, fields) {
    console.log('CREATE!', tableName, fields);
    // const mappedFields = await Utils.mapFields(fields);

    // const query = await Utils.buildQuery(mappedFields);

    // const date = moment().unix();

    // const filename = `${date}_${tableName}`;

    // const sqlQuery = await Utils.buildTableQuery(tableName, query);

    // writeFile(`${fileDirectory}/${filename}.sql`, sqlQuery)
    //   .then(() => {
    //     console.log(`Migration file for ${tableName} created!`);
    //   })
    //   .then(async () => {
    //     const existsodalIndex = odalIndexExists;

    //     // IF odal INDEX DOESNT EXITS WE CREATED AND WRITE TO THE INDEX
    //     if (!existsodalIndex) {
    //       try {
    //         const odalIndexResult = await writeFile(odalIndexPath, filename, { flag: 'wx' });
    //         return odalIndexResult;
    //       } catch (error) {
    //         console.log('error on writing the non existing odal file');
    //         return error;
    //       }
    //     }

    //     // IF odal INDEX ALREADY EXISTS, WE WRITE ON IT
    //     try {
    //       const fileR = await readFile(odalIndexPath, 'utf8')
    //         .then(data => {
    //           const newDataToWrite = `${data}\n${filename}`;
    //           return newDataToWrite;
    //         })
    //         .then(async dataWroted => {
    //           const writeToodal = await writeFile(odalIndexPath, dataWroted);
    //           return writeToodal;
    //         });

    //       return fileR;
    //     } catch (error) {
    //       console.log('Error writing odal index', error);
    //       return error;
    //     }
    //   })
    //   .catch(error => {
    //     console.error('Error on creating the migration file', error);
    //   });
  }
}

module.exports = Odal;
