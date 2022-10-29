import { Pool } from "pg";
import dotenv from "dotenv";
import { exit } from "process";

dotenv.config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: {
    rejectUnauthorized: false
  }
});

const createTables = async () => {
  console.log("creating tables");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY, 
      mnemonic_phrase VARCHAR(255) NOT NULL, 
      mnemonic_path VARCHAR(255) NOT NULL, 
      created_at TIMESTAMP NOT NULL DEFAULT NOW(), 
      updated_at TIMESTAMP NOT NULL DEFAULT NOW())`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      client_id INT NOT NULL,
      user_id INT NOT NULL,
      PRIMARY KEY (client_id, user_id),
      mnemonic_phrase VARCHAR(400) NOT NULL, 
      mnemonic_path VARCHAR(255) NOT NULL, 
      CONSTRAINT fk_client_id FOREIGN KEY (client_id) REFERENCES clients(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(), 
      updated_at TIMESTAMP NOT NULL DEFAULT NOW())`);
};

const populateTables = async () => {
  console.log("populating tables");
  
  await pool.query(`
    INSERT INTO clients (mnemonic_phrase, mnemonic_path) 
      VALUES (
        'match occur govern need wet place aisle space beef sport romance wrap sustain upon multiply', 
        '${"m/44''/0''/0''/0"}')`);
};

const main = async () => {
  await createTables();
  await populateTables();
  exit();
}

main();