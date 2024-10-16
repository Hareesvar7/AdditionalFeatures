// src/services/LintingService.js

class LintingService {
    static lintPolicy(policy) {
        const issues = [];
        const lines = policy.split('\n');

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            // Rule 1: Ensure 'allow' and 'deny' rules are used properly
            if (trimmedLine.startsWith('allow') || trimmedLine.startsWith('deny')) {
                if (!this.hasCorrespondingAllowDeny(trimmedLine, lines)) {
                    issues.push({
                        line: index + 1,
                        message: 'Missing corresponding allow/deny rule for this policy.'
                    });
                }
            }

            // Rule 2: Line length should not exceed 100 characters
            if (trimmedLine.length > 100) {
                issues.push({
                    line: index + 1,
                    message: 'Line is too long. Consider breaking it into multiple lines.'
                });
            }

            // Rule 3: Check for unused variables
            if (trimmedLine.includes('input.') && !this.isUsedVariable(trimmedLine, lines)) {
                issues.push({
                    line: index + 1,
                    message: 'Unused variable detected. Review your policy for optimization.'
                });
            }

            // Rule 4: Ensure messages are descriptive
            if (trimmedLine.includes('msg')) {
                const message = this.extractMessage(trimmedLine);
                if (message.length < 10) {
                    issues.push({
                        line: index + 1,
                        message: 'Message should be more descriptive (at least 10 characters).'
                    });
                }
            }

            // Rule 5: Ensure that rules have comments
            if (trimmedLine.startsWith('allow') || trimmedLine.startsWith('deny')) {
                if (!this.hasComment(lines, index)) {
                    issues.push({
                        line: index + 1,
                        message: 'Consider adding a comment to describe this rule.'
                    });
                }
            }
        });

        return issues;
    }

    // Helper function to check if there's a corresponding allow/deny rule
    static hasCorrespondingAllowDeny(line, lines) {
        const rule = line.split(' ')[0]; // Extract 'allow' or 'deny'
        return lines.some(l => l.trim().startsWith(rule === 'allow' ? 'deny' : 'allow'));
    }

    // Helper function to check if a variable is used
    static isUsedVariable(variableLine, lines) {
        const variable = variableLine.match(/input\.(\w+)/);
        if (variable) {
            const varName = variable[1];
            return lines.some(line => line.includes(varName) && !line.includes('input.'));
        }
        return true; // If there's no variable, we assume it's not used.
    }

    // Helper function to check for comments
    static hasComment(lines, index) {
        // Look for comments in the previous lines
        for (let i = index - 1; i >= 0; i--) {
            if (lines[i].trim().startsWith('#')) {
                return true;
            }
        }
        return false;
    }

    static extractMessage(line) {
        const match = line.match(/msg == "(.*?)"/);
        return match ? match[1] : '';
    }
}

module.exports = LintingService;
