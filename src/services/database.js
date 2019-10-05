const { Pool } = require('pg');

const { NODE_ENV } = process.env;

switch (NODE_ENV) {
  case 'test':
    require('dotenv').config({ path: `${process.cwd()}/.env.test` });
    break;
  case 'development':
    require('dotenv').config({ path: `${process.cwd()}/.env.development` });
    break;
  default:
    require('dotenv').config();
    break;
}

const { DATABASE_URL } = process.env;

class Database {
  constructor(connectionString) {
    if (Database.exists) {
      return Database;
    }
    this.conn = new Pool({
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

module.exports = new Database(DATABASE_URL);
