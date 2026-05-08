#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname);
const TARGET_DIR = path.join(require('os').homedir(), '.claude', 'skills');

const LOGO = `
████████╗███████╗ █████╗ ███╗   ███╗     ██╗
╚══██╔══╝██╔════╝██╔══██╗████╗ ████║    ███║
   ██║   █████╗  ███████║██╔████╔██║    ╚██║
   ██║   ██╔══╝  ██╔══██║██║╚██╔╝██║     ██║
   ██║   ███████╗██║  ██║██║ ╚═╝ ██║     ██║
   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝     ╚═╝
         x402 × Avalanche L1  Builder Meetup
`;

function log(msg, type = 'info') {
  const icons = { info: '•', success: '✅', warn: '⚠️', error: '❌' };
  console.log(`${icons[type] || '•'} ${msg}`);
}

async function install() {
  console.log(LOGO);

  const argUrl = process.argv.slice(2).find(a => a.startsWith('--url='))?.split('=')[1];
  const resolvedUrl = argUrl || 'http://localhost:4010';

  log(`API URL: ${resolvedUrl}`);

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
    log(`생성: ${TARGET_DIR}`, 'success');
  }

  const skills = [
    { src: path.join(SKILLS_DIR, 'discover', 'SKILL.md'), dir: 'x402-discover' },
    { src: path.join(SKILLS_DIR, 'pay', 'SKILL.md'),      dir: 'x402-pay' },
    { src: path.join(SKILLS_DIR, 'quest', 'SKILL.md'),    dir: 'x402-quest' },
  ];

  for (const { src, dir } of skills) {
    let content = fs.readFileSync(src, 'utf8');
    // API URL 플레이스홀더 교체
    content = content.replace(/http:\/\/localhost:4010/g, resolvedUrl);
    const skillDir = path.join(TARGET_DIR, dir);
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), content);
    log(`설치: .claude/skills/${dir}/SKILL.md`, 'success');
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  설치 완료! Claude Code에서 시작하세요.

  /x402-quest   전체 퀘스트 진행
  /x402-discover  서비스 목록 탐색
  /x402-pay       결제 및 호출
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

install().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
