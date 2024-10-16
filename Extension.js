const vscode = require('vscode');
const { showCloudServiceSelection } = require('./commands/cloudServiceSelection');
const { validateOPA } = require('./commands/Opavalidate');
const { aiAssist } = require('./commands/Aiassist');
const { visualizePolicies } = require('./commands/visualizePolicies'); // Ensure this file exists

function activate(context) {
    console.log('Extension "PolicyPilot" is now active!');

    // Register commands
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
        vscode.commands.registerCommand('policyPilot.visualizePolicies', visualizePolicies)
    );
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
