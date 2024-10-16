// src/Extension.js

const vscode = require('vscode');
const { showCloudServiceSelection } = require('./commands/cloudServiceSelection');
const { validateOPA } = require('./commands/Opavalidate');
const { aiAssist } = require('./commands/Aiassist');
const visualizePolicies = require('./commands/VisualizationCommand'); // Import visualization command

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
        vscode.commands.registerCommand('extension.visualizePolicies', () => visualizePolicies(context)) // Call the visualization command
    );
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
