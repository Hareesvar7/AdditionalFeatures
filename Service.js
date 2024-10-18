const json2yaml = require('json2yaml');  // Replacing js-yaml with json2yaml

class ConversionService {
    static async convertPolicy(fileContent, format) {
        try {
            // Convert Rego content to JSON first (use an appropriate parsing logic)
            const jsonOutput = this.parseRegoToJSON(fileContent);

            if (format === 'yaml') {
                const yamlOutput = json2yaml.stringify(jsonOutput);
                return { success: true, data: yamlOutput };
            } else {
                return { success: true, data: JSON.stringify(jsonOutput, null, 2) };
            }
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    static parseRegoToJSON(regoContent) {
        // Assuming the Rego file is structured similarly to JSON-like data
        try {
            // Simulating the conversion of Rego policies to JSON format
            // Realistically, you would need to implement a proper Rego-to-JSON parser
            // This is a basic example for demonstration purposes
            const jsonOutput = {
                policy: regoContent
                // Further parsing based on Rego syntax would go here
            };
            return jsonOutput;
        } catch (err) {
            throw new Error('Failed to parse Rego content to JSON');
        }
    }
}

module.exports = ConversionService;
