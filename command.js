const vscode = require('vscode');
const ConversionService = require('../services/ConversionService');

async function convertPolicy(context) {
    const panel = vscode.window.createWebviewPanel(
        'policyConversion',
        'Convert Policy',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    panel.webview.html = getWebviewContent();

    panel.webview.onDidReceiveMessage(async (message) => {
        if (message.command === 'convertPolicy') {
            const { fileContent, format } = message;
            const result = await ConversionService.convertPolicy(fileContent, format);

            if (result.success) {
                panel.webview.postMessage({ command: 'displayOutput', content: result.data });
            } else {
                vscode.window.showErrorMessage('Conversion failed: ' + result.error);
            }
        }
    });
}

function getWebviewContent() {
    return `
        <html>
        <body>
            <h1>Convert Rego Policy</h1>
            <input type="file" id="fileInput">
            <select id="format">
                <option value="json">JSON</option>
                <option value="yaml">YAML</option>
            </select>
            <button onclick="convert()">Convert</button>
            <textarea id="outputBox" rows="20" cols="80"></textarea>
            <button onclick="copyToClipboard()">Copy to Clipboard</button>
            <script>
                const vscode = acquireVsCodeApi();

                function convert() {
                    const file = document.getElementById('fileInput').files[0];
                    const format = document.getElementById('format').value;
                    if (!file) {
                        vscode.postMessage({ command: 'error', text: 'No file selected' });
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = function() {
                        vscode.postMessage({
                            command: 'convertPolicy',
                            fileContent: reader.result,
                            format: format
                        });
                    };
                    reader.readAsText(file);
                }

                window.addEventListener('message', (event) => {
                    const message = event.data;
                    if (message.command === 'displayOutput') {
                        document.getElementById('outputBox').value = message.content;
                    }
                });

                function copyToClipboard() {
                    const outputBox = document.getElementById('outputBox');
                    outputBox.select();
                    document.execCommand('copy');
                    vscode.postMessage({ command: 'copySuccess' });
                }
            </script>
        </body>
        </html>
    `;
}

module.exports = convertPolicy;
