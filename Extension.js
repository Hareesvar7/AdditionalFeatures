const vscode = require('vscode');
const {
    saveVersionWithLog,
    listSavedVersions,
    performOpaEval
} = require('./commands');

// This method is called when your extension is activated
function activate(context) {
    const saveVersionCommand = vscode.commands.registerCommand('opaPolicyExtension.saveVersion', saveVersionWithLog);
    const listVersionsCommand = vscode.commands.registerCommand('opaPolicyExtension.listVersions', listSavedVersions);
    const performEvalCommand = vscode.commands.registerCommand('opaPolicyExtension.performOpaEval', performOpaEval);

    context.subscriptions.push(saveVersionCommand);
    context.subscriptions.push(listVersionsCommand);
    context.subscriptions.push(performEvalCommand);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
};
