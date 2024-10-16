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
        const nodes = [];
        let currentDeny = '';

        lines.forEach((line) => {
            const trimmedLine = line.trim();

            // Capture deny statements
            if (trimmedLine.startsWith('deny')) {
                currentDeny = trimmedLine.split('{')[0].trim(); // Get the deny message
                nodes.push({ id: currentDeny, label: currentDeny });
            }

            // Check for resource type
            if (currentDeny && trimmedLine.includes('resource')) {
                const resourceType = this.extractResourceType(trimmedLine);
                nodes.push({ id: `Check if resource type is ${resourceType}`, label: `Check if resource type is ${resourceType}` });
            }

            // Check for VPC configuration
            if (currentDeny && trimmedLine.includes('not resource.change.after.vpc_configuration')) {
                nodes.push({ id: 'Check if VPC configuration exists', label: 'Check if VPC configuration exists' });
            }
        });

        return nodes;
    }

    static extractResourceType(line) {
        const match = line.match(/resource\.type == "(.*?)"/);
        return match ? match[1] : 'unknown';
    }

    static getVisualizationHTML(nodes) {
        const nodeElements = nodes.map(node => `<div class="node">${node.label}</div>`).join('');
        const connections = nodes.map((node, index) => {
            if (index < nodes.length - 1) {
                return `<div class="arrow"></div>`;
            }
            return '';
        }).join('');

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
                    .node {
                        background-color: #4caf50;
                        color: white;
                        padding: 20px;
                        margin: 20px;
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
                    .container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                </style>
            </head>
            <body>
                <h1>OPA Policy Visualization</h1>
                <div class="container">
                    ${nodeElements}
                    ${connections}
                </div>
            </body>
            </html>
        `;
    }
}

module.exports = VisualizationService;
