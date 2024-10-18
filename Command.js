const vscode = require('vscode');
const ComplianceReportService = require('../services/ComplianceReportService');
const path = require('path');

module.exports = function generateComplianceReport() {
    return vscode.commands.registerCommand('extension.generateComplianceReport', async function () {
        const planJsonUri = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectMany: false,
            filters: { 'JSON Files': ['json'] }
        });

        if (!planJsonUri) {
            vscode.window.showErrorMessage('Plan.json not selected!');
            return;
        }

        const policyRegoUri = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectMany: false,
            filters: { 'Rego Files': ['rego'] }
        });

        if (!policyRegoUri) {
            vscode.window.showErrorMessage('Policy.rego not selected!');
            return;
        }

        // Generate PDF Report
        const reportPath = await ComplianceReportService.generateReport(planJsonUri[0].fsPath, policyRegoUri[0].fsPath);

        if (reportPath) {
            vscode.window.showInformationMessage(`Compliance report generated at: ${reportPath}`);
            vscode.env.openExternal(vscode.Uri.file(reportPath)); // Open the PDF file
        } else {
            vscode.window.showErrorMessage('Failed to generate compliance report.');
        }
    });
};
