const vscode = require('vscode');
const versionPolicy = require('./commands/PolicyVersioningCommand');

function activate(context) {
    // Register the version policy command
    let disposable = vscode.commands.registerCommand('extension.versionPolicy', versionPolicy);
    context.subscriptions.push(disposable);

    // Other existing commands can be registered here
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
