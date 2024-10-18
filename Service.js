const fs = require('fs');
const yaml = require('js-yaml');
const opa = require('opa'); // Use an OPA library to handle Rego policies

class ConversionService {
    // Parse and convert Rego to JSON
    static convertToJSON(regoPolicy) {
        try {
            const parsedPolicy = opa.parse(regoPolicy);
            const jsonPolicy = JSON.stringify(parsedPolicy, null, 2); // Pretty print JSON
            return jsonPolicy;
        } catch (err) {
            console.error("Error converting Rego to JSON:", err);
            return null;
        }
    }

    // Convert Rego to YAML
    static convertToYAML(regoPolicy) {
        try {
            const parsedPolicy = opa.parse(regoPolicy);
            const yamlPolicy = yaml.dump(parsedPolicy); // Use yaml library to convert to YAML
            return yamlPolicy;
        } catch (err) {
            console.error("Error converting Rego to YAML:", err);
            return null;
        }
    }

    // Method to evaluate the converted JSON with plan.json
    static evaluatePolicy(policyJSON, planJSON) {
        try {
            // Use OPA's evaluator to check the converted policy against the input plan
            const result = opa.evaluate(JSON.parse(policyJSON), planJSON);
            return result;
        } catch (err) {
            console.error("Error evaluating policy:", err);
            return null;
        }
    }
}

module.exports = ConversionService;
