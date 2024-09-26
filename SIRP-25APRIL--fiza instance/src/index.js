import api, { storage,route } from "@forge/api";
import ForgeUI, { render, Fragment, Text, IssuePanel, useProductContext, useState, Button, SectionMessage, useEffect, Form,UserGroup, useAction} from "@forge/ui";


const App = () => {
  const [autocheck, setAutocheck] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const context = useProductContext();
  const [storageData] = useState(async () => await storage.get(`SIRP_Instance_Identifier`));

  const closeTicket = async (issueId, setMessage) => {
    try {
    const res = await api.asUser().requestJira(route`/rest/api/3/issue/${issueId}?fields=description`);
    const data = await res.json();
    const descriptionText = data?.fields?.description?.content?.reduce((text, paragraph) => {
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
        if (response.ok) {
          setMessage(` Incident closed successfully on SIRP.`);
        } else {
          setMessage(`Unable to Close the Incident on SIRP.`);
        }
      } else {
        setMessage(`Unable to Close the Incident on SIRP. Check SIRP ID.`);
      }
    } else {
      setMessage('Unable to Close the Incident on SIRP. Check SIRP ID.');
    }

   }catch (error){
     setMessage(`Unable to Close the Incident on SIRP.`);
   }
  };
  const checkConnectivity = async () => {
   try {
    const thirdPartyApiKey = `${storageData.SIRP_APIToken}`;
    const response = await api.fetch(`https://${storageData.SIRP_Instance_Identifier}.sirp.io/api/v1/incident-management/check-connection`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': thirdPartyApiKey, 
      },
    });
    if (response.ok) {
      setMessage(`Connection to SIRP established successfully.`);
    } else {
      setMessage(`Failed to establish connection to SIRP. Check App Configuration.`);
    }
   } catch (error){
    setMessage(`Failed to establish connection to SIRP. Check App Configuration.`);
   }
  };
  const handleButtonClick = async () => {
    setLoading(true);
    await closeTicket(context.platformContext.issueKey, setMessage);
    setLoading(false);
  }; 
 
  return (
    <Fragment>
      {(storageData?.AutoCloseStatus === false || storageData?.AutoCloseStatus === undefined || storageData?.AutoCloseStatus === 'undefined' ||storageData?.AutoCloseStatus === null || storageData?.AutoCloseStatus === 'null') && (
        <Fragment>
          <Button text="Close Status" onClick={handleButtonClick} />
          <Button
            text="Check Connectivity"
            appearance='link'  
            onClick={async () => {
              setLoading(true);
              await checkConnectivity();
              setLoading(false);
            }}
          />
          {loading && <p>Loading...</p>}
        </Fragment>
      )}
      {storageData?.AutoCloseStatus === true && (
        <Fragment>
          <Text>AutoClose is enabled.</Text>
          <Button
            text="Check Connectivity"
            appearance='link' 
            onClick={async () => {
              setLoading(true);
              await checkConnectivity();
              setLoading(false);
            }}
          />
        </Fragment>
      )}
      {message && <SectionMessage title={message} appearance={message.includes('successful') ? 'confirmation' : 'error'} />}
    </Fragment>
  );
};
export const run = render(
  <IssuePanel>
    <App />
  </IssuePanel>
);
