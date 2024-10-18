const vscode = require('vscode');
const versionPolicy = require('./commands/PolicyVersioningCommand');

function activate(context) {
    // Register the command for versioning policies
    const versionPolicyCommand = vscode.commands.registerCommand('your-extension.versionPolicy', () => {
        versionPolicy(context);
    });

    context.subscriptions.push(versionPolicyCommand);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
