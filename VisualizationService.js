// src/services/VisualizationService.js

const fs = require('fs');
const path = require('path');

class VisualizationService {
    static async getPolicies(filePath) {
        try {
            // Read the contents of the selected .rego file
            const policies = fs.readFileSync(filePath, 'utf8');
            return this.processPolicies(policies);
        } catch (err) {
            console.error("Error reading policies:", err);
            return null;
        }
    }

    static processPolicies(policies) {
        // Split the policies into lines for processing
        const lines = policies.split('\n');
        const nodes = [];
        const links = [];
        
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('deny')) {
                const denyMsg = trimmedLine.split('{')[0].trim(); // Get the deny message
                nodes.push({ id: denyMsg, label: denyMsg });
                if (lines[index + 1]) {
                    const nextLine = lines[index + 1].trim();
                    if (nextLine.startsWith('resource')) {
                        nodes.push({ id: 'Check Resource Type', label: 'Check Resource Type' });
                        links.push({ source: denyMsg, target: 'Check Resource Type' });
                    }
                }
            }

            // Additional parsing logic can be added here for other rules
        });

        return { nodes, links };
    }

    static getVisualizationHTML(policyData) {
        // HTML structure for webview visualization
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Policy Visualization</title>
                <style>
                    #graph { width: 100%; height: 500px; }
                </style>
            </head>
            <body>
                <h1>OPA Policy Visualization</h1>
                <div id="graph"></div>
                <script src="https://d3js.org/d3.v7.min.js"></script>
                <script>
                    const nodes = ${JSON.stringify(policyData.nodes)};
                    const links = ${JSON.stringify(policyData.links)};

                    // Use D3.js to render the graph
                    const width = 800, height = 500;
                    const svg = d3.select("#graph").append("svg")
                        .attr("width", width)
                        .attr("height", height);

                    const simulation = d3.forceSimulation(nodes)
                        .force("link", d3.forceLink(links).id(d => d.id))
                        .force("charge", d3.forceManyBody())
                        .force("center", d3.forceCenter(width / 2, height / 2));

                    const link = svg.append("g")
                        .selectAll("line")
                        .data(links)
                        .enter().append("line")
                        .attr("stroke-width", 2);

                    const node = svg.append("g")
                        .selectAll("circle")
                        .data(nodes)
                        .enter().append("circle")
                        .attr("r", 5)
                        .attr("fill", "blue");

                    node.append("title").text(d => d.label);

                    simulation.on("tick", () => {
                        link
                            .attr("x1", d => d.source.x)
                            .attr("y1", d => d.source.y)
                            .attr("x2", d => d.target.x)
                            .attr("y2", d => d.target.y);

                        node
                            .attr("cx", d => d.x)
                            .attr("cy", d => d.y);
                    });
                </script>
            </body>
            </html>
        `;
    }
}

module.exports = VisualizationService;
