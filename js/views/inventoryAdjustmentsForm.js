var InventoryAdjustmentsFormView = Backbone.View.extend({
    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.inventoryAdjustments = options.inventoryAdjustments;
    },

    render: function () {
        var that = this;
        this.$el.detach();
        this.$el.html(this.template({
            inventoryAdjustments: this.model.toJSON(),
        }));

        $(document).ready(function() {
            $('.tooltipped').tooltip();
            document.getElementById('qtyAdjusted').focus();
        });
        return this;
    }
});