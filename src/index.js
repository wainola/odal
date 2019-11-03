#!/usr/bin/env node
const program = require('commander');
const Odal = require('./Odal');

program.description('Migration tool');

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

// REMOVE ALL MIGRATIONS
program.command('undo:all').action(Odal.undo);

// REMOVE LAST MIGRATION
program.command('undo:last').action(Odal.undoLast);

// REMOVE REGISTRY TABLE
program.command('remove:registry').action(Odal.removeRegistryTable);

// CREATE REGISTRY TABLE
program.command('create:registry').action(Odal.createRegistryTable);

// RE-RUN MIGRATIONS AND UPDATE REGISTRY TABLE
program.command('registry:update').action(Odal.registryUpdate);

// CREATE PGEXTENSION IF NEEDED
program.command('postgres:pgcrypto').action(Odal.createPgCrypto);

program.parse(process.argv);
