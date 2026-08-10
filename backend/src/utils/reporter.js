const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

class Reporter {
    /**
     * Generates an Excel file from data
     * @param {Array} data - Array of objects
     * @param {Array} columns - Column definitions { header, key, width }
     * @returns {ExcelJS.Workbook}
     */
    static async generateExcel(data, columns) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Rapor');

        worksheet.columns = columns;
        worksheet.addRows(data);

        // Style headers
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFECECEC' }
        };

        return workbook;
    }

    /**
     * Generates a basic PDF report
     * @param {String} title - Report title
     * @param {Array} data - Array of strings or objects to list
     */
    static generatePDF(title, content) {
        const doc = new PDFDocument();
        doc.fontSize(20).text(title, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(content);
        doc.end();
        return doc;
    }
}

module.exports = Reporter;
