import { cpSync, mkdirSync, writeFileSync } from 'node:fs';

const out = 'netlify-dist';
mkdirSync(out, { recursive: true });
cpSync('apps/web-staff/dist', `${out}/staff`, { recursive: true });
cpSync('apps/web-citizen/dist', `${out}/citizen`, { recursive: true });
cpSync('apps/web-platform/dist', `${out}/platform`, { recursive: true });

writeFileSync(`${out}/index.html`, `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Samadhan</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Mukta:wght@400;600;700;800&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Mukta',sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#FAF5EE;color:#2A1F17;padding:24px}
  h1{font-size:2.5rem;font-weight:800;letter-spacing:-0.02em;margin-bottom:4px}
  .sub{color:#8A7766;margin-bottom:8px;font-size:1.1rem}
  .hindi{color:#C4B5A3;margin-bottom:40px;font-size:0.95rem}
  .cards{display:flex;gap:24px;flex-wrap:wrap;justify-content:center;max-width:960px}
  .card{background:#fff;border:2px solid #E3D6C6;border-radius:20px;padding:32px;text-align:center;width:260px;text-decoration:none;color:inherit;transition:box-shadow .2s,transform .2s,border-color .2s}
  .card:hover{box-shadow:0 8px 24px rgba(0,0,0,0.08);transform:translateY(-2px);border-color:#C24E33}
  .icon{font-size:2.5rem;margin-bottom:12px;color:#C24E33}
  .card h2{font-size:1.2rem;font-weight:700;margin-bottom:6px}
  .card p{color:#8A7766;font-size:0.9rem;line-height:1.5}
  .badge{display:inline-block;border-radius:12px;padding:4px 12px;font-size:0.75rem;font-weight:700;margin-top:12px}
  footer{margin-top:48px;color:#C4B5A3;font-size:0.8rem}
</style>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0&display=swap" rel="stylesheet">
</head>
<body>
  <h1>Samadhan</h1>
  <p class="sub">Public Grievance Platform</p>
  <div class="cards">
    <a href="/platform/" class="card">
      <div class="icon"><span class="material-symbols-rounded" style="font-size:2.5rem;font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24">shield</span></div>
      <h2>Platform Console</h2>
      <p>Manage all tenant deployments, configurations, usage, costs and analytics.</p>
      <span class="badge" style="background:#1B2A4A;color:#fff">Owner</span>
    </a>
    <a href="/staff/" class="card">
      <div class="icon"><span class="material-symbols-rounded" style="font-size:2.5rem;font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24">apartment</span></div>
      <h2>Staff Console</h2>
      <p>Dashboard, cases management, settings for municipal officers and administrators.</p>
      <span class="badge" style="background:#E0F0FF;color:#2F6690">Desktop</span>
    </a>
    <a href="/citizen/" class="card">
      <div class="icon"><span class="material-symbols-rounded" style="font-size:2.5rem;font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24">smartphone</span></div>
      <h2>Citizen App</h2>
      <p>Register complaints, track status, voice-first experience in English and Hindi.</p>
      <span class="badge" style="background:#E6F5EC;color:#2F7D4F">Mobile PWA</span>
    </a>
  </div>
  <footer>Samadhan R1</footer>
</body>
</html>
`);

console.log('Combined output ready in', out);
