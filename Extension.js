const vscode = require('vscode');
const policyVersionCommand = require('./commands/PolicyVersionCommand');

function activate(context) {
    // Register the policy version command
    let disposable = vscode.commands.registerCommand('extension.policyVersion', policyVersionCommand);
    context.subscriptions.push(disposable);

    // Other existing commands can be registered here
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
