var AdvancedItemsView = Backbone.View.extend({
    breadcrumb: {},

    events: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;
    },

    render: function () {        
        var that = this;
        this.$el.html(this.template());
        App.breadCrumbToolTip = "Further manage items";
        App.setBreadcrumbs(this.breadcrumb);
        $('.tooltipped').tooltip({delay: 0});
        return this;
    },
    
});
