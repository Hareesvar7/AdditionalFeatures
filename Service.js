const fs = require('fs');
const yaml = require('js-yaml');

class ConvertPolicyService {
    // Main function to handle conversion logic
    static async convertPolicy(filePath, format) {
        try {
            const regoContent = fs.readFileSync(filePath, 'utf8');
            if (format === 'JSON') {
                return this.convertToJSON(regoContent);
            } else if (format === 'YAML') {
                return this.convertToYAML(regoContent);
            } else {
                throw new Error('Unsupported format');
            }
        } catch (err) {
            throw new Error(`Failed to read or convert file: ${err.message}`);
        }
    }

    // Convert Rego content to JSON format
    static convertToJSON(regoContent) {
        try {
            // Simple logic to wrap the Rego policy into a JSON object
            const jsonPolicy = {
                "policy": regoContent
            };
            return JSON.stringify(jsonPolicy, null, 2); // Pretty print JSON
        } catch (err) {
            throw new Error(`JSON Conversion failed: ${err.message}`);
        }
    }

    // Convert Rego content to YAML format
    static convertToYAML(regoContent) {
        try {
            const yamlPolicy = {
                "policy": regoContent
            };
            return yaml.dump(yamlPolicy); // Convert to YAML format
        } catch (err) {
            throw new Error(`YAML Conversion failed: ${err.message}`);
        }
    }

    // Generate HTML for the Webview (result display)
    static getWebviewContent(convertedPolicy, format) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Policy Conversion (${format})</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h2 { color: #007bff; }
                    pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; }
                    button { background-color: #007bff; color: white; padding: 10px 20px; border: none; cursor: pointer; }
                    button:hover { background-color: #0056b3; }
                </style>
            </head>
            <body>
                <h2>Converted Policy (${format})</h2>
                <pre>${convertedPolicy}</pre>
                <button onclick="copyToClipboard()">Copy to Clipboard</button>

                <script>
                    function copyToClipboard() {
                        const policyText = document.querySelector('pre').textContent;
                        navigator.clipboard.writeText(policyText).then(() => {
                            alert('Copied to clipboard');
                        }, (err) => {
                            alert('Failed to copy text: ' + err);
                        });
                    }
                </script>
            </body>
            </html>
        `;
    }
}

module.exports = ConvertPolicyService;
