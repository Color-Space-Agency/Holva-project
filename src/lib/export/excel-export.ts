// This is a stub for excel-export using exceljs
// In a real implementation you would run: npm install exceljs

export async function exportToExcel(data: any[], filename: string, columns: { header: string, key: string }[]) {
  try {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Hisobot');
    
    worksheet.columns = columns.map(col => ({
      header: col.header,
      key: col.key,
      width: 20
    }));
    
    worksheet.addRows(data);
    
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Excel export error, ensure exceljs is installed', e);
  }
}
