const fs = require('fs');
const path = './src/components/EventDialog.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/useState\('[^']+'\)/g, function(match) {
  if (match.includes('setEmoji') || match.includes('ðŸ“š')) {
    return "useState('📚')";
  }
  return match;
});

// Since the array destruct is const [emoji, setEmoji] = useState('...');
content = content.replace(/const \[emoji, setEmoji\] = useState\('[^']+'\);/g, "const [emoji, setEmoji] = useState('📚');");
content = content.replace(/setEmoji\('[^']+'\);/g, "setEmoji('📚');");

fs.writeFileSync(path, content);
