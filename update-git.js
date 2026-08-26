const { execSync } = require('child_process');
const fs = require('fs');

try {
  if (fs.existsSync('.git/index.lock')) {
    fs.unlinkSync('.git/index.lock');
  }
  if (fs.existsSync('INTERVIEW_STUDY_GUIDE.md')) {
    fs.unlinkSync('INTERVIEW_STUDY_GUIDE.md');
  }
  console.log('Running git commands...');
  execSync('git add .', { cwd: __dirname });
  execSync('git commit -m "docs: replace interview guide with Learning_log.txt journal"', { cwd: __dirname });
  execSync('git push -u origin main', { cwd: __dirname });
  console.log('Git push succeeded!');
} catch (e) {
  console.error('Git error:', e.stdout || e.stderr || e.message);
}
