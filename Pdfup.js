const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer'); // For generating PDF reports from HTML

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
        return;
    }

    // Show the list in a QuickPick
    const quickPickItems = files.map(file => ({
        label: file,
        description: 'Click to open version',
        filePath: path.join(versionDirectory, file)
    }));

    const selected = await vscode.window.showQuickPick(quickPickItems, {
        placeHolder: 'Select a version to open',
    });

    if (selected) {
        const uri = vscode.Uri.file(selected.filePath);
        const doc = await vscode.workspace.openTextDocument(uri);
        vscode.window.showTextDocument(doc);
    }
}

// Perform OPA evaluation dynamically
async function performOpaEval() {
    const evalCommand = await vscode.window.showInputBox({
        prompt: 'Enter the OPA eval command (e.g., opa eval -i plan.json -d policy.rego "data")'
    });

    if (!evalCommand) {
        vscode.window.showErrorMessage('No command entered.');
        return;
    }

    const exec = require('child_process').exec;
    exec(evalCommand, async (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`Error executing OPA eval: ${stderr}`);
            return;
        }

        const policies = await extractPoliciesFromRego('policy.rego'); // Adjust the path as needed
        const reportContent = generateReport(evalCommand, stdout, policies);
        await saveReport(reportContent); // Save the report as PDF

        vscode.window.showInformationMessage('OPA eval executed and report generated.');
    });
}

// Extract evaluated policies from the .rego file
async function extractPoliciesFromRego(filePath) {
    const policies = [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const regex = /(?<=rule\s)(\w+)/g; // Regex to match rules in the .rego file

    let match;
    while ((match = regex.exec(content)) !== null) {
        // Mocking the evaluation results for demonstration
        // Here you could integrate actual evaluation results if available
        const isSuccess = Math.random() > 0.5; // Simulated success/failure
        policies.push({ name: match[0], status: isSuccess ? 'Success' : 'Failure' });
    }

    return policies;
}

// Generate report content in HTML format
function generateReport(evalCommand, evalOutput, policies) {
    let policiesEvaluated = '';

    policies.forEach(policy => {
        const statusColor = policy.status === 'Success' ? 'green' : 'red';
        policiesEvaluated += `<tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">${policy.name}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: left; color: ${statusColor};">${policy.status}</td>
        </tr>`; // Create rows for each policy
    });

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OPA Evaluation Report</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; background-color: #f9f9f9; }
            h1 { text-align: center; color: #333; }
            h2 { color: #555; }
            p { font-size: 14px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #4CAF50; color: white; padding: 10px; }
            td { padding: 10px; border: 1px solid #ddd; text-align: left; }
            th, td { transition: background-color 0.3s; }
            tr:hover { background-color: #f1f1f1; }
        </style>
    </head>
    <body>
        <h1>OPA Evaluation Report</h1>
        <h2>Command Executed:</h2>
        <p>${evalCommand}</p>
        <h2>Output:</h2>
        <pre style="background-color: #fff; padding: 10px; border: 1px solid #ddd;">${evalOutput}</pre>
        <h2>Policies Evaluated:</h2>
        <table>
            <thead>
                <tr>
                    <th style="text-align: left;">Policy Name</th>
                    <th style="text-align: left;">Status</th>
                </tr>
            </thead>
            <tbody>
                ${policiesEvaluated}
            </tbody>
        </table>
    </body>
    </html>
    `;
}

// Save the generated report as a PDF
async function saveReport(htmlContent) {
    const pdfFilePath = path.join(reportDirectory, 'opa_eval_report.pdf');

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' }); // Ensure the content is fully loaded

        await page.pdf({
            path: pdfFilePath,
            format: 'A4',
            printBackground: true,
        });

        await browser.close();
        vscode.window.showInformationMessage(`PDF report generated: ${pdfFilePath}`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        vscode.window.showErrorMessage(`Failed to generate PDF report: ${error.message}`);
    }
}

module.exports = {
    saveVersionWithLog,
    listSavedVersions,
    performOpaEval
};
