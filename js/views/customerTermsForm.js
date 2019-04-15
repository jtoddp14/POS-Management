var CustomerTermsFormView = Backbone.View.extend({
    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.customerTerms = options.customerTerms;
    },

    render: function () {
        var that = this;
        this.$el.detach();
        this.$el.html(this.template({
            customerTerms: this.model.toJSON(),
        }));

        return this;
    }
});