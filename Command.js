const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

// Define the directory to save policy versions
const policyDir = '/path/to/your/directory'; // Update this to your desired path

const policyVersionCommand = async () => {
    const action = await vscode.window.showQuickPick(['Save Policy Version', 'List Policy Versions'], {
        placeHolder: 'Choose an action',
    });

    if (action === 'Save Policy Version') {
        // Prompt user to select a .rego file
        const fileUri = await vscode.window.showOpenDialog({
            filters: {
                'Rego Files': ['rego'],
            },
            canSelectMany: false,
        });

        if (fileUri && fileUri[0]) {
            const originalFilePath = fileUri[0].fsPath;
            const fileName = path.basename(originalFilePath, '.rego');
            
            // Create versioned file name with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const versionedFileName = `${fileName}_v${timestamp}.rego`;
            const versionedFilePath = path.join(policyDir, versionedFileName);
            
            // Read the original file content
            try {
                const content = fs.readFileSync(originalFilePath, 'utf-8');
                // Save the content to the new versioned file
                fs.writeFileSync(versionedFilePath, content);
                vscode.window.showInformationMessage(`Policy version saved as: ${versionedFileName}`);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to save policy version: ${error.message}`);
            }
        }
    } else if (action === 'List Policy Versions') {
        try {
            // Read files in the specified directory
            const files = fs.readdirSync(policyDir);
            const versions = files.filter(file => file.endsWith('.rego') && file.includes('_v'));

            if (versions.length === 0) {
                vscode.window.showInformationMessage('No policy versions found.');
                return;
            }

            // Show the list of versions
            const selectedVersion = await vscode.window.showQuickPick(versions, {
                placeHolder: 'Select a policy version to open',
            });

            if (selectedVersion) {
                const selectedFilePath = path.join(policyDir, selectedVersion);
                const content = fs.readFileSync(selectedFilePath, 'utf-8');
                vscode.window.showInformationMessage(`Contents of ${selectedVersion}:\n${content}`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to list policy versions: ${error.message}`);
        }
    }
};

module.exports = policyVersionCommand;
