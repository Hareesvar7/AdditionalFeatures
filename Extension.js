const vscode = require('vscode');
const { saveVersionWithLog, listSavedVersions, generateAuditReport } = require('./command');

function activate(context) {
    console.log('Audit log extension with report generation is now active.');

    let saveVersionCommand = vscode.commands.registerCommand('extension.saveVersion', () => {
        saveVersionWithLog();
    });

    let listVersionsCommand = vscode.commands.registerCommand('extension.listVersions', () => {
        listSavedVersions();
    });

    let generateReportCommand = vscode.commands.registerCommand('extension.generateReport', () => {
        generateAuditReport();
    });

    context.subscriptions.push(saveVersionCommand);
    context.subscriptions.push(listVersionsCommand);
    context.subscriptions.push(generateReportCommand);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
