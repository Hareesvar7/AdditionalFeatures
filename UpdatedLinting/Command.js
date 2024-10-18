// src/commands/LintingCommand.js
const vscode = require('vscode');
const LintingService = require('../services/LintingService');

function activateLinting(context) {
    const diagnostics = vscode.languages.createDiagnosticCollection('regoLint');

    vscode.workspace.onDidOpenTextDocument((doc) => {
        if (doc.languageId === 'rego') {
            lintDocument(doc, diagnostics);
        }
    });

    vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId === 'rego') {
            lintDocument(event.document, diagnostics);
        }
    });

    vscode.workspace.onDidSaveTextDocument((doc) => {
        if (doc.languageId === 'rego') {
            lintDocument(doc, diagnostics);
        }
    });

    context.subscriptions.push(diagnostics);
}

function lintDocument(document, diagnostics) {
    const policyText = document.getText();
    const lintResults = LintingService.lintPolicy(policyText);

    const diagnosticsArray = lintResults.map((result) => {
        const range = new vscode.Range(
            new vscode.Position(result.line - 1, 0),
            new vscode.Position(result.line - 1, 100)
        );
        return new vscode.Diagnostic(range, result.message, vscode.DiagnosticSeverity.Warning);
    });

    diagnostics.set(document.uri, diagnosticsArray);
}

module.exports = activateLinting;
