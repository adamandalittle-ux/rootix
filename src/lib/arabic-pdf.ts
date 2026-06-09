import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const A4_W = 210; // mm
const A4_H = 297; // mm

async function renderElementToCanvas(el: HTMLElement) {
  return await html2canvas(el, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    windowWidth: el.scrollWidth,
  });
}

function makeWrapper(html: string, widthPx = 794 /* ~A4 @96dpi */, minHeightPx?: number) {
  const wrapper = document.createElement("div");
  wrapper.style.cssText = `position:fixed;top:-99999px;left:0;width:${widthPx}px;${
    minHeightPx ? `min-height:${minHeightPx}px;` : ""
  }background:#fff;color:#0a0a0a;font-family:'Tajawal','Cairo','Segoe UI','Arial',sans-serif;direction:rtl;text-align:right;padding:36px;line-height:1.7;box-sizing:border-box;`;
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

/**
 * Render a single HTML blob as a multi-page PDF (legacy — slices long content across pages).
 * Use for single-page reports. For per-student bulk reports, use renderArabicPdfPages.
 */
export async function renderArabicPdf(html: string, fileName: string, opts?: { width?: number }) {
  const wrapper = makeWrapper(html, opts?.width || 794);
  try {
    await new Promise((r) => setTimeout(r, 80));
    const canvas = await renderElementToCanvas(wrapper);
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const imgW = A4_W;
    const imgH = (canvas.height * imgW) / canvas.width;
    let heightLeft = imgH;
    let position = 0;
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgW, imgH);
    heightLeft -= A4_H;
    while (heightLeft > 0) {
      position = heightLeft - imgH;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgW, imgH);
      heightLeft -= A4_H;
    }
    pdf.save(fileName);
  } finally {
    document.body.removeChild(wrapper);
  }
}

/**
 * Render an array of HTML blobs — each one becomes its OWN A4 page in the PDF.
 * Perfect for "one student per page" bulk reports — never bleeds one student into another.
 * Each page is sized to A4 (794×1123 px) so the layout fills the sheet cleanly.
 */
export async function renderArabicPdfPages(pages: string[], fileName: string) {
  if (pages.length === 0) return;
  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  for (let i = 0; i < pages.length; i++) {
    const wrapper = makeWrapper(pages[i], 794, 1123);
    try {
      await new Promise((r) => setTimeout(r, 30));
      const canvas = await renderElementToCanvas(wrapper);
      // Scale canvas to fit A4 width; if taller than one page, scale down so it fits one page exactly.
      const widthMm = A4_W;
      let heightMm = (canvas.height * widthMm) / canvas.width;
      let xOffset = 0;
      let yOffset = 0;
      if (heightMm > A4_H) {
        // Scale down to fit A4 height
        const scale = A4_H / heightMm;
        const scaledW = widthMm * scale;
        heightMm = A4_H;
        xOffset = (A4_W - scaledW) / 2;
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", xOffset, 0, scaledW, heightMm);
      } else {
        // Center vertically when content is shorter than the page
        yOffset = 0; // top-aligned looks more print-friendly
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, yOffset, widthMm, heightMm);
      }
    } finally {
      document.body.removeChild(wrapper);
    }
  }
  pdf.save(fileName);
}
