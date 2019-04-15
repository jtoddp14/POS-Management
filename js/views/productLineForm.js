var ProductLineFormView = Backbone.View.extend({
    
    events: {
        'change #item-type' : 'createNewItemType',
        'change #item-category' : 'createNewItemCategory',
        'change #menu-page' : 'checkToAddMenuPage'
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.productLines = options.productLines;
        this.itemTypes = options.itemTypes;
        this.category = options.category;
        this.salesAccounts = options.salesAccounts;
        this.vatCode = options.vatCode;
        this.menuPages = options.menuPages;
        this.choiceGroup = options.choiceGroup;
        this.israCardBuild = options.israCardBuild;
    },

    render: function () {
        var that = this;
        this.$el.detach();
        this.$el.html(this.template({
            productLine: this.model.toJSON(),
            itemTypes: this.itemTypes,
            category: this.category,
            salesAccounts: this.salesAccounts,
            menuPages: this.menuPages,
            choiceGroup: this.choiceGroup,
            vatCode: this.vatCode,
            israCardBuild: this.israCardBuild
        }));
        $(document).ready(function() {
            $('.tooltipped').tooltip();
            $('select').formSelect();
        });

        return this;
    },

    createNewItemType: function () {
        var itemType = this.$el.find('#item-type').val();

        if (itemType == "Create New Item Type") {
            var formModal = this.$el.find('#item-type-form-modal').modal();
            formModal.modal('open');
        }
    },

    createNewItemCategory: function () {
        var itemType = this.$el.find('#item-category').val();

        if (itemType == "Create New Item Category") {
            var formModal = this.$el.find('#item-category-form-modal').modal();
            formModal.modal('open');
        }
    },

    checkToAddMenuPage: function () {
        var menuPage = this.$el.find('#menu-page').val();

        if (menuPage == "Create New Menu Page") {
            var formModal = this.$el.find('#menu-page-form-modal').modal();
            formModal.modal('open');
        }
    }
});
