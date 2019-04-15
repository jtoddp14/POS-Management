var Employee = Backbone.Model.extend({
    defaults: {
        id: '',
        accountingId: '',
        name: '',
        currentHours: 0,
        payLevelNumber: 1,
        payLevel1: '',
        payLevel2: '',
        payLevel3: '',
        payLevel4: '',
        payLevel5: '',
        payLevel6: '',
        payLevel7: '',
        payLevel8: '',
        payLevel9: '',
        payLevel10: '',
        payLevel11: '',
        payLevel12: '',
        payLevel13: '',
        payLevel14: '',
        payLevel15: '',
        payLevel16: '',
        payLevel17: '',
        payLevel18: '',
        payLevel19: '',
        payLevel20: '',
        manager: false,
        overtimeOver8: true,
        isClockedIn: false,
        serverId: '',
        passcode: '',
        group: null,
        till: null,
        isServer: false,
        isDriver: false,
        logOutTime: 0,
        openOrderCount: '',
    }
});