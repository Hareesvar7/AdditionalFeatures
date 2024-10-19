const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit'); // For generating PDF reports

// Other existing code...

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
    exec(evalCommand, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`Error executing OPA eval: ${stderr}`);
            return;
        }

        const policies = extractPoliciesFromRego('policy.rego'); // Replace with your actual file path
        const reportContent = generateReport(evalCommand, stdout, policies);
        saveReport(reportContent);

        vscode.window.showInformationMessage('OPA eval executed and report generated.');
    });
}

// Extract policies from the Rego file (dummy implementation)
function extractPoliciesFromRego(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const regex = /(?<=rule\s)(\w+)/g; // Match rules in the .rego file
    let match;
    const policies = [];

    while ((match = regex.exec(content)) !== null) {
        const isSuccess = Math.random() > 0.5; // Simulated success/failure
        policies.push({ name: match[0], status: isSuccess ? 'Success' : 'Failure' });
    }

    return policies;
}

// Generate report content
function generateReport(evalCommand, evalOutput, policies) {
    const succeeded = policies.filter(policy => policy.status === 'Success');
    const notSucceeded = policies.filter(policy => policy.status === 'Failure');

    let executedPolicies = policies.map(policy => policy.name).join(', ') || 'No policies executed';

    return {
        command: evalCommand,
        output: evalOutput,
        executedPolicies,
        succeeded,
        notSucceeded,
    };
}

// Save the generated report as a PDF
function saveReport(reportData) {
    const pdfFilePath = path.join(reportDirectory, 'opa_eval_report.pdf');
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfFilePath);

    doc.pipe(writeStream);
    doc.fontSize(18).text('OPA Evaluation Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(`Command Executed: ${reportData.command}`);
    doc.moveDown();
    doc.fontSize(12).text('Output:');
    doc.moveDown();
    doc.fontSize(10).text(reportData.output);
    doc.moveDown();

    // Policies Executed
    doc.fontSize(14).text('Policies Executed:', { underline: true });
    doc.fontSize(12).text(reportData.executedPolicies);
    doc.moveDown();

    // Policies Succeeded
    doc.fontSize(14).text('Policies Succeeded:', { underline: true });
    if (reportData.succeeded.length > 0) {
        reportData.succeeded.forEach(policy => {
            doc.fontSize(12).text(`- ${policy.name}`);
        });
    } else {
        doc.fontSize(12).text('None');
    }
    doc.moveDown();

    // Policies Not Succeeded
    doc.fontSize(14).text('Policies Not Succeeded:', { underline: true });
    if (reportData.notSucceeded.length > 0) {
        reportData.notSucceeded.forEach(policy => {
            doc.fontSize(12).text(`- ${policy.name}`);
        });
    } else {
        doc.fontSize(12).text('None');
    }

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
