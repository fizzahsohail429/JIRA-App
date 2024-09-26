document.addEventListener('DOMContentLoaded', function() {


    const client = ZAFClient.init();
    document.getElementById('checkConnectivity').addEventListener('click', function() {
        client.metadata().then(function(metadata) {
            let apiUrl = metadata.settings.SIRP_URL;
            let apiToken = metadata.settings.SIRP_APIKey;

            checkConnectivity(apiUrl, apiToken).then(
                (response) => {
                    const result = response;
                    if (result.data && result.data.success) {
                        showPopupNotification('Connectivity to SIRP verified successfully.');
                    } else {
                        showPopupNotification('Unable to connect to SIRP. Check App Configuration.');
                    }
                },
                (error) => {
                    showPopupNotification('Unable to connect to SIRP. Check App Configuration.');
                });
            });
    });

    client.get('ticket').then(function(data) {
        const ticketDescription = data?.ticket?.description;
        const ticketId = ticketDescription.split('SIRP ID: #')[1];

        client.metadata().then(function(metadata) {
            let apiUrl = metadata.settings.SIRP_URL;
            let apiToken = metadata.settings.SIRP_APIKey;
            let autoCloseStatus = metadata.settings.AutoCloseStatus;

            document.getElementById('AutoCloseStatus').value = autoCloseStatus;

            if (autoCloseStatus) {
                document.getElementById('changeButton').style.display = 'none';
                if (ticketId){
                    client.on('ticket.save', async () => {    
                         const ticketData = await client.get('ticket.status')
                         if(ticketData["ticket.status"] == "solved"){
                            try {
                                const response = await makeApiRequest(ticketId, apiUrl, apiToken);
                                const result = response;
                                if (result.success && result.data && result.data.message) {
                                    showPopupNotification('Ticket closed successfully on SIRP.');
                                } else {
                                    showPopupNotification('Unable to Close the Ticket on SIRP. Check SIRP ID');
                                }
                            } catch (error) {
                                showPopupNotification('Unable to Close the Ticket on SIRP. Check SIRP ID');
                            }
                         }
                    });
                }
            }
                   
            else{
                document.getElementById('changeButton').addEventListener('click', function() {
                    if (ticketId) {
                        client.metadata().then(function(metadata) {
                            let apiUrl = metadata.settings.SIRP_URL;
                            let apiToken = metadata.settings.SIRP_APIKey;

                            makeApiRequest(ticketId, apiUrl, apiToken).then(
                                (response) => {
                                    const result = response;
                                    if (result.success && result.data && result.data.message) {
                                        document.getElementById('statusMessage').textContent = result.data.message;
                                        showPopupNotification('Ticket closed successfully on SIRP.');
                                        setTimeout(function() {
                                            document.getElementById('statusMessage').textContent = '';
                                        }, 3000);
                                    } else {
                                        document.getElementById('statusMessage').textContent = 'Unable to Close the Ticket on SIRP';
                                        showPopupNotification('Unable to Close the Ticket on SIRP');
                                        setTimeout(function() {
                                            document.getElementById('statusMessage').textContent = '';
                                        }, 3000);
                                    }
                                },
                                (error) => {
                                    showPopupNotification('Unable to Close the Ticket on SIRP');
                                });
                        });
                     }else {     
                        showPopupNotification('Unable to extract ticket ID from description');
                }

                });
            }
        });
    });

    function showPopupNotification(message) {
        const Msg = `${message}`;
        client.invoke("notify", Msg).then(function(){
        });
    }
    function makeApiRequest(ticketId, apiUrl, apiToken) {
        const loadingIndicator = document.getElementById('loading');
        loadingIndicator.style.display = 'block';
        var raw = JSON.stringify({
            "iti_ticket_status": "Close"
        });
        const options = {
            url: `${apiUrl}/api/v1/incident-management/custom-update?id=${ticketId}`,
            type: "POST",
            headers: {
                "X-Api-Key": `${apiToken}`,
            },
            contentType: "application/json",
            data: raw,
        };
        return client.request(options).finally(() => {
            loadingIndicator.style.display = 'none';
        });
    }

    function checkConnectivity(apiUrl, apiToken) {
        const loadingIndicator = document.getElementById('loading');
        loadingIndicator.style.display = 'block';
        
        const options = {
            url: `${apiUrl}/api/v1/incident-management/check-connection`,
            type: "GET",
            headers: {
                "X-Api-Key": `${apiToken}`,
            },
            contentType: "application/json",
        };

        return client.request(options).finally(() => {
        loadingIndicator.style.display = 'none';
        }).then(
        (response) => {
            const result = response;
            if (result.data && result.data.success) {
                showPopupNotification('Connection to SIRP established successfully.');
            } else {
                showPopupNotification('Failed to establish connection to SIRP. Check App Configuration.');
            }
        },
        (error) => {
            showPopupNotification('Failed to establish connection to SIRP. Check App Configuration.');
        }
    );
    }
});


    




