const vscode = require('vscode');
const { saveVersion, listSavedVersions, generateReport } = require('./commands');

function activate(context) {
    const saveCommand = vscode.commands.registerCommand('extension.saveVersion', saveVersion);
    const listCommand = vscode.commands.registerCommand('extension.listSavedVersions', listSavedVersions);
    
    // Command to run OPA eval and generate a report
    const evaluateCommand = vscode.commands.registerCommand('extension.evaluateOpa', async () => {
        // Example dynamic evaluation data; replace this with actual eval data
        const evaluationData = "OPA Evaluation result: Passed with warnings."; // Replace with actual results

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
