export const downloadInvoicePdf = async (element: HTMLElement, filename: string) => {
  const html2pdfModule = await import("html2pdf.js");
  const html2pdf = html2pdfModule.default ?? html2pdfModule;
  const safeFilename = filename.trim().length ? filename.trim().replace(/\s+/g, "-") : "invoice";

  return html2pdf()
    .set({
      margin: 0.5,
      filename: `${safeFilename}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    })
    .from(element)
    .save();
};
