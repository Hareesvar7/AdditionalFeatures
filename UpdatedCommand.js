const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { exec } = require('child_process'); // Import exec for running shell commands

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
    await logAuditData('Save File Version', logDetails);

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

        // Optionally allow opening files
        files.forEach((file) => {
            const filePath = path.join(versionDirectory, file);
            vscode.workspace.openTextDocument(filePath).then((doc) => {
                vscode.window.showTextDocument(doc);
            });
        });

        const logDetails = `Listed file versions from: ${versionDirectory}`;
        await logAuditData('List File Versions', logDetails);
    }
}

// Function to run OPA eval command and get the output
function runOpaEval(planFile, policyFile) {
    return new Promise((resolve, reject) => {
        const command = `opa eval -i ${planFile} -d ${policyFile} "data"`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${stderr}`);
            } else {
                resolve(stdout);
            }
        });
    });
}

// Command to generate a compliance report in PDF format
async function generateComplianceReport() {
    // Get the path to the plan.json and policy.rego files (assuming they are in the workspace)
    const planFile = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, 'plan.json');
    const policyFile = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, 'policy.rego');

    // Run OPA eval and capture the output
    let evalOutput;
    try {
        evalOutput = await runOpaEval(planFile, policyFile);
    } catch (err) {
        vscode.window.showErrorMessage(`Failed to run OPA eval: ${err}`);
        return;
    }

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

    // Executive Summary
    doc.text('Executive Summary', { underline: true });
    doc.moveDown();
    doc.text('This report presents the evaluation results of converted Rego policies against defined policies using Open Policy Agent (OPA).');
    doc.moveDown();

    // OPA Eval Output
    doc.text('OPA Evaluation Output', { underline: true });
    doc.moveDown();
    doc.text(evalOutput);
    doc.moveDown();

    // Resource Overview (Dummy data for now)
    doc.text('Resource Overview', { underline: true });
    doc.text('- Resource A: Compliant');
    doc.text('- Resource B: Non-Compliant');
    doc.moveDown();

    // Policy Violations (Dummy data for now)
    doc.text('Policy Violations', { underline: true });
    doc.text('Policy: example.policy');
    doc.text('Description: Example violation');
    doc.text('Recommendation: Update policy.');
    
    // Conclusion
    doc.text('Conclusion', { underline: true });
    doc.text('This audit has identified non-compliance in certain resources. Please refer to the recommendations provided.');

    doc.end();

    writeStream.on('finish', () => {
        vscode.window.showInformationMessage(`Compliance report generated: ${pdfFilePath}`);
        logAuditData('Generate Compliance Report', `Report saved to: ${pdfFilePath}`);
    });
}

module.exports = {
    saveVersionWithLog,
    listSavedVersions,
    generateComplianceReport
};
