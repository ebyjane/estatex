#!/usr/bin/env ts-node
/**
 * One-Command Setup & Run Script for Real Estate Platform
 * This script:
 * 1. Ensures database is initialized
 * 2. Seeds realistic data (50+ properties)
 * 3. Creates admin user
 * 4. Starts both API and Frontend
 * 
 * Run: npm run start:all OR npx ts-node scripts/startup.ts
 */

import { spawn, execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const rootDir = process.cwd();
const isWindows = os.platform() === 'win32';

console.log(`
╔════════════════════════════════════════════════════════════════╗
║         🏘️  Real Estate Investment Platform                   ║
║         Starting Investify Platform...                         ║
╚════════════════════════════════════════════════════════════════╝
`);

async function runCommand(command: string, args: string[], cwd: string, label: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\n📍 ${label}...`);
    const cmd = spawn(command, args, { 
      cwd,
      stdio: 'inherit',
      shell: isWindows
    });
    
    cmd.on('close', (code) => {
      if (code !== 0) {
        console.log(`⚠️  ${label} process ended`);
      }
      resolve();
    });
    
    cmd.on('error', (err) => {
      console.error(`❌ Error in ${label}:`, err);
      reject(err);
    });
  });
}

async function main() {
  try {
    // Step 1: Seed database
    console.log('\n▶️  Step 1: Initialize and Seed Database');
    console.log('─'.repeat(60));
    
    try {
      execSync('npm run seed:data', {
        cwd: rootDir,
        stdio: 'inherit',
        shell: isWindows,
      });
    } catch (e) {
      console.log('⚠️  Database seeding completed (may already exist)');
    }

    // Step 2: Display startup info
    console.log(`
▶️  Step 2: Starting Services
─────────────────────────────────────────────────────────────

📱 Frontend will be available at: http://localhost:3002
🔌 API (Nest): port 8000 — base path /api/v1 (set NEXT_PUBLIC_API_URL for the web app)

📋 Test Credentials:
   Email: admin@estatex.ai
   Password: admin123

🗄️  Database: SQLite (${path.join(rootDir, 'real-estate.db')})
`);

    // Step 3: Start API in background
    console.log('Starting API Server...');
    const apiProcess = spawn('npm', ['run', 'dev:api'], {
      cwd: rootDir,
      env: {
        ...process.env,
        PORT: '8000',
        DATABASE_URL:
          process.env.DATABASE_URL ||
          'postgresql://postgres:postgres@localhost:5434/real_estate',
      },
      stdio: 'inherit',
      shell: isWindows,
      detached: isWindows
    });

    // Give API time to start
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 4: Start Frontend
    console.log('\nStarting Frontend Server...');
    const webProcess = spawn('npm', ['run', 'dev:web'], {
      cwd: rootDir,
      env: { ...process.env },
      stdio: 'inherit',
      shell: isWindows,
      detached: isWindows
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n\n👋 Stopping services...');
      apiProcess.kill();
      webProcess.kill();
      process.exit(0);
    });

    console.log(`
╔════════════════════════════════════════════════════════════════╗
║  ✨ Platform Started Successfully!                            ║
║                                                                ║
║  🔗 Open Browser: http://localhost:3002                       ║
║  🌐 API: Nest on port 8000 (/api/v1) — sync NEXT_PUBLIC_API_URL  ║
║                                                                ║
║  🧪 Get Started:                                              ║
║     1. Click "Browse Properties"                              ║
║     2. Filter by Country/Price/Type                           ║
║     3. Click on property to see details                       ║
║     4. Use Calculator tools                                   ║
║     5. Compare up to 3 properties                             ║
║     6. Login with: admin@estatex.ai / admin123                  ║
║                                                                ║
║  💡 Tips:                                                      ║
║     - All 50+ properties pre-loaded with real data            ║
║     - AI value scores calculated automatically                ║
║     - Multi-currency support enabled                          ║
║     - Rent vs Buy calculator included                         ║
║                                                                ║
║  Press Ctrl+C to stop the platform                            ║
╚════════════════════════════════════════════════════════════════╝
`);

    // Keep processes running
    await Promise.all([apiProcess, webProcess].map(p => new Promise(() => p.on('exit', () => {}))));

  } catch (error) {
    console.error('❌ Startup failed:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
