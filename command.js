const vscode = require('vscode');
const { convertPolicy } = require('./ConvertPolicy');

async function convertPolicyCommand() {
    const regoFileUri = await vscode.window.showOpenDialog({
        canSelectMany: false,
        filters: {
            'Rego Files': ['rego'],
        }
    });

    if (regoFileUri && regoFileUri[0]) {
        const regoFilePath = regoFileUri[0].fsPath;
        
        // Convert the policy
        const result = await convertPolicy(regoFilePath);
        
        // Handle the conversion result
        if (result.success) {
            const jsonOutput = JSON.stringify(result.data, null, 2);
            showWebview(jsonOutput);
        } else {
            vscode.window.showErrorMessage(result.message);
        }
    }
}

function showWebview(jsonOutput) {
    const panel = vscode.window.createWebviewPanel(
        'convertPolicyOutput',
        'Converted Policy Output',
        vscode.ViewColumn.One,
        {}
    );

    panel.webview.html = getWebviewContent(jsonOutput);
}

function getWebviewContent(jsonOutput) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Converted Policy Output</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
            button { margin-top: 10px; padding: 10px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; }
            button:hover { background-color: #45a049; }
        </style>
    </head>
    <body>
        <h1>Converted Policy Output</h1>
        <pre>${jsonOutput}</pre>
        <button onclick="copyToClipboard()">Copy to Clipboard</button>
        <script>
            function copyToClipboard() {
                navigator.clipboard.writeText(\`${jsonOutput}\`).then(() => {
                    alert('Copied to clipboard!');
                });
            }
        </script>
    </body>
    </html>`;
}

module.exports = { convertPolicyCommand };
