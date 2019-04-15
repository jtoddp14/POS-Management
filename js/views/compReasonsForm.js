var CompReasonsFormView = Backbone.View.extend({
    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.compReasons = options.compReasons;
    },

    render: function () {
        var that = this;
        this.$el.detach();
        this.$el.html(this.template({
            compReasons: this.model.toJSON(),
        }));
        $(document).ready(function() {
            M.textareaAutoResize($('#compReason'));
            $('.tooltipped').tooltip();
        });
        return this;
    }
});