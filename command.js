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
        
        // Show output in a webview or notification
        if (result.success) {
            const jsonOutput = JSON.stringify(result.data, null, 2);
            // Display the output in a new webview or notification
            vscode.window.showInformationMessage('Conversion successful! You can view the output in the console or a webview.');
            console.log("Converted JSON:", jsonOutput); // Log the output
        } else {
            vscode.window.showErrorMessage(result.message);
        }
    }
}

module.exports = { convertPolicyCommand };
