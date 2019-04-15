var BreaksFormView = Backbone.View.extend({
    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.breaks = options.breaks;
    },

    render: function () {
        var that = this;
        this.$el.detach();
        this.$el.html(this.template({
            breaks: this.model.toJSON(),
        }));
        $(document).ready(function() {
            $('.tooltipped').tooltip();
        });
        return this;
    }
});
