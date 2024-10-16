// src/services/VisualizationService.js

const fs = require('fs');

class VisualizationService {
    static async getPolicies(filePath) {
        try {
            // Load the OPA policy from the selected Rego file
            const policies = fs.readFileSync(filePath, 'utf8');
            return this.processPolicies(policies);
        } catch (err) {
            console.error("Error reading policies:", err);
            return null;
        }
    }

    static processPolicies(policies) {
        const nodes = [];
        const links = [];

        // Example parsing logic - this needs to be adapted to fit your policy structure
        const lines = policies.split('\n');
        let currentDenyPolicy = '';

        lines.forEach(line => {
            line = line.trim();
            // Detect the "deny" rule
            if (line.startsWith('deny')) {
                // Extract the policy name
                const policyName = line.split('[')[0].trim();
                currentDenyPolicy = policyName;
                nodes.push({ id: policyName, label: `Deny S3 Access Point if not in VPC` });
            }

            // Check for resource type declaration
            if (line.includes('resource')) {
                const resourceCondition = line.match(/resource\.type == "([^"]+)"/);
                if (resourceCondition) {
                    const resourceType = resourceCondition[1];
                    const resourceNode = `Check if resource type is ${resourceType}`;
                    nodes.push({ id: resourceNode, label: resourceNode });
                    links.push({ source: currentDenyPolicy, target: resourceNode });
                }
            }

            // Check for VPC configuration check
            if (line.includes('not resource.change.after.vpc_configuration')) {
                const vpcCheckNode = `Check if VPC configuration exists`;
                nodes.push({ id: vpcCheckNode, label: vpcCheckNode });
                links.push({ source: currentDenyPolicy, target: vpcCheckNode });
            }
        });

        return { nodes, links };
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
            </head>
            <body>
                <h1>OPA Policy Visualization</h1>
                <div id="graph"></div>
                <script src="https://d3js.org/d3.v7.min.js"></script>
                <script>
                    const nodes = ${JSON.stringify(policyData.nodes)};
                    const links = ${JSON.stringify(policyData.links)};

                    const width = 800, height = 500;
                    const svg = d3.select("#graph").append("svg")
                        .attr("width", width)
                        .attr("height", height);

                    const simulation = d3.forceSimulation(nodes)
                        .force("link", d3.forceLink().id(d => d.id).distance(100))
                        .force("charge", d3.forceManyBody().strength(-300))
                        .force("center", d3.forceCenter(width / 2, height / 2));

                    const link = svg.append("g")
                        .selectAll("line")
                        .data(links)
                        .enter().append("line")
                        .attr("stroke-width", 2)
                        .attr("stroke", "#999");

                    const node = svg.append("g")
                        .selectAll("circle")
                        .data(nodes)
                        .enter().append("circle")
                        .attr("r", 10)
                        .attr("fill", "blue")
                        .on("mouseover", (event, d) => {
                            d3.select(event.target).attr("fill", "orange");
                        })
                        .on("mouseout", (event, d) => {
                            d3.select(event.target).attr("fill", "blue");
                        });

                    node.append("title")
                        .text(d => d.label);

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
