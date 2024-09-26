import api, { storage,route } from "@forge/api";
import ForgeUI, { render, Fragment, Text, IssuePanel, useProductContext, useState, Button } from "@forge/ui";

export async function run(event, context) {
    const response = await closeTicketAuto(event.issue.id);
}
async function closeTicketAuto(issueIdOrKey) {
  const storageData = await storage.get(`SIRP_Instance_Identifier`);
  const res = await api.asApp().requestJira(route`/rest/api/3/issue/${issueIdOrKey}?fields=status`);
  const data = await res.json();
  const issueStatus = data.fields.status.name;
  if (issueStatus == 'Done' || issueStatus == 'Close' || issueStatus== 'Closed') {
    const res1 = await api.asApp().requestJira(route`/rest/api/3/issue/${issueIdOrKey}?fields=description`);
    const data1 = await res1.json(); 
    const descriptionText = data1?.fields?.description?.content?.reduce((text, paragraph) => {
      if (text) return text;
      const lineText = paragraph?.content?.reduce((line, content) => {
        if (line) return line;
        if (content.text) {
          const match = content.text.match(/SIRP ID: #(\d+)\b/);
          return match ? match[0] : null;
        }
        return line;
      }, null);
      return lineText || text;
    }, null);
    if (descriptionText) {
      const match = descriptionText.match(/SIRP ID: #(\d+)\b/);
      const sirpId = match ? match[1] : null;  
      if (sirpId) {
        const thirdPartyApiUrl = `https://${storageData.SIRP_Instance_Identifier}.sirp.io/api/v1/incident-management/custom-update?id=` + sirpId;
        const thirdPartyApiKey = `${storageData.SIRP_APIToken}`;
        const response = await api.fetch(thirdPartyApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': thirdPartyApiKey,
          },
          body: JSON.stringify({
            iti_ticket_status: 'Close',
          }),
        });
      }}     
    }
  };
    
