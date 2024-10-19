const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit'); // PDFKit for generating PDF reports

// Command to log audit data
async function logAuditData(action, details) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ACTION: ${action}\nDETAILS: ${details}\n\n`;

    const logDirectory = path.join(require('os').homedir(), 'Downloads', 'logs');
    if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory, { recursive: true });
    }

    const logFilePath = path.join(logDirectory, 'audit.log');

    // Append the log message to the file
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            vscode.window.showErrorMessage('Failed to write to audit log.');
        } else {
            vscode.window.showInformationMessage('Audit log updated successfully.');
        }
    });
}

// Command to save the file version and log it
async function saveVersionWithLog() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active editor found.');
        return;
    }

    const document = editor.document;
    const content = document.getText();
    const filePath = document.uri.fsPath;

    const versionDirectory = path.join(require('os').homedir(), 'Downloads', 'opaVersion');
    if (!fs.existsSync(versionDirectory)) {
        fs.mkdirSync(versionDirectory, { recursive: true });
    }

    const versionFilePath = path.join(versionDirectory, path.basename(filePath));
    fs.writeFileSync(versionFilePath, content);

    const logDetails = `File version saved: ${versionFilePath}`;
    logAuditData('Save File Version', logDetails);

    vscode.window.showInformationMessage(`File version saved: ${versionFilePath}`);
}

// Command to list saved versions and log it
async function listSavedVersions() {
    const versionDirectory = path.join(require('os').homedir(), 'Downloads', 'opaVersion');

    if (!fs.existsSync(versionDirectory)) {
        vscode.window.showErrorMessage('No saved versions found.');
        return;
    }

    const files = fs.readdirSync(versionDirectory);
    if (files.length === 0) {
        vscode.window.showInformationMessage('No file versions saved yet.');
    } else {
        const fileList = files.join('\n');
        vscode.window.showInformationMessage(`Saved file versions:\n${fileList}`);

        const logDetails = `Listed file versions from: ${versionDirectory}`;
        logAuditData('List File Versions', logDetails);
    }
}

// Command to generate an audit report in PDF format
async function generateAuditReport() {
    const logDirectory = path.join(require('os').homedir(), 'Downloads', 'logs');
    const logFilePath = path.join(logDirectory, 'audit.log');

    if (!fs.existsSync(logFilePath)) {
        vscode.window.showErrorMessage('No audit log found to generate a report.');
        return;
    }

    const reportDirectory = path.join(require('os').homedir(), 'Downloads', 'reports');
    if (!fs.existsSync(reportDirectory)) {
        fs.mkdirSync(reportDirectory, { recursive: true });
    }

    const pdfFilePath = path.join(reportDirectory, 'audit_report.pdf');

    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfFilePath);

    doc.pipe(writeStream);
    doc.fontSize(18).text('Audit Log Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);

    // Read and append the log contents to the PDF
    const logData = fs.readFileSync(logFilePath, 'utf8');
    doc.text(logData);

    doc.end();

    writeStream.on('finish', () => {
        vscode.window.showInformationMessage(`Audit report generated: ${pdfFilePath}`);
    });
}

module.exports = {
    saveVersionWithLog,
    listSavedVersions,
    generateAuditReport
};
