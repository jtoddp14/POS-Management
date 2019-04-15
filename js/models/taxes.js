var Taxes = Backbone.Model.extend({
    defaults: {
        id: '',
        code: '',
        description: '',
        rate: '',
        rate2: '',
        isPiggyBack: false
    }
});