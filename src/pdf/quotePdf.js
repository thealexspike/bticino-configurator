import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getSystemName } from '../lib/library';
import { removeDiacritics } from './common';

export function generateQuotePdf({ lang, t, project, totalItems, sections, activeEntries, calculateSectionTotal, formatPrice, priceWithoutVat, grandTotalWithoutVat, vatAmount, grandTotalWithVat }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFont('helvetica');
  
  // Localized labels
  const pdfTitle = lang === 'ro' ? 'Oferta Client' : 'Client Quote';
  const pdfSubtitle = lang === 'ro' ? 'Toate preturile includ TVA 21%' : 'All prices include VAT 21%';
  const pdfProject = lang === 'ro' ? 'Proiect:' : 'Project:';
  const pdfClient = lang === 'ro' ? 'Client:' : 'Client:';
  const pdfDate = lang === 'ro' ? 'Data:' : 'Date:';
  const pdfItems = lang === 'ro' ? 'Articole:' : 'Items:';
  
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(pdfTitle, pageWidth / 2, 20, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(pdfSubtitle, pageWidth / 2, 28, { align: 'center' });
  
  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 33, pageWidth - 14, 33);
  
  // Project info box
  doc.setFillColor(248, 249, 250);
  doc.rect(14, 38, pageWidth - 28, 28, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.rect(14, 38, pageWidth - 28, 28, 'S');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(pdfProject, 18, 47);
  doc.setFont('helvetica', 'normal');
  doc.text(removeDiacritics(project.name) || '—', 50, 47);
  
  doc.setFont('helvetica', 'bold');
  doc.text(pdfClient, 18, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(removeDiacritics(project.clientName) || '—', 50, 55);
  
  doc.setFont('helvetica', 'bold');
  doc.text(pdfDate, 110, 47);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('ro-RO'), 135, 47);
  
  doc.setFont('helvetica', 'bold');
  doc.text(pdfItems, 110, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(totalItems.toString(), 135, 55);
  
  let yPos = 78;
  
  // Section titles from translations
  const sectionTitles = {
    wallBoxesMasonry: t.wallBoxesMasonry,
    wallBoxesDrywall: t.wallBoxesDrywall,
    installFaces: t.supports || t.installFaces,
    decorFaces: t.coverPlates || t.decorFaces,
    modules: t.modules,
    moduleFaces: t.moduleFaces,
  };
  
  // Fixed column widths for quote (6 columns) - adjusted for smaller margins
  const col1Width = 60;  // Item / Articol
  const col2Width = 25;  // Color / Culoare
  const col3Width = 28;  // Unit (excl. VAT)
  const col4Width = 28;  // Unit (incl. VAT)
  const col5Width = 18;  // Qty
  const col6Width = 30;  // Total (with "lei")
  const totalTableWidth = col1Width + col2Width + col3Width + col4Width + col5Width + col6Width;
  
  sections.forEach(({ key, title }) => {
    // Doar articolele active (cele excluse nu apar în ofertă)
    const entriesForPdf = activeEntries(key);
    const items = entriesForPdf.map(([, item]) => item);
    if (items.length === 0) return;

    const sectionTotalWithVat = calculateSectionTotal(entriesForPdf);
    const sectionTotalQty = items.reduce((sum, item) => sum + item.qty, 0);
    
    // Estimate space needed
    const estimatedHeight = 12 + 10 + (items.length * 8) + 10 + 15;
    
    if (yPos + estimatedHeight > 285) {
      doc.addPage();
      yPos = 12;
    }
    
    // Section header with gray background
    doc.setFillColor(80, 80, 80);
    doc.rect(10, yPos, totalTableWidth, 8, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(removeDiacritics(sectionTitles[key] || title), 14, yPos + 6);
    doc.setTextColor(0, 0, 0);
    
    // Move position AFTER the header
    yPos += 8;
    
    // Build table body with items + subtotal row
    const tableBody = items.map(item => {
      const unitWithoutVat = priceWithoutVat(item.unitPrice);
      const totalWithVat = item.unitPrice * item.qty;
      return [
        removeDiacritics(item.name) || '—', 
        removeDiacritics(item.color) || '—', 
        formatPrice(unitWithoutVat),
        formatPrice(item.unitPrice),
        item.qty.toString(),
        formatPrice(totalWithVat) + ' lei'
      ];
    });
    
    // Add subtotal row to table body with qty and price
    tableBody.push([
      { content: 'Subtotal:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 245, 245] } },
      { content: sectionTotalQty.toString(), styles: { halign: 'center', fontStyle: 'bold', fillColor: [245, 245, 245] } },
      { content: formatPrice(sectionTotalWithVat) + ' lei', styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 245, 245] } }
    ]);
    
    // Localized table headers
    const tableHeaders = lang === 'ro' ? [
      { content: 'Articol', styles: { halign: 'left' } },
      { content: 'Culoare', styles: { halign: 'right' } },
      { content: 'Unitar (fara TVA)', styles: { halign: 'right' } },
      { content: 'Unitar (cu TVA)', styles: { halign: 'right' } },
      { content: 'Cant.', styles: { halign: 'center' } },
      { content: 'Total', styles: { halign: 'right' } }
    ] : [
      { content: 'Item', styles: { halign: 'left' } },
      { content: 'Color', styles: { halign: 'right' } },
      { content: 'Unit (excl. VAT)', styles: { halign: 'right' } },
      { content: 'Unit (incl. VAT)', styles: { halign: 'right' } },
      { content: 'Qty', styles: { halign: 'center' } },
      { content: 'Total', styles: { halign: 'right' } }
    ];
    
    // Create independent table for this section
    autoTable(doc, {
      startY: yPos,
      head: [tableHeaders],
      body: tableBody,
      theme: 'grid',
      styles: {
        fontSize: 8,
      },
      headStyles: { 
        fillColor: [240, 240, 240],
        textColor: [50, 50, 50],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: col1Width, halign: 'left' },
        1: { cellWidth: col2Width, halign: 'right' },
        2: { cellWidth: col3Width, halign: 'right', textColor: [100, 100, 100] },
        3: { cellWidth: col4Width, halign: 'right' },
        4: { cellWidth: col5Width, halign: 'center' },
        5: { cellWidth: col6Width, halign: 'right', fontStyle: 'bold' },
      },
      margin: { left: 10, right: 10 },
      tableId: key, // Unique ID for each table
    });
    
    // Get the final Y position immediately after this table
    const thisTableFinalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : (doc.previousAutoTable ? doc.previousAutoTable.finalY : yPos + 50);
    
    // Set position for next section with padding
    yPos = thisTableFinalY + 10;
  });
  
  // Grand total box - use last table's final position
  const lastY = doc.lastAutoTable ? doc.lastAutoTable.finalY : (doc.previousAutoTable ? doc.previousAutoTable.finalY : yPos);
  yPos = lastY + 15;
  
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }
  
  // Grand Total Box
  doc.setFillColor(240, 240, 240);
  doc.rect(pageWidth - 100, yPos, 86, 40, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(pageWidth - 100, yPos, 86, 40, 'S');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  // Total without VAT
  doc.text('Total (fara TVA):', pageWidth - 96, yPos + 10);
  doc.text(formatPrice(grandTotalWithoutVat) + ' lei', pageWidth - 18, yPos + 10, { align: 'right' });
  
  // VAT Amount
  doc.text('TVA (21%):', pageWidth - 96, yPos + 20);
  doc.text(formatPrice(vatAmount) + ' lei', pageWidth - 18, yPos + 20, { align: 'right' });
  
  // Total with VAT
  doc.setDrawColor(150, 150, 150);
  doc.line(pageWidth - 96, yPos + 25, pageWidth - 18, yPos + 25);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', pageWidth - 96, yPos + 35);
  doc.text(formatPrice(grandTotalWithVat) + ' lei', pageWidth - 18, yPos + 35, { align: 'right' });
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(
      `${getSystemName(project.system, lang)} - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Reset text color and save
  doc.setTextColor(0, 0, 0);
  const filePrefix = lang === 'ro' ? 'Oferta' : 'Quote';
  const clientName = project.clientName ? removeDiacritics(project.clientName).replace(/\s+/g, '_') : 'Client';
  const dateStr = new Date().toLocaleDateString('ro-RO').replace(/\./g, '-');
  doc.save(`${filePrefix}_${clientName}_${dateStr}.pdf`);
}
