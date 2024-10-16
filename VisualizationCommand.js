const vscode = require('vscode');
const VisualizationService = require('../services/VisualizationService');

function visualizePolicies(context) {
    const disposable = vscode.commands.registerCommand('policyPilot.visualizePolicies', async function () {
        const policies = await VisualizationService.getPolicies();
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

module.exports = {
    visualizePolicies
};
