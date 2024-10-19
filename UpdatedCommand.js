const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit'); // For generating PDF reports

// Directory paths
const versionDirectory = path.join(require('os').homedir(), 'Downloads', 'opaVersion');
const logDirectory = path.join(require('os').homedir(), 'Downloads', 'logs');
const reportDirectory = path.join(require('os').homedir(), 'Downloads', 'reports');

// Ensure directories exist
if (!fs.existsSync(versionDirectory)) {
    fs.mkdirSync(versionDirectory, { recursive: true });
}
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}
if (!fs.existsSync(reportDirectory)) {
    fs.mkdirSync(reportDirectory, { recursive: true });
}

// Log audit data
async function logAuditData(action, details) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ACTION: ${action}\nDETAILS: ${details}\n\n`;
    const logFilePath = path.join(logDirectory, 'audit.log');
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            vscode.window.showErrorMessage('Failed to write to audit log.');
        }
    });
}

// Save the current file version with a timestamp
async function saveVersionWithLog() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active editor found.');
        return;
    }

    const document = editor.document;
    const content = document.getText();
    const filePath = document.uri.fsPath;
    const currentTime = new Date().toISOString().replace(/[:.]/g, '-'); // Replace colons and dots for a valid filename
    const versionFileName = `${path.basename(filePath, path.extname(filePath))}_${currentTime}${path.extname(filePath)}`;
    const versionFilePath = path.join(versionDirectory, versionFileName);

    fs.writeFileSync(versionFilePath, content);
    await logAuditData('Save File Version', `File version saved: ${versionFilePath}`);

    vscode.window.showInformationMessage(`File version saved: ${versionFilePath}`);
}

// List saved versions for the current file
async function listSavedVersions() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active editor found.');
        return;
    }

    const document = editor.document;
    const currentFileName = path.basename(document.uri.fsPath, path.extname(document.uri.fsPath));
    const files = fs.readdirSync(versionDirectory).filter(file => file.startsWith(currentFileName));

    if (files.length === 0) {
        vscode.window.showInformationMessage('No saved versions found for the current file.');
    } else {
        const fileList = files.join('\n');
        vscode.window.showInformationMessage(`Saved versions for ${currentFileName}:\n${fileList}`);
    }
}

// Perform OPA evaluation dynamically (No changes made here as per your request)
async function performOpaEval() {
    const evalCommand = await vscode.window.showInputBox({
        prompt: 'Enter the OPA eval command (e.g., opa eval -i plan.json -d policy.rego "data")'
    });

    if (!evalCommand) {
        vscode.window.showErrorMessage('No command entered.');
        return;
    }

    const exec = require('child_process').exec;
    exec(evalCommand, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`Error executing OPA eval: ${stderr}`);
            return;
        }

        const reportContent = generateReport(evalCommand, stdout);
        saveReport(reportContent);

        vscode.window.showInformationMessage('OPA eval executed and report generated.');
    });
}

// Generate report content
function generateReport(evalCommand, evalOutput) {
    return `
        OPA Evaluation Report
        =====================

        Command Executed: ${evalCommand}
        Output:
        ${evalOutput}
    `;
}

// Save the generated report as a PDF
function saveReport(content) {
    const pdfFilePath = path.join(reportDirectory, 'opa_eval_report.pdf');
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfFilePath);

    doc.pipe(writeStream);
    doc.fontSize(18).text('OPA Evaluation Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(content);
    doc.end();

    writeStream.on('finish', () => {
        vscode.window.showInformationMessage(`Report generated: ${pdfFilePath}`);
    });
}

module.exports = {
    saveVersionWithLog,
    listSavedVersions,
    performOpaEval
};
