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

    // Process policies dynamically based on keywords
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
                currentPolicy.push({ id: currentRule, label: currentRule });
            }

            // Detect resource change type
            if (trimmedLine.includes('resource_change.type')) {
                const resourceType = this.extractResourceType(trimmedLine);
                if (resourceType !== 'unknown') {
                    currentPolicy.push({ id: `Resource Type: ${resourceType}`, label: `Resource Type: ${resourceType}` });
                }
            }

            // Detect change after and before
            if (trimmedLine.includes('resource_change.change.after')) {
                currentPolicy.push({ id: 'Change After', label: 'Evaluating Change After' });
            }
            if (trimmedLine.includes('resource_change.change.before')) {
                currentPolicy.push({ id: 'Change Before', label: 'Evaluating Change Before' });
            }

            // Detect not condition
            if (trimmedLine.includes('not')) {
                currentPolicy.push({ id: 'Not Condition', label: 'Not Condition Applied' });
            }

            // Detect message
            if (trimmedLine.includes('msg')) {
                const message = this.extractMessage(trimmedLine);
                currentPolicy.push({ id: `Message: ${message}`, label: `Message: ${message}` });
            }

            // Detect other conditions
            if (trimmedLine.includes('input.')) {
                currentPolicy.push({ id: `Condition: ${trimmedLine}`, label: `Condition: ${trimmedLine}` });
            }
        });

        if (currentPolicy.length) {
            policyGroups.push(currentPolicy);
        }

        return policyGroups;
    }

    static extractResourceType(line) {
        const match = line.match(/resource_change\.type == "(.*?)"/);
        return match ? match[1] : 'unknown';
    }

    static extractMessage(line) {
        const match = line.match(/msg == "(.*?)"/);
        return match ? match[1] : 'unknown';
    }

    // Generate HTML for visualization with Go.js
    static getVisualizationHTML(policyGroups) {
        const treeData = this.prepareTreeData(policyGroups);
        console.log("Tree Data:", treeData); // Log tree data for debugging

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
                        width: 90%; /* Increased width */
                        height: 600px;
                        max-width: 1000px;
                        margin: 20px auto;
                        border: 1px solid #ccc;
                        background-color: white;
                        padding: 10px;
                        overflow: hidden; /* Hide scrollbar */
                    }
                </style>
            </head>
            <body>
                <div class="header">Visualize OPA Policy</div>
                <div id="policyDiagram"></div>

                <script>
                    const $ = go.GraphObject.make;

                    const myDiagram = $(go.Diagram, "policyDiagram", {
                        layout: $(go.TreeLayout, { angle: 90, layerSpacing: 50 }) // Adjust layer spacing
                    });

                    myDiagram.nodeTemplate =
                        $(go.Node, "Horizontal",
                            { padding: 5 },
                            $(go.TextBlock, "Default Text",
                                { margin: 5, font: "bold 14px sans-serif", stroke: "white" }, // Adjust styles
                                new go.Binding("text", "label"),
                                new go.Binding("background", "color") // Bind color to background
                            )
                        );

                    // Assign colors alternately for each policy group
                    const colors = ['#007bff', '#ff69b4']; // Blue and Pink
                    treeData.forEach((node, index) => {
                        node.color = colors[index % colors.length]; // Alternate colors
                    });

                    myDiagram.linkTemplate =
                        $(go.Link,
                            $(go.Shape, { strokeWidth: 2, stroke: "#333" }),
                            $(go.Shape, { toArrow: "OpenTriangle", stroke: "#333", fill: null })
                        );

                    // Check if treeData has nodes to render
                    if (treeData.length > 0) {
                        myDiagram.model = new go.TreeModel(treeData);
                    } else {
                        console.warn("No data to render.");
                    }
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
