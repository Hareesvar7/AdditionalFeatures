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
            retainContextWhenHidden: true // Keep the context when the panel is hidden
        }
    );

    // Set the HTML content for the webview with a file upload option
    panel.webview.html = VisualizationService.getUploadHTML();

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(async (message) => {
        switch (message.command) {
            case 'upload':
                const policies = await VisualizationService.getPolicies(message.filePath);
                if (policies) {
                    panel.webview.postMessage({ command: 'visualize', data: policies });
                } else {
                    panel.webview.postMessage({ command: 'error', text: 'No policies found to visualize.' });
                }
                break;
        }
    });
}

module.exports = visualizePolicies;
