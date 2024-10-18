// src/services/VisualizationService.js

const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

class VisualizationService {
    static getVisualizationHTML() {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Policy Visualization</title>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap">
                <link rel="stylesheet" href="https://unpkg.com/@mui/material@5.2.0/umd/material-ui.production.min.css">
                <script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
                <script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
                <script src="https://unpkg.com/@mui/material@5.2.0/umd/material-ui.production.min.js"></script>
                <style>
                    body {
                        font-family: 'Roboto', sans-serif;
                        margin: 0;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }
                    #root {
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div id="root"></div>
                <script>
                    const { createElement: h } = React;
                    const { createRoot } = ReactDOM;
                    const { Button, TextField, Container, Typography } = window['@mui/material'];

                    const App = () => {
                        const [fileContent, setFileContent] = React.useState('');
                        const [error, setError] = React.useState('');

                        const handleFileUpload = async (event) => {
                            const file = event.target.files[0];
                            if (file && file.name.endsWith('.rego')) {
                                const reader = new FileReader();
                                reader.onload = async (e) => {
                                    const content = e.target.result;
                                    const response = await fetch('/visualize', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ content })
                                    });
                                    const result = await response.json();
                                    setFileContent(JSON.stringify(result, null, 2));
                                };
                                reader.readAsText(file);
                            } else {
                                setError('Please upload a valid .rego file.');
                            }
                        };

                        return h(Container, { maxWidth: "md" },
                            h(Typography, { variant: "h4", gutterBottom: true }, "Upload and Visualize OPA Policies"),
                            h(TextField, {
                                type: "file",
                                onChange: handleFileUpload,
                                variant: "outlined",
                                fullWidth: true,
                                helperText: error,
                            }),
                            h(Button, {
                                variant: "contained",
                                color: "primary",
                                style: { marginTop: '20px' },
                                onClick: () => {
                                    // Here you could also handle visualization logic if needed
                                }
                            }, "Visualize Policies"),
                            h('pre', { style: { whiteSpace: 'pre-wrap' } }, fileContent)
                        );
                    };

                    createRoot(document.getElementById('root')).render(h(App));
                </script>
            </body>
            </html>
        `;
    }

    static async processPolicies(content) {
        // Implement your logic to process the .rego content and return structured data
        // For demonstration, let's return the content as is for now
        return { policies: content.split('\n').filter(line => line.trim() !== '') };
    }

    // Add express server setup for handling requests
    static startServer() {
        const app = express();
        app.use(bodyParser.json());

        app.post('/visualize', async (req, res) => {
            const { content } = req.body;
            // Process the content of the .rego file and generate the visualization data
            const policies = await this.processPolicies(content); // Make sure to implement processPolicies to handle string input
            res.json(policies);
        });

        const PORT = 3000; // Choose a port
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    }
}

// Start the server when the extension is activated
VisualizationService.startServer();

module.exports = VisualizationService;
