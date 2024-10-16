// src/services/VisualizationService.js

const fs = require('fs');

class VisualizationService {
    static async getPolicies(filePath) {
        try {
            // Read the Rego file
            const policies = fs.readFileSync(filePath, 'utf8');
            // Process the policies into a format suitable for visualization
            return this.processPolicies(policies);
        } catch (err) {
            console.error("Error reading policies:", err);
            return null;
        }
    }

    static processPolicies(policies) {
        const lines = policies.split('\n');
        const policyGroups = [];
        let currentDeny = '';
        let currentPolicy = [];

        lines.forEach((line) => {
            const trimmedLine = line.trim();

            // Capture deny statements
            if (trimmedLine.startsWith('deny')) {
                if (currentPolicy.length) {
                    policyGroups.push(currentPolicy);
                    currentPolicy = [];
                }
                currentDeny = trimmedLine.split('{')[0].trim(); // Get the deny message
                currentPolicy.push({ id: currentDeny, label: currentDeny });
            }

            // Check for resource type
            if (currentDeny && trimmedLine.includes('resource')) {
                const resourceType = this.extractResourceType(trimmedLine);
                currentPolicy.push({ id: `Check if resource type is ${resourceType}`, label: `Check if resource type is ${resourceType}` });
            }

            // Check for VPC configuration
            if (currentDeny && trimmedLine.includes('not resource.change.after.vpc_configuration')) {
                currentPolicy.push({ id: 'Check if VPC configuration exists', label: 'Check if VPC configuration exists' });
            }
        });

        if (currentPolicy.length) {
            policyGroups.push(currentPolicy);
        }

        return policyGroups;
    }

    static extractResourceType(line) {
        const match = line.match(/resource\.type == "(.*?)"/);
        return match ? match[1] : 'unknown';
    }

    static getVisualizationHTML(policyGroups) {
        const policyElements = policyGroups.map(group => {
            const nodeElements = group.map(node => `<div class="node">${node.label}</div>`).join('');
            const connections = group.map((_, index) => {
                if (index < group.length - 1) {
                    return `<div class="arrow"></div>`;
                }
                return '';
            }).join('');

            return `
                <div class="policy-container">
                    ${nodeElements}
                    ${connections}
                </div>
            `;
        }).join('<div class="separator"></div>'); // Separator between different policy groups

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Policy Visualization</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                        flex-direction: column;
                        height: 100vh;
                        margin: 0;
                    }
                    .header {
                        background-color: #007bff; /* Blue color for header */
                        color: white;
                        padding: 10px;
                        border-radius: 5px;
                        text-align: center;
                        width: 80%;
                        max-width: 800px;
                        margin: 20px auto; /* Centering */
                        box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
                    }
                    .output-box {
                        background-color: #e6f7ff;
                        padding: 20px;
                        border-radius: 5px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
                        width: 80%; /* Adjust width as necessary */
                        max-width: 800px; /* Maximum width */
                        margin: 20px auto; /* Centering */
                        margin-top: 10px; /* Gap from header */
                    }
                    .node {
                        background-color: #007bff; /* Blue color for nodes */
                        color: white;
                        padding: 20px;
                        margin: 10px;
                        border-radius: 5px;
                        text-align: center;
                        width: 300px;
                        box-shadow: 2px 2px 10px rgba(0,0,0,0.3);
                    }
                    .arrow {
                        width: 2px;
                        height: 50px;
                        background-color: #333;
                        margin: 0 auto;
                    }
                    .policy-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        margin-bottom: 40px; /* Space between policy groups */
                    }
                    .separator {
                        height: 20px; /* Space between different policy groups */
                    }
                </style>
            </head>
            <body>
                <div class="header">Visualize OPA Policy</div>
                <div class="output-box">
                    ${policyElements}
                </div>
            </body>
            </html>
        `;
    }
}

module.exports = VisualizationService;
