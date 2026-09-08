import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/xu-duo-butterfly-guide/g, 'hilary-butterfly-guide');
app = app.replace(/xuDuoTitle/g, 'hilaryTitle');
app = app.replace(/xuDuoDesc/g, 'hilaryDesc');
app = app.replace(/CASE_XUDUO_ART/g, 'CASE_HILARY_ART');
fs.writeFileSync('src/App.tsx', app);

let trans = fs.readFileSync('src/i18n/translations.ts', 'utf8');
trans = trans.replace(/xu-duo-butterfly-guide/g, 'hilary-butterfly-guide');
trans = trans.replace(/xuDuoTitle/g, 'hilaryTitle');
trans = trans.replace(/xuDuoDesc/g, 'hilaryDesc');
trans = trans.replace(/徐多/g, 'Hilary');
trans = trans.replace(/Xu Duo/g, 'Hilary');
trans = trans.replace(/Young Author S/g, 'Young Author H');
trans = trans.replace(/CASE_XUDUO_ART/g, 'CASE_HILARY_ART');
fs.writeFileSync('src/i18n/translations.ts', trans);

console.log("Replacements done.");
