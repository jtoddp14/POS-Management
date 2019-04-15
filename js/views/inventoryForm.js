var InventoryFormView = Backbone.View.extend({
    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.inventory = options.inventory;
    },

    render: function () {
        var that = this;
        this.$el.detach();

        this.$el.html(this.template({
            inventory: this.model.toJSON(),
        }));

        $(document).ready(function() {
            $('.tooltipped').tooltip();
            document.getElementById('qtyReceived').focus();
        });
        return this;
    }
});