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

    // Process policies dynamically based on keywords like deny, allow, resource.type, etc.
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
                    currentPolicy.push({ id: `Resource Type: ${resourceType}`, label: `Check resource type: ${resourceType}` });
                }
            }

            // Detect change after and before
            if (trimmedLine.includes('resource_change.change.after')) {
                currentPolicy.push({ id: 'Change After', label: 'Evaluate change after' });
            }
            if (trimmedLine.includes('resource_change.change.before')) {
                currentPolicy.push({ id: 'Change Before', label: 'Evaluate change before' });
            }

            // Detect not condition
            if (trimmedLine.includes('not')) {
                currentPolicy.push({ id: 'Not Condition', label: 'Check not condition' });
            }

            // Detect message
            if (trimmedLine.includes('msg')) {
                const message = this.extractMessage(lines, line);
                currentPolicy.push({ id: `Message: ${message}`, label: `Message: ${message}` });
            }

            // Detect other conditions dynamically
            if (trimmedLine.includes('input.')) {
                currentPolicy.push({ id: `Condition: ${trimmedLine}`, label: `Check condition: ${trimmedLine}` });
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

    static extractMessage(lines, line) {
        const match = line.match(/msg == "(.*?)"/);
        if (match) {
            // Get the index of the current line
            const index = lines.indexOf(line);
            // Get five words before and after the message
            const words = match[1].split(' ');
            const start = Math.max(0, index - 5);
            const end = Math.min(lines.length, index + 6);
            const context = lines.slice(start, end).join(' ');
            return `${context.trim()}: ${words.join(' ')}`;
        }
        return 'unknown';
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
                        width: 90%; /* Increased width to reduce scrolling */
                        height: 600px;
                        max-width: 1000px; /* Adjusted max width */
                        margin: 20px auto;
                        border: 1px solid #ccc;
                        background-color: white;
                        overflow: hidden; /* Prevent scrolling */
                        padding: 10px; /* Add padding for better spacing */
                    }
                </style>
            </head>
            <body>
                <div class="header">Visualize OPA Policy</div>
                <div id="policyDiagram"></div>

                <script>
                    const $ = go.GraphObject.make;

                    const myDiagram = $(go.Diagram, "policyDiagram", {
                        layout: $(go.TreeLayout, { angle: 90, layerSpacing: 20 }) // Adjusted layer spacing
                    });

                    myDiagram.nodeTemplate =
                        $(go.Node, "Horizontal",
                            { background: "#007bff", padding: 5 },
                            $(go.TextBlock, "Default Text",
                                { margin: 5, stroke: "white", font: "bold 14px sans-serif" },
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

        policyGroups.forEach((group, index) => {
            const color = index % 2 === 0 ? "#e3f2fd" : "#fce4ec"; // Alternate colors
            group.forEach((policy, groupIndex) => {
                if (groupIndex === 0) {
                    nodes.push({ key: keyCounter++, label: policy.label, color });
                } else {
                    nodes.push({ key: keyCounter++, parent: keyCounter - 2, label: policy.label, color });
                }
            });
        });

        return nodes;
    }
}

module.exports = VisualizationService;
