var TenderTypesFormView = Backbone.View.extend({
    events: {
        'change #tenderTypesName': 'updateName'
    },

    

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.tenderTypes = options.tenderTypes;
        
        this.paymentTypes = Object.keys(options.paymentTypes).map(function (key) {
            return {
                id: key,
                name: options.paymentTypes[key]
            };
        });
    },

    render: function () {
        var that = this;
        this.$el.detach();

        this.$el.html(this.template({
            tenderTypes: this.model.toJSON(),
            paymentTypes: this.paymentTypes
        }));

        $(document).ready(function() {
            $('.tooltipped').tooltip();
        });
        return this;
    },

    updateName: function (e) {
        var element = $(e.currentTarget);
        var name = $(element).val();
        this.model.set('tenderName', name);
    }
});