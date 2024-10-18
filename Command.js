const vscode = require('vscode');
const PolicyVersioningService = require('../services/PolicyVersioningService');

async function versionPolicy(context) {
    // Prompt user to select a .rego file
    const fileUri = await vscode.window.showOpenDialog({
        canSelectMany: false,
        filters: {
            'Rego Files': ['rego']
        }
    });

    if (!fileUri || fileUri.length === 0) {
        vscode.window.showErrorMessage('No file selected.');
        return;
    }

    const policyPath = fileUri[0].fsPath;

    // Call the versioning service to save the policy
    const result = await PolicyVersioningService.savePolicyVersion(policyPath);
    if (result) {
        vscode.window.showInformationMessage(`Policy version saved: ${result}`);
    } else {
        vscode.window.showErrorMessage('Failed to save policy version.');
    }
}

module.exports = versionPolicy;
