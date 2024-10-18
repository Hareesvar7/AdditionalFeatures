const vscode = require('vscode');
const VersioningCommand = require('./versioningCommand');

function activate(context) {
    const versioningCommand = new VersioningCommand(context);

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.savePolicyVersion', () => versioningCommand.saveVersion()),
        vscode.commands.registerCommand('extension.listPolicyVersions', () => versioningCommand.listVersions())
    );
}

exports.activate = activate;
