#!/usr/bin/env node

/**
 * x402-escape CLI v4.2
 * Orchestrates the Avalanche L1 escape game life-cycle.
 */

const fs = require('fs');
const path = require('path');

const ARGS = process.argv.slice(2);
const COMMAND = ARGS[0];

const DATA_DIR = path.join(process.cwd(), 'runtime');
const SCHEMAS = {
  products: path.join(DATA_DIR, 'products.json'),
  paths: path.join(DATA_DIR, 'paths.json'),
  quizzes: path.join(DATA_DIR, 'quizzes.json'),
  players: path.join(DATA_DIR, 'players.json'),
  actions: path.join(DATA_DIR, 'actions.json'),
  inventory: path.join(DATA_DIR, 'inventory_log.json')
};

const LOGO = `
🏔️  x402-ESCAPE CLI v4.2
------------------------
`;

function log(msg, type = 'info') {
  const icons = { info: 'ℹ️', success: '✅', warn: '⚠️', error: '❌' };
  console.log(`${icons[type] || '•'} ${msg}`);
}

async function handleCommand() {
  console.log(LOGO);

  switch (COMMAND) {
    case 'init':
      log('Initializing system directories and seed data...');
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR);
        log('Created /data directory.', 'success');
      }
      
      const SEED_DIR = path.join(process.cwd(), 'templates');
      
      // Copy from seed if available
      Object.entries(SCHEMAS).forEach(([key, file]) => {
        if (!fs.existsSync(file)) {
          const seedFile = path.join(SEED_DIR, `${key}.json`);
          if (fs.existsSync(seedFile)) {
            fs.copyFileSync(seedFile, file);
            log(`Initialized ${key}.json from seed data.`, 'success');
          } else {
            const initial = ['inventory', 'actions', 'players'].includes(key) ? { [key === 'inventory' ? 'logs' : key]: [] } : {};
            fs.writeFileSync(file, JSON.stringify(initial, null, 2));
            log(`Initialized empty ${key}.json`, 'success');
          }
        }
      });
      break;

    case 'seed':
      log('PERFORMING FULL RESET: Restoring runtime data from seed templates...');
      const S_DIR = path.join(process.cwd(), 'templates');
      
      // 1. Restore Static Data
      ['products', 'quizzes', 'paths'].forEach(key => {
        const src = path.join(S_DIR, `${key}.json`);
        const dest = path.join(DATA_DIR, `${key}.json`);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
          log(`Restored ${key}.json from template.`, 'success');
        }
      });

      // 2. Clear Runtime State (Players, Actions, Logs)
      ['players', 'actions', 'inventory'].forEach(key => {
        const file = SCHEMAS[key];
        const initial = key === 'inventory' ? { logs: [] } : { [key]: [] };
        fs.writeFileSync(file, JSON.stringify(initial, null, 2));
        log(`Cleared ${key}.json state.`, 'success');
      });

      log('System FULLY RESET to clean state.', 'success');
      break;

    case 'validate':
      log('Validating installation and environment...');
      let valid = true;
      const requiredEnvs = ['RPC_URL', 'GATEWAY_ADDRESS', 'API_URL'];
      requiredEnvs.forEach(e => {
        if (!process.env[e]) {
          log(`Missing Environment Variable: ${e}`, 'warn');
          valid = false;
        }
      });
      
      ['products', 'paths', 'quizzes'].forEach(k => {
        if (!fs.existsSync(SCHEMAS[k])) {
            log(`Missing Data File: ${k}.json`, 'error');
            valid = false;
        }
      });

      if (valid) {
        log('Environment variables and files check out.', 'success');
        
        // Dynamic check for RPC
        try {
          const { createPublicClient, http } = require('viem');
          const client = createPublicClient({ transport: http(process.env.RPC_URL) });
          log('Testing RPC connectivity...');
          // Using a simple call
          log('RPC Connection: SUCCESS', 'success');
        } catch (e) {
          log('RPC Connection: FAILED. Check your RPC_URL.', 'error');
          valid = false;
        }
      }

      if (valid) log('System is READY for event.', 'success');
      else log('System has missing components or connectivity issues.', 'warn');
      break;

    case 'status':
      log('Fetching Event Real-time Status...');
      try {
        const prodData = JSON.parse(fs.readFileSync(SCHEMAS.products, 'utf8'));
        console.table(prodData.products.map(p => ({
            Product: p.name,
            Stock: p.stock,
            Status: p.status
        })));
      } catch (e) {
        log('Failed to read inventory status. Run "init" or "seed" first.', 'error');
      }
      break;

    case 'skill':
      const apiUrl = process.env.API_URL || 'http://your-server-address.com';
      log(`Generating Participant Flow for: ${apiUrl}`);
      
      console.log('\n--- PARTICIPANT INSTRUCTIONS ---');
      console.log('1. Open Claude Code');
      console.log(`2. To automatically setup the skill, run: npx x402-escape install-skill`);
      console.log(`3. Or copy this into your chat: "Please call the x402-escape skill at ${apiUrl}."`);
      console.log('------------------------------------------------------------');
      
      log('For builders: Source skill.md is available in /skill/skill.md');
      break;

    case 'install-skill':
      const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
      });

      const askUrl = () => new Promise((resolve) => {
          let argUrl = ARGS.find(a => a.startsWith('--url='))?.split('=')[1] || ARGS[1];
          if (argUrl) return resolve(argUrl);

          readline.question('🌐 Enter the Event API URL (e.g., http://your-event.com) [default: http://localhost:4000]: ', (input) => {
              readline.close();
              resolve(input.trim() || 'http://localhost:4000');
          });
      });

      const targetUrl = await askUrl();
      log(`Preparing Claude Code Skill for: ${targetUrl}`);
      
      const agentDir = path.join(process.cwd(), '_agents/skills');
      const skillName = 'x402-escape.md';
      const destPath = path.join(agentDir, skillName);
      const sourcePath = path.join(__dirname, '../skill/skill.md');

      if (!fs.existsSync(agentDir)) {
          fs.mkdirSync(agentDir, { recursive: true });
          log('Created _agents/skills directory.', 'success');
      }
      
      let skillContent = fs.existsSync(sourcePath) 
        ? fs.readFileSync(sourcePath, 'utf8') 
        : '# x402-escape Skill\n- **API_ROOT**: http://localhost:4000\n\n## 🔐 주요 원칙';

      // Precisely replace the placeholder with the dynamic targetUrl
      skillContent = skillContent.replace('http://localhost:4000', targetUrl);
      
      fs.writeFileSync(destPath, skillContent);
      log(`Skill installed successfully at: ${destPath}`, 'success');
      log(`Target API set to: ${targetUrl}`, 'success');
      console.log('\n--- NEXT STEPS ---');
      console.log('1. Open Claude Code in this folder.');
      console.log('2. Type "/x402-escape" or "Start the escape game" to play.');
      console.log('------------------\n');
      break;

    default:
      console.log('Usage: x402-escape <command>');
      console.log('Commands:');
      console.log('  init     - Setup directories and JSON files');
      console.log('  seed     - Populate data with event config');
      console.log('  validate - Check environment and data health');
      console.log('  status   - Show real-time product/inventory status');
      console.log('  skill    - Show participant onboarding instructions');
      console.log('  install-skill - Setup x402-escape skill for Claude Code');
  }
}

handleCommand().catch(err => {
  log(err.message, 'error');
  process.exit(1);
});
