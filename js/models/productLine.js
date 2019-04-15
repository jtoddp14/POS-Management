var ProductLine = Backbone.Model.extend({

    defaults: {
        id: 0,
        description: '',
        type: '',
        category: '',
        salesAccount: '',
        choiceGroup: '',
        menuKeyPage: '',
        allowDiscount: true,
        isStock: false,
        scale: false,
        serialized: false,
        noPartialQuantity: true,
        vatCode: '',
        taxable: true,
        cardStyleClass: 'white'
    }
});