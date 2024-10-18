// src/Extension.js
const activateLinting = require('./commands/LintingCommand');

function activate(context) {
    activateLinting(context); // Activating live linting for Rego files
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
