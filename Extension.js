// src/Extension.js

const vscode = require('vscode');
const registerAutoCompletion = require('./commands/AutoCompleteCommand');

function activate(context) {
    // Register the auto-completion command for AWS S3 Rego policies
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.autoCompleteS3Policies', async () => {
            // Open a new document with a Rego file extension
            const newDocument = await vscode.workspace.openTextDocument({ language: 'rego' });
            await vscode.window.showTextDocument(newDocument);

            // Automatically suggest the package when the document is opened
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                editor.edit(editBuilder => {
                    editBuilder.insert(new vscode.Position(0, 0), 'package aws.s3.policies\n');
                });
            }
        })
    );

    // Register auto-completion feature
    registerAutoCompletion(context);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
