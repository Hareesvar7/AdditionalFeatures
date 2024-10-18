// src/commands/AutoCompleteCommand.js

const vscode = require('vscode');

async function registerAutoCompletion(context) {
    const regoCompletionProvider = vscode.languages.registerCompletionItemProvider(
        { language: 'rego', scheme: 'file' },
        {
            provideCompletionItems(document, position) {
                const linePrefix = document.lineAt(position).text.substr(0, position.character);

                // Trigger suggestions for S3-specific rules when "package aws.s3.policies" is typed
                if (linePrefix.startsWith('package aws.s3.policies')) {
                    const snippets = [];

                    // 1. Enforce S3 Access Points in VPC Only
                    const s3AccessPointInVPC = new vscode.CompletionItem('Enforce S3 Access Points in VPC Only', vscode.CompletionItemKind.Snippet);
                    s3AccessPointInVPC.insertText = new vscode.SnippetString(
                        `deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_s3_access_point"
    not resource.change.after.vpc_configuration
    msg = sprintf("S3 Access Point '%s' must be configured in a VPC", [resource.change.after.name])
}`);
                    snippets.push(s3AccessPointInVPC);

                    // 2. Enforce Public Access Blocks on S3 Access Points
                    const publicAccessBlocks = new vscode.CompletionItem('Enforce Public Access Blocks on S3 Access Points', vscode.CompletionItemKind.Snippet);
                    publicAccessBlocks.insertText = new vscode.SnippetString(
                        `deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_s3_access_point"
    not resource.change.after.public_access_block
    msg = sprintf("S3 Access Point '%s' must have public access blocks enabled", [resource.change.after.name])
}`);
                    snippets.push(publicAccessBlocks);

                    // 3. Enforce Account-Level Public Access Blocks
                    const accountLevelPublicAccess = new vscode.CompletionItem('Enforce Account-Level Public Access Blocks', vscode.CompletionItemKind.Snippet);
                    accountLevelPublicAccess.insertText = new vscode.SnippetString(
                        `deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_s3_bucket"
    not resource.change.after.account_level_public_access_block
    msg = sprintf("S3 bucket '%s' must have account-level public access blocks enabled", [resource.change.after.bucket])
}`);
                    snippets.push(accountLevelPublicAccess);

                    // 4. Prohibit ACLs on S3 Buckets
                    const prohibitACLs = new vscode.CompletionItem('Prohibit ACLs on S3 Buckets', vscode.CompletionItemKind.Snippet);
                    prohibitACLs.insertText = new vscode.SnippetString(
                        `deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_s3_bucket"
    resource.change.after.acl != "private"
    msg = sprintf("S3 bucket '%s' must not use ACLs", [resource.change.after.bucket])
}`);
                    snippets.push(prohibitACLs);

                    // 5. Prohibit Blacklisted Actions on S3 Buckets
                    const blacklistedActions = new vscode.CompletionItem('Prohibit Blacklisted Actions on S3 Buckets', vscode.CompletionItemKind.Snippet);
                    blacklistedActions.insertText = new vscode.SnippetString(
                        `deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_s3_bucket"
    action := resource.change.after.blacklisted_actions[_]
    msg = sprintf("S3 bucket '%s' contains blacklisted action '%s'", [resource.change.after.bucket, action])
}`);
                    snippets.push(blacklistedActions);

                    return snippets;
                }

                return undefined;
            }
        },
        ' ', '{' // Trigger suggestions when space or '{' is typed
    );

    context.subscriptions.push(regoCompletionProvider);
}

module.exports = registerAutoCompletion;
