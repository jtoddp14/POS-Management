var UserGroupFormView = Backbone.View.extend({
    
    events: {
        'change .permission-checkbox': 'togglePermissionSwitch',
        'change #username': 'updateName'
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.isFoodService = options.isFoodService;
    },

    render: function () {
        var that = this;
        this.$el.detach();
        this.$el.html(this.template({
            userGroup: this.model.toJSON(),
            isFoodService: this.isFoodService
        }));
        $("#permission-type-selector").formSelect();
        $("#user-group-selector").formSelect();
        $(document).ready(function() {
            $('.tooltipped').tooltip();
        });
        return this;
    },

    togglePermissionSwitch: function (e) {
        var element = $(e.currentTarget);
        var dataType = $(element).attr('data-type');
        var checked = $(element).is(':checked');
        var permString = dataType.split('.');
        
        var updatedModelAttribute = _.clone(this.model.get(permString[0]));
        updatedModelAttribute[permString[1]] = checked;
        this.model.set(permString[0], updatedModelAttribute);
    },

    updateName: function (e) {
        var element = $(e.currentTarget);
        var name = $(element).val();
        this.model.set('name', name);
    }
});
