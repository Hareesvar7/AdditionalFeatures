// src/Extension.js

const vscode = require('vscode');
const { showCloudServiceSelection } = require('./commands/cloudServiceSelection');
const { validateOPA } = require('./commands/Opavalidate');
const { aiAssist } = require('./commands/Aiassist');
const visualizePolicies = require('./commands/VisualizationCommand'); // Adjusted import

function activate(context) {
    console.log('Extension "PolicyPilot" is now active!');

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.showCloudServiceSelection', showCloudServiceSelection)
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.validateOPA', validateOPA)
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.aiAssist', aiAssist)
    );
    context.subscriptions.push(
        visualizePolicies(context) // Pass context to the visualizePolicies command
    );
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
