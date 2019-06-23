#!/usr/bin/env node
const program = require('commander');
const Odal = require('./Odal');

program.description('Migration tool like goose but slower 😄');

program
  .version('0.1.0')
  .option('init', 'Setup to work with the migrations')
  .option('postgres', 'Create pgcrypto extension and registry table')
  .option('postgres:pgcrypto', 'It creates on demand the pgcrypto extension')
  .option('status', 'It prints an status of your migrations')
  .option('create <tableName>', 'It creates the migration file with a timestamp')
  .option('migrate', 'It runs the migrations that are not fullfilled')
  .option('undo:all', 'Undo all the migrations')
  .option('create:registry', 'It creates on demand the registry table')
  .option('remove:registry', 'It drops the registry table')
  .option(
    'registry:update',
    'It updates the registry table with the current migrations that are listed on the registry directory'
  );

program.command('test').action(Odal.test);

// INIT POSTGRES MIGRATIONS
program.command('init').action(Odal.init);

// SETUP FOR POSTGRES MIGRATIONS
program.command('postgres').action(Odal.postgres);

// CREATE PGEXTENSION IF NEEDED
program.command('postgres:pgcrypto').action(Odal.createPgCrypto);

// GET STATUS OF MIGRATIONS
program.command('status').action(Odal.status);

// CREATE MIGRATIONS
program.command('create <tableName>').action(Odal.create);

// RUN ALL MIGRATION
program.command('migrate').action(Odal.migrate);

// REMOVE ALL MIGRATIONS
program.command('undo:all').action(Odal.undo);

// CREATE REGISTRY TABLE
program.command('create:registry').action(Odal.createRegistryTable);

// REMOVE REGISTRY TABLE
program.command('remove:registry').action(Odal.removeRegistryTable);

// RE-RUN MIGRATIONS AND UPDATE REGISTRY TABLE
program.command('registry:update').action(Odal.registryUpdate);

program.parse(process.argv);
