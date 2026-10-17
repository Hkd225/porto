/** Compare brightness of a region across two screenshots. */
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('about:blank');
  const region = { x: 540, y: 585, width: 260, height: 95 };
  for (const name of process.argv.slice(2)) {
    const buf = fs.readFileSync(`${process.env.TEMP}/porto-audit/${name}`);
    const dataUrl = `data:image/png;base64,${buf.toString('base64')}`;
    const stats = await page.evaluate(async ([url, rect]) => {
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
      const cv = document.createElement('canvas');
      cv.width = img.width; cv.height = img.height;
      const ctx = cv.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(rect.x, rect.y, rect.width, rect.height).data;
      let sum = 0, mx = 0, n = d.length / 4;
      for (let i = 0; i < d.length; i += 4) {
        const v = (d[i] + d[i + 1] + d[i + 2]) / 3;
        sum += v; if (v > mx) mx = v;
      }
      return { name: null, avg: +(sum / n).toFixed(2), max: +mx.toFixed(2) };
    }, [dataUrl, region]);
    console.log(`${name}: avg=${stats.avg} max=${stats.max}`);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
