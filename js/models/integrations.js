var Integrations = Backbone.Model.extend({
    defaults: {
        exportImportFolder: '',
        integratorType: '',
        hasAccounting: false,
        skipItems: false,
        summarizeCash: false,
        updateItemPrices: true,
        location: '',
        accountingMerchantId: '',
        hasComo: false,
        creditsOrPoints: '',
        useOneConnection: false,
        accuposCloudSync: true,
        cloudMerchantId: '',
        hasAd2POS: false,
        secure: false,
        hasRegional: false,
        updateItemTypesYesNo: false,
        useAutomatedTaxYesNo: false,
    }
});