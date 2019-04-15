var PriceLevelTimesFormView = Backbone.View.extend({
    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.priceLevelTimes = options.priceLevelTimes;
    },

    render: function () {
        var that = this;
        this.$el.detach();

        this.$el.html(this.template({
            priceLevelTimes: this.model.toJSON(),
        }));

        $(document).ready(function() {
            var pickerElement = document.querySelectorAll('.timepicker');
            var instances = M.Timepicker.init(pickerElement, {
                autoClose: true,
                container: 'body'
            });
            that.timepicker = instances;
        });
        
        return this;
    }
});