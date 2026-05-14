import { Router, type Request, type Response } from "express";
import { getQuest10Token } from "../db.js";

const router = Router();

// GET /quest/:uuid — quest10 웹 페이지
router.get("/:uuid", (req: Request, res: Response) => {
  const { uuid } = req.params;
  const token = getQuest10Token(uuid);

  if (!token) {
    res.status(404).send(`
      <!DOCTYPE html>
      <html lang="ko">
      <head><meta charset="UTF-8"><title>404</title>
      <style>body{background:#0f1117;color:#64748b;font-family:monospace;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}</style>
      </head>
      <body><div style="text-align:center"><p style="font-size:48px">404</p><p>유효하지 않은 퀘스트 URL입니다.</p><p style="font-size:12px">x402로 Quest 10을 구매하면 고유 URL을 받을 수 있습니다.</p></div></body>
      </html>
    `);
    return;
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quest 10 — x402 Avalanche Meetup</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #0f1117;
          color: #f1f5f9;
          font-family: 'Courier New', monospace;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .card {
          background: #1e293b;
          border-radius: 12px;
          padding: 40px;
          max-width: 480px;
          width: 100%;
          text-align: center;
        }
        .badge {
          background: #1d4ed8;
          color: #bfdbfe;
          font-size: 11px;
          padding: 4px 12px;
          border-radius: 20px;
          display: inline-block;
          margin-bottom: 20px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        h1 { font-size: 22px; margin-bottom: 12px; }
        .desc { color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 32px; }
        .btn {
          background: #3b82f6;
          color: #fff;
          border: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 15px;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn:hover { background: #2563eb; }
        .btn:disabled { background: #374151; cursor: default; }
        .code-box {
          display: none;
          margin-top: 28px;
          background: #0f1117;
          border: 1px solid #3b82f6;
          border-radius: 8px;
          padding: 20px;
        }
        .code-box.visible { display: block; }
        .code-label { color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .code-value { color: #4ade80; font-size: 28px; letter-spacing: 6px; font-weight: bold; }
        .code-hint { color: #64748b; font-size: 12px; margin-top: 10px; }
        .chain-info { margin-top: 32px; color: #475569; font-size: 11px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">Quest 10 · Avalanche x402</div>
        <h1>최종 퀘스트</h1>
        <p class="desc">
          여기까지 오셨군요!<br>
          아래 버튼을 눌러 클리어 코드를 받고,<br>
          Claude에게 알려주세요.
        </p>
        <button class="btn" id="clearBtn" onclick="clearQuest()">
          퀘스트 클리어!
        </button>
        <div class="code-box" id="codeBox">
          <div class="code-label">클리어 코드</div>
          <div class="code-value" id="codeValue">------</div>
          <div class="code-hint">이 코드를 Claude에게 입력하세요</div>
        </div>
        <div class="chain-info">
          Avalanche APIX L1 · Chain ID 402<br>
          x402 Payment Protocol
        </div>
      </div>
      <script>
        async function clearQuest() {
          const btn = document.getElementById('clearBtn');
          btn.disabled = true;
          btn.textContent = '확인 중...';
          try {
            const res = await fetch('/quest/${uuid}/code');
            const data = await res.json();
            document.getElementById('codeValue').textContent = data.code;
            document.getElementById('codeBox').classList.add('visible');
            btn.textContent = '클리어 완료';
          } catch (e) {
            btn.disabled = false;
            btn.textContent = '퀘스트 클리어!';
            alert('오류가 발생했습니다. 다시 시도해주세요.');
          }
        }
      </script>
    </body>
    </html>
  `);
});

// GET /quest/:uuid/code — answerCode 반환
router.get("/:uuid/code", (req: Request, res: Response) => {
  const { uuid } = req.params;
  const token = getQuest10Token(uuid);
  if (!token) {
    res.status(404).json({ error: "유효하지 않은 토큰입니다" });
    return;
  }
  res.json({ code: token.answerCode });
});

export default router;
