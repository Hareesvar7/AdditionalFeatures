const { exec } = require('child_process');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');

class ComplianceReportService {
    static async generateReport(planPath, policyPath) {
        return new Promise((resolve, reject) => {
            const command = `opa eval -i ${planPath} -d ${policyPath} "data" --format=json`;

            exec(command, (error, stdout, stderr) => {
                if (error || stderr) {
                    return resolve(null);
                }

                const evaluationResult = JSON.parse(stdout);
                const reportPath = path.join(__dirname, '../reports', 'compliance-report.pdf');
                ComplianceReportService.createPdfReport(evaluationResult, reportPath)
                    .then(() => resolve(reportPath))
                    .catch(err => {
                        console.error(err);
                        resolve(null);
                    });
            });
        });
    }

    static createPdfReport(result, reportPath) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const writeStream = fs.createWriteStream(reportPath);
            doc.pipe(writeStream);

            // PDF Title
            doc.fontSize(20).text('Compliance Report', { align: 'center' });
            doc.moveDown();

            // Table Header
            doc.fontSize(14).text('Policy', { continued: true }).text('Status');
            doc.moveDown();

            const policyResults = result.result[0].expressions[0].value;

            let passedPolicies = 0;
            let failedPolicies = 0;

            // List Policy Results
            Object.keys(policyResults).forEach(policyName => {
                const policyStatus = policyResults[policyName] ? 'Passed' : 'Failed';
                doc.text(`${policyName} - ${policyStatus}`);
                if (policyResults[policyName]) {
                    passedPolicies++;
                } else {
                    failedPolicies++;
                }
            });

            // Summary
            doc.moveDown();
            doc.text(`Total Passed: ${passedPolicies}`);
            doc.text(`Total Failed: ${failedPolicies}`);

            doc.end();

            writeStream.on('finish', () => {
                resolve();
            });

            writeStream.on('error', (err) => {
                reject(err);
            });
        });
    }
}

module.exports = ComplianceReportService;
