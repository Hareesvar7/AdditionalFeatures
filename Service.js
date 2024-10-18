const fs = require('fs');
const path = require('path');

class PolicyVersioningService {
    constructor(policyFilePath) {
        this.policyFilePath = policyFilePath;
        this.versionsDir = path.join(path.dirname(policyFilePath), 'versions');
        
        // Create versions directory if it doesn't exist
        if (!fs.existsSync(this.versionsDir)) {
            fs.mkdirSync(this.versionsDir);
        }
    }

    // Save the current policy as a new version
    saveVersion() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const versionPath = path.join(this.versionsDir, `policy-${timestamp}.rego`);
        fs.copyFileSync(this.policyFilePath, versionPath);
        return versionPath;
    }

    // List all saved versions
    listVersions() {
        return fs.readdirSync(this.versionsDir)
            .filter(file => file.endsWith('.rego'))
            .map(file => ({
                name: file,
                path: path.join(this.versionsDir, file),
            }));
    }

    // Revert to a specific version
    revertToVersion(versionFile) {
        fs.copyFileSync(versionFile, this.policyFilePath);
    }
}

module.exports = PolicyVersioningService;
