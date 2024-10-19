const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Function to log audit data
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
        }
    });
}

// Function to save version of the current file
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
    await logAuditData('Save File Version', logDetails);

    vscode.window.showInformationMessage(`File version saved: ${versionFilePath}`);
}

// Function to list saved versions of the current file
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

    const files = fs.readdirSync(versionDirectory).filter(file => file === fileName);
    if (files.length === 0) {
        vscode.window.showInformationMessage('No versions saved for this file yet.');
    } else {
        const fileList = files.join('\n');
        vscode.window.showInformationMessage(`Saved file versions:\n${fileList}`);

        const logDetails = `Listed file versions for: ${fileName}`;
        await logAuditData('List File Versions', logDetails);
    }
}

// Function to generate an audit report in PDF format
async function generateComplianceReport(opaEvalOutput) {
    const reportDirectory = path.join(require('os').homedir(), 'Downloads', 'reports');
    if (!fs.existsSync(reportDirectory)) {
        fs.mkdirSync(reportDirectory, { recursive: true });
    }

    const pdfFilePath = path.join(reportDirectory, 'compliance_report.pdf');
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfFilePath);

    doc.pipe(writeStream);
    doc.fontSize(18).text('OPA Policy Compliance Audit Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    
    // Add dynamic OPA eval output
    doc.text('OPA Evaluation Results:');
    doc.moveDown();
    doc.text(opaEvalOutput);

    doc.end();

    writeStream.on('finish', () => {
        vscode.window.showInformationMessage(`Compliance report generated: ${pdfFilePath}`);
    });
}

// Function to perform OPA eval command and capture output
async function performOpaEval() {
    const terminal = vscode.window.createTerminal("OPA Eval");
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active editor found. Please open a file to evaluate.');
        return;
    }

    const planFilePath = path.join(require('os').homedir(), 'Downloads', 'opaVersion', 'plan.json'); // Example plan.json path
    const policyFilePath = editor.document.uri.fsPath; // Current open file (policy.rego)

    // Run OPA eval command
    terminal.sendText(`opa eval -i ${planFilePath} -d ${policyFilePath} "data"`);

    // Capture terminal output (you would need to listen to the terminal output in a real implementation)
    // Here we simulate that output
    const opaEvalOutput = `Evaluation result for ${policyFilePath}: Success`; // Placeholder for actual evaluation result
    await generateComplianceReport(opaEvalOutput);
}

// Export commands
module.exports = {
    saveVersionWithLog,
    listSavedVersions,
    generateComplianceReport,
    performOpaEval
};
