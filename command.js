// src/commands/ConvertPolicyCommand.js

const vscode = require('vscode');
const ConvertPolicyService = require('../services/ConvertPolicyService');

async function convertPolicy(context) {
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

    const formatChoice = await vscode.window.showQuickPick(['JSON', 'YAML'], {
        placeHolder: 'Select format for conversion'
    });

    if (!formatChoice) {
        vscode.window.showErrorMessage('No format selected.');
        return;
    }

    const convertedPolicy = await ConvertPolicyService.convertPolicy(fileUri[0].fsPath, formatChoice);
    
    if (convertedPolicy) {
        const panel = vscode.window.createWebviewPanel(
            'policyConversion',
            'Policy Conversion',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = `
            <html>
            <body>
                <h1>Converted Policy</h1>
                <pre>${convertedPolicy}</pre>
                <button onclick="copyToClipboard()">Copy to Clipboard</button>
                <script>
                    function copyToClipboard() {
                        navigator.clipboard.writeText(\`${convertedPolicy}\`).then(() => {
                            alert('Copied to clipboard');
                        });
                    }
                </script>
            </body>
            </html>
        `;
    } else {
        vscode.window.showErrorMessage('Conversion failed.');
    }
}

module.exports = convertPolicy;
