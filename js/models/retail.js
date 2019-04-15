var Retail = Backbone.Model.extend({
    defaults: {
        hasSalesReps: false,
        priceDecimalNumber: 2,
        quantityDecimalNumber: 1,
        totalDecimalNumber: 2,
        showItemId: true,
        showOriginalPrice: false,
        completed: false
    }
});