const fs = require('fs');
const path = require('path');

const policyVersionDirectory = path.join(process.env.HOME || process.env.USERPROFILE, 'Downloads', 'opaVersion');

// Ensure the directory exists
if (!fs.existsSync(policyVersionDirectory)) {
    fs.mkdirSync(policyVersionDirectory, { recursive: true });
}

async function savePolicyVersion(filePath, versionedFileName) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const versionedFilePath = path.join(policyVersionDirectory, versionedFileName);
        
        fs.writeFileSync(versionedFilePath, fileContent);
        return true;
    } catch (error) {
        console.error(`Error saving policy version: ${error.message}`);
        return false;
    }
}

async function getSavedPolicyVersions() {
    try {
        const files = fs.readdirSync(policyVersionDirectory);
        return files.filter(file => file.endsWith('.rego')); // Return only .rego files
    } catch (error) {
        console.error(`Error reading policy versions: ${error.message}`);
        return [];
    }
}

module.exports = {
    savePolicyVersion,
    getSavedPolicyVersions,
};
