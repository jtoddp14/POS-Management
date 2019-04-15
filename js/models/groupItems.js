var GroupItems = Backbone.Model.extend({
    defaults: {
        masterItemId: '',
        masterItemDescription: '',
        masterItemPrice: '',
        beforeDiscountPrice: 0,
        detailItems: [
            {
                id: '',
                price: 0,
                masterItem: '',
                detailItem: '',
                masterItem: '',
                groupItemDescription: '',
                quantity: '',
                print: false
            }
        ]
    }
});