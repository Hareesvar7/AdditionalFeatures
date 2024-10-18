const vscode = require('vscode');
const ConvertPolicyService = require('../services/ConvertPolicyService');

async function convertPolicyCommand(context) {
    // Show open dialog to upload a Rego file
    const fileUri = await vscode.window.showOpenDialog({
        canSelectMany: false,
        filters: { 'Rego Files': ['rego'] },
    });

    if (!fileUri || fileUri.length === 0) {
        vscode.window.showErrorMessage('No file selected.');
        return;
    }

    // Ask user for conversion type (JSON or YAML)
    const conversionType = await vscode.window.showQuickPick(['JSON', 'YAML'], {
        placeHolder: 'Choose conversion format (JSON or YAML)',
    });

    if (!conversionType) {
        vscode.window.showErrorMessage('Conversion type not selected.');
        return;
    }

    // Perform the conversion using the service
    const filePath = fileUri[0].fsPath;
    try {
        const convertedPolicy = await ConvertPolicyService.convertPolicy(filePath, conversionType);

        // Show the result in a Webview with Copy to Clipboard option
        const panel = vscode.window.createWebviewPanel(
            'policyConversion',
            `Policy Conversion (${conversionType})`,
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = ConvertPolicyService.getWebviewContent(convertedPolicy, conversionType);
    } catch (err) {
        vscode.window.showErrorMessage(`Conversion failed: ${err.message}`);
    }
}

module.exports = convertPolicyCommand;
