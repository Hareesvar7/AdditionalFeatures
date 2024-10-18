// src/commands/VisualizationCommand.js

const vscode = require('vscode');
const VisualizationService = require('../services/VisualizationService');

async function visualizePolicies(context) {
    // Open Webview for visualization
    const panel = vscode.window.createWebviewPanel(
        'policyVisualization',
        'Policy Visualization',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: [] // Add any resources here if needed
        }
    );

    // Set the HTML content for the webview
    panel.webview.html = VisualizationService.getVisualizationHTML();

    // Listen for messages from the webview
    panel.webview.onDidReceiveMessage(async (message) => {
        switch (message.command) {
            case 'uploadFile':
                // Process the uploaded policies
                const policies = await VisualizationService.processPolicies(message.data);
                if (!policies) {
                    vscode.window.showErrorMessage('No policies found to visualize.');
                    return;
                }
                panel.webview.html = VisualizationService.getVisualizationHTML(policies);
                break;
        }
    });
}

module.exports = visualizePolicies;
