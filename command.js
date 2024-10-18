// src/commands/ConverterCommand.js

const vscode = require('vscode');
const ConverterService = require('../services/ConverterService');

async function openConverterWebview(context) {
    const panel = vscode.window.createWebviewPanel(
        'policyConverter',
        'Policy Converter',
        vscode.ViewColumn.One,
        {
            enableScripts: true
        }
    );

    // Set the HTML content for the webview
    panel.webview.html = getWebviewContent();

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(async (message) => {
        switch (message.command) {
            case 'convertPolicy':
                const convertedPolicy = ConverterService.convertPolicy(message.policyContent, message.outputFormat);
                panel.webview.postMessage({ command: 'setConvertedPolicy', policyContent: convertedPolicy });
                break;
        }
    });
}

// Generate the HTML for the webview
function getWebviewContent() {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Policy Converter</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                #convertedPolicy { margin-top: 20px; white-space: pre; }
            </style>
        </head>
        <body>
            <h1>Convert Policy</h1>
            <textarea id="policyInput" rows="10" cols="50" placeholder="Enter Rego policy here..."></textarea><br>
            <label><input type="radio" name="format" value="json" checked> JSON</label>
            <label><input type="radio" name="format" value="yaml"> YAML</label><br>
            <button onclick="convertPolicy()">Convert</button>
            <h2>Converted Policy</h2>
            <div id="convertedPolicy"></div>

            <script>
                const vscode = acquireVsCodeApi();
                function convertPolicy() {
                    const policyContent = document.getElementById('policyInput').value;
                    const outputFormat = document.querySelector('input[name="format"]:checked').value;
                    
                    // Send a message to the extension to convert the policy
                    vscode.postMessage({
                        command: 'convertPolicy',
                        policyContent: policyContent,
                        outputFormat: outputFormat
                    });
                }

                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.command) {
                        case 'setConvertedPolicy':
                            document.getElementById('convertedPolicy').textContent = message.policyContent;
                            break;
                    }
                });
            </script>
        </body>
        </html>
    `;
}

module.exports = openConverterWebview;
