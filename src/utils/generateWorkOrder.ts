import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateAndDownloadPDF(project: any, signs: any[]) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('WORK ORDER', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Project: ${project.project_name}`, 14, 30);
  doc.text(`Quote Ref: ${project.quote_ref || '—'}`, 14, 36);
  doc.text(`Submitted: ${project.submitted_at_gmt7 || new Date().toLocaleString()}`, 14, 42);
  doc.text(`Total Signs: ${signs.length}`, 14, 48);

  doc.setDrawColor(200);
  doc.line(14, 52, 196, 52);

  // Signs table
  const tableRows = signs.map((sign: any, i: number) => {
    const specSummary = sign.spec_data
      ? [
          sign.spec_data.face_assembly?.map((c: any) => c.component_name).join(', '),
          sign.spec_data.body?.map((c: any) => c.component_name).join(', '),
          sign.spec_data.systems?.map((c: any) => c.component_name).join(', '),
        ]
          .filter(Boolean)
          .join(' | ')
      : '—';

    return [
      String(i + 1),
      sign.sign_name || '—',
      sign.profile_code || '—',
      sign.profile_type || '—',
      sign.height_inches ? `${sign.height_inches}"` : sign.height || '—',
      String(sign.sets || 1),
      specSummary,
      sign.notes || '',
    ];
  });

  autoTable(doc, {
    startY: 56,
    head: [['#', 'Sign Name', 'Profile Code', 'Tech', 'Height', 'Qty', 'Spec Summary', 'Notes']],
    body: tableRows,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [30, 30, 50], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 32 },
      2: { cellWidth: 28 },
      3: { cellWidth: 18 },
      4: { cellWidth: 16 },
      5: { cellWidth: 10 },
      6: { cellWidth: 55 },
      7: { cellWidth: 25 },
    },
    alternateRowStyles: { fillColor: [245, 245, 250] },
  });

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(
      'Manufactured by The Signage Factory, Bangkok. This document is the official technical spec for production.',
      14,
      doc.internal.pageSize.height - 8
    );
    doc.text(`Page ${i} of ${pageCount}`, 180, doc.internal.pageSize.height - 8);
  }

  doc.save(`${project.quote_ref || 'work-order'}.pdf`);
}
