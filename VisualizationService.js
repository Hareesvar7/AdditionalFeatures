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
                <script src="https://d3js.org/d3.v7.min.js"></script>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .header {
                        background-color: #007bff;
                        color: white;
                        padding: 10px;
                        border-radius: 5px;
                        text-align: center;
                        margin-bottom: 10px;
                    }
                    #chart {
                        width: 80%;
                        height: 600px;
                        border: 1px solid black;
                    }
                </style>
            </head>
            <body>
                <div class="header">Visualize OPA Policy</div>
                <svg id="chart"></svg>
                <script>
                    const policyData = ${JSON.stringify(policyData)};
                    const svg = d3.select("#chart");
                    const width = svg.attr("width");
                    const height = svg.attr("height");

                    const nodes = policyData.map((d, i) => ({
                        id: d.id,
                        label: d.label,
                        x: Math.random() * width,
                        y: Math.random() * height
                    }));

                    const links = nodes.map((node, i) => {
                        if (i < nodes.length - 1) {
                            return { source: node, target: nodes[i + 1] };
                        }
                    }).filter(d => d); // Remove undefined links

                    // Add links (arrows) between nodes
                    svg.selectAll("line")
                        .data(links)
                        .enter().append("line")
                        .attr("x1", d => d.source.x)
                        .attr("y1", d => d.source.y)
                        .attr("x2", d => d.target.x)
                        .attr("y2", d => d.target.y)
                        .style("stroke", "#333");

                    // Add nodes
                    const node = svg.selectAll("circle")
                        .data(nodes)
                        .enter().append("g")
                        .attr("class", "node")
                        .attr("transform", d => `translate(${d.x}, ${d.y})`);

                    node.append("circle")
                        .attr("r", 20)
                        .style("fill", "#007bff");

                    node.append("text")
                        .attr("dy", ".35em")
                        .attr("text-anchor", "middle")
                        .style("fill", "white")
                        .text(d => d.label);

                    // Drag functionality
                    const drag = d3.drag()
                        .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended);

                    function dragstarted(event) {
                        d3.select(this).raise().classed("active", true);
                    }

                    function dragged(event, d) {
                        d3.select(this)
                            .attr("transform", `translate(${d.x = event.x}, ${d.y = event.y})`);
                    }

                    function dragended(event) {
                        d3.select(this).classed("active", false);
                    }

                    node.call(drag);
                </script>
            </body>
            </html>
        `;
    }
}

module.exports = VisualizationService;
