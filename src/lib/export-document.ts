export function exportToDocx(title: string, htmlContent: string) {
  const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset='utf-8'>
    <title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #333; }
      h1 { font-size: 20pt; color: #111; margin-bottom: 12px; }
      h2 { font-size: 16pt; color: #222; margin-top: 18px; }
      h3 { font-size: 13pt; color: #444; }
      code { font-family: Consolas, monospace; background: #f4f4f5; padding: 2px 4px; border-radius: 4px; }
      blockquote { border-left: 4px solid #7c3aed; padding-left: 12px; margin-left: 0; color: #555; }
      table { border-collapse: collapse; width: 100%; margin: 16px 0; }
      td, th { border: 1px solid #ddd; padding: 8px; }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    ${htmlContent}
  </body>
  </html>`;

  const blob = new Blob(["\ufeff", header], {
    type: "application/msword;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, "-")}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToPdf(title: string, htmlContent: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1e293b; line-height: 1.6; padding: 20px; }
          h1 { font-size: 24px; border-bottom: 2px solid #7c3aed; padding-bottom: 8px; margin-bottom: 20px; }
          blockquote { border-left: 4px solid #7c3aed; padding-left: 12px; font-style: italic; color: #475569; }
          code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${htmlContent}
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
