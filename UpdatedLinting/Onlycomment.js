// src/services/LintingService.js

class LintingService {
    static lintPolicy(policyText) {
        const issues = [];
        const lines = policyText.split('\n');

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            // Rule: Check if comments have more than 7 words
            if (trimmedLine.startsWith('#')) {
                const commentWords = this.getWordCount(trimmedLine);
                if (commentWords < 7) {
                    issues.push({
                        line: index + 1,
                        message: 'Comment should contain more than 7 words.'
                    });
                }
            }

            // New Rule: Check for valid deny statement syntax
            if (trimmedLine.startsWith('deny[')) {
                const denyMessageMatch = trimmedLine.match(/msg\s*=\s*sprintf"([^"]+)",\s*(.*)/);
                if (!denyMessageMatch) {
                    issues.push({
                        line: index + 1,
                        message: 'Deny statement must define a message with sprintf.'
                    });
                } else {
                    const resourceMatch = lines[index - 1].match(/resource\s*:=\s*input\.resource_changes_/);
                    if (!resourceMatch) {
                        issues.push({
                            line: index,
                            message: 'Deny statement must have a valid resource assignment.'
                        });
                    }
                }
            }
        });

        return issues;
    }

    // Helper function to count words in a comment
    static getWordCount(comment) {
        return comment.replace(/#/g, '').trim().split(/\s+/).length;
    }
}

module.exports = LintingService;
