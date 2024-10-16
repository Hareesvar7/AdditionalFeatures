// src/services/LintingService.js

class LintingService {
    static lintPolicy(policy) {
        const issues = [];
        const lines = policy.split('\n');
        const declaredVariables = new Set();
        const usedVariables = new Set();

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

            // Rule 3: Track declared variables
            this.trackDeclaredVariables(trimmedLine, declaredVariables);

            // Rule 4: Track used variables
            this.trackUsedVariables(trimmedLine, usedVariables);

            // Rule 5: Ensure messages are descriptive
            if (trimmedLine.includes('msg')) {
                const message = this.extractMessage(trimmedLine);
                if (message.length < 10) {
                    issues.push({
                        line: index + 1,
                        message: 'Message should be more descriptive (at least 10 characters).'
                    });
                }
            }

            // Rule 6: Ensure that rules have comments
            if (trimmedLine.startsWith('allow') || trimmedLine.startsWith('deny')) {
                if (!this.hasComment(lines, index)) {
                    issues.push({
                        line: index + 1,
                        message: 'Consider adding a comment to describe this rule.'
                    });
                }
            }

            // Rule 7: Check for logical errors in policy conditions
            if (this.hasLogicalErrors(trimmedLine)) {
                issues.push({
                    line: index + 1,
                    message: 'Logical condition may lead to unexpected behavior.'
                });
            }

            // Rule 8: Validate the use of the "not" operator
            if (trimmedLine.includes('not') && !this.isValidNotUsage(trimmedLine)) {
                issues.push({
                    line: index + 1,
                    message: 'The use of "not" operator may be incorrect or unnecessary.'
                });
            }
        });

        // Check for unused variables after analyzing all lines
        declaredVariables.forEach(variable => {
            if (!usedVariables.has(variable)) {
                issues.push({
                    message: `Unused variable detected: '${variable}'. Review your policy for optimization.`
                });
            }
        });

        return issues;
    }

    // Helper function to track declared variables
    static trackDeclaredVariables(line, declaredVariables) {
        const varMatch = line.match(/(input\.\w+)/g);
        if (varMatch) {
            varMatch.forEach(v => declaredVariables.add(v));
        }
    }

    // Helper function to track used variables
    static trackUsedVariables(line, usedVariables) {
        const varMatch = line.match(/(\w+)/g); // Match all words
        if (varMatch) {
            varMatch.forEach(v => usedVariables.add(v));
        }
    }

    // Helper function to check if there's a corresponding allow/deny rule
    static hasCorrespondingAllowDeny(line, lines) {
        const rule = line.split(' ')[0]; // Extract 'allow' or 'deny'
        return lines.some(l => l.trim().startsWith(rule === 'allow' ? 'deny' : 'allow'));
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

    // Helper function to extract message from the policy
    static extractMessage(line) {
        const match = line.match(/msg == "(.*?)"/);
        return match ? match[1] : '';
    }

    // Helper function to check for logical errors in policy conditions
    static hasLogicalErrors(line) {
        // Simple logic check example; this could be expanded
        const disallowedPatterns = ['== false', '== null'];
        return disallowedPatterns.some(pattern => line.includes(pattern));
    }

    // Helper function to validate the use of the "not" operator
    static isValidNotUsage(line) {
        // This can be expanded based on OPA logic rules
        return !line.includes('not false') && !line.includes('not null');
    }
}

module.exports = LintingService;
