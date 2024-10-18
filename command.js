// src/commands/ConvertPolicyCommand.js

const vscode = require('vscode');
const ConvertPolicyService = require('../services/ConvertPolicyService');
const fs = require('fs');
const path = require('path');

async function convertPolicy(context) {
    const panel = vscode.window.createWebviewPanel(
        'policyConversion',
        'Policy Conversion',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    panel.webview.html = getWebviewContent();

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
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    padding: 20px;
                    background-color: #f5f5f5;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    font-size: 24px;
                    color: #333;
                }
                input[type="text"], select {
                    width: 100%;
                    padding: 10px;
                    margin: 10px 0;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                button {
                    background-color: #007acc;
                    color: white;
                    border: none;
                    padding: 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                }
                button:hover {
                    background-color: #005f99;
                }
                pre {
                    background-color: #eaeaea;
                    padding: 10px;
                    border-radius: 4px;
                    overflow-x: auto;
                    white-space: pre-wrap; /* Wrap text */
                    word-wrap: break-word; /* Break long words */
                }
            </style>
        </head>
        <body>
            <h1>Convert Rego Policy</h1>
            <label for="fileInput">Upload Rego File:</label>
            <input type="file" id="fileInput" accept=".rego" />
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
                    const fileInput = document.getElementById('fileInput');
                    const format = document.getElementById('format').value;

                    if (fileInput.files.length === 0) {
                        alert('Please select a file to upload.');
                        return;
                    }

                    const file = fileInput.files[0];
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        const filePath = e.target.result;
                        vscode.postMessage({ command: 'convert', filePath, format });
                    };
                    
                    reader.readAsText(file);
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
