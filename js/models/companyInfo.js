var CompanyInfo = Backbone.Model.extend({
    defaults: {
        company_info: {
            transactionNumber: 101,
            priceLimit: 9999.00,
            dayStart: 0,
            invoiceNumber: 101,
            quantity: 9999.00,
            taxCode: ''
        },
        accounting_integration: {
            tenderSummary: '',
            siteName: '',
            sendTips: false,
            classSales: ''
        },
        credit_card: {
            slipLimit: 0.0,
            gratuityHandling: false,
            gratutityInclusion: 6,
            defaultPrice: 0,
            alwaysInclude: false,
        },

        serialNumber: 0000000000000,
        countryCode: 'US',
        businessType: 'RT',
        reportDirection: 'No'
    }
});