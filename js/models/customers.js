var Customers = Backbone.Model.extend({
    defaults: {
        id: '',
        first: '',
        middle: '',
        last: '',
        phone: null,
        email: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: null,
        companyName: '',
        fax: null,
        taxable: false,
        creditLimit: null,
        discount: 0,
        taxCode: 0,
        balance: 0,
        priceLevel: '0',
        notes: '',
        terms: null,
        discountItemId: 0, 
        dueDays: null,
        discountDays: null,
        uploaded: false,
    }
});