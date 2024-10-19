const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const vscode = require('vscode');

const reportDirectory = '/path/to/reports'; // Update this path accordingly

function generateReport(evalCommand, evalOutput) {
    return `
        OPA Evaluation Report
        =====================

        **Report ID:** ${generateReportID()}
        **Generated On:** ${new Date().toISOString()}

        **Command Executed:**
        ${evalCommand}

        **Output:**
        ${evalOutput}

        **Analysis:**
        The evaluation results indicate the following insights:
        - [Insert analysis based on evalOutput]
        
        **Recommendations:**
        Based on the output and analysis, consider the following recommendations:
        - [Insert recommendations]

        **Additional Notes:**
        - [Insert any additional notes or remarks]
    `;
}

function generateReportID() {
    return `RPT-${Date.now()}`;
}

// Save the generated report as a PDF
function saveReport(content) {
    const pdfFilePath = path.join(reportDirectory, 'opa_eval_report.pdf');
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfFilePath);

    doc.pipe(writeStream);
    
    // Title
    doc.fontSize(18).text('OPA Evaluation Report', { align: 'center' });
    doc.moveDown();

    // Report Sections
    doc.fontSize(12).text('Report ID: ' + generateReportID(), { align: 'left' });
    doc.text('Generated On: ' + new Date().toISOString(), { align: 'left' });
    doc.moveDown();

    // Command Executed
    doc.fontSize(14).text('Command Executed:', { underline: true });
    doc.fontSize(12).text(content.split("**Command Executed:**")[1].split("**Output:**")[0].trim());
    doc.moveDown();

    // Output
    doc.fontSize(14).text('Output:', { underline: true });
    doc.fontSize(12).text(content.split("**Output:**")[1].split("**Analysis:**")[0].trim());
    doc.moveDown();

    // Analysis Section
    doc.fontSize(14).text('Analysis:', { underline: true });
    doc.fontSize(12).text('The evaluation results indicate the following insights:', { indent: 20 });
    doc.moveDown();
    doc.text('- [Insert analysis based on evalOutput]', { indent: 40 });
    doc.moveDown();

    // Recommendations Section
    doc.fontSize(14).text('Recommendations:', { underline: true });
    doc.fontSize(12).text('Based on the output and analysis, consider the following recommendations:', { indent: 20 });
    doc.moveDown();
    doc.text('- [Insert recommendations]', { indent: 40 });
    doc.moveDown();

    // Additional Notes Section
    doc.fontSize(14).text('Additional Notes:', { underline: true });
    doc.fontSize(12).text('- [Insert any additional notes or remarks]', { indent: 20 });
    doc.moveDown();

    doc.end();

    writeStream.on('finish', () => {
        vscode.window.showInformationMessage(`Report generated: ${pdfFilePath}`);
    });
}
