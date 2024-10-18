// src/services/LintingService.js

class LintingService {
    static lintPolicy(policyText) {
        const issues = [];
        const lines = policyText.split('\n');

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            // Rule 1: Check for missing corresponding allow/deny rule
            if (trimmedLine.startsWith('allow') || trimmedLine.startsWith('deny')) {
                if (!this.hasCorrespondingAllowDeny(trimmedLine, lines)) {
                    issues.push({
                        line: index + 1,
                        message: 'Missing corresponding allow/deny rule for this policy.'
                    });
                }
            }

            // Rule 2: Enforce line length constraint
            if (trimmedLine.length > 100) {
                issues.push({
                    line: index + 1,
                    message: 'Line is too long. Consider breaking it into multiple lines.'
                });
            }

            // Rule 3: Ensure descriptive messages
            if (trimmedLine.includes('msg')) {
                const message = this.extractMessage(trimmedLine);
                if (message.length < 10) {
                    issues.push({
                        line: index + 1,
                        message: 'Message should be more descriptive (at least 10 characters).'
                    });
                }
            }

            // Rule 4: Check for comments
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

    // Helper functions...
    static hasCorrespondingAllowDeny(line, lines) {
        const rule = line.split(' ')[0];
        return lines.some(l => l.trim().startsWith(rule === 'allow' ? 'deny' : 'allow'));
    }

    static extractMessage(line) {
        const match = line.match(/msg == "(.*?)"/);
        return match ? match[1] : '';
    }

    static hasComment(lines, index) {
        for (let i = index - 1; i >= 0; i--) {
            if (lines[i].trim().startsWith('#')) {
                return true;
            }
        }
        return false;
    }
}

module.exports = LintingService;
