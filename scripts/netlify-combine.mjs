import { cpSync, mkdirSync, writeFileSync } from 'node:fs';

const out = 'netlify-dist';
mkdirSync(out, { recursive: true });
cpSync('apps/web-staff/dist', `${out}/staff`, { recursive: true });
cpSync('apps/web-citizen/dist', `${out}/citizen`, { recursive: true });

writeFileSync(`${out}/index.html`, `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Samadhan</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Inter',system-ui,sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f8fafc;color:#1e293b;padding:24px}
  h1{font-size:2.5rem;font-weight:700;letter-spacing:-0.02em;margin-bottom:4px}
  .sub{color:#64748b;margin-bottom:8px;font-size:1.1rem}
  .hindi{color:#94a3b8;margin-bottom:40px;font-size:0.95rem}
  .cards{display:flex;gap:24px;flex-wrap:wrap;justify-content:center;max-width:700px}
  .card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:32px;text-align:center;width:280px;text-decoration:none;color:inherit;transition:box-shadow .2s,transform .2s}
  .card:hover{box-shadow:0 8px 24px rgba(0,0,0,0.08);transform:translateY(-2px)}
  .icon{font-size:2.5rem;margin-bottom:12px}
  .card h2{font-size:1.2rem;font-weight:600;margin-bottom:6px}
  .card p{color:#64748b;font-size:0.9rem;line-height:1.5}
  .badge{display:inline-block;background:#dbeafe;color:#2563eb;border-radius:12px;padding:4px 12px;font-size:0.75rem;font-weight:600;margin-top:12px}
  footer{margin-top:48px;color:#94a3b8;font-size:0.8rem}
</style>
</head>
<body>
  <h1>Samadhan</h1>
  <p class="sub">Public Grievance Platform</p>
  <p class="hindi">समाधान · लोक शिकायत मंच</p>
  <div class="cards">
    <a href="/staff/" class="card">
      <div class="icon">🏛️</div>
      <h2>Staff Console</h2>
      <p>Dashboard, cases management, settings — for municipal officers and administrators.</p>
      <span class="badge">Desktop</span>
    </a>
    <a href="/citizen/" class="card">
      <div class="icon">📱</div>
      <h2>Citizen App</h2>
      <p>Register complaints, track status, voice-first — bilingual English &amp; Hindi.</p>
      <span class="badge">Mobile PWA</span>
    </a>
  </div>
  <footer>Samadhan R1 · Phases 0-5</footer>
</body>
</html>
`);

console.log('Combined output ready in', out);
