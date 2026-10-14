const sharp = require('/home/claude/.npm-global/lib/node_modules/sharp');
const fs = require('fs');
const RES = '../android/app/src/main/res';
const icon = fs.readFileSync('logo-icon.svg');
const mark = fs.readFileSync('logo-mark.svg', 'utf8');
const inner = mark.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const grad = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#19b878"/><stop offset="1" stop-color="#0b7d52"/></linearGradient></defs>`;
const svg = s => Buffer.from(s);
const round = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${grad}<circle cx="256" cy="256" r="256" fill="url(#g)"/><g transform="translate(51.2 51.2) scale(0.8)">${inner}</g></svg>`);
// Adaptive icon foreground: transparent, mark inside the 66/108 safe zone.
const fg = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g transform="translate(96 96) scale(0.625)">${inner}</g></svg>`);
const dens = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
const out = [];
(async () => {
  for (const [d, k] of Object.entries(dens)) {
    const s = Math.round(48 * k), f = Math.round(108 * k);
    await sharp(icon, { density: 400 }).resize(s, s).png().toFile(`${RES}/mipmap-${d}/ic_launcher.png`);
    await sharp(round, { density: 400 }).resize(s, s).png().toFile(`${RES}/mipmap-${d}/ic_launcher_round.png`);
    await sharp(fg, { density: 400 }).resize(f, f).png().toFile(`${RES}/mipmap-${d}/ic_launcher_foreground.png`);
    out.push(`mipmap-${d}: ${s}/${f}`);
  }
  const splashes = fs.readdirSync(RES).filter(n => n.startsWith('drawable')).filter(n => fs.existsSync(`${RES}/${n}/splash.png`));
  for (const dir of splashes) {
    const meta = await sharp(`${RES}/${dir}/splash.png`).metadata();
    const W = meta.width, H = meta.height, m = Math.round(Math.min(W, H) * 0.34);
    const bg = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#16b073"/><stop offset="1" stop-color="#0b7d52"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`);
    const markPng = await sharp(svg(mark), { density: 400 }).resize(m, m).png().toBuffer();
    await sharp(bg).composite([{ input: markPng, gravity: 'center' }]).flatten({ background: '#11a36a' }).png().toFile(`${RES}/${dir}/splash.png`);
    out.push(`${dir}: ${W}x${H}`);
  }
  await sharp(icon, { density: 300 }).resize(64, 64).png().toFile('../src/assets/icon/favicon.png');
  await sharp(icon, { density: 300 }).resize(512, 512).png().toFile('icon-512.png');
  await sharp(icon, { density: 300 }).resize(1024, 1024).png().toFile('icon-1024.png');
  console.log(out.join('\n'));
})();
