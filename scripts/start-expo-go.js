/**
 * Start Metro with Expo Go stubs (no custom native modules).
 * Usage: node scripts/start-expo-go.js [--clear]
 */
process.env.EXPO_GO_COMPAT = '1';

const { spawn } = require('child_process');
const args = ['expo', 'start', ...process.argv.slice(2)];

const child = spawn('npx', args, {
  stdio: 'inherit',
  shell: true,
  env: process.env,
  cwd: require('path').join(__dirname, '..'),
});

child.on('exit', (code) => process.exit(code ?? 0));
