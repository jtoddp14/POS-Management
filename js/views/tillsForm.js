var TillsFormView = Backbone.View.extend({
    events: {
        'change #tillsName': 'updateName'
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.tills = options.tills;
        this.newTill = options.newTill;
    },

    render: function () {
        var that = this;
        this.$el.detach();
        this.$el.html(this.template({
            tills: this.model.toJSON(),
            newTill: this.newTill
        }));

        $(document).ready(function() {
            $('.tooltipped').tooltip();
            var pickerElement = document.querySelector('#z-out-time-picker');
            var instances = M.Timepicker.init(pickerElement, {
                autoClose: true,
                container: 'body'
            });
            that.timepicker = instances;
        });
        return this;
    },

    updateName: function (e) {
        var element = $(e.currentTarget);
        var name = $(element).val();
        this.model.set('name', name);
    }
});