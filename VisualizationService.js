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
                policyData.push({ action: 'Deny', label: trimmedLine });
            } else if (trimmedLine.startsWith('allow')) {
                policyData.push({ action: 'Allow', label: trimmedLine });
            } else if (trimmedLine.includes('resource.type')) {
                const resourceType = this.extractResourceType(trimmedLine);
                policyData.push({ action: 'Resource Type', label: resourceType });
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
        const labels = policyData.map(item => item.label);
        const actions = policyData.map(item => item.action);
        
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
                        flex-direction: column;
                        align-items: center;
                    }
                    .chart-container {
                        width: 80%;
                        max-width: 800px;
                        margin-top: 20px;
                    }
                    .header {
                        background-color: #007bff;
                        color: white;
                        padding: 10px;
                        border-radius: 5px;
                        text-align: center;
                        width: 100%;
                        margin: 20px 0;
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
                    const policyChart = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: ${JSON.stringify(labels)},
                            datasets: [{
                                label: 'Policy Actions',
                                data: ${JSON.stringify(actions.map(action => action === 'Deny' ? 1 : action === 'Allow' ? 1 : 0))},
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.2)',
                                    'rgba(54, 162, 235, 0.2)',
                                    'rgba(255, 206, 86, 0.2)',
                                ],
                                borderColor: [
                                    'rgba(255, 99, 132, 1)',
                                    'rgba(54, 162, 235, 1)',
                                    'rgba(255, 206, 86, 1)',
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }
                    });
                </script>
            </body>
            </html>
        `;
    }
}

module.exports = VisualizationService;
