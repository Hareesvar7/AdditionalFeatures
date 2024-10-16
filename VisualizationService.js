// src/services/VisualizationService.js

const fs = require('fs');

class VisualizationService {
    static async getPolicies(filePath) {
        try {
            // Read the Rego file
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
        let currentPolicy = [];

        lines.forEach((line) => {
            const trimmedLine = line.trim();

            // Identify deny statements and start new policy group
            if (trimmedLine.startsWith('deny')) {
                if (currentPolicy.length) {
                    policyGroups.push(currentPolicy);
                    currentPolicy = [];
                }
                currentPolicy.push({ id: trimmedLine, label: `Policy: ${trimmedLine}` });
            }

            // Check for resource type and add it to current policy
            if (trimmedLine.includes('resource.type ==')) {
                const resourceType = this.extractResourceType(trimmedLine);
                if (resourceType !== 'unknown') {
                    currentPolicy.push({ id: `Check resource type: ${resourceType}`, label: `Check if resource type is ${resourceType}` });
                }
            }

            // Check for specific conditions like VPC
            if (trimmedLine.includes('vpc_configuration')) {
                currentPolicy.push({ id: 'Check VPC configuration', label: 'Check if VPC configuration exists' });
            }

            // Add other conditions or checks dynamically
            if (trimmedLine.includes('action ==')) {
                const action = this.extractAction(trimmedLine);
                currentPolicy.push({ id: `Check action: ${action}`, label: `Check if action is ${action}` });
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

    static extractAction(line) {
        const match = line.match(/action == "(.*?)"/);
        return match ? match[1] : 'unknown';
    }

    static getVisualizationHTML(policyGroups) {
        const treeData = this.prepareTreeData(policyGroups);

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Policy Visualization</title>
                <script src="https://unpkg.com/gojs/release/go.js"></script>
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
                    #policyDiagram {
                        width: 80%;
                        height: 600px;
                        max-width: 800px;
                        margin: 20px auto;
                        border: 1px solid #ccc;
                        background-color: white;
                    }
                </style>
            </head>
            <body>
                <div class="header">Visualize OPA Policy</div>
                <div id="policyDiagram"></div>

                <script>
                    const $ = go.GraphObject.make;

                    const myDiagram = $(go.Diagram, "policyDiagram", {
                        layout: $(go.TreeLayout, { angle: 90, layerSpacing: 35 })
                    });

                    myDiagram.nodeTemplate =
                        $(go.Node, "Horizontal",
                            { background: "#007bff", padding: 10 },
                            $(go.TextBlock, "Default Text",
                                { margin: 10, stroke: "white", font: "bold 16px sans-serif" },
                                new go.Binding("text", "label"))
                        );

                    myDiagram.linkTemplate =
                        $(go.Link,
                            $(go.Shape, { strokeWidth: 2, stroke: "#333" }),
                            $(go.Shape, { toArrow: "OpenTriangle", stroke: "#333", fill: null })
                        );

                    myDiagram.model = new go.TreeModel(${JSON.stringify(treeData)});
                </script>
            </body>
            </html>
        `;
    }

    static prepareTreeData(policyGroups) {
        const nodes = [];
        let keyCounter = 0;

        policyGroups.forEach(group => {
            group.forEach((policy, index) => {
                if (index === 0) {
                    nodes.push({ key: keyCounter++, label: policy.label });
                } else {
                    nodes.push({ key: keyCounter++, parent: keyCounter - 2, label: policy.label });
                }
            });
        });

        return nodes;
    }
}

module.exports = VisualizationService;
