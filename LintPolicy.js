// src/commands/LintPolicy.js

const LintingService = require('../services/LintingService');
const vscode = require('vscode');

class LintPolicy {
    static outputChannel = vscode.window.createOutputChannel('Policy Linting'); // Create an output channel

    static async execute(filePath) {
        try {
            const policy = await this.readFile(filePath); // Implement this function to read the file
            const issues = LintingService.lintPolicy(policy);

            // Clear previous output
            this.outputChannel.clear();
            this.outputChannel.appendLine('Linting Results:\n');

            if (issues.length === 0) {
                this.outputChannel.appendLine('No linting issues found.');
            } else {
                issues.forEach(issue => {
                    this.outputChannel.appendLine(`Line ${issue.line}: ${issue.message}`);
                });
            }

            // Show the output channel
            this.outputChannel.show(true);
        } catch (err) {
            console.error("Error executing linting:", err);
            this.outputChannel.appendLine("Error executing linting: " + err.message);
            this.outputChannel.show(true);
        }
    }

    // Helper function to read the policy file
    static async readFile(filePath) {
        const fs = require('fs').promises;
        return await fs.readFile(filePath, 'utf8');
    }
}

module.exports = LintPolicy;
