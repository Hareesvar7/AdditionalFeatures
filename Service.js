const fs = require('fs');
const path = require('path');

class PolicyVersioningService {
    static async savePolicyVersion(filePath) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');

            // Create a versioning directory in the user's Downloads/opaVersion directory
            const versioningDir = path.join(process.env.HOME || process.env.USERPROFILE, 'Downloads', 'opaVersion');
            if (!fs.existsSync(versioningDir)) {
                fs.mkdirSync(versioningDir, { recursive: true });
            }

            // Get the current timestamp for versioning
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Format: YYYY-MM-DDTHH-mm-ss
            const fileName = path.basename(filePath, '.rego');
            const versionedFilePath = path.join(versioningDir, `${fileName}_v${timestamp}.rego`);

            // Save the versioned policy file
            fs.writeFileSync(versionedFilePath, fileContent);
            return versionedFilePath; // Return the path of the saved version
        } catch (error) {
            console.error('Error saving policy version:', error);
            return null;
        }
    }
}

module.exports = PolicyVersioningService;
