const fs = require('fs');
const path = require('path');

// Save version
async function saveVersionCommand(context, filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const versionDir = path.join(process.env.HOME || process.env.USERPROFILE, 'Downloads', 'opaVersion');

        // Create version directory if it doesn't exist
        if (!fs.existsSync(versionDir)) {
            fs.mkdirSync(versionDir, { recursive: true });
        }

        // Create a unique versioned file name based on timestamp
        const fileName = path.basename(filePath);
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const versionedFile = path.join(versionDir, `${fileName}-${timestamp}.rego`);

        // Write file to the version directory
        fs.writeFileSync(versionedFile, content);
        vscode.window.showInformationMessage(`Saved version: ${versionedFile}`);
    } catch (err) {
        vscode.window.showErrorMessage(`Error saving version: ${err.message}`);
    }
}

// List versions
async function listVersionsCommand() {
    try {
        const versionDir = path.join(process.env.HOME || process.env.USERPROFILE, 'Downloads', 'opaVersion');

        if (!fs.existsSync(versionDir)) {
            vscode.window.showErrorMessage('No versions found.');
            return;
        }

        const files = fs.readdirSync(versionDir);
        if (files.length === 0) {
            vscode.window.showInformationMessage('No versions available.');
        } else {
            vscode.window.showQuickPick(files).then(selected => {
                if (selected) {
                    const filePath = path.join(versionDir, selected);
                    vscode.workspace.openTextDocument(filePath).then(doc => {
                        vscode.window.showTextDocument(doc);
                    });
                }
            });
        }
    } catch (err) {
        vscode.window.showErrorMessage(`Error listing versions: ${err.message}`);
    }
}

module.exports = {
    saveVersionCommand,
    listVersionsCommand
};
