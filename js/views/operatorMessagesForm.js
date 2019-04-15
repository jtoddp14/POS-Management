var OperatorMessagesFormView = Backbone.View.extend({
    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.operatorMessages = options.operatorMessages;
        this.itemTypes = options.itemTypes;
    },

    render: function () {
        var that = this;
        this.$el.detach();
        this.$el.html(this.template({
            operatorMessages: this.model.toJSON(),
            itemTypes: this.itemTypes
        }));

        $(document).ready(function() {
            $('.tooltipped').tooltip();
        });
        return this;
    }
});