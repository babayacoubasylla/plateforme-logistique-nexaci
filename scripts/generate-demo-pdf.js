#!/usr/bin/env node
/*
  Génération PDF automatisée pour la page de démo des identifiants.
  - Source 1: docs/DEMO_CREDENTIALS.html -> docs/DEMO_CREDENTIALS.pdf
  - Source 2: frontend/public/demo-credentials.html -> frontend/public/demo-credentials.pdf

  Options (CLI):
    --only=docs|public  Limiter à une seule source
    --out=<chemin.pdf>  Sortie unique personnalisée (uniquement si --only est défini)
*/

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer');

function arg(name) {
  const pref = `--${name}=`;
  const raw = process.argv.find(a => a.startsWith(pref));
  return raw ? raw.slice(pref.length) : undefined;
}

function fileUrl(p) {
  return pathToFileURL(path.resolve(p)).toString();
}

async function exportPdf({ inputHtml, outputPdf }) {
  const browser = await puppeteer.launch({
    headless: 'new',
    // Par défaut, Puppeteer peut charger les ressources http(s) requises par le fichier
    // file://. Pas besoin de flags spéciaux ici.
  });
  try {
    const page = await browser.newPage();

    // Aller sur le fichier local et attendre l'idle réseau
    await page.goto(fileUrl(inputHtml), { waitUntil: 'networkidle0', timeout: 60000 });

    // Attendre que les QR Codes (canvas) soient dessinés
    await page.waitForFunction(() => {
      const has = (id) => {
        const el = document.getElementById(id);
        return !!el && !!el.querySelector('canvas');
      };
      return has('qr_web') && has('qr_apk_client') && has('qr_apk_livreur');
    }, { timeout: 15000 }).catch(() => {});

    // Utiliser les styles d'impression
    await page.emulateMediaType('print');

    // Export PDF
    await page.pdf({
      path: path.resolve(outputPdf),
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '12mm', left: '10mm' },
      preferCSSPageSize: false,
    });

    console.log(`✅ PDF généré: ${outputPdf}`);
  } finally {
    await browser.close();
  }
}

(async () => {
  const only = arg('only'); // 'docs' | 'public'
  const out = arg('out');

  const jobs = [];

  if (!only || only === 'docs') {
    const inputHtml = path.join('docs', 'DEMO_CREDENTIALS.html');
    const outputPdf = out && only === 'docs' ? out : path.join('docs', 'DEMO_CREDENTIALS.pdf');
    if (fs.existsSync(inputHtml)) jobs.push({ inputHtml, outputPdf });
    else console.warn(`⚠️ Introuvable: ${inputHtml}`);
  }

  if (!only || only === 'public') {
    const inputHtml = path.join('frontend', 'public', 'demo-credentials.html');
    const outputPdf = out && only === 'public' ? out : path.join('frontend', 'public', 'demo-credentials.pdf');
    if (fs.existsSync(inputHtml)) jobs.push({ inputHtml, outputPdf });
    else console.warn(`⚠️ Introuvable: ${inputHtml}`);
  }

  if (!jobs.length) {
    console.error('Aucune source HTML trouvée. Abandon.');
    process.exit(1);
  }

  for (const job of jobs) {
    await exportPdf(job);
  }
})();
