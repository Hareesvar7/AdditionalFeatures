// src/services/ConvertPolicyService.js

const fs = require('fs');
const yaml = require('js-yaml');

class ConvertPolicyService {
    static async convertPolicy(filePath, format) {
        try {
            // Read the Rego file
            const regoPolicy = fs.readFileSync(filePath, 'utf8');
            const json = this.convertToJSON(regoPolicy);
            const yamlFormat = this.convertToYAML(regoPolicy);

            // Return the converted policy in the requested format
            return format === 'JSON' ? json : yamlFormat;
        } catch (err) {
            console.error("Error converting policy:", err);
            return null;
        }
    }

    static convertToJSON(rego) {
        // Conversion logic to JSON
        const jsonObject = { policy: rego };
        return JSON.stringify(jsonObject, null, 2); // Formatting with 2 spaces
    }

    static convertToYAML(rego) {
        // Conversion logic to YAML
        const yamlObject = { policy: rego };
        return yaml.dump(yamlObject); // Using js-yaml to convert to YAML
    }
}

module.exports = ConvertPolicyService;
