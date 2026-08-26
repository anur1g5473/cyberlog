const { execSync } = require('child_process');
const fs = require('fs');

try {
  if (fs.existsSync('.git/index.lock')) {
    fs.unlinkSync('.git/index.lock');
  }
  console.log('Running git commands...');
  execSync('git add .', { cwd: __dirname });
  execSync('git commit -m "fix(security): remove legacy DATABASE_URL & hardcoded fallback secrets; update Learning_log.txt"', { cwd: __dirname });
  execSync('git push -u origin main', { cwd: __dirname });
  console.log('Git push succeeded!');
} catch (e) {
  console.error('Git error:', e.stdout ? e.stdout.toString() : e.message);
}
