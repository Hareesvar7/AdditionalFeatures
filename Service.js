const yaml = require('js-yaml');

class ConversionService {
    static async convertPolicy(fileContent, format) {
        try {
            // Convert Rego content to JSON first (use an appropriate parsing logic)
            const jsonOutput = this.parseRegoToJSON(fileContent);

            if (format === 'yaml') {
                const yamlOutput = yaml.dump(jsonOutput);
                return { success: true, data: yamlOutput };
            } else {
                return { success: true, data: JSON.stringify(jsonOutput, null, 2) };
            }
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    static parseRegoToJSON(regoContent) {
        // Here is where you would put the Rego to JSON conversion logic
        // This is a simple stub for demo purposes
        try {
            const jsonOutput = JSON.parse(regoContent); // Replace with actual Rego parsing logic
            return jsonOutput;
        } catch (err) {
            throw new Error('Failed to parse Rego content to JSON');
        }
    }
}

module.exports = ConversionService;
