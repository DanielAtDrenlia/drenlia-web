import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

interface SetupData {
  frontendEnv: Record<string, string>;
  backendEnv: Record<string, string>;
  adminUser: {
    username: string;
    password: string;
    email: string;
  };
  siteSettings: Record<string, string>;
}

async function runSetup(setupData: SetupData) {
  const dbPath = path.join(process.cwd(), 'server', 'database.sqlite');
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  try {
    // Read and execute migration
    const migrationPath = path.join(__dirname, '../migrations/001_initial_setup.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');
    await db.exec(migration);

    // Insert environment variables
    for (const [key, value] of Object.entries(setupData.frontendEnv)) {
      await db.run(
        'INSERT OR REPLACE INTO environment_variables (environment, key, value) VALUES (?, ?, ?)',
        ['frontend', key, value]
      );
    }

    for (const [key, value] of Object.entries(setupData.backendEnv)) {
      await db.run(
        'INSERT OR REPLACE INTO environment_variables (environment, key, value) VALUES (?, ?, ?)',
        ['backend', key, value]
      );
    }

    // Insert admin user
    const passwordHash = await bcrypt.hash(setupData.adminUser.password, 10);
    await db.run(
      'INSERT INTO users (username, password_hash, email, is_admin) VALUES (?, ?, ?, ?)',
      [setupData.adminUser.username, passwordHash, setupData.adminUser.email, 1]
    );

    // Insert site settings
    for (const [key, value] of Object.entries(setupData.siteSettings)) {
      await db.run(
        'INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)',
        [key, value]
      );
    }

    // Log setup completion
    await db.run(
      'INSERT INTO setup_log (setup_version, setup_data) VALUES (?, ?)',
      ['1.0.0', JSON.stringify(setupData)]
    );

    // Write environment files
    const frontendEnvContent = Object.entries(setupData.frontendEnv)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    fs.writeFileSync(path.join(process.cwd(), '.env'), frontendEnvContent);

    const backendEnvContent = Object.entries(setupData.backendEnv)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    fs.writeFileSync(path.join(process.cwd(), 'server', '.env'), backendEnvContent);

    console.log('Setup completed successfully!');
  } catch (error) {
    console.error('Error during setup:', error);
    throw error;
  } finally {
    await db.close();
  }
}

export default runSetup; 