const { execSync } = require('child_process');
try {
  execSync('npx @tailwindcss/cli -i test.css -o out.css', { stdio: 'inherit' });
} catch (e) {
  console.log('error', e);
}
