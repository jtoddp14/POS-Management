var CardSetup = Backbone.Model.extend({
    defaults: {
        gateway: '',
        emailAddress: '',  
        merchantPassword : '',
        debugLogging: false,
        processGratuities: false,
        processPostAuth: false,
        giftGateway: '',
        giftCardPassword: '', 
        giftCardUserId: '',
        giftCardGroup: '',
        merchantId: '',
        isOpen247: false, 
        sendTransNumber: false,
        alternateHost: '',
        roomChargeOutlet: '',
        shvaDataPath: '',
        heartlandLicenseId: '', 
        heartlandSiteId: '',
        heartlandDeviceId: '',
        merchantUser: '',
        isShvaUSD: false
    }
});