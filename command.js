// src/commands/ConvertPolicyCommand.js

const vscode = require('vscode');
const ConvertPolicyService = require('../services/ConvertPolicyService');

async function convertPolicy(context) {
    // Open a webview for input
    const panel = vscode.window.createWebviewPanel(
        'policyConversion',
        'Policy Conversion',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    panel.webview.html = getWebviewContent();

    // Listen for messages from the webview
    panel.webview.onDidReceiveMessage(async message => {
        switch (message.command) {
            case 'convert':
                const { filePath, format } = message;
                const convertedPolicy = await ConvertPolicyService.convertPolicy(filePath, format);

                if (convertedPolicy) {
                    panel.webview.postMessage({ command: 'showConvertedPolicy', convertedPolicy });
                } else {
                    vscode.window.showErrorMessage('Conversion failed.');
                }
                break;
        }
    });
}

function getWebviewContent() {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Convert Rego Policy</title>
        </head>
        <body>
            <h1>Convert Rego Policy</h1>
            <label for="filePath">Rego File Path:</label>
            <input type="text" id="filePath" placeholder="Enter path to .rego file" />
            <br />
            <label for="format">Select Format:</label>
            <select id="format">
                <option value="JSON">JSON</option>
                <option value="YAML">YAML</option>
            </select>
            <br />
            <button id="convertButton">Convert</button>
            <pre id="output"></pre>
            <script>
                const vscode = acquireVsCodeApi();

                document.getElementById('convertButton').onclick = () => {
                    const filePath = document.getElementById('filePath').value;
                    const format = document.getElementById('format').value;
                    vscode.postMessage({ command: 'convert', filePath, format });
                };

                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.command) {
                        case 'showConvertedPolicy':
                            document.getElementById('output').textContent = message.convertedPolicy;
                            break;
                    }
                });
            </script>
        </body>
        </html>
    `;
}

module.exports = convertPolicy;
