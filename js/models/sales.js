var date = new Date();
var timestamp = date.getTime();
var Sales = Backbone.Model.extend({
    defaults: {
        id: '',
        discount: 0,
        quantity: 0,
        quantityPrice: 0,
        quantityLevel: 0,
        initialQuantity: 0,
        forPrice: 0,
        group: '',
        item: '',
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
        start: timestamp,
        end: timestamp,
        nextDiscountPrice: '',
        nextDiscountPct: '',
        fromMinutes: 0,
        thruMinutes: 0,
    }
});