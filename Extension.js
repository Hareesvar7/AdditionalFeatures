const vscode = require('vscode');
const { saveVersion, listSavedVersions, generateReport, performOpaEval } = require('./commands');

function activate(context) {
    const saveCommand = vscode.commands.registerCommand('extension.saveVersion', saveVersion);
    const listCommand = vscode.commands.registerCommand('extension.listSavedVersions', listSavedVersions);
    
    // Command to run OPA eval and generate a report
    const evaluateCommand = vscode.commands.registerCommand('extension.evaluateOpa', async () => {
        const evaluationData = await performOpaEval(); // Call the simulated OPA eval function

        // Generate a report for the OPA evaluation
        await generateReport(evaluationData);
    });

    context.subscriptions.push(saveCommand);
    context.subscriptions.push(listCommand);
    context.subscriptions.push(evaluateCommand);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
