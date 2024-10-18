const fs = require('fs');

function convertRegoToJson(regoContent) {
    const resourceChanges = [];
    let policyMessage = "";

    const lines = regoContent.split('\n');

    lines.forEach(line => {
        // Match for resource type
        const resourceMatch = line.match(/resource := input.resource_changes_]/);
        if (resourceMatch) {
            // Initialize a new resource object
            const resourceObject = {
                type: null,
                change: {
                    after: {
                        vpc_configuration: null, // Default value
                        name: null // Placeholder for name
                    }
                }
            };

            // Extract the resource type
            const typeMatch = lines.find(l => l.includes('resource.type =='));
            if (typeMatch) {
                const typeRegex = /resource\.type == "(.*?)"/;
                const type = typeRegex.exec(typeMatch);
                if (type) {
                    resourceObject.type = type[1];
                }
            }

            resourceChanges.push(resourceObject);
        }

        // Check for VPC configuration
        if (line.includes('not resource.change.after.vpc_configuration')) {
            if (resourceChanges.length > 0) {
                resourceChanges[resourceChanges.length - 1].change.after.vpc_configuration = null;
            }
        }

        // Extract the message using sprintf
        const msgMatch = line.match(/msg = sprintf"(.*?)", (.*?)/);
        if (msgMatch) {
            const messageTemplate = msgMatch[1];
            const resourceNameMatch = line.match(/resource.change.after.name/);
            if (resourceNameMatch && resourceChanges.length > 0) {
                // Default name for placeholder
                const resourceName = resourceChanges[resourceChanges.length - 1].change.after.name || "example-s3-access-point";
                policyMessage = messageTemplate.replace("%s", resourceName);
            }
        }

        // Match for resource name to capture it
        const nameMatch = line.match(/resource.change.after.name\s*=\s*"(.*?)"/);
        if (nameMatch) {
            const resourceName = nameMatch[1];
            if (resourceChanges.length > 0) {
                resourceChanges[resourceChanges.length - 1].change.after.name = resourceName;
            }
        }
    });

    // Construct the final JSON output
    const jsonOutput = {
        resource_changes: resourceChanges,
        policy: {
            deny: {
                msg: policyMessage || "No message available"
            }
        }
    };

    return jsonOutput;
}

async function convertPolicy(regoFilePath) {
    try {
        const regoContent = fs.readFileSync(regoFilePath, 'utf8');
        const convertedJson = convertRegoToJson(regoContent);
        return { success: true, data: convertedJson };
    } catch (error) {
        console.error("Error reading or converting Rego file:", error);
        return { success: false, message: "Failed to convert policy" };
    }
}

module.exports = { convertPolicy };
