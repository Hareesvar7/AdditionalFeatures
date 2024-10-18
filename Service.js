const YAML = require('yaml');

class ConverterService {
    static convertPolicy(policyContent, outputFormat) {
        try {
            // Parse the Rego policy content
            const policyObject = this.parseRego(policyContent);

            // Convert to the desired format
            if (outputFormat === 'json') {
                return JSON.stringify(policyObject, null, 2);
            } else if (outputFormat === 'yaml') {
                return YAML.stringify(policyObject);
            }
        } catch (error) {
            console.error("Conversion error:", error);
            return "Error converting policy.";
        }
    }

    static parseRego(policyContent) {
        // A basic parsing logic to transform Rego to a JS object.
        // You may need a more sophisticated parser depending on your requirements.
        const lines = policyContent.split('\n');
        const policyObject = {};

        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine) {
                const [key, value] = trimmedLine.split(':');
                policyObject[key.trim()] = value ? value.trim() : null;
            }
        });

        return policyObject;
    }
}

module.exports = ConverterService;
