var EConduitFormView = Backbone.View.extend({
    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
    },

    render: function () {
        var that = this;
        this.$el.detach();
        
        this.$el.html(this.template({
            eConduit: this.model.toJSON(),
        }));
        return this;
    }
});