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

    // Process policies dynamically based on specific keywords
    static processPolicies(policies) {
        const lines = policies.split('\n');
        const policyGroups = [];
        let currentPolicy = [];
        let currentRule = '';

        lines.forEach((line) => {
            const trimmedLine = line.trim();

            // Detect and start a new deny/allow rule
            if (trimmedLine.startsWith('deny') || trimmedLine.startsWith('allow')) {
                if (currentPolicy.length) {
                    policyGroups.push(currentPolicy);
                    currentPolicy = [];
                }
                currentRule = trimmedLine.split('{')[0].trim();
                currentPolicy.push({ id: currentRule, label: `${currentRule} - Policy rule` });
            }

            // Track specific keywords related to OPA policies
            this.trackKeywords(trimmedLine, currentPolicy);
        });

        if (currentPolicy.length) {
            policyGroups.push(currentPolicy);
        }

        return policyGroups;
    }

    // Track specified keywords and provide more descriptive information
    static trackKeywords(line, currentPolicy) {
        const keywords = {
            package: 'Package Declaration',
            deny: 'Deny Rule',
            allow: 'Allow Rule',
            resource_change: 'Resource Change Evaluation',
            'resource_change.type': 'Resource Change Type Evaluation',
            'resource_change.change.after': 'New State After Change',
            'resource_change.change.before': 'Previous State Before Change',
            not: 'Logical NOT Condition',
            msg: 'Message Evaluation',
            policy: 'Policy Evaluation'
        };

        for (const [key, description] of Object.entries(keywords)) {
            if (line.includes(key)) {
                // Create a more descriptive label for the policy condition
                const additionalInfo = line.split(key)[1] ? `: ${line.split(key)[1].trim()}` : '';
                currentPolicy.push({ id: `${key} Check`, label: `${description}${additionalInfo}` });
            }
        }
    }

    // Generate HTML for visualization with Go.js
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

    // Prepare tree data for Go.js visualization
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
