// src/services/VisualizationService.js

const fs = require('fs');

class VisualizationService {
    // Generate HTML for the upload interface and visualization
    static getUploadHTML() {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Policy Visualization</title>
                <script src="https://d3js.org/d3.v7.min.js"></script>
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
                    #visualization {
                        margin-top: 20px;
                    }
                    .node {
                        cursor: pointer;
                    }
                    .node circle {
                        fill: #fff;
                        stroke: steelblue;
                        stroke-width: 3px;
                    }
                    .node text {
                        font: 12px sans-serif;
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
                        const visualizationDiv = d3.select('#visualization');
                        visualizationDiv.selectAll('*').remove(); // Clear previous visualization

                        const width = 960;
                        const height = 500;

                        const svg = visualizationDiv.append('svg')
                            .attr('width', width)
                            .attr('height', height);

                        const root = d3.hierarchy({ children: policyGroups });

                        const treeLayout = d3.tree().size([height, width - 160]);
                        treeLayout(root);

                        // Nodes
                        const nodes = svg.append('g').attr('transform', 'translate(80,0)').selectAll('.node')
                            .data(root.descendants())
                            .enter().append('g')
                            .attr('class', 'node')
                            .attr('transform', d => `translate(${d.y},${d.x})`)
                            .on('click', d => console.log('Clicked on node:', d.data));

                        nodes.append('circle').attr('r', 5);

                        nodes.append('text')
                            .attr('dy', 3)
                            .attr('x', d => d.children ? -8 : 8)
                            .style('text-anchor', d => d.children ? 'end' : 'start')
                            .text(d => d.data.label);

                        // Links
                        svg.append('g').attr('transform', 'translate(80,0)').selectAll('.link')
                            .data(root.links())
                            .enter().append('path')
                            .attr('class', 'link')
                            .attr('d', d3.linkHorizontal()
                                .x(d => d.y)
                                .y(d => d.x));
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
