const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit'); // For generating PDF reports

// Function to log audit data
async function logAuditData(action, details) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ACTION: ${action}\nDETAILS: ${details}\n\n`;
    const logDirectory = path.join(require('os').homedir(), 'Downloads', 'logs');

    // Ensure log directory exists
    if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory, { recursive: true });
    }

    const logFilePath = path.join(logDirectory, 'audit.log');
    fs.appendFileSync(logFilePath, logMessage);
}

// Function to save the version of the currently open file
async function saveVersion() {
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

    const timestamp = new Date().toISOString().replace(/:/g, '-'); // Format timestamp for filenames
    const versionFilePath = path.join(versionDirectory, `${path.basename(filePath)}_${timestamp}.txt`);
    fs.writeFileSync(versionFilePath, content);

    await logAuditData('Save File Version', `Version saved: ${versionFilePath}`);
    vscode.window.showInformationMessage(`File version saved: ${versionFilePath}`);
}

// Function to list saved versions of the currently open file
async function listSavedVersions() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found.');
        return;
    }

    const fileName = path.basename(editor.document.uri.fsPath);
    const versionDirectory = path.join(require('os').homedir(), 'Downloads', 'opaVersion');

    if (!fs.existsSync(versionDirectory)) {
        vscode.window.showErrorMessage('No saved versions found.');
        return;
    }

    const files = fs.readdirSync(versionDirectory).filter(file => file.startsWith(fileName));
    if (files.length === 0) {
        vscode.window.showInformationMessage('No file versions saved yet.');
        return;
    }

    const fileList = files.map(file => `${file}`).join('\n');
    const selectedFile = await vscode.window.showQuickPick(files, {
        placeHolder: 'Select a version to open',
    });

    if (selectedFile) {
        const selectedFilePath = path.join(versionDirectory, selectedFile);
        const document = await vscode.workspace.openTextDocument(selectedFilePath);
        await vscode.window.showTextDocument(document);
    }

    await logAuditData('List File Versions', `Listed versions for: ${fileName}`);
}

// Function to generate a compliance report in PDF format for OPA evaluations
async function generateReport(evaluationData) {
    const reportDirectory = path.join(require('os').homedir(), 'Downloads', 'reports');
    if (!fs.existsSync(reportDirectory)) {
        fs.mkdirSync(reportDirectory, { recursive: true });
    }

    const pdfFilePath = path.join(reportDirectory, `opa_evaluation_report_${Date.now()}.pdf`);
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfFilePath);

    doc.pipe(writeStream);
    doc.fontSize(18).text('OPA Compliance Evaluation Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);

    // Add dynamic evaluation data to the report
    doc.text(`Date: ${new Date().toISOString()}`);
    doc.moveDown();
    doc.text(`Evaluation Results:\n${evaluationData}`);
    
    // Additional structured sections can be added here
    doc.end();

    writeStream.on('finish', () => {
        vscode.window.showInformationMessage(`Report generated: ${pdfFilePath}`);
    });
}

module.exports = {
    saveVersion,
    listSavedVersions,
    generateReport,
    logAuditData
};
