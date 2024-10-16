const vscode = require('vscode');
const { showCloudServiceSelection } = require('./commands/cloudServiceSelection');
const { validateOPA } = require('./commands/Opavalidate');
const { aiAssist } = require('./commands/Aiassist');
const { visualizePolicies } = require('./commands/VisualizationCommand');

function activate(context) {
    console.log('Extension "PolicyPilot" is now active!');

    // Register cloud service selection command
    let cloudServiceSelectionCmd = vscode.commands.registerCommand('policyPilot.showCloudServiceSelection', function () {
        showCloudServiceSelection(context);
    });

    // Register OPA validation command
    let validateOPACmd = vscode.commands.registerCommand('policyPilot.validateOPA', function () {
        validateOPA(context);
    });

    // Register AI Assist command
    let aiAssistCmd = vscode.commands.registerCommand('policyPilot.aiAssist', function () {
        aiAssist(context);
    });

    // Register Policy Visualization command
    let visualizePoliciesCmd = vscode.commands.registerCommand('policyPilot.visualizePolicies', function () {
        visualizePolicies(context);
    });

    // Add all commands to context subscriptions
    context.subscriptions.push(cloudServiceSelectionCmd);
    context.subscriptions.push(validateOPACmd);
    context.subscriptions.push(aiAssistCmd);
    context.subscriptions.push(visualizePoliciesCmd);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
