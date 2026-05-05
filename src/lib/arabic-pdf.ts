import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Render an HTML element (Arabic-friendly) as a multi-page PDF.
 * The element must be visible in the DOM with explicit width.
 */
export async function htmlElementToPdf(el: HTMLElement, fileName: string) {
  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    windowWidth: el.scrollWidth,
  });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;

  let heightLeft = imgH;
  let position = 0;
  pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
  heightLeft -= pageH;
  while (heightLeft > 0) {
    position = heightLeft - imgH;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
    heightLeft -= pageH;
  }
  pdf.save(fileName);
}

/** Build offscreen Arabic-styled DIV, render, then remove. */
export async function renderArabicPdf(
  html: string,
  fileName: string,
  opts?: { width?: number }
) {
  const wrapper = document.createElement("div");
  wrapper.style.cssText = `position:fixed;top:-99999px;left:0;width:${opts?.width || 800}px;background:#fff;color:#0a0a0a;font-family:'Tajawal','Cairo','Segoe UI','Arial',sans-serif;direction:rtl;text-align:right;padding:32px;line-height:1.7;`;
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  try {
    // give fonts a tick to load
    await new Promise((r) => setTimeout(r, 60));
    await htmlElementToPdf(wrapper, fileName);
  } finally {
    document.body.removeChild(wrapper);
  }
}
