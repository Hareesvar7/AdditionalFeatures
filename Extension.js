const vscode = require('vscode');
const LintPolicy = require('./commands/LintPolicy');

function activate(context) {
    // Register the lint policy command
    context.subscriptions.push(vscode.commands.registerCommand('extension.lintPolicy', async () => {
        const fileUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            filters: {
                'Rego Files': ['rego']
            }
        });

        if (fileUri && fileUri[0]) {
            await LintPolicy.execute(fileUri[0].fsPath);
        }
    }));
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
