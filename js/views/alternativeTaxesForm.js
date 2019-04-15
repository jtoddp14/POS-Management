var AlternativeTaxesFormView = Backbone.View.extend({
    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.alternativeTaxes = options.alternativeTaxes;
        this.itemTypes = options.itemTypes;
        this.taxAuthorities = options.taxAuthorities;
    },

    render: function () {
        var that = this;
        this.$el.detach();
        this.$el.html(this.template({
            alternativeTaxes: this.model.toJSON(),
            itemTypes: this.itemTypes,
            taxAuthorities: this.taxAuthorities
        }));

        $(document).ready(function() {
            $('.tooltipped').tooltip();
        });
        return this;
    }
});