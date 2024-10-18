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

    // Set the HTML content for the webview
    panel.webview.html = VisualizationService.getVisualizationHTML();
}

module.exports = visualizePolicies;
