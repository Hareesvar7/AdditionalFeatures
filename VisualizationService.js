// src/services/VisualizationService.js

const fs = require('fs');
const path = require('path');

class VisualizationService {
    static async getPolicies(filePath) {
        try {
            // Read the Rego file
            const policies = fs.readFileSync(filePath, 'utf8');
            // Process the policies into a format suitable for visualization (e.g., JSON)
            return this.processPolicies(policies);
        } catch (err) {
            console.error("Error reading policies:", err);
            return null;
        }
    }

    static processPolicies(policies) {
        const lines = policies.split('\n');
        const nodes = [];
        const links = [];
        let currentDeny = '';

        lines.forEach((line) => {
            const trimmedLine = line.trim();

            // Capture deny statements
            if (trimmedLine.startsWith('deny')) {
                currentDeny = trimmedLine.split('{')[0].trim(); // Get the deny message
                nodes.push({ id: currentDeny, label: currentDeny });
            }

            // Check for resource type
            if (currentDeny && trimmedLine.includes('resource')) {
                const resourceType = this.extractResourceType(trimmedLine);
                const resourceNode = `Check if resource type is ${resourceType}`;
                nodes.push({ id: resourceNode, label: resourceNode });
                links.push({ source: currentDeny, target: resourceNode });
            }

            // Check for VPC configuration
            if (currentDeny && trimmedLine.includes('not resource.change.after.vpc_configuration')) {
                const vpcNode = 'Check if VPC configuration exists';
                nodes.push({ id: vpcNode, label: vpcNode });
                links.push({ source: currentDeny, target: vpcNode });
            }
        });

        return { nodes, links };
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
                <style>
                    #graph { width: 100%; height: 500px; }
                </style>
                <!-- Load D3.js from a CDN -->
                <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.0.0/d3.min.js"></script>
            </head>
            <body>
                <h1>OPA Policy Visualization</h1>
                <div id="graph"></div>
                <script>
                    const nodes = ${JSON.stringify(policyData.nodes)};
                    const links = ${JSON.stringify(policyData.links)};

                    const width = 800, height = 500;
                    const svg = d3.select("#graph").append("svg")
                        .attr("width", width)
                        .attr("height", height);

                    const simulation = d3.forceSimulation(nodes)
                        .force("link", d3.forceLink().id(d => d.id).distance(50))
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
                        .attr("fill", "blue")
                        .call(d3.drag()
                            .on("start", dragstarted)
                            .on("drag", dragged)
                            .on("end", dragended));

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

                    function dragstarted(event, d) {
                        if (!event.active) simulation.alphaTarget(0.3).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                    }

                    function dragged(event, d) {
                        d.fx = event.x;
                        d.fy = event.y;
                    }

                    function dragended(event, d) {
                        if (!event.active) simulation.alphaTarget(0);
                        d.fx = null;
                        d.fy = null;
                    }
                </script>
            </body>
            </html>
        `;
    }
}

module.exports = VisualizationService;
