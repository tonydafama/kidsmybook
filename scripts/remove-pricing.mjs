import fs from 'fs';
import path from 'path';

const blogDir = path.join(process.cwd(), 'blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));

for (const file of files) {
  const filePath = path.join(blogDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Hant
  content = content.replace(/入門價由 HK\$3,800 起，?/g, '');
  content = content.replace(/入門方案由 HK\$3,800 起，?/g, '');
  content = content.replace(/入門方案 HK\$3,800 起，?/g, '');
  content = content.replace(/入門方案 HK\$3,800 起。?/g, '');
  content = content.replace(/入門價由 HK\$3,800 起。?/g, '');
  content = content.replace(/入門方案由 HK\$3,800 起。?/g, '');
  // Hans
  content = content.replace(/入门价从 HK\$3,800 起，?/g, '');
  content = content.replace(/入门方案从 HK\$3,800 起，?/g, '');
  content = content.replace(/入门方案 HK\$3,800 起，?/g, '');
  content = content.replace(/入门方案 HK\$3,800 起。?/g, '');
  content = content.replace(/入门价从 HK\$3,800 起。?/g, '');
  content = content.replace(/入门方案从 HK\$3,800 起。?/g, '');
  // En
  content = content.replace(/Starter plans from HK\$3,800[.,]?\s*/g, '');
  content = content.replace(/Entry price from HK\$3,800[.,]?\s*/g, '');
  content = content.replace(/Starter plans begin at HK\$3,800[.,]?\s*/g, '');
  
  // Clean up any weird trailing punctuation if left behind
  content = content.replace(/，完整方案歡迎預約諮詢/g, '完整方案歡迎預約諮詢');
  content = content.replace(/，欢迎预约免费咨询/g, '欢迎预约免费咨询');
  content = content.replace(/，助您輕鬆/g, '助您輕鬆');
  content = content.replace(/，助您轻松/g, '助您轻松');
  content = content.replace(/，可以先傾下/g, '可以先傾下');
  content = content.replace(/，可以先聊一聊/g, '可以先聊一聊');
  content = content.replace(/，立即聯絡我們/g, '立即聯絡我們');
  content = content.replace(/，立即联络我们/g, '立即联络我们');
  content = content.replace(/，歡迎與我們/g, '歡迎與我們');
  content = content.replace(/，欢迎与我们/g, '欢迎与我们');
  content = content.replace(/，可以先了解/g, '可以先了解');

  fs.writeFileSync(filePath, content, 'utf8');
}
console.log("Blog pricing removed.");
