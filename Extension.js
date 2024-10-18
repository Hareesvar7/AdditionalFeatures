const vscode = require('vscode');
const { savePolicyVersion, listPolicyVersions } = require('./commands');

function activate(context) {
    console.log('Policy versioning extension is now active!');

    // Register the savePolicyVersion command
    let saveCommand = vscode.commands.registerCommand('extension.savePolicyVersion', () => {
        savePolicyVersion();
    });

    // Register the listPolicyVersions command
    let listCommand = vscode.commands.registerCommand('extension.listPolicyVersions', () => {
        listPolicyVersions();
    });

    context.subscriptions.push(saveCommand);
    context.subscriptions.push(listCommand);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
