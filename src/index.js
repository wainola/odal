#!/usr/bin/env node
const program = require('commander');
const { promisify } = require('util');
const fs = require('fs');
const Odal = require('./Odal');
const { odalIndexPath, fileDirectory, registryPath } = require('./constants');

// FUNCTIONS TO USE AND PROMISIFY
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

program.description('Migration tool');

const odalIndexExists = fs.existsSync(odalIndexPath);

program.command('init').action(Odal.init);

program.command('postgres').action(Odal.postgres);

// GET STATUS OF MIGRATIONS
program.command('status').action(Odal.status);

// CREATE MIGRATIONS
program.command('create <tableName> [fields...]').action(Odal.create);

// CREATE CLEAN MIGRATION
program.command('create:clean <migrationName>').action(Odal.createClean);

// RUN ALL MIGRATION
program.command('migrate').action(Odal.migrate);

// RUN THE LATEST MIGRATION
program.command('migrate:last').action(Odal.migrateLast);

// REMOVE ALL MIGRATIONS
program.command('remove:all').action(Odal.remove);

// REMOVE LAST MIGRATION
program.command('remove:last').action(Odal.removeLast);

// REMOVE LAST MIGRATION
// program.command('remove:last').action(() => {
//   if (!odalIndexExists) {
//     console.log('No migrations to run');

//     process.exit(1);
//   }

//   readFile(`${odalIndexPath}`, 'utf8')
//     .then(async datafile => {
//       const lastMigration = datafile.split('\n').pop();

//       const newodalIndexContent = datafile
//         .split('\n')
//         .filter(item => item !== lastMigration)
//         .join('\n');
//       console.log('lastMigration', lastMigration);
//       console.log('new odal index content', newodalIndexContent);

//       try {
//         const writeToIndex = await writeFile(`${odalIndexPath}`, newodalIndexContent);
//         console.log('odal index updated!');
//       } catch (err) {
//         console.log('Some error on updating the odal file', err);
//       }
//       return lastMigration;
//     })
//     .then(async lastMigration => {
//       const parseTableName = lastMigration.split('_').pop();

//       try {
//         Database.connect();

//         const query = `DROP TABLE ${parseTableName}`;

//         const result = await Database.queryToExec(query);

//         return [result, parseTableName];
//       } catch (err) {
//         console.log(`Some error on droping the table ${parseTableName}`, err);

//         return err;
//       }
//     })
//     .then(async ([result, parseTableName]) => {
//       console.log('Success on droping the table', parseTableName);
//       process.exit(1);
//     })
//     .catch(err => {
//       console.log('Error when removing the last migration', err);
//     });
// });

// // REMOVE ALL THE MIGRATIONS FILE AND THE INDEX
// program.command('remove:all').action(async () => {
//   const odalIndexExists = fs.existsSync(odalIndexPath);
//   if (!odalIndexExists) {
//     console.log('There is no odal index. Exiting');
//     process.exit(1);
//   }

//   readFile(`${registryPath}/odal_index`, 'utf-8')
//     .then(result => {
//       const filenames = result.split('\n');
//       const tableNames = filenames.map(item => item.split('_')[1]);
//       const filenamesWithExtension = filenames.map(item => `${item}.sql`);

//       console.log('tableNames', tableNames);
//       const queryToExec = tableNames.reduce((queryArray, currentTableName) => {
//         queryArray.push(`DROP TABLE ${currentTableName}`);
//         return queryArray;
//       }, []);

//       const qExecuted = queryToExec.map(query => {
//         const d = Database.queryToExec(query);
//         return d;
//       });

//       // // THIS IS A GOOD PLACE FOR A METHOD THAT RETURNS A PROMISE
//       // filenamesWithExtension.forEach(async filename => {
//       //   try {
//       //     const result = await unlink(`${registryPath}/${filename}`);
//       //     console.log('DELETION RESULT', result);
//       //   } catch (e) {
//       //     console.log('Some error happened durin the cleaning', e);
//       //   }
//       // });
//     })
//     // .then(async () => {
//     //   try {
//     //     const result = await unlink(`${odalIndexPath}`);
//     //     console.log('Success deletion of odal index');
//     //   } catch (e) {
//     //     console.log('Some error happened', e);
//     //   }
//     // })
//     .catch(e => {
//       console.log('Some error happened!', e);
//     });
// });

program.parse(process.argv);
