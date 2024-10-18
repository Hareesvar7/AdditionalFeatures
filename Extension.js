const vscode = require('vscode');
const registerAutoCompletion = require('./commands/AutoCompleteCommand');
const LintPolicy = require('./commands/LintPolicy');
const ValidateOPA = require('./commands/ValidateOPA'); // Assuming you have this command
const ShowCloudServiceSelection = require('./commands/ShowCloudServiceSelection'); // Assuming you have this command
const AiAssist = require('./commands/AiAssist'); // Assuming you have this command
const VisualizePolicies = require('./commands/VisualizePolicies'); // Assuming you have this command

function activate(context) {
    // Register the lint policy command
    context.subscriptions.push(vscode.commands.registerCommand('extension.lintPolicy', async () => {
        const fileUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            filters: {
                'Rego Files': ['rego']
            }
        });

        if (fileUri && fileUri[0]) {
            await LintPolicy.execute(fileUri[0].fsPath);
        }
    }));

    // Register the other commands
    context.subscriptions.push(vscode.commands.registerCommand('extension.showCloudServiceSelection', ShowCloudServiceSelection));
    context.subscriptions.push(vscode.commands.registerCommand('extension.validateOPA', ValidateOPA));
    context.subscriptions.push(vscode.commands.registerCommand('extension.aiAssist', AiAssist));
    context.subscriptions.push(vscode.commands.registerCommand('extension.visualizePolicies', VisualizePolicies));

    // Register the auto-completion feature
    registerAutoCompletion(context);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
