const vscode = require('vscode');
const ConversionService = require('../services/ConversionService');
const fs = require('fs');

async function convertPolicy(context) {
    // Create a webview panel
    const panel = vscode.window.createWebviewPanel(
        'policyConversion',
        'Rego Policy Conversion',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    panel.webview.html = getWebviewContent();

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(async (message) => {
        if (message.command === 'uploadFile') {
            const regoContent = fs.readFileSync(message.filePath, 'utf8');

            // Convert based on user choice
            let convertedContent;
            if (message.format === 'json') {
                convertedContent = ConversionService.convertToJSON(regoContent);
            } else {
                convertedContent = ConversionService.convertToYAML(regoContent);
            }

            if (convertedContent) {
                panel.webview.postMessage({ command: 'displayConverted', content: convertedContent });
            } else {
                vscode.window.showErrorMessage('Failed to convert policy.');
            }
        }
    });
}

// HTML content for webview
function getWebviewContent() {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Rego Policy Conversion</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 10px;
                    background-color: #f4f4f4;
                }
                .container {
                    margin: 0 auto;
                    max-width: 600px;
                    padding: 20px;
                    background-color: #fff;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                input[type="file"], button {
                    display: block;
                    margin: 10px 0;
                    padding: 10px;
                    font-size: 16px;
                }
                pre {
                    background-color: #f0f0f0;
                    padding: 10px;
                    overflow: auto;
                    white-space: pre-wrap;
                }
                .copy-btn {
                    margin: 10px 0;
                    padding: 10px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Upload Rego Policy</h1>
                <input type="file" id="fileInput">
                <label for="format">Convert to:</label>
                <select id="format">
                    <option value="json">JSON</option>
                    <option value="yaml">YAML</option>
                </select>
                <button onclick="convertPolicy()">Convert</button>
                <pre id="output"></pre>
                <button class="copy-btn" onclick="copyToClipboard()">Copy to Clipboard</button>
            </div>

            <script>
                const vscode = acquireVsCodeApi();

                function convertPolicy() {
                    const fileInput = document.getElementById('fileInput');
                    const format = document.getElementById('format').value;

                    if (fileInput.files.length === 0) {
                        alert('Please upload a file.');
                        return;
                    }

                    const file = fileInput.files[0];
                    vscode.postMessage({ command: 'uploadFile', filePath: file.path, format: format });
                }

                function copyToClipboard() {
                    const output = document.getElementById('output').innerText;
                    navigator.clipboard.writeText(output);
                    alert('Copied to clipboard!');
                }

                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.command === 'displayConverted') {
                        document.getElementById('output').innerText = message.content;
                    }
                });
            </script>
        </body>
        </html>
    `;
}

module.exports = convertPolicy;
