require('dotenv').config();

const { NODE_ENV } = process.env;

const odalIndexPath =
  NODE_ENV !== 'development'
    ? `${process.cwd()}/api/migrations/registry/odal_index`
    : `${process.cwd()}/src/registry/odal_index`;

const fileDirectory =
  NODE_ENV !== 'development'
    ? `${process.cwd()}/api/migrations/registry`
    : `${process.cwd()}/src/registry`;

// CHECK IF DIRECTORIES EXISTS. IF NOT, CREATE THEM
const registryPath =
  NODE_ENV !== 'development'
    ? `${process.cwd()}/api/migrations/registry`
    : `${process.cwd()}/src/registry`;

const pgcryptoQuery = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;
`;

const registryTableQuery = `
CREATE TABLE registry (
id uuid not null primary key default gen_random_uuid(),
migration_name text not null,
createdAt timestamp default null,
migratedAt timestamp default null
)
`;

module.exports = {
  odalIndexPath,
  fileDirectory,
  registryPath,
  pgcryptoQuery,
  registryTableQuery
};
