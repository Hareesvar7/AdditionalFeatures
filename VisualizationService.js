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
            if (currentDeny && trimmedLine.includes('vpc_configuration')) {
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
        const treeData = this.prepareTreeData(policyGroups);

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Policy Visualization</title>
                <script src="https://unpkg.com/gojs@2.1.46/release/go.js"></script>
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
                    #policyDiagram {
                        width: 80%; /* Adjust width as necessary */
                        height: 600px; /* Adjust height as necessary */
                        max-width: 800px; /* Maximum width */
                        margin: 20px auto; /* Centering */
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
