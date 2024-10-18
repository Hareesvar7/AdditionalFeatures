const fs = require('fs');

function convertRegoToJson(regoContent) {
    const resourceChanges = [];
    let policyMessage = "";

    const lines = regoContent.split('\n');

    lines.forEach(line => {
        // Extract resource type
        const resourceMatch = line.match(/resource\.type == "(.*?)"/);
        if (resourceMatch) {
            resourceChanges.push({
                type: resourceMatch[1],
                change: {
                    after: {}
                }
            });
        }

        // Extract VPC configuration check
        if (line.includes('not resource.change.after.vpc_configuration')) {
            if (resourceChanges.length > 0) {
                resourceChanges[resourceChanges.length - 1].change.after.vpc_configuration = null;
            }
        }

        // Extract message from sprintf
        const msgMatch = line.match(/msg\s*=\s*sprintf"(.*?)", (.*?)/);
        if (msgMatch) {
            const messageTemplate = msgMatch[1];
            // Assuming there's a reference to resource.change.after.name
            const resourceName = "example-s3-access-point"; // Hardcoded for demonstration
            policyMessage = messageTemplate.replace("%s", resourceName);
        }
    });

    const jsonOutput = {
        resource_changes: resourceChanges,
        policy: {
            deny: {
                msg: policyMessage
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
