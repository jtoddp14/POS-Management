var POSUser = Backbone.Model.extend({
    defaults: {
        id: null,
        serverId: '',
        passcode: '',
        group: null,
        till: null,
        isServer: false,
        isDriver: false,
        logOutTime: 0,
        openOrderCount: ''
    }
});