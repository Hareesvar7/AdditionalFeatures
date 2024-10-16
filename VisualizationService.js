// src/services/VisualizationService.js

const fs = require('fs');

class VisualizationService {
    static async getPoliciesFromFile(filePath) {
        try {
            // Read the policies file
            const policiesContent = fs.readFileSync(filePath, 'utf8');

            // Process the policies into a format suitable for visualization (e.g., JSON)
            return this.processPolicies(policiesContent);
        } catch (err) {
            console.error("Error reading policies:", err);
            return null;
        }
    }

    static processPolicies(policies) {
        // Convert policies into a format suitable for visualization (e.g., nodes/links for graphs)
        const processedData = {
            nodes: [],
            links: []
        };

        // Logic to parse the policies and fill nodes for visualization
        const lines = policies.split('\n');
        lines.forEach((line, index) => {
            if (line.trim() !== '') {
                processedData.nodes.push({ id: `policy_${index}`, name: line.trim() });
            }
        });

        return processedData;
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

                    node.append("title")
                        .text(d => d.name);

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
