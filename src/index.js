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

// RUN ALL MIGRATION
program.command('migrate').action(Odal.migrate);

// REMOVE ALL MIGRATIONS
program.command('undo:all').action(Odal.undo);

// REMOVE LAST MIGRATION
program.command('remove:last').action(Odal.removeLast);

// REMOVE REGISTRY TABLE
program.command('remove:registry').action(Odal.removeRegistryTable);

// CREATE REGISTRY TABLE
program.command('create:registry').action(Odal.createRegistryTable);

program.parse(process.argv);
