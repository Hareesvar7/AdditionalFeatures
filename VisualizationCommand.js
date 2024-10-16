// src/commands/VisualizationCommand.js

const vscode = require('vscode');
const VisualizationService = require('../services/VisualizationService');

async function visualizePolicies(context) {
    const disposable = vscode.commands.registerCommand('extension.visualizePolicies', async function () {
        // Prompt user to select a .rego file
        const fileUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            filters: {
                'Rego Files': ['rego']
            }
        });

        if (!fileUri || fileUri.length === 0) {
            vscode.window.showErrorMessage('No file selected.');
            return;
        }

        const policies = await VisualizationService.getPolicies(fileUri[0].fsPath);
        if (!policies) {
            vscode.window.showErrorMessage('No policies found to visualize.');
            return;
        }

        // Open Webview for visualization
        const panel = vscode.window.createWebviewPanel(
            'policyVisualization',
            'Policy Visualization',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        // Set the HTML content for the webview
        panel.webview.html = VisualizationService.getVisualizationHTML(policies);
    });

    context.subscriptions.push(disposable);
}

module.exports = visualizePolicies;
