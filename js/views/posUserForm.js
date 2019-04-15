var POSUserFormView = Backbone.View.extend({
    
    events: {

    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.isFoodService = options.isFoodService;
        this.userGroups = options.userGroups;
        this.tills = options.tills;
        this.hasAccess = options.hasAccess;
    },

    render: function () {
        var that = this;
        var userGroups = [];
        var tills = [];
        Object.keys(this.userGroups).forEach(function(key, index) { 
            userGroups.push({
                id: key,
                name: that.userGroups[key]
            });
        });
        Object.keys(this.tills).forEach(function(key, index) { 
            tills.push({
                id: key,
                name: that.tills[key]
            });
        });
        this.$el.html(this.template({
            posUser: this.model.toJSON(),
            isFoodService: this.isFoodService,
            userGroups: userGroups,
            tills: tills
        }));
        if (!this.hasAccess) {
            $('.delete-button').hide();
            $('#delete-button').hide();
            $('.save-button').hide();
            $('#save-button').hide();
        }
        return this;
    }
});
