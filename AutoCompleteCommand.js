// src/commands/AutoCompleteCommand.js

const vscode = require('vscode');

// Function to create a snippet
function createSnippet(label, body) {
    const completionItem = new vscode.CompletionItem(label, vscode.CompletionItemKind.Snippet);
    completionItem.insertText = new vscode.SnippetString(body);
    return completionItem;
}

// Register auto-completion for AWS S3 policies
async function registerAutoCompletion(context) {
    const regoCompletionProvider = vscode.languages.registerCompletionItemProvider(
        { language: 'rego', scheme: 'file' },
        {
            provideCompletionItems(document, position) {
                const linePrefix = document.lineAt(position).text.substr(0, position.character);

                // Trigger suggestions when the package declaration is typed
                if (linePrefix === 'package aws.s3.policies') {
                    const snippets = [];

                    // Define your snippets
                    snippets.push(createSnippet(
                        'Enforce S3 Access Points in VPC Only',
                        `deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_s3_access_point"
    not resource.change.after.vpc_configuration
    msg = sprintf("S3 Access Point '%s' must be configured in a VPC", [resource.change.after.name])
}`
                    ));

                    snippets.push(createSnippet(
                        'Enforce Public Access Blocks on S3 Access Points',
                        `deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_s3_access_point"
    not resource.change.after.public_access_block
    msg = sprintf("S3 Access Point '%s' must have public access blocks enabled", [resource.change.after.name])
}`
                    ));

                    snippets.push(createSnippet(
                        'Enforce Account-Level Public Access Blocks',
                        `deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_s3_bucket"
    not resource.change.after.account_level_public_access_block
    msg = sprintf("S3 bucket '%s' must have account-level public access blocks enabled", [resource.change.after.bucket])
}`
                    ));

                    snippets.push(createSnippet(
                        'Prohibit ACLs on S3 Buckets',
                        `deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_s3_bucket"
    resource.change.after.acl != "private"
    msg = sprintf("S3 bucket '%s' must not use ACLs", [resource.change.after.bucket])
}`
                    ));

                    snippets.push(createSnippet(
                        'Prohibit Blacklisted Actions on S3 Buckets',
                        `deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_s3_bucket"
    action := resource.change.after.blacklisted_actions[_]
    msg = sprintf("S3 bucket '%s' contains blacklisted action '%s'", [resource.change.after.bucket, action])
}`
                    ));

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
