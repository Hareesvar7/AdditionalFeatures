// src/Extension.js

const vscode = require('vscode');
const { showCloudServiceSelection } = require('./commands/cloudServiceSelection');
const { validateOPA } = require('./commands/Opavalidate');
const { aiAssist } = require('./commands/Aiassist');
const visualizePolicies = require('./commands/VisualizationCommand');

function activate(context) {
    console.log('Extension "PolicyPilot" is now active!');

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.showCloudServiceSelection', showCloudServiceSelection),
        vscode.commands.registerCommand('extension.validateOPA', validateOPA),
        vscode.commands.registerCommand('extension.aiAssist', aiAssist),
        vscode.commands.registerCommand('extension.visualizePolicies', visualizePolicies)
    );
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
