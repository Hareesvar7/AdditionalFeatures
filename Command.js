const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const policyDir = path.join(require('os').homedir(), 'Downloads', 'opaVersion');

// Ensure the policyDir exists or create it if not exists
if (!fs.existsSync(policyDir)) {
    fs.mkdirSync(policyDir, { recursive: true });
}

// Save the version of the .rego file
function savePolicyVersion() {
    const options = {
        canSelectMany: false,
        openLabel: 'Select a .rego file to version',
        filters: {
            'Rego Files': ['rego']
        }
    };

    vscode.window.showOpenDialog(options).then(fileUri => {
        if (fileUri && fileUri[0]) {
            const filePath = fileUri[0].fsPath;
            const fileName = path.basename(filePath);
            const versionedFileName = `${fileName.replace('.rego', '')}_v${Date.now()}.rego`;
            const targetPath = path.join(policyDir, versionedFileName);

            // Copy the .rego file into opaVersion directory with version info
            fs.copyFile(filePath, targetPath, err => {
                if (err) {
                    vscode.window.showErrorMessage(`Error saving version: ${err.message}`);
                } else {
                    vscode.window.showInformationMessage(`Policy version saved as ${versionedFileName}`);
                }
            });
        }
    });
}

// List all saved versions in the opaVersion directory
function listPolicyVersions() {
    fs.readdir(policyDir, (err, files) => {
        if (err) {
            vscode.window.showErrorMessage(`Error listing versions: ${err.message}`);
            return;
        }

        if (files.length === 0) {
            vscode.window.showInformationMessage('No saved policy versions found.');
        } else {
            const regoFiles = files.filter(file => file.endsWith('.rego'));
            vscode.window.showQuickPick(regoFiles, {
                placeHolder: 'Select a policy version to view'
            }).then(selectedFile => {
                if (selectedFile) {
                    const filePath = path.join(policyDir, selectedFile);
                    vscode.workspace.openTextDocument(filePath).then(doc => {
                        vscode.window.showTextDocument(doc);
                    });
                }
            });
        }
    });
}

module.exports = {
    savePolicyVersion,
    listPolicyVersions
};
