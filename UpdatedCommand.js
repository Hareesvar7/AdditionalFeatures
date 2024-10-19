const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

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

// Command to generate a compliance report in PDF format
async function generateComplianceReport() {
    // Sample data for demonstration purposes
    const evaluatedResources = [
        { name: "my-bucket", type: "AWS S3 Bucket", compliant: false },
        { name: "my-iam-policy", type: "AWS IAM Policy", compliant: true },
        { name: "my-security-group", type: "AWS Security Group", compliant: false },
    ];

    const policyViolations = [
        {
            policy: "aws.s3.enforce-vpc-access",
            description: "S3 Access Point 'example-s3-access-point' not configured in a VPC.",
            recommendation: "Ensure all S3 Access Points have a valid VPC configuration.",
        },
        {
            policy: "aws.security-group.restrict-ssh",
            description: "SSH access is open to all IP addresses.",
            recommendation: "Restrict SSH access to trusted IP addresses.",
        },
    ];

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

    // Resource Overview
    doc.text('Resource Overview', { underline: true });
    evaluatedResources.forEach(resource => {
        doc.text(`- ${resource.type}: ${resource.name} - ${resource.compliant ? 'Compliant' : 'Non-Compliant'}`);
    });
    doc.moveDown();

    // Policy Violations
    doc.text('Policy Violations', { underline: true });
    policyViolations.forEach(violation => {
        doc.text(`Policy: ${violation.policy}`);
        doc.text(`Description: ${violation.description}`);
        doc.text(`Recommendation: ${violation.recommendation}`);
        doc.moveDown();
    });

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
