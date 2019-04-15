var ServerSettings = Backbone.Model.extend({
    defaults: {
        main_settings: {
            countryCode: 0,
            debug: false,
            removeFood: true,
            socketPort: 10000,
            secureLogin: false,
            reportsLR: false,
            tipsTenderCode: 0,
            autoUpdate: false,
            databaseDriver: 0,
            verifyOrder: true,
            databasePath: 'AccuPos.mdb',
            clearCustomerClose: false,
            backupFolder: 'autoBackup',
            accessFolder: 'MsAccess.exe Folder',
            taxCalc: 0,
            carryoutTax: false
        },
    }
});
