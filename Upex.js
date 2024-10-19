const vscode = require('vscode');
const commands = require('./commands'); // Import the commands from commands.js

function activate(context) {
    console.log('OPA Policy Management Extension is now active!');

    // Command to save the version of the file
    let saveVersionCommand = vscode.commands.registerCommand('extension.saveVersion', async () => {
        await commands.saveVersionWithLog();
    });

    // Command to list saved versions
    let listVersionsCommand = vscode.commands.registerCommand('extension.listVersions', async () => {
        await commands.listSavedVersions();
    });

    // Command to generate compliance report
    let generateReportCommand = vscode.commands.registerCommand('extension.generateComplianceReport', async () => {
        await commands.generateComplianceReport();
    });

    // Add commands to the context
    context.subscriptions.push(saveVersionCommand);
    context.subscriptions.push(listVersionsCommand);
    context.subscriptions.push(generateReportCommand);
}

// This method is called when your extension is deactivated
function deactivate() {
    console.log('OPA Policy Management Extension is now deactivated.');
}

module.exports = {
    activate,
    deactivate
};
