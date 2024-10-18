// src/Extension.js

const { saveFile, generateReport, logAuditAction } = require('./commands/command');

function activate(context) {
    // Example command to save a file
    let saveFileCommand = {
        command: 'extension.saveFile',
        callback: () => {
            const fileContent = "Your file content here"; // Replace with actual content
            saveFile(fileContent); // Call the save function
            logAuditAction('Triggered save file command.'); // Log the command execution
        },
    };

    // Example command to generate a compliance report
    let generateReportCommand = {
        command: 'extension.generateReport',
        callback: () => {
            const reportContent = "Your report content here"; // Replace with actual report content
            generateReport(reportContent); // Call the report generation function
            logAuditAction('Triggered generate report command.'); // Log the command execution
        },
    };

    context.subscriptions.push(saveFileCommand, generateReportCommand);
}

function deactivate() {
    // Clean up if necessary
}

module.exports = {
    activate,
    deactivate,
};
