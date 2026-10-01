import jsPDF from 'jspdf';
import { getSystemProportions } from '../data/libraries';
import { adjustBrightness } from '../graphics/colors';
import { isDarkColor, getColorName, getModuleName } from '../lib/library';
import { removeDiacritics, svgToImage } from './common';

export async function generateAssemblyListPdf({ type, lang, project, library, assemblies, moduleCatalog }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Function to generate SVG string for an assembly
  // Uses fit-to-box scaling: SVG fits within maxWidth x maxHeight (in PDF mm units)
  const generateAssemblySVG = (assembly, maxWidth = 50, maxHeight = 22) => {
    const sysProps = getSystemProportions(library);
    
    // Calculate natural (unscaled) dimensions
    const naturalModuleArea = assembly.size * sysProps.moduleWidth1M;
    const naturalWidth = naturalModuleArea + (sysProps.sideMargin * 2);
    const naturalHeight = (sysProps.topMargin + sysProps.moduleHeight + sysProps.bottomMargin) 
      || (sysProps.moduleHeight + (sysProps.supportBarHeight + sysProps.supportBarOffset) * 2);
    
    // Fit-to-box: scale to fit within maxWidth x maxHeight
    const s = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);
    
    const moduleWidth1M = sysProps.moduleWidth1M * s;
    const modHeight = sysProps.moduleHeight * s;
    const sideMargin = sysProps.sideMargin * s;
    const topMargin = sysProps.topMargin * s;
    const bottomMargin = sysProps.bottomMargin * s;
    const totalHeight = (sysProps.topMargin + sysProps.moduleHeight + sysProps.bottomMargin) * s
      || (sysProps.moduleHeight + (sysProps.supportBarHeight + sysProps.supportBarOffset) * 2) * s;
    const cr = sysProps.cornerRadius * s;
    const mcr = sysProps.moduleCornerRadius * s;
    
    const moduleAreaWidth = assembly.size * moduleWidth1M;
    const totalWidth = moduleAreaWidth + (sideMargin * 2);
    
    // Vertical offset: center modules in totalHeight for systems without explicit margins
    const moduleTop = sysProps.topMargin > 0 ? topMargin : (totalHeight - modHeight) / 2;
    
    const isDark = isDarkColor(assembly.color, library);
    const frameBg = isDark ? '#3a3a3a' : '#f5f5f5';
    const supportBarColor = '#4a4a4a';
    const colorHexPdf = (library?.availableColors || []).find(c => c.id === assembly.color)?.hex;
    const moduleBg = colorHexPdf || (isDark ? '#3a3a3a' : '#ffffff');
    const moduleBorder = isDark ? adjustBrightness(colorHexPdf || '#3a3a3a', 30) : adjustBrightness(colorHexPdf || '#f5f5f5', -25);
    const frameBorderOuter = isDark ? '#555' : '#ddd';
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">`;
    
    // Outer frame
    svg += `<rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" rx="${cr}" fill="${frameBg}" stroke="${frameBorderOuter}" stroke-width="0.5"/>`;
    
    // Support bars (BTicino only)
    if (sysProps.hasSupportBars) {
      const sbh = sysProps.supportBarHeight * s;
      const sbo = sysProps.supportBarOffset * s;
      svg += `<rect x="${sideMargin}" y="${moduleTop + sbo}" width="${moduleAreaWidth}" height="${sbh}" fill="${supportBarColor}"/>`;
      svg += `<rect x="${sideMargin}" y="${moduleTop + modHeight - sbo - sbh}" width="${moduleAreaWidth}" height="${sbh}" fill="${supportBarColor}"/>`;
    }
    
    // Modules
    let moduleX = sideMargin;
    const centerYAbs = moduleTop + modHeight / 2;
    (assembly.modules || []).forEach((mod) => {
      const catalogItem = moduleCatalog.find(c => c.id === mod.moduleId);
      const size = catalogItem?.size || 1;
      const modWidth = size * moduleWidth1M;
      const centerX = moduleX + modWidth / 2;
      const centerY = centerYAbs;
      
      // Module background
      svg += `<rect x="${moduleX}" y="${moduleTop}" width="${modWidth}" height="${modHeight}" rx="${mcr}" fill="${moduleBg}" stroke="${moduleBorder}" stroke-width="0.5"/>`;
      
      if (catalogItem) {
        const modId = catalogItem.id.toLowerCase();
        const symbolColor = isDark ? '#ffffff' : '#333333';
        const accentColor = isDark ? '#555555' : '#e8e8e8';
        const holeColor = isDark ? '#ffffff' : '#333333';
        const sw = 0.95;
        
        if (modId.includes('schuko')) {
          svg += `<circle cx="${centerX}" cy="${centerY}" r="${8 * s}" fill="${accentColor}"/>`;
          svg += `<circle cx="${centerX - 3.5 * s}" cy="${centerY}" r="${1.8 * s}" fill="${holeColor}"/>`;
          svg += `<circle cx="${centerX + 3.5 * s}" cy="${centerY}" r="${1.8 * s}" fill="${holeColor}"/>`;
        } else if (modId.includes('italian')) {
          svg += `<ellipse cx="${centerX}" cy="${centerY}" rx="${3.5 * s}" ry="${8 * s}" fill="${accentColor}"/>`;
          svg += `<circle cx="${centerX}" cy="${centerY - 4 * s}" r="${1.2 * s}" fill="${holeColor}"/>`;
          svg += `<circle cx="${centerX}" cy="${centerY}" r="${1.2 * s}" fill="${holeColor}"/>`;
          svg += `<circle cx="${centerX}" cy="${centerY + 4 * s}" r="${1.2 * s}" fill="${holeColor}"/>`;
        } else if (modId.includes('usb')) {
          svg += `<rect x="${centerX - 3 * s}" y="${centerY - 5.5 * s}" width="${6 * s}" height="${3.2 * s}" rx="0.5" fill="${holeColor}"/>`;
          svg += `<rect x="${centerX - 3 * s}" y="${centerY + 0.8 * s}" width="${6 * s}" height="${3.2 * s}" rx="0.5" fill="${holeColor}"/>`;
        } else if (modId.includes('switch') || modId.includes('intrerupator')) {
          svg += `<line x1="${centerX - 4 * s}" y1="${centerY}" x2="${centerX + 4 * s}" y2="${centerY}" stroke="${symbolColor}" stroke-width="${sw}" stroke-linecap="round"/>`;
          svg += `<line x1="${centerX}" y1="${centerY - 4 * s}" x2="${centerX}" y2="${centerY + 4 * s}" stroke="${symbolColor}" stroke-width="${sw}" stroke-linecap="round"/>`;
          svg += `<circle cx="${centerX}" cy="${centerY + 10 * s}" r="${1.5 * s}" fill="#4ade80"/>`;
        } else if (modId.includes('dimmer') || modId.includes('potentiometru')) {
          svg += `<line x1="${centerX - 8 * s}" y1="${centerY - 3 * s}" x2="${centerX - 2 * s}" y2="${centerY - 3 * s}" stroke="${symbolColor}" stroke-width="${sw}" stroke-linecap="round"/>`;
          svg += `<line x1="${centerX - 5 * s}" y1="${centerY - 6 * s}" x2="${centerX - 5 * s}" y2="${centerY}" stroke="${symbolColor}" stroke-width="${sw}" stroke-linecap="round"/>`;
          svg += `<line x1="${centerX + 2 * s}" y1="${centerY + 3 * s}" x2="${centerX + 8 * s}" y2="${centerY + 3 * s}" stroke="${symbolColor}" stroke-width="${sw}" stroke-linecap="round"/>`;
        } else if (modId.includes('coax') || modId.includes('tv')) {
          svg += `<circle cx="${centerX}" cy="${centerY}" r="${5 * s}" fill="none" stroke="${symbolColor}" stroke-width="${sw}"/>`;
          svg += `<circle cx="${centerX}" cy="${centerY}" r="${1.5 * s}" fill="${symbolColor}"/>`;
        } else if (modId.includes('utp') || modId.includes('rj45') || modId.includes('data')) {
          svg += `<rect x="${centerX - 4 * s}" y="${centerY - 3 * s}" width="${8 * s}" height="${6 * s}" rx="1" fill="none" stroke="${symbolColor}" stroke-width="${sw}"/>`;
          svg += `<line x1="${centerX - 2 * s}" y1="${centerY - 3 * s}" x2="${centerX - 2 * s}" y2="${centerY + 3 * s}" stroke="${symbolColor}" stroke-width="${sw * 0.7}"/>`;
          svg += `<line x1="${centerX + 2 * s}" y1="${centerY - 3 * s}" x2="${centerX + 2 * s}" y2="${centerY + 3 * s}" stroke="${symbolColor}" stroke-width="${sw * 0.7}"/>`;
        } else if (modId.includes('blank') || modId.includes('tasta')) {
          // Blank
        } else {
          svg += `<rect x="${centerX - 3 * s}" y="${centerY - 3 * s}" width="${6 * s}" height="${6 * s}" fill="${holeColor}"/>`;
        }
      }
      
      moduleX += modWidth;
    });
    
    // Empty slots
    const usedSize = (assembly.modules || []).reduce((sum, mod) => {
      const catalogItem = moduleCatalog.find(c => c.id === mod.moduleId);
      return sum + (catalogItem?.size || 1);
    }, 0);
    
    if (usedSize < assembly.size) {
      const emptyWidth = (assembly.size - usedSize) * moduleWidth1M;
      svg += `<rect x="${moduleX}" y="${moduleTop}" width="${emptyWidth}" height="${modHeight}" rx="${mcr}" fill="none" stroke="#ccc" stroke-width="1" stroke-dasharray="3,2"/>`;
    }
    
    svg += '</svg>';
    return { svg, width: totalWidth, height: totalHeight };
  };
  
  const typeTitle = type === 'outlet' 
    ? (lang === 'ro' ? 'Lista Prize' : 'Outlets List')
    : (lang === 'ro' ? 'Lista Intrerupatoare' : 'Switches List');
  const projectName = project?.name || (lang === 'ro' ? 'Proiect' : 'Project');
  const clientName = project?.clientName || (lang === 'ro' ? 'Client' : 'Client');
  const dateStr = new Date().toLocaleDateString('ro-RO');
  
  doc.setFont('helvetica');
  
  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(typeTitle, pageWidth / 2, 14, { align: 'center' });
  
  // Project name
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(removeDiacritics(projectName), pageWidth / 2, 21, { align: 'center' });
  
  // Client name
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(removeDiacritics(clientName), pageWidth / 2, 27, { align: 'center' });
  
  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(10, 31, pageWidth - 10, 31);
  
  // Date on the right
  doc.setFontSize(9);
  doc.text(dateStr, pageWidth - 10, 38, { align: 'right' });
  
  let yPos = 44;
  
  // Group by room for better organization
  const groupedData = {};
  assemblies.forEach(assembly => {
    const room = assembly.room || (lang === 'ro' ? 'Fara camera' : 'No room');
    if (!groupedData[room]) {
      groupedData[room] = [];
    }
    groupedData[room].push(assembly);
  });
  
  const rooms = Object.keys(groupedData).sort((a, b) => {
    const noRoom = lang === 'ro' ? 'Fara camera' : 'No room';
    if (a === noRoom) return 1;
    if (b === noRoom) return -1;
    return a.localeCompare(b);
  });
  
  const cardHeight = 28; // Reduced height
  const roomHeaderHeight = 7;
  
  for (const room of rooms) {
    const roomAssemblies = groupedData[room];
    
    // Check if room header + at least one card fits on current page
    if (yPos + roomHeaderHeight + cardHeight > 280) {
      doc.addPage();
      yPos = 20;
    }
    
    // Room header
    doc.setFillColor(70, 70, 70);
    doc.rect(10, yPos, pageWidth - 20, 6, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(removeDiacritics(room), 13, yPos + 4.5);
    doc.setTextColor(0, 0, 0);
    yPos += roomHeaderHeight;
    
    for (const assembly of roomAssemblies) {
      if (yPos + cardHeight > 280) {
        doc.addPage();
        yPos = 20;
      }
      
      const wallBoxType = assembly.wallBoxType || 'masonry';
      const wallBoxLabel = wallBoxType === 'drywall' 
        ? (lang === 'ro' ? 'Gips-carton' : 'Drywall')
        : (lang === 'ro' ? 'Zidarie' : 'Masonry');
      const colorLabel = getColorName(assembly.color, library, lang);
      
      // Card background
      doc.setFillColor(252, 252, 252);
      doc.setDrawColor(230, 230, 230);
      doc.rect(10, yPos, pageWidth - 20, cardHeight - 1, 'FD');
      
      // Code
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 50, 50);
      doc.text(assembly.code, 13, yPos + 6);
      
      // Info line 1
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(90, 90, 90);
      doc.text(`${assembly.size}M | ${wallBoxLabel} | ${colorLabel}`, 13, yPos + 12);
      
      // Info line 2: Modules
      const moduleNames = assembly.modules.map(mod => {
        const catalogItem = moduleCatalog.find(c => c.id === mod.moduleId);
        return catalogItem ? removeDiacritics(getModuleName(catalogItem, lang)) : mod.moduleId;
      }).join(', ') || (lang === 'ro' ? 'Gol' : 'Empty');
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(120, 120, 120);
      const truncatedModules = moduleNames.length > 60 ? moduleNames.substring(0, 57) + '...' : moduleNames;
      doc.text(truncatedModules, 13, yPos + 18);

      // Info line 3: Notes
      if (assembly.notes) {
        const noteLabel = lang === 'ro' ? 'Obs' : 'Note';
        const noteLines = doc.splitTextToSize(`${noteLabel}: ${removeDiacritics(assembly.notes)}`, 130);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(90, 90, 90);
        doc.text(noteLines.length > 1 ? noteLines[0] + '...' : noteLines[0], 13, yPos + 24);
      }
      
      // Generate and add SVG sketch — fit to card area
      const maxImgWidth = 50; // mm in PDF
      const maxImgHeight = cardHeight - 4; // mm, leave some padding
      const { svg, width, height } = generateAssemblySVG(assembly, maxImgWidth, maxImgHeight);
      const imageData = await svgToImage(svg, width, height);
      
      if (imageData) {
        const imgX = pageWidth - 12 - width;
        const imgY = yPos + (cardHeight - 1 - height) / 2;
        doc.addImage(imageData, 'PNG', imgX, imgY, width, height);
      }
      
      yPos += cardHeight;
    }
    
    yPos += 2;
  }
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  const pageLabel = lang === 'ro' ? 'Pagina' : 'Page';
  const ofLabel = lang === 'ro' ? 'din' : 'of';
  const footerInfo = `${removeDiacritics(projectName)} - ${removeDiacritics(clientName)}`;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    // Client info on left
    doc.text(footerInfo, 10, doc.internal.pageSize.getHeight() - 10);
    // Page number on right
    doc.text(
      `${pageLabel} ${i} ${ofLabel} ${pageCount}`,
      pageWidth - 10,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }
  
  doc.setTextColor(0, 0, 0);
  const fileType = type === 'outlet' ? (lang === 'ro' ? 'Lista_Prize' : 'Outlets_List') : (lang === 'ro' ? 'Lista_Intrerupatoare' : 'Switches_List');
  const fileClientName = removeDiacritics(project?.clientName || 'Client').replace(/\s+/g, '_');
  const fileDateStr = new Date().toLocaleDateString('ro-RO').replace(/\./g, '-');
  doc.save(`${fileType}_${fileClientName}_${fileDateStr}.pdf`);
}
