// src/commands/VisualizationCommand.js

const vscode = require('vscode');
const VisualizationService = require('../services/VisualizationService');

async function visualizePolicies(context) {
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

    const policyData = await VisualizationService.getPolicies(fileUri[0].fsPath);
    if (!policyData || policyData.length === 0) {
        vscode.window.showErrorMessage('No policies found to visualize.');
        return;
    }

    const panel = vscode.window.createWebviewPanel(
        'policyVisualization',
        'Policy Visualization',
        vscode.ViewColumn.One,
        {
            enableScripts: true
        }
    );

    panel.webview.html = VisualizationService.getVisualizationHTML(policyData);
}

module.exports = visualizePolicies;
