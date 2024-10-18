const vscode = require('vscode');
const openConverterWebview = require('./commands/ConverterCommand');

function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.openConverterWebview', () => openConverterWebview(context))
    );
}

exports.activate = activate;

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
