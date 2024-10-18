const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

async function generateReport(reportData) {
    const doc = new PDFDocument();
    const reportDir = path.join(__dirname, 'download', 'reports');
    const reportFile = path.join(reportDir, 'compliance_report.pdf');

    // Create the report directory if it doesn't exist
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    // Pipe the PDF to a file
    doc.pipe(fs.createWriteStream(reportFile));

    // Title
    doc.fontSize(20).text('Compliance Report', { align: 'center' });
    doc.moveDown();

    // Add report content
    doc.fontSize(12).text(reportData, { align: 'left' });
    
    doc.end();
    
    return reportFile;
}

module.exports = {
    generateReport
};
