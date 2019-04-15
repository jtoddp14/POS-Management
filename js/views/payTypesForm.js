var PayTypesFormView = Backbone.View.extend({
    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.payTypes = options.payTypes;
    },

    render: function () {
        var that = this;
        this.$el.detach();
        this.$el.html(this.template({
            payType: this.model.toJSON(),
        }));

        $(document).ready(function() {
            $('.tooltipped').tooltip();
        });
        return this;
    }
});