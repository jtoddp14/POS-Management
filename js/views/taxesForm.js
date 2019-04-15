var TaxesFormView = Backbone.View.extend({
    events: {
        'change #description': 'updateName'
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.taxes = options.taxes;
    },

    render: function () {
        var that = this;
        this.$el.detach();

        this.$el.html(this.template({
            taxes: this.model.toJSON(),
        }));

        $(document).ready(function() {
            $('.tooltipped').tooltip();
        });
        return this;
    },

    updateName: function (e) {
        var element = $(e.currentTarget);
        var name = $(element).val();
        this.model.set('description', name);
    }
});