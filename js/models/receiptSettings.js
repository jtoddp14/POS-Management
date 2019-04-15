var ReceiptSettings = Backbone.Model.extend({
    defaults: {
        receipt_info: {
            name: '',
            city: '',
            emailOrWebsite: '',
            addressLine1: '',
            state: '',
            zip: '',
            invoiceMessage: '',
            savingMessage: '',
            addressLine2: '',
            telephone: '',
            fax: '',
            dateTimeFormat: 'MMM dd,yyyy hh:mm a',
            printItemDescriptionAndSku: false
        },
        email_receipts: {
            offerEmail: false,
            emailServer: '',
            emailAccount: '',
            emailPort: '',
            EmailPassword: '',
            emailSubject: '',
        },
        customer_info: {
            customerName: false,
            customerCompanyName: false,
            customerContact: false,
            customerPhone: false,
            customerAddress: false,
        }
    }
});
