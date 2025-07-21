// utils/exportCertificate.ts
// Requires: npm install html2canvas jspdf
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export type ExportType = "png" | "pdf";

/**
 * Exports a DOM node (certificate) as PNG or PDF.
 * @param element The DOM node to export
 * @param type Export type: 'png' or 'pdf'
 * @param fileName Optional file name (default: 'certificate')
 * @returns Promise<Blob> (PNG) or Promise<Uint8Array> (PDF)
 */
export async function exportCertificate(
  element: HTMLElement,
  type: ExportType = "png"
): Promise<Blob> {
  // Use html2canvas to render the element
  const canvas = await html2canvas(element, {
    scale: 2, // for high resolution
    useCORS: true,
    backgroundColor: "#fff",
  });

  if (type === "png") {
    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, "image/png");
    });
  } else {
    // PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    const arrayBuffer = pdf.output("arraybuffer") as ArrayBuffer;
    return new Blob([arrayBuffer], { type: "application/pdf" });
  }
} 