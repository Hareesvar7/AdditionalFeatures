// src/services/VisualizationService.js

const fs = require('fs');

class VisualizationService {
    static async getPolicies(filePath) {
        try {
            const policies = fs.readFileSync(filePath, 'utf8');
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

            if (trimmedLine.startsWith('deny')) {
                if (currentPolicy.length) {
                    policyGroups.push(currentPolicy);
                    currentPolicy = [];
                }
                currentDeny = trimmedLine.split('{')[0].trim();
                currentPolicy.push({ id: currentDeny.replace(/\s+/g, ''), label: currentDeny });
            }

            if (currentDeny && trimmedLine.includes('resource')) {
                const resourceType = this.extractResourceType(trimmedLine);
                currentPolicy.push({ id: `CheckResourceType${resourceType}`, label: `Check if resource type is ${resourceType}` });
            }

            if (currentDeny && trimmedLine.includes('not resource.change.after.vpc_configuration')) {
                currentPolicy.push({ id: 'CheckVPCConfig', label: 'Check if VPC configuration exists' });
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
        const mermaidDiagram = policyGroups.map(group => {
            const nodes = group.map(node => `  ${node.id}["${node.label}"]`).join('\n');
            const connections = group.map((_, index) => {
                if (index < group.length - 1) {
                    return `  ${group[index].id} --> ${group[index + 1].id}`;
                }
                return '';
            }).filter(Boolean).join('\n');

            return `
                graph TD;
                ${nodes}
                ${connections}
            `;
        }).join('\n');

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Policy Visualization</title>
                <script type="module">
                    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.esm.min.mjs';
                    mermaid.initialize({ startOnLoad: true });
                </script>
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
                        background-color: #007bff;
                        color: white;
                        padding: 10px;
                        border-radius: 5px;
                        text-align: center;
                        width: 80%;
                        max-width: 800px;
                        margin: 20px auto;
                        box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
                    }
                    .output-box {
                        background-color: #e6f7ff;
                        padding: 20px;
                        border-radius: 5px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
                        width: 80%;
                        max-width: 800px;
                        margin: 20px auto;
                        margin-top: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="header">Visualize OPA Policy</div>
                <div class="output-box">
                    <div class="mermaid">
                        ${mermaidDiagram}
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}

module.exports = VisualizationService;
