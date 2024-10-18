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

            // Convert based on the chosen format
            return format === 'JSON' ? this.convertToJSON(parsedPolicy) : this.convertToYAML(parsedPolicy);
        } catch (err) {
            console.error("Error converting policy:", err);
            return null;
        }
    }

    static parseRegoPolicy(rego) {
        const policyLines = rego.split('\n');
        const policyObj = { policies: [] };
        
        let currentPolicy = {};

        policyLines.forEach(line => {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('package')) {
                policyObj.package = trimmedLine.split(' ')[1];
            } else if (trimmedLine.startsWith('deny') || trimmedLine.startsWith('allow')) {
                if (currentPolicy.id) {
                    policyObj.policies.push(currentPolicy);
                }
                currentPolicy = { id: trimmedLine, conditions: [] };
            } else if (trimmedLine) { // Non-empty line
                currentPolicy.conditions.push(trimmedLine);
            }
        });

        // Push the last policy if exists
        if (currentPolicy.id) {
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
