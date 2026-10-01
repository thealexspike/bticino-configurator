import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getSystemName } from '../lib/library';
import { removeDiacritics } from './common';

export function generateBoqPdf({ lang, t, project, totalItems, sections, activeEntries }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFont('helvetica');
  
  // Localized labels
  const pdfTitle = lang === 'ro' ? 'Lista de Cantitati' : 'Bill of Quantities';
  const pdfSubtitle = lang === 'ro' ? 'Pentru Furnizor' : 'For Supplier';
  const pdfProject = lang === 'ro' ? 'Proiect:' : 'Project:';
  const pdfClient = lang === 'ro' ? 'Client:' : 'Client:';
  const pdfDate = lang === 'ro' ? 'Data:' : 'Date:';
  const pdfTotalItems = lang === 'ro' ? 'Total articole:' : 'Total items:';
  
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(pdfTitle, pageWidth / 2, 20, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(12);
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
  doc.text(pdfDate, 120, 47);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('ro-RO'), 145, 47);
  
  doc.setFont('helvetica', 'bold');
  doc.text(pdfTotalItems, 120, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(totalItems.toString(), 160, 55);
  
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
  
  sections.forEach(({ key, title }) => {
    // Doar articolele active (cele excluse nu intră în comandă)
    const items = activeEntries(key).map(([, item]) => item);
    if (items.length === 0) return;

    // Calculate section total qty
    const sectionTotalQty = items.reduce((sum, item) => sum + item.qty, 0);
    
    // Estimate space needed: header (12) + table header (10) + rows (8 each) + subtotal (10) + padding (15)
    const estimatedHeight = 12 + 10 + (items.length * 8) + 10 + 15;
    
    if (yPos + estimatedHeight > 280) {
      doc.addPage();
      yPos = 20;
    }
    
    // Fixed column widths for consistent alignment
    const col1Width = 75;  // Item / Articol
    const col2Width = 40;  // Color / Culoare
    const col3Width = 40;  // SKU / Cod
    const col4Width = 27;  // Qty / Cant.
    const totalTableWidth = col1Width + col2Width + col3Width + col4Width;
    
    // Section header with gray background - same width as table
    doc.setFillColor(80, 80, 80);
    doc.rect(10, yPos, totalTableWidth, 8, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(removeDiacritics(sectionTitles[key] || title), 14, yPos + 6);
    doc.setTextColor(0, 0, 0);
    
    // Move position AFTER the header
    yPos += 8;
    
    // Localized table headers
    const tableHeaders = lang === 'ro' 
      ? [
          { content: 'Articol', styles: { halign: 'left' } },
          { content: 'Culoare', styles: { halign: 'right' } },
          { content: 'Cod', styles: { halign: 'right' } },
          { content: 'Cant.', styles: { halign: 'center' } }
        ]
      : [
          { content: 'Item', styles: { halign: 'left' } },
          { content: 'Color', styles: { halign: 'right' } },
          { content: 'SKU', styles: { halign: 'right' } },
          { content: 'Qty', styles: { halign: 'center' } }
        ];
    
    // Build table body with subtotal row
    const tableBody = items.map(item => [
      removeDiacritics(item.name) || '—', 
      removeDiacritics(item.color) || '—', 
      item.sku || '—', 
      item.qty.toString()
    ]);
    
    // Add subtotal row
    tableBody.push([
      { content: 'Subtotal:', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 245, 245] } },
      { content: sectionTotalQty.toString(), styles: { halign: 'center', fontStyle: 'bold', fillColor: [245, 245, 245] } }
    ]);
    
    // Create independent table for this section
    autoTable(doc, {
      startY: yPos,
      head: [tableHeaders],
      body: tableBody,
      theme: 'grid',
      styles: {
        fontSize: 9,
      },
      headStyles: { 
        fillColor: [240, 240, 240],
        textColor: [50, 50, 50],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: col1Width, halign: 'left' },
        1: { cellWidth: col2Width, halign: 'right' },
        2: { cellWidth: col3Width, halign: 'right', fontStyle: 'italic', textColor: [100, 100, 100] },
        3: { cellWidth: col4Width, halign: 'center', fontStyle: 'bold' },
      },
      margin: { left: 10, right: 10 },
      tableId: key, // Unique ID for each table
    });
    
    // Get the final Y position immediately after this table
    const thisTableFinalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : (doc.previousAutoTable ? doc.previousAutoTable.finalY : yPos + 50);
    
    // Set position for next section with minimal padding
    yPos = thisTableFinalY + 5;
  });
  
  // Total needs consistent spacing from last table's finalY
  const lastTableEndY = doc.lastAutoTable ? doc.lastAutoTable.finalY : (doc.previousAutoTable ? doc.previousAutoTable.finalY : yPos);
  yPos = lastTableEndY + 15; // 15px padding after last table
  
  if (yPos > 270) {
    doc.addPage();
    yPos = 20;
  }
  
  const totalLabel = lang === 'ro' ? `TOTAL: ${totalItems} articole` : `TOTAL: ${totalItems} items`;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(totalLabel, pageWidth - 14, yPos, { align: 'right' });
  
  const pageCount = doc.internal.getNumberOfPages();
  const pageLabel = lang === 'ro' ? 'Pagina' : 'Page';
  const ofLabel = lang === 'ro' ? 'din' : 'of';
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(
      `${getSystemName(project.system, lang)} - ${pageLabel} ${i} ${ofLabel} ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  doc.setTextColor(0, 0, 0);
  const filePrefix = lang === 'ro' ? 'BOQ_Furnizor' : 'BOQ_Supplier';
  const clientName = project.clientName ? removeDiacritics(project.clientName).replace(/\s+/g, '_') : 'Client';
  const dateStr = new Date().toLocaleDateString('ro-RO').replace(/\./g, '-');
  doc.save(`${filePrefix}_${clientName}_${dateStr}.pdf`);
}
