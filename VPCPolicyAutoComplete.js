const vscode = require('vscode');

async function registerAutoCompletion(context) {
    const vpcCompletionProvider = vscode.languages.registerCompletionItemProvider(
        { language: 'rego', scheme: 'file' },
        {
            provideCompletionItems(document, position) {
                const linePrefix = document.lineAt(position).text.substr(0, position.character);

                // Trigger suggestions for VPC-specific rules when "package aws.vpc.policies" is typed
                if (linePrefix.startsWith('package aws.vpc.policies')) {
                    const snippets = [];

                    // 1. Enforce Default Security Group is Closed
                    const defaultSecurityGroupClosed = new vscode.CompletionItem('Enforce Default Security Group is Closed', vscode.CompletionItemKind.Snippet);
                    defaultSecurityGroupClosed.insertText = new vscode.SnippetString(
                        `deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_vpc"
    resource.change.after.default_security_group_open
    msg = sprintf("Default security group in VPC '%s' is not closed", [resource.change.after.name])
}`
                    );
                    snippets.push(defaultSecurityGroupClosed);

                    // 2. Enforce VPC Flow Logs Enabled
                    const vpcFlowLogsEnabled = new vscode.CompletionItem('Enforce VPC Flow Logs Enabled', vscode.CompletionItemKind.Snippet);
                    vpcFlowLogsEnabled.insertText = new vscode.SnippetString(
                        `deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_vpc"
    not resource.change.after.enable_flow_logs
    msg = sprintf("VPC '%s' does not have flow logs enabled", [resource.change.after.name])
}`
                    );
                    snippets.push(vpcFlowLogsEnabled);

                    // 3. Enforce Network ACL Unused Check
                    const networkAclUnusedCheck = new vscode.CompletionItem('Enforce Network ACL Unused Check', vscode.CompletionItemKind.Snippet);
                    networkAclUnusedCheck.insertText = new vscode.SnippetString(
                        `deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_network_acl"
    resource.change.after.is_used == false
    msg = sprintf("Network ACL '%s' is not in use", [resource.change.after.name])
}`
                    );
                    snippets.push(networkAclUnusedCheck);

                    // 4. Enforce VPC Peering DNS Resolution Check
                    const vpcPeeringDnsCheck = new vscode.CompletionItem('Enforce VPC Peering DNS Resolution Check', vscode.CompletionItemKind.Snippet);
                    vpcPeeringDnsCheck.insertText = new vscode.SnippetString(
                        `deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_vpc_peering_connection"
    not resource.change.after.allow_dns_resolution
    msg = sprintf("VPC Peering Connection '%s' does not allow DNS resolution", [resource.change.after.name])
}`
                    );
                    snippets.push(vpcPeeringDnsCheck);

                    // 5. Enforce Security Group Open Only to Authorized Ports
                    const securityGroupAuthorizedPorts = new vscode.CompletionItem('Enforce Security Group Open Only to Authorized Ports', vscode.CompletionItemKind.Snippet);
                    securityGroupAuthorizedPorts.insertText = new vscode.SnippetString(
                        `deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_security_group"
    resource.change.after.allowed_ports[_] not in ["22", "80", "443"]
    msg = sprintf("Security Group '%s' allows access to unauthorized port '%s'", [resource.change.after.name, resource.change.after.allowed_ports[_]])
}`
                    );
                    snippets.push(securityGroupAuthorizedPorts);

                    // 6. Enforce Security Group Port Restriction Check
                    const securityGroupPortCheck = new vscode.CompletionItem('Enforce Security Group Port Restriction Check', vscode.CompletionItemKind.Snippet);
                    securityGroupPortCheck.insertText = new vscode.SnippetString(
                        `deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_security_group"
    resource.change.after.allowed_ports[_] == "0"
    msg = sprintf("Security Group '%s' allows traffic on all ports (0)", [resource.change.after.name])
}`
                    );
                    snippets.push(securityGroupPortCheck);

                    // 7. Enforce VPN Tunnels Status Check
                    const vpnTunnelsStatusCheck = new vscode.CompletionItem('Enforce VPN Tunnels Status Check', vscode.CompletionItemKind.Snippet);
                    vpnTunnelsStatusCheck.insertText = new vscode.SnippetString(
                        `deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_vpn_connection"
    count(resource.change.after.tunnel_status) < 2
    msg = sprintf("VPN Connection '%s' does not have both tunnels up", [resource.change.after.name])
}`
                    );
                    snippets.push(vpnTunnelsStatusCheck);

                    // 8. Allow if no deny conditions are met
                    const allowIfNoDeny = new vscode.CompletionItem('Allow if no deny conditions are met', vscode.CompletionItemKind.Snippet);
                    allowIfNoDeny.insertText = new vscode.SnippetString(
                        `allow {
    not deny[_]
}`
                    );
                    snippets.push(allowIfNoDeny);

                    return snippets;
                }

                return undefined;
            }
        },
        ' ', '{' // Trigger suggestions when space or '{' is typed
    );

    context.subscriptions.push(vpcCompletionProvider);
}

module.exports = registerAutoCompletion;
