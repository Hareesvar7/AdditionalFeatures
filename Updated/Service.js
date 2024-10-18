// src/services/VisualizationService.js

const fs = require('fs');

class VisualizationService {
    // Generate HTML for the upload interface
    static getUploadHTML() {
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
                        padding: 20px;
                    }
                    .upload-container {
                        margin-bottom: 20px;
                    }
                    .header {
                        background-color: #007bff;
                        color: white;
                        padding: 10px;
                        border-radius: 5px;
                        text-align: center;
                    }
                    #fileInput {
                        margin: 10px 0;
                    }
                    #visualization {
                        display: none;
                    }
                </style>
            </head>
            <body>
                <div class="header">Upload OPA Policy File</div>
                <div class="upload-container">
                    <input type="file" id="fileInput" accept=".rego">
                    <button id="uploadBtn">Upload</button>
                    <p id="errorMessage" style="color: red;"></p>
                </div>
                <div id="visualization"></div>

                <script>
                    const vscode = acquireVsCodeApi();

                    document.getElementById('uploadBtn').addEventListener('click', () => {
                        const fileInput = document.getElementById('fileInput');
                        if (fileInput.files.length === 0) {
                            document.getElementById('errorMessage').textContent = 'Please select a .rego file to upload.';
                            return;
                        }
                        const filePath = fileInput.files[0].path;
                        vscode.postMessage({ command: 'upload', filePath: filePath });
                    });

                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.command) {
                            case 'visualize':
                                visualizePolicies(message.data);
                                break;
                            case 'error':
                                document.getElementById('errorMessage').textContent = message.text;
                                break;
                        }
                    });

                    function visualizePolicies(policyGroups) {
                        const visualizationDiv = document.getElementById('visualization');
                        visualizationDiv.innerHTML = '';
                        visualizationDiv.style.display = 'block';

                        // Generate visualization content
                        const treeData = prepareTreeData(policyGroups);
                        visualizationDiv.innerHTML = createVisualizationHTML(treeData);
                    }

                    function prepareTreeData(policyGroups) {
                        const nodes = [];
                        let keyCounter = 0;

                        policyGroups.forEach((group, groupIndex) => {
                            const color = groupIndex % 2 === 0 ? "#ffcccb" : "#add8e6"; // Alternate colors for policies
                            group.forEach((policy, index) => {
                                if (index === 0) {
                                    nodes.push({ key: keyCounter++, label: policy.label, color: color });
                                } else {
                                    nodes.push({ key: keyCounter++, parent: keyCounter - 2, label: policy.label, color: color });
                                }
                            });
                        });

                        return nodes;
                    }

                    function createVisualizationHTML(treeData) {
                        const nodes = JSON.stringify(treeData);
                        return `
                            <div id="policyDiagram" style="width: 90%; height: 600px; border: 1px solid #ccc; background-color: white; padding: 10px;"></div>
                            <script src="https://unpkg.com/gojs/release/go.js"></script>
                            <script>
                                const $ = go.GraphObject.make;
                                const myDiagram = $(go.Diagram, "policyDiagram", {
                                    layout: $(go.TreeLayout, { angle: 90, layerSpacing: 30 })
                                });

                                myDiagram.nodeTemplate =
                                    $(go.Node, "Horizontal",
                                        { padding: 5 },
                                        $(go.TextBlock, "Default Text",
                                            { margin: 5, stroke: "black", font: "bold 14px sans-serif" },
                                            new go.Binding("text", "label"))
                                    );

                                myDiagram.linkTemplate =
                                    $(go.Link,
                                        $(go.Shape, { strokeWidth: 2, stroke: "#333" }),
                                        $(go.Shape, { toArrow: "OpenTriangle", stroke: "#333", fill: null })
                                    );

                                myDiagram.model = new go.TreeModel(${nodes});
                            </script>
                        `;
                    }
                </script>
            </body>
            </html>
        `;
    }

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
        let currentPolicy = [];
        let currentRule = '';

        lines.forEach((line) => {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('deny') || trimmedLine.startsWith('allow')) {
                if (currentPolicy.length) {
                    policyGroups.push(currentPolicy);
                    currentPolicy = [];
                }
                currentRule = trimmedLine.split('{')[0].trim();
                currentPolicy.push({ id: currentRule, label: `Rule: ${currentRule}. Defines the action taken for this policy.` });
            }

            if (trimmedLine.includes('resource_change.type')) {
                const resourceType = this.extractResourceType(trimmedLine);
                if (resourceType !== 'unknown') {
                    currentPolicy.push({ id: `Resource Type: ${resourceType}`, label: `Resource Type: ${resourceType}. Specifies the resource being evaluated.` });
                }
            }

            if (trimmedLine.includes('resource_change.change.after')) {
                currentPolicy.push({ id: 'Change After', label: 'Change After: Evaluates the new state of the resource.' });
            }
            if (trimmedLine.includes('resource_change.change.before')) {
                currentPolicy.push({ id: 'Change Before', label: 'Change Before: Evaluates the previous state of the resource.' });
            }

            if (trimmedLine.includes('not')) {
                currentPolicy.push({ id: 'Not Condition', label: 'Not Condition: Checks for the absence of a condition.' });
            }

            if (trimmedLine.includes('msg')) {
                const message = this.extractMessage(trimmedLine);
                currentPolicy.push({ id: `Message: ${message}`, label: `Message: ${message}. Displays an informative message based on evaluation.` });
            }

            if (trimmedLine.includes('input.')) {
                currentPolicy.push({ id: `Condition: ${trimmedLine}`, label: `Condition: ${trimmedLine}. Checks a specific input condition relevant to the policy.` });
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
}

module.exports = VisualizationService;
