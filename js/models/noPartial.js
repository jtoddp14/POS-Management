var NoPartial = Backbone.Model.extend({
    defaults: {
        itemId: '',
        itemType: '',
        noSync: false,
        id: Math.floor(Math.random() * 1000) + 1,
    }
});