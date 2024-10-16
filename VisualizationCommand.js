// src/commands/VisualizationCommand.js

const vscode = require('vscode');
const VisualizationService = require('../services/VisualizationService');

module.exports = async function visualizePolicies(context) {
    const disposable = vscode.commands.registerCommand('extension.visualizePolicies', async function () {
        // Prompt user to select a .rego file
        const regoFileUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            filters: {
                'Rego Files': ['rego']
            }
        });

        if (!regoFileUri || regoFileUri.length === 0) {
            vscode.window.showErrorMessage('No file selected');
            return;
        }

        const regoFilePath = regoFileUri[0].fsPath;

        try {
            const policies = await VisualizationService.getPoliciesFromFile(regoFilePath);
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
        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error.message}`);
        }
    });

    context.subscriptions.push(disposable);
};
