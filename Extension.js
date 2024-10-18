const vscode = require('vscode');
const { saveVersionCommand, listVersionsCommand } = require('./commands');

function activate(context) {
    // Register the save version command
    let saveVersion = vscode.commands.registerCommand('extension.saveVersion', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const filePath = editor.document.uri.fsPath;
            saveVersionCommand(context, filePath);
        } else {
            vscode.window.showErrorMessage('No active file to version.');
        }
    });

    // Register the list versions command
    let listVersions = vscode.commands.registerCommand('extension.listVersions', () => {
        listVersionsCommand();
    });

    context.subscriptions.push(saveVersion, listVersions);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
