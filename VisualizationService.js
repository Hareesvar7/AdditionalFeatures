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
        const policyData = [];

        lines.forEach((line) => {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('deny')) {
                policyData.push({ id: trimmedLine, label: trimmedLine });
            } else if (trimmedLine.includes('resource.type')) {
                const resourceType = this.extractResourceType(trimmedLine);
                policyData.push({ id: `Check if resource type is ${resourceType}`, label: `Check if resource type is ${resourceType}` });
            }
            // Additional parsing can go here
        });

        return policyData;
    }

    static extractResourceType(line) {
        const match = line.match(/resource\.type == "(.*?)"/);
        return match ? match[1] : 'unknown';
    }

    static getVisualizationHTML(policyData) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Policy Visualization</title>
                <script src="https://unpkg.com/gojs/release/go.js"></script>
                <style>
                    #myDiagram {
                        width: 100%;
                        height: 600px;
                        border: 1px solid black;
                    }
                    .header {
                        background-color: #007bff;
                        color: white;
                        padding: 10px;
                        border-radius: 5px;
                        text-align: center;
                        margin-bottom: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="header">Visualize OPA Policy</div>
                <div id="myDiagram"></div>
                <script>
                    const $ = go.GraphObject.make;
                    const myDiagram = $(go.Diagram, "myDiagram");

                    myDiagram.nodeTemplate =
                        $(go.Node, "Auto",
                            $(go.Shape, "RoundedRectangle",
                                { fill: "#007bff", stroke: "#000", strokeWidth: 1 }),
                            $(go.TextBlock,
                                { margin: 8, font: "bold 14px sans-serif", stroke: "white" },
                                new go.Binding("text", "label"))
                        );

                    const model = $(go.GraphLinksModel);
                    model.nodeDataArray = ${JSON.stringify(policyData)};

                    // Create links (connections) between nodes
                    const links = [];
                    for (let i = 0; i < policyData.length - 1; i++) {
                        links.push({ from: policyData[i].id, to: policyData[i + 1].id });
                    }
                    model.linkDataArray = links;

                    myDiagram.model = model;
                </script>
            </body>
            </html>
        `;
    }
}

module.exports = VisualizationService;
