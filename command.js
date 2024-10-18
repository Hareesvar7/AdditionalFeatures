const vscode = require('vscode');
const yaml = require('js-yaml');

function convertRegoToJson(regoContent) {
    const resourceChanges = [];
    let policyMessage = "";

    const lines = regoContent.split('\n');

    lines.forEach(line => {
        // Match for resource type
        const resourceMatch = line.match(/resource := input.resource_changes_]/);
        if (resourceMatch) {
            const resourceObject = {
                type: null,
                change: {
                    after: {
                        vpc_configuration: null,
                        name: null
                    }
                }
            };

            const typeMatch = lines.find(l => l.includes('resource.type =='));
            if (typeMatch) {
                const typeRegex = /resource\.type == "(.*?)"/;
                const type = typeRegex.exec(typeMatch);
                if (type) {
                    resourceObject.type = type[1];
                }
            }

            resourceChanges.push(resourceObject);
        }

        if (line.includes('not resource.change.after.vpc_configuration')) {
            if (resourceChanges.length > 0) {
                resourceChanges[resourceChanges.length - 1].change.after.vpc_configuration = null;
            }
        }

        const msgMatch = line.match(/msg = sprintf"(.*?)", (.*?)/);
        if (msgMatch) {
            const messageTemplate = msgMatch[1];
            const resourceNameMatch = line.match(/resource.change.after.name/);
            if (resourceNameMatch && resourceChanges.length > 0) {
                const resourceName = resourceChanges[resourceChanges.length - 1].change.after.name || "example-s3-access-point";
                policyMessage = messageTemplate.replace("%s", resourceName);
            }
        }

        const nameMatch = line.match(/resource.change.after.name\s*=\s*"(.*?)"/);
        if (nameMatch) {
            const resourceName = nameMatch[1];
            if (resourceChanges.length > 0) {
                resourceChanges[resourceChanges.length - 1].change.after.name = resourceName;
            }
        }
    });

    const jsonOutput = {
        resource_changes: resourceChanges,
        policy: {
            deny: {
                msg: policyMessage || "No message available"
            }
        }
    };

    return jsonOutput;
}

async function convertPolicy(regoContent, format) {
    try {
        const convertedJson = convertRegoToJson(regoContent);
        let output;
        if (format === "yaml") {
            output = yaml.dump(convertedJson);
        } else {
            output = JSON.stringify(convertedJson, null, 2);
        }

        return { success: true, data: output };
    } catch (error) {
        console.error("Error during conversion:", error);
        return { success: false, message: "Failed to convert policy" };
    }
}

async function showConversionWebView(context) {
    const panel = vscode.window.createWebviewPanel(
        'convertPolicy',
        'Convert Rego Policy',
        vscode.ViewColumn.One,
        {
            enableScripts: true
        }
    );

    panel.webview.html = getWebviewContent();

    panel.webview.onDidReceiveMessage(async message => {
        switch (message.command) {
            case 'convert':
                const regoContent = message.regoContent;
                const format = message.format;

                const result = await convertPolicy(regoContent, format);
                panel.webview.postMessage(result);
                return;
        }
    });
}

function getWebviewContent() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            textarea { width: 100%; height: 200px; }
            select { width: 100%; margin: 10px 0; }
            button { padding: 10px; background-color: #007acc; color: white; border: none; cursor: pointer; }
            button:hover { background-color: #005fa3; }
            .output { margin-top: 20px; padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9; }
        </style>
    </head>
    <body>
        <h1>Convert Rego Policy</h1>
        <textarea id="regoInput" placeholder="Paste your Rego policy here..."></textarea>
        <select id="format">
            <option value="json">JSON</option>
            <option value="yaml">YAML</option>
        </select>
        <button id="convertButton">Convert</button>
        <h2>Converted Output</h2>
        <div class="output" id="outputBox"></div>
        <button id="copyButton">Copy to Clipboard</button>

        <script>
            const vscode = acquireVsCodeApi();

            document.getElementById('convertButton').addEventListener('click', () => {
                const regoContent = document.getElementById('regoInput').value;
                const format = document.getElementById('format').value;

                vscode.postMessage({ command: 'convert', regoContent, format });
            });

            window.addEventListener('message', event => {
                const message = event.data;
                if (message.success) {
                    document.getElementById('outputBox').innerText = message.data;
                } else {
                    document.getElementById('outputBox').innerText = message.message;
                }
            });

            document.getElementById('copyButton').addEventListener('click', () => {
                const outputBox = document.getElementById('outputBox');
                navigator.clipboard.writeText(outputBox.innerText).then(() => {
                    alert('Copied to clipboard!');
                }).catch(err => {
                    alert('Failed to copy: ', err);
                });
            });
        </script>
    </body>
    </html>`;
}

module.exports = { showConversionWebView };
