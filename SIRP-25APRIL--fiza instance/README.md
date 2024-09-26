# JIRA App for SIRP SOAR

This App allows users to push the JIRA Issue closure status to SIRP i.e. close an Incident on SIRP

Based on the configuration, there are two options available for Incident closure on SIRP:
- Users can either close the Incident manually by clicking on a button displayed on JIRA issue panel screen.
- Or the incident can be closed automatically as soon as the JIRA issue status changes to "Done"


## App Configuration

To configure the app, add following details to the Configuration Page:
- Title: SIRP SOAR
- SIRP Instance Identifier: Your SIRP instance Identifier
- SIRP API Key: API Key from your SIRP profile
- Manual/Automated: Option to either close Incident automatically on Issue Status Change or manually by clicking a button

##Bugs
Please submit bug reports to support@sirp.io


### Notes
-Note: You can only close those Incidents in SIRP which were pushed from SIRP into JIRA as Issues. Each issue receieved from SIRP contains ID of the Incident in SIRP. If the ID is not present then there is no link between the JIRA Issue and SIRP Incident.

