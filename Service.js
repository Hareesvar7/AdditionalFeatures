// src/services/ConvertPolicyService.js

const fs = require('fs');
const yaml = require('js-yaml');

class ConvertPolicyService {
    static async convertPolicy(filePath, format) {
        try {
            // Read the Rego file
            const regoPolicy = fs.readFileSync(filePath, 'utf8');

            // Parse the Rego policy into a structured object
            const parsedPolicy = this.parseRegoPolicy(regoPolicy);
            if (!parsedPolicy || Object.keys(parsedPolicy).length === 0) {
                throw new Error("Failed to parse the Rego policy. It may be malformed.");
            }

            // Convert based on the chosen format
            return format === 'JSON' ? this.convertToJSON(parsedPolicy) : this.convertToYAML(parsedPolicy);
        } catch (err) {
            console.error("Error converting policy:", err);
            return null; // Return null on error
        }
    }

    static parseRegoPolicy(rego) {
        const policyLines = rego.split('\n');
        const policyObj = { package: '', policies: [] };

        let currentPolicy = null;

        policyLines.forEach(line => {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('package')) {
                policyObj.package = trimmedLine.split(' ')[1];
            } else if (trimmedLine.startsWith('deny') || trimmedLine.startsWith('allow')) {
                if (currentPolicy) {
                    policyObj.policies.push(currentPolicy); // Save the previous policy
                }
                currentPolicy = { id: trimmedLine, conditions: [] }; // Start a new policy
            } else if (currentPolicy && trimmedLine) { // Non-empty line and there's a current policy
                currentPolicy.conditions.push(trimmedLine);
            }
        });

        // Push the last policy if exists
        if (currentPolicy) {
            policyObj.policies.push(currentPolicy);
        }

        return policyObj;
    }

    static convertToJSON(policyObject) {
        return JSON.stringify(policyObject, null, 2);
    }

    static convertToYAML(policyObject) {
        return yaml.dump(policyObject);
    }
}

module.exports = ConvertPolicyService;
