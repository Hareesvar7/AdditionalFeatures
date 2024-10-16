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
                    const width = 800;
                    const height = 600;
                    const radius = 40;

                    svg.attr("width", width).attr("height", height);

                    const nodes = policyData.map((d, i) => ({
                        id: d.id,
                        label: d.label,
                        x: 100 + i * 150,
                        y: 100 + (i % 2) * 150
                    }));

                    const links = nodes.map((_, i) => {
                        if (i < nodes.length - 1) {
                            return { source: nodes[i], target: nodes[i + 1] };
                        }
                    }).filter(d => d);

                    const link = svg.selectAll(".link")
                        .data(links)
                        .enter()
                        .append("line")
                        .attr("x1", d => d.source.x)
                        .attr("y1", d => d.source.y)
                        .attr("x2", d => d.target.x)
                        .attr("y2", d => d.target.y)
                        .style("stroke", "#333")
                        .style("stroke-width", 2);

                    const node = svg.selectAll(".node")
                        .data(nodes)
                        .enter()
                        .append("g")
                        .attr("class", "node")
                        .attr("transform", d => `translate(${d.x}, ${d.y})`);

                    node.append("circle")
                        .attr("r", radius)
                        .style("fill", "#007bff");

                    node.append("text")
                        .attr("dy", ".35em")
                        .attr("text-anchor", "middle")
                        .style("fill", "white")
                        .text(d => d.label);

                    const drag = d3.drag()
                        .on("start", function (event, d) {
                            d3.select(this).raise().classed("active", true);
                        })
                        .on("drag", function (event, d) {
                            d.x = event.x;
                            d.y = event.y;
                            d3.select(this).attr("transform", `translate(${d.x}, ${d.y})`);
                            link.attr("x1", d => d.source.x)
                                .attr("y1", d => d.source.y)
                                .attr("x2", d => d.target.x)
                                .attr("y2", d => d.target.y);
                        })
                        .on("end", function () {
                            d3.select(this).classed("active", false);
                        });

                    node.call(drag);
                </script>
            </body>
            </html>
        `;
    }
}

module.exports = VisualizationService;
