var Recipes = Backbone.Model.extend({
    defaults: {
        id: '',
        description: '',
        price: '',
        quantity: '',
        detailItems: [
            {
                detailItem: '',
                groupItemDescription: '',
                id: '',
                masterItem: '',
                price: '',
                quantity: '',
            }
        ]
    }
});