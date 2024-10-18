// src/services/VisualizationService.js

class VisualizationService {
    static getVisualizationHTML() {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Policy Visualization</title>
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
                    const { Button, TextField, Container, Typography, Snackbar } = window['@mui/material'];

                    const App = () => {
                        const [fileContent, setFileContent] = React.useState('');
                        const [error, setError] = React.useState('');
                        const [snackbarOpen, setSnackbarOpen] = React.useState(false);

                        const handleFileUpload = (event) => {
                            const file = event.target.files[0];
                            if (file && file.name.endsWith('.rego')) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    const content = e.target.result;
                                    setFileContent(content);
                                    setError('');
                                    setSnackbarOpen(true);
                                };
                                reader.readAsText(file);
                            } else {
                                setError('Please upload a valid .rego file.');
                                setSnackbarOpen(true);
                            }
                        };

                        return h(Container, { maxWidth: "md" },
                            h(Typography, { variant: "h4", gutterBottom: true }, "Upload and Visualize OPA Policies"),
                            h(TextField, {
                                type: "file",
                                onChange: handleFileUpload,
                                variant: "outlined",
                                fullWidth: true,
                            }),
                            h('pre', { style: { whiteSpace: 'pre-wrap', backgroundColor: '#fff', padding: '10px', borderRadius: '4px', marginTop: '20px' } }, fileContent),
                            h(Snackbar, {
                                open: snackbarOpen,
                                onClose: () => setSnackbarOpen(false),
                                message: error || "File uploaded successfully!",
                                autoHideDuration: 3000,
                            })
                        );
                    };

                    createRoot(document.getElementById('root')).render(h(App));
                </script>
            </body>
            </html>
        `;
    }
}

module.exports = VisualizationService;
