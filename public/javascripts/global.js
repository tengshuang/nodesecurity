'user strict'

var address_server = "";
//var address_server = "https://fse-esn-sv6.herokuapp.com";

//add comment here
app.constant(
    "globalUrl",{
        LoginAccess:address_server+'/api/logIn',
        CreateNewUser:address_server+'/api/users',
        LogOutAccess:address_server+'/api/logOut',
        getMessageAccess:address_server+'/api/message',
        postMessageAccess:address_server+'/api/message',
        getDiretoryList:address_server+'/api/directory',
        postUserProfileAccess:address_server+'/api/status',
        postDirectoryStatusAccess:address_server+'/api/directoryStatus',
        postPrivateDirectory:address_server+'/api/privateDirectory',
        getSearchMessages:address_server+'/api/search',
        createPerson: address_server + '/api/createPerson',
        searchMPCase: address_server + '/api/searchPerson',
        seeAllMP: address_server + '/api/getAllMPCases',
        closeCase : address_server + '/api/closePerson',
        reportFound: address_server + '/api/findPerson',
        postIncidentAccess:address_server+'/api/incident',
        postIncidentStatusAccess: address_server+'/api/incidentStatus'
    }
);

app.constant('incidentType',[
    {
        title: 'fire disaster',
        value:'0'
    },
    {
        title: 'robbery',
        value: '1'
    },
    {
        title: 'earthquake',
        value: '2'
    }
]);
app.constant('severityType',[
    {
        title: 'small',
        value:'0'
    },
    {
        title: 'medium',
        value: '1'
    },
    {
        title: 'large',
        value: '2'
    }
]);

app.constant('status_global_constant',[
    {
        title: 'Undefined',
        value: '0',
        color: 'blue'
    },
    {
        title: 'OK',
        value: '1',
        color: 'green'
    },
    {
        title: 'Help',
        value: '2',
        color: 'orange'
    },
    {
        title: 'Emergency',
        value: '3',
        color: 'red'
    }
]);