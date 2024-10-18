const vscode = require('vscode');
const PolicyVersioningService = require('./PolicyVersioningService');

class VersioningCommand {
    constructor(context) {
        this.context = context;
        this.policyFilePath = ''; // Set this to your current policy file path
        this.versioningService = new PolicyVersioningService(this.policyFilePath);
    }

    // Command to save a version
    saveVersion() {
        this.versioningService.saveVersion();
        vscode.window.showInformationMessage('Policy version saved successfully.');
    }

    // Command to list versions
    async listVersions() {
        const versions = this.versioningService.listVersions();
        if (versions.length === 0) {
            vscode.window.showInformationMessage('No versions found.');
            return;
        }
        
        const selectedVersion = await vscode.window.showQuickPick(
            versions.map(version => version.name),
            { placeHolder: 'Select a version to revert' }
        );

        if (selectedVersion) {
            const versionToRevert = versions.find(v => v.name === selectedVersion);
            this.versioningService.revertToVersion(versionToRevert.path);
            vscode.window.showInformationMessage(`Reverted to version: ${selectedVersion}`);
        }
    }
}

module.exports = VersioningCommand;
