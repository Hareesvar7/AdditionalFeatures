const vscode = require('vscode');
const policyVersionService = require('../services/PolicyVersioningService');

async function versionPolicy(context) {
    // Ask the user to select a .rego file
    const fileUri = await vscode.window.showOpenDialog({
        canSelectMany: false,
        filters: {
            'Rego Files': ['rego'],
        },
    });

    if (fileUri && fileUri[0]) {
        const filePath = fileUri[0].fsPath;

        // Get the current date for versioning
        const date = new Date();
        const timestamp = date.toISOString().replace(/[:.-]/g, '_'); // Formatting timestamp
        const versionedFileName = `policy_version_${timestamp}.rego`;

        // Save the versioned policy
        const success = await policyVersionService.savePolicyVersion(filePath, versionedFileName);

        if (success) {
            vscode.window.showInformationMessage(`Policy version saved as: ${versionedFileName}`);
            listPolicyVersions();
        } else {
            vscode.window.showErrorMessage('Failed to save policy version.');
        }
    } else {
        vscode.window.showErrorMessage('No file selected.');
    }
}

// Function to list all saved policy versions
async function listPolicyVersions() {
    const versions = await policyVersionService.getSavedPolicyVersions();
    if (versions.length > 0) {
        vscode.window.showInformationMessage(`Saved Policy Versions: \n${versions.join('\n')}`);
    } else {
        vscode.window.showInformationMessage('No saved policy versions found.');
    }
}

module.exports = versionPolicy;
