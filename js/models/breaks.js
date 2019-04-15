var Breaks = Backbone.Model.extend({
    defaults: {
        id: '',
        type: '',
        appliesAfter: 0,
        breakTime: 0,
        minimumTime: 0, 
        isPaid: false, 
        textColor: '',
    }
});