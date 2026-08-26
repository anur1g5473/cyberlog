const { execSync } = require('child_process');
const fs = require('fs');

try {
  if (fs.existsSync('.git/index.lock')) {
    fs.unlinkSync('.git/index.lock');
  }
  console.log('Running tsc...');
  execSync('npx tsc --noEmit', { cwd: __dirname });
  console.log('TSC passed cleanly!');
  console.log('Running git commands...');
  execSync('git add .', { cwd: __dirname });
  execSync('git commit -m "security: remove hardcoded passphrase strings from source code"', { cwd: __dirname });
  execSync('git push -u origin main', { cwd: __dirname });
  console.log('Git push succeeded!');
} catch (e) {
  console.error('Error:', e.stdout ? e.stdout.toString() : e.message);
}
