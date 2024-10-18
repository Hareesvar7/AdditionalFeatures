// src/services/LintingService.js

class LintingService {
    static lintPolicy(policyText) {
        const issues = [];
        const lines = policyText.split('\n');
        let packageKeywordFound = false;

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            // Rule: Check for the presence of the 'package' keyword
            if (trimmedLine.startsWith('package ')) {
                if (packageKeywordFound) {
                    issues.push({
                        line: index + 1,
                        message: 'Only one package declaration is allowed.'
                    });
                } else {
                    packageKeywordFound = true; // Mark that we found the package keyword
                }
            }

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
        });

        // If no package keyword was found, add an issue
        if (!packageKeywordFound) {
            issues.push({
                line: 1,
                message: 'The policy must include a package declaration (e.g., package aws.s3.policies).'
            });
        }

        return issues;
    }

    // Helper function to count words in a comment
    static getWordCount(comment) {
        return comment.replace(/#/g, '').trim().split(/\s+/).length;
    }
}

module.exports = LintingService;
