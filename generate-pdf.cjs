const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('🚀 Starting PDF generation...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Load the HTML file
  const htmlPath = path.resolve(__dirname, 'BookWoven_Project_Report.html');
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  
  console.log('📄 Loading report from:', fileUrl);
  
  await page.goto(fileUrl, { 
    waitUntil: 'networkidle0',
    timeout: 60000 
  });
  
  // Wait for images to load
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('📐 Generating PDF with A4 format...');
  
  // Generate PDF
  const pdfPath = path.resolve(__dirname, 'BookWoven_Project_Report.pdf');
  
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '20mm'
    },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="width:100%; text-align:center; font-size:10px; color:#666; font-family: 'Times New Roman', serif;">
        <span class="pageNumber"></span>
      </div>
    `,
    preferCSSPageSize: false
  });
  
  console.log('✅ PDF generated successfully!');
  console.log('📁 Output:', pdfPath);
  
  await browser.close();
  
  // Get file size
  const fs = require('fs');
  const stats = fs.statSync(pdfPath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`📊 File size: ${fileSizeInMB} MB`);
})();
