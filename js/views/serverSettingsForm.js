var ServerSettingsFormView = Backbone.View.extend({
    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
    },

    render: function () {
        var that = this;
        this.$el.detach();
        this.$el.html(this.template({
            serverSettings: this.model.toJSON(),
        }));
        $(document).ready(function () {
            that.$el.find('select').formSelect();
        });
        
        return this;
    }
});