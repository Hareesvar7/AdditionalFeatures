// src/services/VisualizationService.js

const fs = require('fs');

class VisualizationService {
    static async getPolicies(filePath) {
        try {
            // Read the Rego file
            const policies = fs.readFileSync(filePath, 'utf8');
            // Process the policies into a format suitable for visualization
            return this.processPolicies(policies);
        } catch (err) {
            console.error("Error reading policies:", err);
            return null;
        }
    }

    static processPolicies(policies) {
        const lines = policies.split('\n');
        const policyGroups = [];
        let currentDeny = '';
        let currentPolicy = [];

        lines.forEach((line) => {
            const trimmedLine = line.trim();

            // Capture deny statements
            if (trimmedLine.startsWith('deny')) {
                if (currentPolicy.length) {
                    policyGroups.push(currentPolicy);
                    currentPolicy = [];
                }
                currentDeny = trimmedLine.split('{')[0].trim(); // Get the deny message
                currentPolicy.push({ id: currentDeny, label: currentDeny });
            }

            // Check for resource type
            if (currentDeny && trimmedLine.includes('resource')) {
                const resourceType = this.extractResourceType(trimmedLine);
                currentPolicy.push({ id: `Check if resource type is ${resourceType}`, label: `Check if resource type is ${resourceType}` });
            }

            // Check for VPC configuration
            if (currentDeny && trimmedLine.includes('vpc_configuration')) {
                currentPolicy.push({ id: 'Check if VPC configuration exists', label: 'Check if VPC configuration exists' });
            }
        });

        if (currentPolicy.length) {
            policyGroups.push(currentPolicy);
        }

        return policyGroups;
    }

    static extractResourceType(line) {
        const match = line.match(/resource\.type == "(.*?)"/);
        return match ? match[1] : 'unknown';
    }

    static getVisualizationHTML(policyGroups) {
        const chartData = this.prepareChartData(policyGroups);

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Policy Visualization</title>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
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
                        background-color: #007bff; /* Blue color for header */
                        color: white;
                        padding: 10px;
                        border-radius: 5px;
                        text-align: center;
                        width: 80%;
                        max-width: 800px;
                        margin: 20px auto; /* Centering */
                        box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
                    }
                    .chart-container {
                        width: 80%; /* Adjust width as necessary */
                        max-width: 800px; /* Maximum width */
                        margin: 20px auto; /* Centering */
                    }
                </style>
            </head>
            <body>
                <div class="header">Visualize OPA Policy</div>
                <div class="chart-container">
                    <canvas id="policyChart"></canvas>
                </div>
                <script>
                    const ctx = document.getElementById('policyChart').getContext('2d');
                    const data = ${JSON.stringify(chartData)};
                    const config = {
                        type: 'bar', // You can change this type to 'tree', 'bar', etc.
                        data: data,
                        options: {
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }
                    };
                    const policyChart = new Chart(ctx, config);
                </script>
            </body>
            </html>
        `;
    }

    static prepareChartData(policyGroups) {
        // Prepare data for Chart.js format, assuming a bar chart for now.
        const labels = [];
        const datasets = [];

        policyGroups.forEach(group => {
            group.forEach(policy => {
                labels.push(policy.label);
            });
        });

        datasets.push({
            label: 'Policies',
            data: policyGroups.map(group => group.length),
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        });

        return {
            labels: labels,
            datasets: datasets
        };
    }
}

module.exports = VisualizationService;
