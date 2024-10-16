// src/services/LintService.js

const fs = require('fs');

class LintService {
    static async lintPolicies(filePath) {
        try {
            // Read the Rego file
            const policies = fs.readFileSync(filePath, 'utf8');
            return this.lintPoliciesContent(policies);
        } catch (err) {
            console.error("Error reading policies:", err);
            return null;
        }
    }

    // Lint policies based on common rules
    static lintPoliciesContent(policies) {
        const lines = policies.split('\n');
        const lintMessages = [];

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            // Rule 1: Check for unused deny messages
            if (trimmedLine.startsWith('deny[')) {
                const msgLine = lines[index + 1] ? lines[index + 1].trim() : '';
                if (!msgLine.includes('msg')) {
                    lintMessages.push({
                        line: index + 1,
                        message: "Deny rules should include a descriptive 'msg' for clarity.",
                    });
                }
            }

            // Rule 2: Ensure all resources are clearly defined
            if (trimmedLine.includes('resource := input.resource_changes[_]')) {
                const resourceTypeLine = lines[index + 1] ? lines[index + 1].trim() : '';
                if (!resourceTypeLine.includes('resource.type')) {
                    lintMessages.push({
                        line: index + 1,
                        message: "Each policy must clearly define the resource type.",
                    });
                }
            }

            // Rule 3: All policies must have a corresponding allow condition
            if (trimmedLine.includes('deny[') && !lines.slice(index).some(l => l.trim().includes('allow'))) {
                lintMessages.push({
                    line: index + 1,
                    message: "Every deny rule should be balanced with an appropriate allow rule.",
                });
            }

            // Rule 4: Use of consistent naming conventions
            if (trimmedLine.startsWith('deny[') || trimmedLine.startsWith('allow[')) {
                const nameMatch = trimmedLine.match(/deny(.*)/) || trimmedLine.match(/allow(.*)/);
                if (nameMatch && !this.isValidNamingConvention(nameMatch[1].trim())) {
                    lintMessages.push({
                        line: index + 1,
                        message: "Ensure consistent naming conventions for rules.",
                    });
                }
            }

            // Rule 5: Check for redundancy in deny rules
            if (trimmedLine.startsWith('deny[')) {
                const denyCondition = trimmedLine.split(' ')[1]; // Extract condition after deny[
                if (lines.some((l, idx) => idx < index && l.includes(denyCondition))) {
                    lintMessages.push({
                        line: index + 1,
                        message: "Avoid redundant deny rules that repeat conditions.",
                    });
                }
            }

            // Rule 6: Encourage meaningful policy comments
            if (trimmedLine.startsWith('deny[') && !trimmedLine.includes('msg')) {
                lintMessages.push({
                    line: index + 1,
                    message: "Consider adding comments to explain the rationale behind deny rules.",
                });
            }

            // Rule 7: Validate logical conditions in policies
            if (trimmedLine.includes('not') && !trimmedLine.includes('deny')) {
                lintMessages.push({
                    line: index + 1,
                    message: "Ensure that logical conditions are used appropriately within policies.",
                });
            }
        });

        return lintMessages;
    }

    // Helper function to validate naming conventions
    static isValidNamingConvention(name) {
        // Example: Only allow lowercase letters, numbers, underscores, and hyphens
        const regex = /^[a-z0-9_]+$/;
        return regex.test(name);
    }
}

module.exports = LintService;
