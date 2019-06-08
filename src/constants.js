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

module.exports = {
  odalIndexPath,
  fileDirectory,
  registryPath
};
