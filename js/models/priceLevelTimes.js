var PriceLevelTimes = Backbone.Model.extend({
    defaults: {
        id: '',
        priceLevel: 1,
        priceStart: '',
        priceEnd: '',
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
    }
});