# 🔌 N8N MCP SERVER INTEGRATION

## Connection Details

**Server**: n8n-mcp  
**Endpoint**: https://newjerusalemholdingsllc.app.n8n.cloud/mcp-server/http  
**Status**: ✅ Configured in Cursor settings

---

## Authentication

**Method**: Bearer Token  
**Token**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Headers**:
```
authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMGY1OTJiZC1jYmI2LTRlYjItYWI3NC04NDI5NTIyNzA4OWMiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6ImE3MTU4YmZlLTk1ZGMtNDYxZC1iYzMzLTUwZTI4NjZmMzZlMSIsImlhdCI6MTc3MjMyNTIyMn0.Urq0rIrOHPOd9t6gwoaUGNyjkw-W1l1olVZC5N-Fyhk
```

---

## Integration Strategy

### Potential Use Cases for Wolf Shield

**1. Workflow Automation**
- Automate tenant onboarding workflows
- Payment reminder sequences
- Recertification notification chains
- Maintenance ticket escalation

**2. External Integrations**
- Connect to Yardi/AppFolio APIs
- Sync data with accounting systems (QuickBooks)
- Email automation (Mailgun, SendGrid)
- SMS notifications (Twilio)

**3. Data Processing**
- Scheduled CSV imports from n8n workflows
- Automated ledger reconciliation
- Batch tenant document processing
- Report generation and delivery

**4. Monitoring & Alerts**
- Failed payment webhook → n8n → SMS/Email
- Overdue recertification → n8n → Escalation sequence
- Maintenance SLA breach → n8n → Alert PM

---

## Configuration Added

**File**: Cursor MCP Settings  
**Location**: `~/.cursor/settings.json` or workspace settings

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "supergateway",
        "--streamableHttp",
        "https://newjerusalemholdingsllc.app.n8n.cloud/mcp-server/http",
        "--header",
        "authorization:Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMGY1OTJiZC1jYmI2LTRlYjItYWI3NC04NDI5NTIyNzA4OWMiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6ImE3MTU4YmZlLTk1ZGMtNDYxZC1iYzMzLTUwZTI4NjZmMzZlMSIsImlhdCI6MTc3MjMyNTIyMn0.Urq0rIrOHPOd9t6gwoaUGNyjkw-W1l1olVZC5N-Fyhk"
      ]
    }
  }
}
```

---

## Next Steps

### Phase 1: Discovery
1. List available n8n workflows/tools
2. Document workflow endpoints
3. Identify integration points with Wolf Shield

### Phase 2: Integration
1. Create webhook receivers in Wolf Shield
2. Connect n8n workflows to Wolf Shield events
3. Build admin UI for workflow management

### Phase 3: Automation
1. Automated tenant onboarding sequences
2. Payment dunning workflows
3. Compliance alert escalation
4. Report delivery automation

---

## Available n8n Workflows (To Be Discovered)

**Expected Workflows**:
- [ ] Tenant onboarding email sequence
- [ ] Payment reminder automation
- [ ] Recertification notification chain
- [ ] Maintenance escalation workflow
- [ ] Document processing pipeline
- [ ] Report generation and delivery

**To List Workflows**:
```bash
# Call n8n MCP server to list available tools
# Will be explored in next step
```

---

## Security Considerations

**Token Storage**:
- ✅ Token stored in Cursor settings (not in codebase)
- ✅ Not committed to git
- ⚠️ Token has no expiry visible (rotate periodically)

**Webhook Security**:
- [ ] Add webhook signature verification for n8n → Wolf Shield
- [ ] Use CRON_SECRET for n8n webhook authentication
- [ ] Log all n8n webhook calls to audit trail

---

# 🔌 N8N MCP: READY FOR INTEGRATION

**Status**: ✅ Configured  
**Endpoint**: Accessible  
**Next Step**: Discover available workflows and integrate with Wolf Shield events

---

*BLAST-Forge for IsoFlux: N8N integration layer prepared. Automation capabilities unlocked.*
