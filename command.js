const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const ConverterService = require('../services/ConverterService');

// Function to open the converter webview
async function openConverterWebview(context) {
    const panel = vscode.window.createWebviewPanel(
        'policyConverter',
        'Rego Policy Converter',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
        }
    );

    // Get the path to the HTML file
    const filePath = path.join(context.extensionPath, 'media', 'converterWebview.html');

    // Read the HTML file and set it as the webview content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    panel.webview.html = fileContent;

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(async (message) => {
        switch (message.command) {
            case 'convertPolicy':
                const convertedPolicy = await ConverterService.convertPolicy(message.policyContent, message.outputFormat);
                panel.webview.postMessage({ command: 'setConvertedPolicy', policyContent: convertedPolicy });
                break;
        }
    });
}

module.exports = openConverterWebview;
