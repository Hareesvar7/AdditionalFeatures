const vscode = require('vscode');
const { showCloudServiceSelection } = require('./commands/cloudServiceSelection');
const { validateOPA } = require('./commands/Opavalidate');
const { aiAssist } = require('./commands/Aiassist');
const { visualizePolicies } = require('./commands/visualization'); // Ensure this file exists

function activate(context) {
    console.log('Extension "PolicyPilot" is now active!');

    // Register commands (ensure unique names)
    context.subscriptions.push(
        vscode.commands.registerCommand('policyPilot.showCloudServiceSelection', showCloudServiceSelection)
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('policyPilot.validateOPA', validateOPA)
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('policyPilot.aiAssist', aiAssist)
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('policyPilot.visualizePolicies', () => visualizePolicies(context)) // Pass context here
    );
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
