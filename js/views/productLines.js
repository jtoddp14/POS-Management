var ProductLinesView = Backbone.View.extend({
    itemTypes: [],
    fullCollection: {},
    deletionModal: {},
    menuProps: {
        salesAccounts: [],
        itemCategories: [],
        menuPages: [],
        vatGroups: [],
        itemTypes: []
    },

    events: {
        'click .card-panel-entity': 'highlightCard',
        'change #item-type-filter': 'filterCards',
        'click .delete-button': 'deletionModal',
        'click #delete-product-line-confirm': 'deleteProductLine',
        'click .edit-product-line-trigger': 'populateEditFormValues',
        'click .save-button': 'saveProductLine',
        'click .add-product-line': 'addProductLine',
        'keyup #description' : 'validateForm',
        'click .save-item-type-button' : 'chooseNewItemType',
        'click .save-item-category-button' : 'chooseNewCategory',
        'click .save-menu-page-button' : 'chooseNewMenuPage',
    },

    breadcrumb: {},

    typeStyleMapping: {},

    styles: [
        'white',
    ],

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.israCardBuild = options.israCardBuild;
        this.productLineFormTemplate = options.productLineFormTemplate;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.initProductLines();
        this.renderItemTypesFilter();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({ 
            productLines: this.collection.toJSON(),
            menuProps: this.menuProps,
            itemTypes: this.itemTypes,
            category: this.category,
            salesAccounts: this.salesAccounts,
            menuPages: this.menuPages,
            choiceGroup: this.choiceGroup,
            vatCode: this.vatCode,
            israCardBuild: this.israCardBuild
        }));
        App.breadCrumbToolTip = "Create a backbone for items you create. Further speeds up item creation."; 
        App.setBreadcrumbs(this.breadcrumb);
        $(document).on('keydown', 'input, select', function(e) {
            var self = $(this)
              , form = self.parents('form:eq(0)')
              , focusable
              , next
              ;
            if (e.keyCode == 13) {
                focusable = form.find('input,a,select,button,select').filter(':visible');
                next = focusable.eq(focusable.index(this)+1);
                if (next.length) {
                    next.focus();
                } else {
                    form.submit();
                }
                return false;
            }
        });
        $('.tooltipped').tooltip();
        this.deletionModal = $(".modal").modal();
        this.formModal = this.$el.find('#product-line-form-modal').modal();
        $('select').formSelect();
        
        return this;
    },

    getFormValues: function () {
        var description = this.$el.find('#description').val();
        var itemType = this.$el.find('#item-type option:selected').text();
        if (itemType == "Create New Item Type") {
            itemType = "N/A"
        }
        var itemCategory = this.$el.find('#item-category option:selected').text();
        if (itemCategory == "Create New Item Category") {
            itemCategory = "N/A"
        }
        var salesAccount = this.$el.find('#sales-account option:selected').text();
        var vatCode = this.$el.find('#vatCode option:selected').text();
        var menuPage = this.$el.find('#menu-page option:selected').text();
        var menuPageVal = this.$el.find('#menu-page').val();
        if (menuPageVal == "noMenuButton") {
            menuPage = '';
        }
        var choiceGroup = this.$el.find('#choice-page option:selected').text();
        var taxable = this.$el.find('#taxable:checked').length > 0;
        var allowDiscounts = this.$el.find('#allow-discounts:checked').length > 0;
        var scalable = this.$el.find('#scale:checked').length > 0;
        var stockable = this.$el.find('#isStock:checked').length > 0;
        var serializable = this.$el.find('#serialized:checked').length > 0;
        var partial = this.$el.find('#noPartialQuantity:checked').length > 0;
        var id = this.productLineFormView.model.attributes.id;
        if (this.israCardBuild) {
            var updatedModel = {
                choiceGroup: choiceGroup,
                taxable: null,

                id: id,
                description: description,
                itemType: itemType,
                itemCategory: itemCategory,
                salesAccount: null,
                menuKeyPage: menuPage,
                vatCode: vatCode,
                allowDiscount: allowDiscounts,
                scale: scalable,
                isStock: stockable,
                serialized: null,
                partial: partial,
            };
        }
        else {
            var updatedModel = {
                description: description,
                itemType: itemType,
                itemCategory: itemCategory,
                salesAccount: salesAccount,
                vatCode: vatCode,
                menuKeyPage: menuPage,
                choiceGroup: choiceGroup,
                allowDiscount: allowDiscounts,
                scale: scalable,
                isStock: stockable,
                serialized: serializable,
                partial: partial,
                taxable: taxable,
                id: id
            };
        }

        updatedModel.type = updatedModel.itemType

        this.productLineFormView.model.set(updatedModel);
        return updatedModel;
    },

    saveProductLine: function () {
        var that = this;
        var validation = this.validateForm();
        var updateCollection = that.collection;

        if (validation) {
            var formValues = this.getFormValues();
            var sessionToken = this.getCookie();
            $.ajax({
                url: '/data/update-product-line',
                data: {
                    productLine: JSON.stringify(formValues),
                    token: sessionToken
                },
                dataType: 'json',
                type: 'POST',
                success: function (data) {
                    var success = false;
                    if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                        success = data.results.success;
                    }
                    if (success !== null) {
                        var m = that.productLineFormView.model;
                        updateCollection.add(m);
                    }
                    that.formModal.modal('close');
                    M.toast({ html: '{Literal}Product line updated successfully{/Literal}' });
                },
                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem fetching product lines from the server{/Literal}' });
                    }
                }
            });
        }
        this.render();
    },

    getCookie: function() {
        var nameEQ = "sessionCookie" + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
    },

    getMenuProps: function (models) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-menu-pages',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.menuProps = data;
                that.renderMenuPropsAndModels(models);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem fetching product lines from the server{/Literal}' });
                }
            }
        });
    },

    renderMenuPropsAndModels: function (models) {
        this.collection.reset(models);
    },

    renderItemTypesFilter: function () {
        this.itemTypes.sort();
        
        for (var i = 0; i < this.itemTypes.length; i++) {
            $("#item-type-filter").append(
                $('<option></option>').attr("value", this.itemTypes[i]).text(this.itemTypes[i])
            );
        }
        $("#item-type-filter").formSelect();
    },

    initProductLines: function () {
        this.getProductLines();
    },

    getProductLines: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-product-lines',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.renderProductLines(data.results);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem fetching product lines from the server{/Literal}' });
                }
            }
        });
    },

    renderProductLines: function (data) {
        this.generateTypeStyleMapping(data);
        var collection = new ProductLineCollection();
        for (var i = 0; i < data.length; i++) {
            var currentProductLineData = data[i];
            currentProductLineData.cardStyleClass = this.typeStyleMapping[currentProductLineData.type];
            collection.add(new ProductLine(currentProductLineData));
        }
        this.fullCollection = collection;
        this.getMenuProps(collection.models);
        this.getItemTypes();
    },

    getItemTypes: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-item-types',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.itemTypes = data.results;
                that.renderItemTypes(data.results);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem fetching item types from the server{/Literal}' });
                }
            }
        });
    },

    renderItemTypes: function (data) {
        var that = this;
        var currentItemTypes = [];
        for (var i = 0; i < data.length; i++) {
            currentItemTypes.push(data[i]);   
        }
        
        this.getItemCategory();
    },
    
    getItemCategory: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-category',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.category = data.results;
                that.renderCategory(data.results); 
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem fetching item categories from the server{/Literal}' });
                }
            }
        });
    },

    renderCategory: function (data) {
        var that = this;
        for (var i = 0; i < data.length; i++) {
            var currentCategory = data[i];
        }
        this.getSalesAccounts();
    },

    getSalesAccounts: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-sales-accounts',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.salesAccounts = data.results;
                that.renderSalesAccounts(data.results); 
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem fetching sales accounts from the server{/Literal}' });
                }
            }
        });
    },

    renderSalesAccounts: function (data) {
        var that = this;
        for (var i = 0; i < data.length; i++) {
            var currentSalesAccounts = data[i];
        }
        this.getMenuPages();
    },

    getMenuPages: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-menu-pages',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.menuPages = data.results;
                that.renderMenuPages(data.results); 
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem fetching sales accounts from the server{/Literal}' });
                }
            }
        });
    },

    renderMenuPages: function (data) {
        var that = this;
        for (var i = 0; i < data.length; i++) {
            var currentMenuPage = data[i];
        }
        this.getChoiceGroups();
    },

    getChoiceGroups: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-choice-groups',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.choiceGroup = data.results;
                that.renderChoiceGroups(data.results); 
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem fetching sales accounts from the server{/Literal}' });
                }
            }
        });
    },

    renderChoiceGroups: function (data) {
        var that = this;
        for (var i = 0; i < data.length; i++) {
            var currentMenuPage = data[i];
        }
        this.getVatCodes();  
    },

    getVatCodes: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-vat-codes',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.vatCode = data.results;
                that.rendervatCode(data.results);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem fetching taxes from the server{/Literal}' });
                }
            }
        });
    },

    rendervatCode: function (data) {
        var that = this;
        for (var i = 0; i < data.length; i++) {
            var currentvatCode = data[i];
        }
    },

    generateTypeStyleMapping: function (data) {
        var types = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        this.itemTypes = [];
        for (var i = 0; i < data.length; i++) {
            if (types.indexOf(data[i].type) < 0) {
                this.itemTypes.push(data[i].type);
                types.push(data[i].type);        
                this.typeStyleMapping[data[i].type] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
    },

    validateForm: function () {
        var valid = true;
        var productLineDescription = this.$el.find('#description').val();
        if (productLineDescription.trim().length < 1) {
            this.$el.find("#description").addClass("invalid");
            valid = false;
        }
        else {
            var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
            for (var i = 0; i < productLineDescription.length; i++) {
                if (iChars.indexOf(productLineDescription.charAt(i)) != -1) {
                    this.$el.find("#description").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }
        
        return valid;
    },

    populateEditFormValues: function (e) {

        var element = $(e.currentTarget);
        var id = $(element).attr('data-id');
        var productLines = this.collection.get(id);

        if (this.collection.get(id) !== null && this.collection.get(id) !== '') {
            this.productLineFormView = new ProductLineFormView({
                template: this.productLineFormTemplate,
                model: productLines,
                itemTypes: this.itemTypes,
                category: this.category,
                salesAccounts: this.salesAccounts,
                menuPages: this.menuPages,
                choiceGroup: this.choiceGroup,
                vatCode: this.vatCode,
                israCardBuild: this.israCardBuild
            });

            this.$el.find('#product-line-form-modal').html(this.productLineFormView.render().el);
            this.$el.find('select').formSelect();
            this.formModal.modal('open');
        }
        
        else {
            M.toast({ html: '{Literal}There was a problem fetching data from the server{/Literal}' });
        }   
    },

    addProductLine: function (e) {
        var productLines = new ProductLine();
        this.productLineFormView = new ProductLineFormView({
            template: this.productLineFormTemplate,
            model: productLines,
            itemTypes: this.itemTypes,
            category: this.category,
            salesAccounts: this.salesAccounts,
            menuPages: this.menuPages,
            choiceGroup: this.choiceGroup,
            vatCode: this.vatCode,
            israCardBuild: this.israCardBuild
        });

        this.$el.find('#product-line-form-modal').html(this.productLineFormView.render().el);
        this.$el.find('select').formSelect();
        this.$el.find("select[required]").css({
            display: "block", 
            position: 'absolute',
            visibility: 'hidden'
        });  
        this.formModal.modal('open');
    },

    filterCards: function (e) {
        var element = $(e.currentTarget);
        var selectedItemType = $(element).val();

        if (selectedItemType === '0') {
            this.collection.reset(this.fullCollection.models);
            $("#item-type-filter option").first().attr('selected', '');
        } 
        else if (selectedItemType === '1') {
            this.collection.reset(this.fullCollection.models);
            var filtered = this.fullCollection.byItemType(selectedItemType);
            this.collection.reset(filtered.models);
            $("#item-type-filter option[value=" + selectedItemType + "]").attr('selected', '');
        }
        else {
            this.collection.reset(this.fullCollection.models);
            var filtered = this.fullCollection.byMenuPage(selectedItemType);
            this.collection.reset(filtered.models);
            $("#item-type-filter option[value=" + selectedItemType + "]").attr('selected', '');
        }
        
        $("select").formSelect();
    },

    highlightCard: function (e) {
        this.$el.find('.edit').hide();
        this.$el.find('.card-panel-entity').removeClass('active');
        var element = $(e.currentTarget);
        var selected = $(element).attr('data-selected') === '1';
        if (selected) {
            $(element).removeAttr('data-selected');
            $(element).removeClass('active');
            $(element).find('.edit').hide();
        } else {
            $(element).removeAttr('data-selected');
            $(element).attr('data-selected', '1');
            $(element).find('.edit').show();
            $(element).addClass('active');
        }
    },

    deletionModal: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var productLineId = $(element).attr('data-id');
        $('#delete-product-line-modal').modal().modal('open');
    },

    deleteProductLine: function(e) {
        var that = this;
        var element = $(e.currentTarget);
        var productLineId = that.productLineFormView.model.attributes.id;
        var productLineName = that.productLineFormView.model.attributes.description;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/delete-product-line',
            type: 'POST',
            data: {
                productLineId: productLineId,
                token: sessionToken
            },

            success: function (data) {
                var success = false;
                if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                    success = data.results.success;
                }
                if (success !== null) {
                    that.collection.remove(productLineId);
                }

                M.toast({ html: '{Literal}Product line deleted successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem deleting this product line{/Literal}.' });
                }
            }
        });
        this.render();
    },

    chooseNewCategory: function () {
        var itemCategory = this.$el.find('#itemCategoryName').val();
        that = this;
        var isTaken = false;

        if (itemCategory != '' && itemCategory != undefined && itemCategory != null) {
            for (var i in that.category) {
                if (that.category[i].name === itemCategory) {
                    isTaken = true;
                    break;
                }
            }

            if (isTaken) {
                M.toast({ html: '{Literal}This Item Category is already defined{/Literal}' });
            }
            else {
                that.category.push({id: that.category.length, name: itemCategory});  
                this.reopenModal();
            }
        }
        else {
            M.toast({ html: '{Literal}Please enter a valid Item Category name{/Literal}' });
        }
    },

    chooseNewItemType: function () {
        var itemType = this.$el.find('#itemTypeName').val();
        that = this;
        var isTaken = false;
        if (itemType != '' && itemType != undefined && itemType != null) {
            for (var i in that.itemTypes) {
                if (that.itemTypes[i].name === itemType) {
                    isTaken = true;
                    break;
                }
            }

            if (isTaken) {
                M.toast({ html: '{Literal}This Item Type is already defined{/Literal}' });
            }
            else {
                that.itemTypes.push({id: that.itemTypes.length, name: itemType});  
                this.reopenModal();
            }
        }
        else {
            M.toast({ html: '{Literal}Please enter a valid Item Type name{/Literal}' });
        }
    },

    chooseNewMenuPage: function () {
        var menuPage = this.$el.find('#menuPageName').val();
        that = this;
        var isTaken = false;
        if (menuPage != '' && menuPage != undefined && menuPage != null) {
            for (var i in that.menuPages) {
                if (that.menuPages[i] === menuPage) {
                    isTaken = true;
                    break;
                }
            }

            if (isTaken) {
                M.toast({ html: '{Literal}This Item Type is already defined{/Literal}' });
            }
            else {
                that.menuPages.push(menuPage);  
                this.reopenModal();
            }
        }
        else {
            M.toast({ html: '{Literal}Please enter a valid Item Type name{/Literal}' });
        }
    },

    reopenModal: function () { 
        var id = this.productLineFormView.model.attributes.id;

        this.productLineFormView.model.attributes.description = this.$el.find('#description').val();
        this.productLineFormView.model.attributes.vatCode = this.$el.find('#vatCode option:selected').text();
        this.productLineFormView.model.attributes.isStock = this.$el.find('#isStock:checked').length > 0;
        this.productLineFormView.model.attributes.taxable = this.$el.find('#taxable:checked').length > 0;
        this.productLineFormView.model.attributes.allowDiscount = this.$el.find('#allow-discounts:checked').length > 0;
        this.productLineFormView.model.attributes.scale = this.$el.find('#scale:checked').length > 0;
        this.productLineFormView.model.attributes.serialized = this.$el.find('#serialized:checked').length > 0;
        this.productLineFormView.model.attributes.noPartialQuantity = this.$el.find('#noPartialQuantity:checked').length > 0;

        if (this.$el.find('#item-type').val() == "Create New Item Type") {
            this.productLineFormView.model.attributes.itemType = this.$el.find('#itemTypeName').val();
        }
        else {
            this.productLineFormView.model.attributes.itemType = this.$el.find('#item-type option:selected').text();
        }

        if (this.$el.find('#item-category').val() == "Create New Item Category") {
            this.productLineFormView.model.attributes.category = this.$el.find('#itemCategoryName').val();
        }
        else {
            this.productLineFormView.model.attributes.category = this.$el.find('#item-category option:selected').text();
        }
        if (this.$el.find('#menu-page').val() == "Create New Menu Page") {
            this.productLineFormView.model.attributes.menuKeyPage = this.$el.find('#menuPageName').val();
        }
        else {
            this.productLineFormView.model.attributes.menuKeyPage = this.$el.find('#menu-page option:selected').text();
        }

        var productLines = this.collection.get(id);
        if (this.collection.get(id) !== null && this.collection.get(id) !== '' && this.collection.get(id) != undefined) {
            this.productLineFormView = new ProductLineFormView({
                template: this.productLineFormTemplate,
                model: this.productLineFormView.model,
                itemTypes: this.itemTypes,
                category: this.category,
                salesAccounts: this.salesAccounts,
                menuPages: this.menuPages,
                choiceGroup: this.choiceGroup,
                vatCode: this.vatCode,
                israCardBuild: this.israCardBuild
            });
            $('#product-line-form-modal').modal().modal('close');
            this.$el.find('#product-line-form-modal').html(this.productLineFormView.render().el);
            this.$el.find('select').formSelect();
            this.formModal.modal('open');
        }

        else {
            var productLines = new ProductLine();
            this.productLineFormView = new ProductLineFormView({
                template: this.productLineFormTemplate,
                model: this.productLineFormView.model,
                itemTypes: this.itemTypes,
                category: this.category,
                salesAccounts: this.salesAccounts,
                menuPages: this.menuPages,
                choiceGroup: this.choiceGroup,
                vatCode: this.vatCode,
                israCardBuild: this.israCardBuild
            });
            $('#product-line-form-modal').modal().modal('close');
            this.$el.find('#product-line-form-modal').html(this.productLineFormView.render().el);
            this.$el.find('select').formSelect();
            this.$el.find("select[required]").css({
                display: "block", 
                position: 'absolute',
                visibility: 'hidden'
            });  
            this.formModal.modal('open');
        }

    },
});