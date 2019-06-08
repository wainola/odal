require('dotenv').config();
const yaml = require('yaml');
const fs = require('fs');
const { Client } = require('pg');

const { NODE_ENV } = process.env;

const existsMigrationsFolder = fs.existsSync(`${process.cwd()}/migrations`);

let databaseUrl;

if (existsMigrationsFolder) {
  const file = fs.readFileSync(`${process.cwd()}/migrations/config.yml`, 'utf8');
  const parsed = yaml.parse(file);
  if (NODE_ENV !== 'development') {
    databaseUrl = parsed.production.database_url;
  }
  databaseUrl = parsed.development.database_url;
}

class Database {
  constructor(connectionString) {
    if (Database.exists) {
      return Database;
    }
    this.conn = new Client({
      connectionString
    });
    Database.exists = true;
    Database.instance = this;
    return this;
  }

  async connect() {
    try {
      await this.conn.connect();
      return { error: false, meta: { connected: true } };
    } catch (e) {
      return { error: true, meta: e };
    }
  }

  async closeConnection() {
    try {
      await this.conn.end();
      return { error: false, meta: { connected: false } };
    } catch (e) {
      return { error: true, meta: e };
    }
  }

  async testConnection() {
    try {
      const q = await this.conn.query('SELECT NOW()');
      const r = await q.rows;
      return r;
    } catch (e) {
      return e;
    }
  }

  async queryToExec(query) {
    try {
      const q = await this.conn.query(query);
      const r = await q.rows;
      if (r.length === 0) {
        return { success: true };
      }
      return r;
    } catch (e) {
      return { error: true, meta: e };
    }
  }

  async getSchemas() {
    console.log('getSchemas');
    try {
      const q = await this.conn.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
      );
      const r = await q.rows;
      if (r.length === 0) {
        return { success: true };
      }
      return r;
    } catch (e) {
      return { error: true, meta: e };
    }
  }
}

module.exports = new Database(databaseUrl);
