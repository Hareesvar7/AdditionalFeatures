// src/commands/LintPolicy.js

const LintingService = require('../services/LintingService');

class LintPolicy {
    static async execute(filePath) {
        try {
            const policy = await this.readFile(filePath); // Implement this function to read the file
            const issues = LintingService.lintPolicy(policy);

            if (issues.length === 0) {
                console.log('No linting issues found.');
            } else {
                console.log('Linting Issues:');
                issues.forEach(issue => {
                    console.log(`Line ${issue.line}: ${issue.message}`);
                });
            }
        } catch (err) {
            console.error("Error executing linting:", err);
        }
    }

    // Helper function to read the policy file
    static async readFile(filePath) {
        const fs = require('fs').promises;
        return await fs.readFile(filePath, 'utf8');
    }
}

module.exports = LintPolicy;
