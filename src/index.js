#!/usr/bin/env node
const program = require('commander');
const Odal = require('./Odal');

program.description('Migration tool');

program.command('test').action(Odal.test);

program.command('init').action(Odal.init);

program.command('postgres').action(Odal.postgres);

// GET STATUS OF MIGRATIONS
program.command('status').action(Odal.status);

// CREATE MIGRATIONS
program.command('create <tableName> [fields...]').action(Odal.create);

// CREATE CLEAN MIGRATION
program.command('create:clean <migrationName>').action(Odal.createClean);

// RUN ALL MIGRATION// program.command('migrate:last').action(() => {
//   Database.connect();
//   if (!odalIndexExists) {
//     console.log('No migrations to run');

//     process.exit(1);
//   }

//   readFile(`${odalIndexPath}`, 'utf8')
//     .then(async dataFile => {
//       const filenames = dataFile.split('\n');
//       const lastMigration = filenames.pop();
//       const filename = `${registryPath}/${lastMigration}.sql`;

//       try {
//         const fileContent = await readFile(filename, 'utf8');
//         return fileContent;
//       } catch (e) {
//         console.log('Error reading the last migration file', e);
//         return e;
//       }
//     })
//     .then(async fileContent => {
//       console.log('fileContent', fileContent);
//       const queryToExec = fileContent;

//       try {
//         const results = await Database.queryToExec(queryToExec);
//         return results;
//       } catch (e) {
//         console.log('Some error happened during query execution', e);
//         return e;
//       }
//     })
//     .then(resultsOfInsertion => {
//       console.log('RESULT OF INSERTION', resultsOfInsertion);
//       Database.closeConnection();
//       process.exit(1);
//     });
// });
program.command('migrate').action(Odal.migrate);

// REMOVE ALL MIGRATIONS
program.command('undo:all').action(Odal.undo);

// REMOVE LAST MIGRATION
program.command('remove:last').action(Odal.removeLast);

// REMOVE REGISTRY TABLE
program.command('remove:registry').action(Odal.removeRegistryTable);

// CREATE REGISTRY TABLE
program.command('create:registry').action(Odal.createRegistryTable);

// RE-RUN MIGRATIONS AND UPDATE REGISTRY TABLE
program.command('registry:update').action(Odal.registryUpdate);

// CREATE PGEXTENSION IF NEEDED
program.command('postgres:pgcrypto').action(Odal.createPgCrypto);

program.parse(process.argv);
