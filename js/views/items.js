var ItemsView = Backbone.View.extend({
    fullCollection: {},
    deletionModal: {},
    itemsRows: 3,
    itemsColumns: 4,
    pages: 0,
    itemTypesTotal: 0,
    advancedOptionSwitch: 0,
    sort: 0,
    cards: true,
    itemsCollectionCut: {},
    currentPageIndex: null,
    selectedPageIndex: 1,
    canAddDelete: false,
    changeItems: false,
    addedItem: false,
    shownItems: [],
    appendItem: false,

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .pagination-trigger': 'handlePageClickEvent',
        'click #pagination-back': 'handlePageBackEvent',
        'click #pagination-forward': 'handlePageForwardEvent',
        'click .edit-items-trigger': 'editItems',
        'click #add-items-button': 'addItems',
        'click .save-button': 'saveItems',
        'click .save-add-button': 'saveAddAnother',
        'click .search-items-button': 'searchItems',
        'click .sort-by-button': 'sortSearch',
        'click .advanced': 'advancedOptions',
        'click .optional-button': 'optionalInfo',
        'keyup #id' : 'validateId',
        'keyup #description' : 'validateDescription',
        'keyup #price' : 'validatePrice',
        'keyup #secondPrice' : 'validateSecondPrice',
        'keyup #altDescription' : 'validateAltDescription',
        'keyup #priceLevel2' : 'validateForm',
        'keyup #priceLevel3' : 'validateForm',
        'keyup #priceLevel4' : 'validateForm',
        'keyup #priceLevel5' : 'validateForm',
        'click .save-item-type-button' : 'chooseNewItemType',
        'click .save-item-category-button' : 'chooseNewCategory',
        'change #productLine1' : 'chooseProductLine',
        'keyup #searchText': 'enterToSearch',
    },

    breadcrumb: {},

    itemsStyleMapping: {},

    styles: [
        'ap-blue',
    ],

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.itemsFormTemplate = options.itemsFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.initItemTypes();
        this.initializePaginator();

    },

    render: function () {
        
        this.$el.html(this.template({
            items: this.collection.toJSON(),
            itemTypes: this.itemTypes,
            choiceGroups: this.choiceGroups,
            category: this.category,
            productLine: this.productLine,
            salesAccounts: this.salesAccounts,
            vatCode: this.vatCode
        }));

        App.breadCrumbToolTip = "Create, manage, and edit your items"

        App.setBreadcrumbs(this.breadcrumb);

        this.deletionModal = $(".modal").modal();
        var that = this;
        $(document).ready(function(){
            $('.modal').modal();
            $('select').formSelect();
            document.getElementById("searchText").focus();
        });
        $('.tooltipped').tooltip();
        this.formModal = this.$el.find('#items-form-modal').modal();
        
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

        if (this.appendItem) {
            var html = '<div id="itemCards"><div class="col m2" style="width: 16.6666666667%; left: auto; right: auto;">'
            html += '<div class="card-panel card-panel-entity z-depth-2 sequence-card hoverable waves-effect waves-light" style="background-color: #ffffff" data-id="'+ that.itemsFormView.model.attributes.id + '" data-selected="0">'
            html += '<div> <div class="row itemDescription truncate" style="font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}ID#{/Literal} '+ that.itemsFormView.model.attributes.id  + '</div>';
            html += '<div> <div class="row description truncate" style="color: #3970b7; font-size: 1rem;">' + that.itemsFormView.model.attributes.description  + '</div>';
            html += '<div class="row type truncate" style="font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}Type:{/Literal}' + that.itemsFormView.model.attributes.type + '</div>'
            html += '<div class="row price truncate" style="font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}Price:{/Literal}' + that.itemsFormView.model.attributes.priceLevel1 + '</div>'
            html += '<div class="row truncate">';
            html += '<div class="discount" style="display: none; font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}Discount:{/Literal}' + that.itemsFormView.model.attributes.allowDiscount + '</div>'
            html += '<div class="category" style="display: none; font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}Category:{/Literal}' + that.itemsFormView.model.attributes.categoryName + '</div>'
            html += '<div class="taxable" style="display: none; font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}Taxable:{/Literal}' + that.itemsFormView.model.attributes.taxable + '</div>'
            html += '<div class="inactive" style="display: none; font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}Inactive:{/Literal}' + that.itemsFormView.model.attributes.inactive + '</div>'
            html += '<div class="allowDiscount" style="display: none; font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}Allow Discount:{/Literal}' + that.itemsFormView.model.attributes.allowDiscount + '</div>'
            html += '<div class="price2" style="display: none; font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}Price Level 2:{/Literal}' + that.itemsFormView.model.attributes.priceLevel2 + '</div>'
            html += '<div class="price3" style="display: none; font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}Price Level 3:{/Literal}' + that.itemsFormView.model.attributes.priceLevel3 + '</div>'
            html += '<div class="price4" style="display: none; font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}Price Level 4:{/Literal}' + that.itemsFormView.model.attributes.priceLevel4 + '</div>'
            html += '<div class="price5" style="display: none; font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}Price Level 5:{/Literal}' + that.itemsFormView.model.attributes.priceLevel5 + '</div>'
            html += '<div class="isStock" style="display: none; font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}Track Stock:{/Literal}' + that.itemsFormView.model.attributes.isStock + '</div>'
            html += '<div class="scale" style="display: none; font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}Scalable:{/Literal}' + that.itemsFormView.model.attributes.scale + '</div>'
            html += '<div class="noPartialQuantity" style="display: none; font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}No Partial Quantity:{/Literal}' + that.itemsFormView.model.attributes.noPartialQuantity + '</div>'
            html += '<div class="serialized" style="display: none; font-size: .95rem; margin-bottom: 0px; color: gray;">{Literal}Has Serial #:{/Literal}' + that.itemsFormView.model.attributes.serialized + '</div>'
            html += '</div>';
            html += '</div>';
            html += '<div class="edit" style="display: none"><a href="javascript:void(0)" class="btn-floating btn-large waves-effect waves-light ap-dark-blue edit-items-trigger" data-id="' + that.itemsFormView.model.attributes.id + '"> <i class="material-icons">edit</i> </a> </div>'
            html += '</div></div></div>' 
            $('#items-wrapper').append(html);
            this.appendItem = false;
        }

        return this;
    },
    
    
    /*--------------------------------------Search Card Options---------------------------------------------- */

    searchItems: function () {
        var that = this;
        var searchText = this.$el.find('#searchText').val();
        var searchField = this.$el.find('#searchField').val();
        for (var i=0; i < this.fullCollection.length; i++) {
            for (var t = 0; t < this.fullCollection.models[i].attributes.id.length; t++) {
                if (searchText.indexOf(this.fullCollection.models[i].attributes.id.charAt(t)) != -1) {
                }
            }
        }

        if (searchText == '') {
            if (this.cards === true) {
                M.toast({ html: '{Literal}Showing all items{/Literal}...' });
                var delayInMilliseconds = 100; 
                setTimeout(function() {
                    that.collection.reset(that.fullCollection.models);
                    that.getItemsTotalCount();
                    that.cards = false;
                    $("#items-pagination").remove();
                    $('.sortBy').show();
                    $('.sortByButton').show();
                    $('#itemBlock').show();
                }, delayInMilliseconds);
            }
            else {
                this.collection.reset(itemsCollectionCut.models);
                this.cards = true;
                $("#items-pagination").show();
                $('.sortBy').hide();
                $('.sortByButton').hide();
            }
        }

        else if (searchField == 0) {
            var filtered = this.fullCollection.byItemDescription(searchText);
            if (filtered.models.length > 0) {
                this.collection.reset(filtered.models);
                
                $("#searchField option[value=" + searchField + "]").attr('selected', '');

                this.shownItems = [];

                if (that.collection.length > 12) {
                    for (var i=0; i < 12; i++) {
                        this.shownItems.push(that.collection.models[i].attributes);
                    }
                    this.selectedPageIndex = 1;
                    that.renderPaginator(this.collection.length);
                    that.renderPaginationChange(this.shownItems, { parentView: this });
                   
                }
                else {
                    that.getItemsTotalCount();
                    that.cards = false;
                    $("#items-pagination").remove();
                    $('#itemBlock').show();
                }
                $("select").formSelect();

                $('#itemBlock').show();
                $('#paginationBlock').show();
            }
            else {
                M.toast({ html: '{Literal}No search results found{/Literal}' }); 
            }
        }

        else if (searchField == 1) {
            var filtered = this.fullCollection.byItemId(searchText);
            if (filtered.length > 0) {
                this.collection.reset(filtered);
                
                $("#searchField option[value=" + searchField + "]").attr('selected', '');

                this.shownItems = [];

                if (that.collection.length > 12) {
                    for (var i=0; i < 12; i++) {
                        this.shownItems.push(that.collection.models[i].attributes);
                    }
                    this.selectedPageIndex = 1;
                    that.renderPaginationChange(this.shownItems, { parentView: this });
                    that.renderPaginator(that.collection.length);
                }
                else {
                    that.getItemsTotalCount();
                    that.cards = false;
                    $("#items-pagination").remove();
                    $('#itemBlock').show();
                }
                $("select").formSelect();

                $('#itemBlock').show();
                $('#paginationBlock').show();
            }
            else {
                M.toast({ html: '{Literal}No search results found{/Literal}' });
            }
        }

        else if (searchField == 2) {
            var filtered = this.fullCollection.byItemType(searchText);
            if (filtered.models.length > 0) {
                this.collection.reset(filtered.models);
                
                $("#searchField option[value=" + searchField + "]").attr('selected', '');

                this.shownItems = [];

                if (that.collection.length > 12) {
                    for (var i=0; i < 12; i++) {
                        this.shownItems.push(that.collection.models[i].attributes);
                    }
                    this.selectedPageIndex = 1;
                    that.renderPaginationChange(this.shownItems, { parentView: this });
                    that.renderPaginator(that.collection.length);
                }
                else {
                    that.getItemsTotalCount();
                    that.cards = false;
                    $("#items-pagination").remove();
                    $('#itemBlock').show();
                }
                $("select").formSelect();

                $('#itemBlock').show();
                $('#paginationBlock').show();
            }
            else {
                M.toast({ html: '{Literal}No search results found{/Literal}' }); 
            }
        }

        else if (searchField == 3) {
            var filtered = this.fullCollection.byAltDescription(searchText);
            if (filtered.models.length > 0) {
                this.collection.reset(filtered.models);
                
                $("#searchField option[value=" + searchField + "]").attr('selected', '');

                this.shownItems = [];

                if (that.collection.length > 12) {
                    for (var i=0; i < 12; i++) {
                        this.shownItems.push(that.collection.models[i].attributes);
                    }
                    this.selectedPageIndex = 1;
                    that.renderPaginationChange(this.shownItems, { parentView: this });
                    that.renderPaginator(that.collection.length);
                }
                else {
                    that.getItemsTotalCount();
                    that.cards = false;
                    $("#items-pagination").remove();
                    $('#itemBlock').show();
                }
                $("select").formSelect();

                $('#itemBlock').show();
                $('#paginationBlock').show();
            }
            else {
                M.toast({ html: '{Literal}No search results found{/Literal}' });
            }
        }

        else if (searchField == 4) {
            var filtered = this.fullCollection.byCategory(searchText);
            if (filtered.models.length > 0) {
                this.collection.reset(filtered.models);
                
                $("#searchField option[value=" + searchField + "]").attr('selected', '');

                this.shownItems = [];

                if (that.collection.length > 12) {
                    for (var i=0; i < 12; i++) {
                        this.shownItems.push(that.collection.models[i].attributes);
                    }
                    this.selectedPageIndex = 1;
                    that.renderPaginationChange(this.shownItems, { parentView: this });
                    that.renderPaginator(that.collection.length);
                }
                else {
                    that.getItemsTotalCount();
                    that.cards = false;
                    $("#items-pagination").remove();
                    $('#itemBlock').show();
                }
                $("select").formSelect();

                $('#itemBlock').show();
                $('#paginationBlock').show();
            }
            else {
                M.toast({ html: '{Literal}No search results found{/Literal}' });
            }
        }
    },
    
    sortSearch: function () {
        var sortBy = this.$el.find('#sortBy1').val();
        if (sortBy == 0) {
            sort = 1; 
            filtered = this.collection.sortBy("description");
            this.collection.reset(filtered);
            this.getItemsTotalCount();
            $('.sortBy').show();
            $('.sortByButton').show();
            $("#items-pagination").remove();
        }
        else if (sortBy == 1) {
            sort = 2; 
            filtered = this.collection.sortBy("description").reverse();
            this.collection.reset(filtered);
            this.getItemsTotalCount();
            $('.sortBy').show();
            $('.sortByButton').show();
            $("#items-pagination").remove();
        }
        else if (sortBy == 2) {
            sort = 0; 
            filtered = this.collection.sortBy("id");
            this.collection.reset(filtered);
            this.getItemsTotalCount();
            $('.sortBy').show();
            $('.sortByButton').show();
            $("#items-pagination").remove();
        }
        else if (sortBy == 3) {
            sort = 3; 
            filtered = this.collection.sortBy("id").reverse();
            this.collection.reset(filtered);
            this.getItemsTotalCount();
            $('.sortBy').show();
            $('.sortByButton').show();
            $("#items-pagination").remove();
        }
        $('#itemBlock').show();
        $('#paginationBlock').show();
    },

    enterToSearch: function (e) {
        if (e.keyCode == 13) {
            this.$el.find(".search-items-button").trigger("click");
        }
    }, 

    /*-------------------------------------------Initialize/Render Options---------------------------------------------- */
  
    initItemTypes:  function () {
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
        
        
        this.initProductLine();
    },

    initProductLine: function() {
        this.getProductLine();
    },

    getProductLine: function () {
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
                for (var i = 0; i < data.results.length; i++) {
                    var newObj = {};
                    newItemType = data.results[i].type

                    newObj.id = newItemType;
                    newObj.name = newItemType;

                    that.itemTypes.push(newObj);
                }
                that.getItemTypeTotalCount(that.itemTypes);
                that.productLine = data.results;
                that.renderProductLine(data.results);
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

    renderProductLine: function (data) {
        var that = this;
        for (var i = 0; i < data.length; i++) {
            var currentProductLine = data[i];
        }
        this.initChoiceGroups();
    },

    initChoiceGroups:  function () {
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
                that.choiceGroups = data.results;
                that.renderChoiceGroups(data.results); 
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem fetching choice groups from the server{/Literal}' });
                }
            }
        });
    },
    
    renderChoiceGroups: function (data) {
        var that = this;
        for (var i = 0; i < data.length; i++) {
            var currentChoiceGroup = data[i];
        }
        this.initCategory();
    },

    initCategory:  function () {
        this.getCategory();
    },  

    getCategory: function () {
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
        this.initSalesAccounts();
    },

    initSalesAccounts: function () {
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
        this.initvatCode();
    },

    initializeCounter: function () {
        this.getItemTypeTotalCount();
    },

    getItemTypeTotalCount: function (currentItemTypes) {       
        var that = this;     
        var sessionToken = this.getCookie();   
        $.ajax({
            url: '/data/get-items-type-count',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var itemTypesTotal = data.results;
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
            }
        });
    },

    initvatCode: function() {
        this.getvatCode();
    },

    getvatCode: function () {
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
        this.initItems();
    },

    /*--------------------------------------Form Options---------------------------------------------- */

    editItems: function (e) {
        if (this.changeItems) {
           
            var element = $(e.currentTarget);
            var id = $(element).attr('data-id');
            var items = this.collection.get(id);
            this.advancedOptionSwitch = 0;
    
            if (this.collection.get(id) !== null && this.collection.get(id) !== '') {
                this.itemsFormView = new ItemsFormView({
                    template: this.itemsFormTemplate,
                    model: items,
                    itemTypes: this.itemTypes,
                    choiceGroups: this.choiceGroups,
                    category: this.category,
                    salesAccounts: this.salesAccounts,
                    productLine: this.productLine,
                    vatCode: this.vatCode
                });
                this.formModal = this.$el.find('#items-form-modal').modal();
                this.$el.find('#items-form-modal').html(this.itemsFormView.render().el);
                this.$el.find('select').formSelect();
                this.formModal.modal('open');
            }
            else {
                M.toast({ html: '{Literal}There was a problem fetching data from the server{/Literal}' });
            }
        }
        else {
            M.toast({ html: '{Literal}You do not have access to edit items{/Literal}' });
        }
    },

    addAnotherItem: function () {
        if (this.canAddDelete) {
            var productLine = this.itemsFormView.model.attributes.productLine;
            var type = this.itemsFormView.model.attributes.type;
            var category = this.itemsFormView.model.attributes.category;

            this.addedItem = true;
            this.advancedOptionSwitch = 0;
            this.isCreateMode = true;
            var items = new Items();

            items.attributes.type = type;
            items.attributes.productLine = productLine;
            items.attributes.category = category;

            this.itemsFormView = new ItemsFormView({
                template: this.itemsFormTemplate,
                model: items,
                itemTypes: this.itemTypes,
                choiceGroups: this.choiceGroups,
                category: this.category,
                salesAccounts: this.salesAccounts,
                productLine: this.productLine,
                vatCode: this.vatCode
            });

            this.$el.find('#items-form-modal').html(this.itemsFormView.render().el);
            this.$el.find('select').formSelect();
            this.$el.find("select[required]").css({
                display: "block", 
                position: 'absolute',
                visibility: 'hidden'
            });  
            this.formModal = this.$el.find('#items-form-modal').modal();
            this.formModal.modal('open');
            $('#productLine1').show(); 
            $("#id").removeAttr('disabled')
        }
        else {
            M.toast({ html: '{Literal}You do not have access to add items{/Literal}' });
        }
    },

    addItems: function () {
        if (this.canAddDelete) {
            this.addedItem = true;
            this.advancedOptionSwitch = 0;
            this.isCreateMode = true;
            var items = new Items();
            this.itemsFormView = new ItemsFormView({
                template: this.itemsFormTemplate,
                model: items,
                itemTypes: this.itemTypes,
                choiceGroups: this.choiceGroups,
                category: this.category,
                salesAccounts: this.salesAccounts,
                productLine: this.productLine,
                vatCode: this.vatCode
            });
    
            this.$el.find('#items-form-modal').html(this.itemsFormView.render().el);
            this.$el.find('select').formSelect();
            this.$el.find("select[required]").css({
                display: "block", 
                position: 'absolute',
                visibility: 'hidden'
            });  
            this.formModal = this.$el.find('#items-form-modal').modal();
            this.formModal.modal('open');
            $('#productLine1').show(); 
            $("#id").removeAttr('disabled')
        }
        else {
            M.toast({ html: '{Literal}You do not have access to add items{/Literal}' });
        }
    },

    /*--------------------------------------Card Options---------------------------------------------- */

    generateItemsStyleMapping: function (data) {
        var items = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        for (var i = 0; i < data.length; i++) {
            if (items.indexOf(data[i].id) < 0) {
                items.push(data[i].id);
                this.itemsStyleMapping[data[i].id] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
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
    
    advancedOptions: function() {
        if (this.advancedOptionSwitch % 2 == 0) {
            $('#price0').hide(); 
            $('#category2').hide(); 
            $('#productLine1').hide(); 
            $('#category1').show(); 
            $('#choiceGroup1').show(); 
            if (App.serverInfo.hasAccounting) {
                $('#salesAccount1').show(); 
            }
            $('#altDescription1').show(); 
            $('#availability1').show(); 
            $('#quantity1').show(); 
            $('#price1').show(); 
            $('#price2').show(); 
            $('#price3').show(); 
            $('#price4').show(); 
            $('#price5').show(); 
            $('#allowDiscount1').show(); 
            $('#isStock1').show(); 
            $('#inactive1').show();
            $('#scale1').show(); 
            $('#noPartialQuantity1').show(); 
            $('#serialized1').show();
            if (App.serverInfo.hasVatTax) {
                $('#taxable1').show();
            } 
            else {
                $('#taxable2').show(); 
            }

            this.advancedOptionSwitch++;
        } 
        else {
            if (this.itemsFormView.model.attributes.id == "") {
                $('#productLine1').show(); 
            }
            $('#price0').show(); 
            $('#category1').hide(); 
            $('#category2').show();
            $('#choiceGroup1').hide(); 
            $('#salesAccount1').hide(); 
            $('#altDescription1').hide(); 
            $('#availability1').hide(); 
            $('#available1').hide(); 
            $('#quantity1').hide(); 
            $('#price1').hide(); 
            $('#price2').hide(); 
            $('#price3').hide(); 
            $('#price4').hide(); 
            $('#price5').hide(); 
            $('#allowDiscount1').hide(); 
            $('#isStock1').hide(); 
            $('#inactive1').hide();
            $('#scale1').hide(); 
            $('#noPartialQuantity1').hide(); 
            $('#serialized1').hide(); 
            $('#taxable1').hide(); 
            $('#taxable2').hide(); 
            this.advancedOptionSwitch++;
        } 
    },

    optionalInfo: function() {
        $('.discount').hide();
        $('.category').hide();
        $('.taxable').hide();
        $('.inactive').hide();
        $('.allowDiscount').hide();
        $('.price2').hide();
        $('.price3').hide();
        $('.price4').hide();
        $('.price5').hide();
        $('.isStock').hide();
        $('.scale').hide();
        $('.noPartialQuantity').hide();
        $('.serialized').hide();

        var optional = this.$el.find('#optional1').val();

        if (optional == 1) {
            $('.category').show();
        }
        else if (optional == 2) {
            $('.taxable').show();
        }
        else if (optional == 3) {
            $('.inactive').show();
        }
        else if (optional == 0) {
            $('.discount').show();
        }
        else if (optional == 5) {
            $('.allowDiscount').show();
        }
        else if (optional == 6) {
            $('.price2').show();
        }
        else if (optional == 7) {
            $('.price3').show();
        }
        else if (optional == 8) {
            $('.price4').show();
        }
        else if (optional == 9) {
            $('.price5').show();
        }
        else if (optional == 10) {
            $('.isStock').show();
        }
        else if (optional == 11) {
            $('.scale').show();
        }
        else if (optional == 12) {
            $('.noPartialQuantity').show();
        }
        else if (optional == 4) {
            $('.serialized').show();
        }


    },
    
    /*------------------------------ Pagination Stuff ------------------------------------*/

    initializePaginator: function () {
        this.getItemsTotalCount();
    },

    renderPaginator: function (itemsTotalCount) {
        $('.pagination-trigger').remove();

        this.pages = Math.ceil(1.0 * itemsTotalCount / (this.itemsRows * this.itemsColumns));
        
        if (this.pages > 10 & this.selectedPageIndex > 5) {
            if (this.pages < this.selectedPageIndex + 6) {
                var start = this.selectedPageIndex - 4;
                var currentPageElement = $('<li class="waves-effect pagination-trigger" data-page="' + start + '"><a href="javascript:void(0)">' + start + '</a></li>');
                $("#pagination-back").after(currentPageElement);
                for (var i = this.selectedPageIndex - 3; i <= this.pages; i++) {
                    var lastElement = currentPageElement;
                    currentPageElement = $('<li class="waves-effect pagination-trigger" data-page="' + i + '"><a href="javascript:void(0)">' + i + '</a></li>');
                    if (this.selectedPageIndex === i) {
                        $(currentPageElement).addClass('active').addClass('ap-blue');
                    }
                    $(lastElement).after(currentPageElement);
                }
            }
            else {
                var start = this.selectedPageIndex - 4;
                var currentPageElement = $('<li class="waves-effect pagination-trigger" data-page="' + start + '"><a href="javascript:void(0)">' + start + '</a></li>');
                $("#pagination-back").after(currentPageElement);
                for (var i = this.selectedPageIndex - 3; i <= this.selectedPageIndex + 5; i++) {
                    var lastElement = currentPageElement;
                    currentPageElement = $('<li class="waves-effect pagination-trigger" data-page="' + i + '"><a href="javascript:void(0)">' + i + '</a></li>');
                    if (this.selectedPageIndex === i) {
                        $(currentPageElement).addClass('active').addClass('ap-blue');
                    }
                    $(lastElement).after(currentPageElement);
                }
            }
        } 
        else if (this.pages > 10 & this.selectedPageIndex < 6) {
            var currentPageElement = $('<li class="pagination-trigger" data-page="1"><a href="javascript:void(0)">1</a></li>');
            if (this.selectedPageIndex === 1) {
                $(currentPageElement).addClass('active').addClass('ap-blue');
            }
            $("#pagination-back").after(currentPageElement);
            for (var i = 2; i <= 10; i++) {
                var lastElement = currentPageElement;
                currentPageElement = $('<li class="waves-effect pagination-trigger" data-page="' + i + '"><a href="javascript:void(0)">' + i + '</a></li>');
                if (this.selectedPageIndex === i) {
                    $(currentPageElement).addClass('active').addClass('ap-blue');
                }
                $(lastElement).after(currentPageElement);
            }
        }
        else {
            var currentPageElement = $('<li class="pagination-trigger" data-page="1"><a href="javascript:void(0)">1</a></li>');
            if (this.selectedPageIndex === 1) {
                $(currentPageElement).addClass('active').addClass('ap-blue');
            }
            $("#pagination-back").after(currentPageElement);
            for (var i = 2; i <= this.pages; i++) {
                var lastElement = currentPageElement;
                currentPageElement = $('<li class="waves-effect pagination-trigger" data-page="' + i + '"><a href="javascript:void(0)">' + i + '</a></li>');
                if (this.selectedPageIndex === i) {
                    $(currentPageElement).addClass('active').addClass('ap-blue');
                }
                $(lastElement).after(currentPageElement);
            }
        }
        
        document.getElementById("searchText").focus();
        $("#items-pagination").show();
    },

    handlePageBackEvent: function (e) {
        var element = $(e.currentTarget);
        if ($(element).hasClass('disabled') === false) {
            var currentPage = parseInt($("#items-pagination").attr("data-current-page"));
            this.goToItemsPage(this.selectedPageIndex - 1, -1);
        }
    },

    handlePageForwardEvent: function (e) {
        var element = $(e.currentTarget);
        if ($(element).hasClass('disabled') === false) {
            var currentPage = parseInt($("#items-pagination").attr("data-current-page"));
            this.goToItemsPage(this.selectedPageIndex + 1, -1);
        }
        
    },

    handlePageClickEvent: function (e) {
        var element = $(e.currentTarget);
        var selectedPage = parseInt($(element).attr('data-page'));

        var currentPage = parseInt($("#items-pagination").attr("data-current-page"));
        this.goToItemsPage(selectedPage, currentPage);
    },

    goToItemsPage: function (selectedPage, currentPage) {
        var element = $(".pagination-trigger[data-page=" + selectedPage + "]");
        var offset = this.itemsColumns * this.itemsRows;
        var args = {
            selectedPage: selectedPage,
            element: element,
            parentView: this
        };
        this.selectedPageIndex = selectedPage;
        var nextPageItems = [];

        if (selectedPage * 12 > this.collection.length) {
            for (var i = (selectedPage * 12) - 12; i < this.collection.length; i++) {
                nextPageItems.push(this.collection.models[i].attributes);
            }
        }    
        else if (selectedPage * 12 < this.collection.length) {
            var showItems = selectedPage * 12;
            for (var i = showItems - 12; i < showItems; i++) {
                nextPageItems.push(this.collection.models[i].attributes);
            }
        }
       
        this.renderPaginationChange(nextPageItems, args);
        
    },
    
    renderPaginationChange: function (items, args) {
        this.cards = true;
        var that = args.parentView;
        var selectedPage = args.selectedPage;
        var element = args.element;
        var itemsCollection = new ItemsCollection();
        for (var i = 0; i < items.length; i++) {
            itemsCollection.add(new Items({
                id: items[i].id,
                description: items[i].description,
                type: items[i].type,
                price: items[i].price,
                price1: items[i].price,
                productLine: items[i].productLine,
                priceLevel1: items[i].price,
                priceLevel2: items[i].priceLevel2,
                priceLevel3: items[i].priceLevel3,
                priceLevel4: items[i].priceLevel4,
                priceLevel5: items[i].priceLevel5,
                choiceGroup: items[i].choiceGroup,
                altDescription: items[i].altDescription,
                category: items[i].category,
                salesAccount: items[i].salesAccount,
                operatorMessage: items[i].operatorMessage,
                allowDiscount: items[i].allowDiscount,
                isStock: items[i].isStock,
                inactive: items[i].inactive,
                scale: items[i].scale,
                serialized: items[i].serialized,
                vatCode: items[i].vatCode,
                taxable: items[i].taxable,
                onHand: items[i].onHand,
                trackAvailableOption: items[i].trackAvailableOption,
                warnAvailableNumber: items[i].warnAvailableNumber
            }));
        }

        this.$el.html(this.template({
            items: itemsCollection.toJSON(),
            itemTypes: this.itemTypes,
            choiceGroups: this.choiceGroups,
            category: this.category,
            productLine: this.productLine,
            salesAccounts: this.salesAccounts,
            vatCode: this.vatCode
        }));

        this.renderPaginator(this.collection.length);

        $('.modal').modal();
        $('select').formSelect();
        $("#items-pagination").attr("data-current-page", this.selectedPageIndex);
        if (this.collection.length > 12) {
            if (this.selectedPageIndex === 1 && this.fullCollection.length > this.collection.length) {
                $('#itemBlock').show();
                $('#paginationBlock').show();
                $("#pagination-back").addClass('disabled').removeClass('waves-effect');
                $("#pagination-forward").removeClass('disabled').addClass('waves-effect');
            } else if (this.selectedPageIndex === 1) {
                $("#pagination-back").addClass('disabled').removeClass('waves-effect');
                $("#pagination-forward").removeClass('disabled').addClass('waves-effect');
            } else if (this.selectedPageIndex === that.pages) {
                $('#itemBlock').show();
                $('#paginationBlock').show();
                $("#pagination-back").removeClass('disabled').addClass('waves-effect');
                $("#pagination-forward").addClass('disabled').removeClass('waves-effect');
            } else {
                $('#itemBlock').show();
                $('#paginationBlock').show();
                $("#pagination-back").removeClass('disabled').addClass('waves-effect');
                $("#pagination-forward").removeClass('disabled').addClass('waves-effect');
            }
        }

        $("#items-modal-preloader").hide();
    },

    getItemsTotalCount: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-items-total-count',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var count = data.results;
                that.renderPaginator(count);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {

                }
            }
        });
    },

    /*--------------------------------------Initialize/Render Items---------------------------------------------- */
    getCookie: function() {
        var nameEQ = "sessionCookie" + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
    },

    initItems:  function () {
        var itemsPerPage = this.itemsColumns * this.itemsRows;
        var fullItems = this.getItemsFull();
        var items = this.getItems(itemsPerPage, 1, { parentView: this });
    },

    getItems: function (pageSize, pageNumber, callbackArgs) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-items',
            data: {
                items: that.items,
                offset: pageSize,
                pageNumber: pageNumber,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                if (typeof data.results !== 'undefined') {
                    for (var i = 0; i < data.results.length; i++) {
                        var itemTypeId = data.results[i].type;
                        var categoryId = data.results[i].category;                       
                        if (typeof that.itemTypes !== 'undefined') {
                            var itemType = that.itemTypes.filter(
                                function (element) {
                                    return element.id === itemTypeId;
                                }
                            );
                            if (itemType.length > 0) {
                                data.results[i].itemTypeName = itemType[0].name;
                            } else {
                                data.results[i].itemTypeName = 'N/A';    
                            }
                        } else {
                            data.results[i].itemTypeName = 'N/A';
                        }

                        if (typeof that.category !== 'undefined') {
                            var category = that.category.filter(
                                function (element) {
                                    return element.id === categoryId;
                                }
                            );
                            if (category.length > 0) {
                                data.results[i].categoryName = category[0].name;
                            } else {
                                data.results[i].categoryName = 'N/A';    
                            }
                        }
                        else {
                            data.results[i].categoryName = 'N/A';
                        }
                    }
                }
                that.renderItems(data.results);
                that.renderPaginationChange(data.results, callbackArgs);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {

                }
            }
        });
    },

    getItemsFull: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-items-full',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                if (typeof data.results !== 'undefined') {
                    for (var i = 0; i < data.results.length; i++) {
                        var itemTypeId = data.results[i].type;
                        var categoryId = data.results[i].category;                       
                        if (typeof that.itemTypes !== 'undefined') {
                            var itemType = that.itemTypes.filter(
                                function (element) {
                                    return element.id === itemTypeId;
                                }
                            );
                            if (itemType.length > 0) {
                                data.results[i].itemTypeName = itemType[0].name;
                            } else {
                                data.results[i].itemTypeName = 'N/A';    
                            }
                        } else {
                            data.results[i].itemTypeName = 'N/A';
                        }

                        if (typeof that.category !== 'undefined') {
                            var category = that.category.filter(
                                function (element) {
                                    return element.id === categoryId;
                                }
                            );
                            if (category.length > 0) {
                                data.results[i].categoryName = category[0].name;
                            } else {
                                data.results[i].categoryName = 'N/A';    
                            }
                        }
                        else {
                            data.results[i].categoryName = 'N/A';
                        }
                    }
                }
                that.fullCollectionMethod(data.results);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({
                        html: '{Literal}There was a problem fetching data from the server{/Literal}'
                    });
                }
            }
        });
    },

    fullCollectionMethod: function (data) {
        var collection = new ItemsCollection();
        for (var i = 0; i < data.length; i++) {
            var currentItems = data[i];
            collection.add(new Items(currentItems));
        }
    
        this.fullCollection = collection;
    },

    renderItems: function (data) {
        this.checkAccess();
        var that = this;
        this.generateItemsStyleMapping(data);

        data.sort(function (a, b) {
            return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
        });
        
        itemsCollectionCut = new ItemsCollection();
        for (var i = 0; i < data.length; i++) {
            var currentItems = data[i];
            currentItems.cardStyleClass = that.itemsStyleMapping[data[i].id];
            itemsCollectionCut.add(new Items(currentItems));
        }
        that.collection == itemsCollectionCut.models;
    },

    checkAccess: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/check-access',
            data: {
                accessName: (App.IDS_ADD_DEL_ITEMS),
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                that.canAddDelete = true;
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else if (e.responseJSON.hasAccess == false) {
                    that.canAddDelete = false;
                }
            }
        });

        $.ajax({
            url: '/data/check-access',
            data: {
                accessName: (App.IDS_MODIFY_ITEMS),
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                that.changeItems = true;
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else if (e.responseJSON.hasAccess == false) {
                    that.changeItems = false;
                }
            }
        });
    },

    /*--------------------------------------Update/Save Model---------------------------------------------- */

    getFormValues: function () {
        if (this.advancedOptionSwitch % 2 == 0) {
            var id = this.$el.find('#id').val();
            var description = this.$el.find('#description').val();
            var price = this.$el.find('#price').val();
            var type = this.$el.find('#item-type-dropdown option:selected').text();
            var category = this.$el.find('#item-category-dropdown2 option:selected').text();
            if (type == "Create New Item Type") {
                type = "N/A"
            }

            var productLine = this.$el.find('#product-line-dropdown option:selected').text();
            if (productLine == "Select Product Line") {
                productLine = this.itemsFormView.model.attributes.productLine;
            }
            
            var priceLevel2 = this.itemsFormView.model.attributes.priceLevel2;
            var priceLevel3 = this.itemsFormView.model.attributes.priceLevel3;
            var priceLevel4 = this.itemsFormView.model.attributes.priceLevel4;
            var priceLevel5 = this.itemsFormView.model.attributes.priceLevel5;
            var choiceGroup = this.itemsFormView.model.attributes.choiceGroup;
            var altDescription = this.itemsFormView.model.attributes.altDescription;
            var allowDiscount = this.itemsFormView.model.attributes.allowDiscount;
            var isStock = this.itemsFormView.model.attributes.isStock;
            var inactive = this.itemsFormView.model.attributes.inactive;
            var scale = this.itemsFormView.model.attributes.scale;
            var serialized = this.itemsFormView.model.attributes.serialized;
            var noPartialQuantity = this.itemsFormView.model.attributes.noPartialQuantity;
            var taxable = this.itemsFormView.model.attributes.taxable;
            var vatCode = this.itemsFormView.model.attributes.vatCode;
            var quantity = this.$el.find('#quantity').val();
            var availability = this.$el.find('#availability-dropdown option:selected').text();
            var available = this.$el.find('#available').val();
        }
        else {
            var id = this.$el.find('#id').val();
            var description = this.$el.find('#description').val();
            var type = this.$el.find('#item-type-dropdown option:selected').text();
            if (type == "Create New Item Type") {
                type = "N/A"
            }

            var price = this.$el.find('#secondPrice').val();
            var priceLevel2 = this.$el.find('#priceLevel2').val();
            var priceLevel3 = this.$el.find('#priceLevel3').val();
            var priceLevel4 = this.$el.find('#priceLevel4').val();
            var priceLevel5 = this.$el.find('#priceLevel5').val();
            var choiceGroup =  this.$el.find('#choice-group-dropdown option:selected').text();
            var altDescription = this.$el.find('#altDescription').val();
            var category = this.$el.find('#item-category-dropdown1 option:selected').text();
            if (category == "Create New Item Category") {
                category = "N/A"
            }

            var productLine = this.$el.find('#product-line-dropdown option:selected').text();
            if (productLine == "Select Product Line") {
                productLine = this.itemsFormView.model.attributes.productLine;
            }
            
            var salesAccount = this.$el.find('#sales-account-dropdown option:selected').text();
            var allowDiscount = this.$el.find('.allowDiscount:checked').length > 0
            var isStock = this.$el.find('.isStock:checked').length > 0
            var inactive = this.$el.find('.inactive:checked').length > 0
            var scale = this.$el.find('.scale:checked').length > 0
            var serialized = this.$el.find('.serialized:checked').length > 0
            var noPartialQuantity = this.$el.find('.noPartialQuantity:checked').length > 0
           
            if (vatCode != 0) {
                var vatCode = this.$el.find('#vat-tax-dropdown option:selected').text();
            }
            else {
                var vatCode = ""
            }

            var quantity = this.$el.find('#quantity').val();
            var availability = this.$el.find('#availability-dropdown option:selected').text();
            var available = this.$el.find('#available').val();

            if (!App.serverInfo.hasVatTax) {
                var taxable = this.$el.find('#taxable2:checked').length > 0
            }
            else 
            {
                var taxable = true;
            }
            
            if (App.israCardBuild) {
                availability = null;
                available = null;
                taxable = null;
            }
        }
        
        var updatedModel = {
            id: id,
            description: description,
            price: parseFloat(price),
            type: type,
            productLine: productLine,
            priceLevel1: parseFloat(price),
            priceLevel2: parseFloat(priceLevel2),
            priceLevel3: parseFloat(priceLevel3),
            priceLevel4: parseFloat(priceLevel4),
            priceLevel5: parseFloat(priceLevel5),
            choiceGroup: choiceGroup,
            altDescription: altDescription,
            itemCategory: category,
            salesAccount: salesAccount,
            allowDiscount: allowDiscount,
            isStock: isStock,
            inactive: inactive,
            scale: scale,
            serialized: serialized,
            noPartialQuantity: noPartialQuantity,
            vatCode: vatCode,
            taxable: taxable,
            onHand: quantity,
            trackAvailableOption: availability,
            warnAvailableNumber: available,
            itemTypeName: type,
            categoryName: category,
            category: category
        };
        this.itemsFormView.model.set(updatedModel);
    },

    validateId: function () {
        var validateItemId = this.$el.find("#id").val();
        if (validateItemId.trim().length < 1) {
            this.$el.find("#id").addClass("invalid");
        }
        else {
            var iChars = "`~!@#$%^&*()_+=[]{};,<>./?*\\\'\"";
            for (var i = 0; i < validateItemId.length; i++) {
                if (iChars.indexOf(validateItemId.charAt(i)) != -1) {
                    this.$el.find("#id").addClass("invalid");
                    break;
                }
            }
        }
    },

    validateDescription: function () { 
        var validateDescription = this.$el.find("#description").val();
        if (validateDescription.trim().length < 1) {
            this.$el.find("#description").addClass("invalid");
        }
        else {
            var iChars = "`~!@$%^&*()_+=[]{};<>/?*\\\'\"";
            for (var i = 0; i < validateDescription.length; i++) {
                if (iChars.indexOf(validateDescription.charAt(i)) != -1) {
                    this.$el.find("#description").addClass("invalid");
                    break;
                }
            }
        }
    },

    validatePrice: function () {
        var validatePrice = this.$el.find("#price").val(); 

        var price = document.getElementById('price');
        var secondPrice = document.getElementById('secondPrice');

        if (validatePrice.trim().length < 1) {
            this.$el.find("#price").addClass("invalid");
        }
        else if (validatePrice.indexOf("-") > -1 || validatePrice.indexOf('e') > -1) {
            this.$el.find("#price").addClass("invalid");
        }
        else if (validatePrice > 999999) {
            this.$el.find("#price").addClass("invalid");
        }
        else {
            secondPrice.value = price.value;
        }
    },

    validateSecondPrice: function () {
        var price = document.getElementById('price');
        var secondPrice = document.getElementById('secondPrice');

        var validateSecondPrice = this.$el.find("#secondPrice").val(); 
        if (validateSecondPrice.trim().length < 1) {
            this.$el.find("#secondPrice").addClass("invalid");
        }
        else if (validateSecondPrice.indexOf("-") > -1 || validateSecondPrice.indexOf('e') > -1) {
            this.$el.find("#secondPrice").addClass("invalid");
        }
        else if (validateSecondPrice > 999999) {
            this.$el.find("#secondPrice").addClass("invalid");
        }
        else {
            price.value = secondPrice.value;
        }
    },

    validateAltDescription: function () {
        var validateAltDescription = this.$el.find("#altDescription").val();
        var iChars = "`~!@#$^&*()_+=[]{}:;,<>./?*\\\'\"";
        for (var i = 0; i < validateAltDescription.length; i++) {
            if (iChars.indexOf(validateAltDescription.charAt(i)) != -1) {
                this.$el.find("#altDescription").addClass("invalid");
                break;
            }
        }
    },

    validateForm: function () {
        var valid = true;

        var validateDescription = this.$el.find("#description").val();
        if (validateDescription.trim().length < 1) {
            this.$el.find("#description").addClass("invalid");
            valid = false;
        }
        else {
            var iChars = "`~!@#^&*()_+=[]{}:;<>/?*\\\'\"";
            for (var i = 0; i < validateDescription.length; i++) {
                if (iChars.indexOf(validateDescription.charAt(i)) != -1) {
                    this.$el.find("#description").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }

        var validateItemId = this.$el.find("#id").val();
        if (validateItemId.trim().length < 1) {
            this.$el.find("#id").addClass("invalid");
            valid = false;
        }
        else {
            var iChars = "`~!@#^&*()_+=[]{};,<>./?*\\\'\"";
            for (var i = 0; i < validateItemId.length; i++) {
                if (iChars.indexOf(validateItemId.charAt(i)) != -1) {
                    this.$el.find("#id").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }
        
        if (this.advancedOptionSwitch % 2 == 0) {
            var validatePrice = this.$el.find("#price").val(); 
            if (validatePrice.trim().length < 1) {
                this.$el.find("#price").addClass("invalid");
                valid = false;
            }
            else if (validatePrice.indexOf("-") > -1 || validatePrice.indexOf('e') > -1) {
                this.$el.find("#price").addClass("invalid");
                valid = false;
            }
            else if (validatePrice > 999999) {
                this.$el.find("#price").addClass("invalid");
                valid = false;
            }
        }
        else if (this.advancedOptionSwitch % 2 != 0) {
            var validateSecondPrice = this.$el.find("#secondPrice").val(); 
            if (validateSecondPrice.trim().length < 1) {
                this.$el.find("#secondPrice").addClass("invalid");
                valid = false;
            }
            else if (validateSecondPrice.indexOf("-") > -1 || validateSecondPrice.indexOf('e') > -1) {
                this.$el.find("#secondPrice").addClass("invalid");
                valid = false;
            }
            else if (validateSecondPrice > 999999) {
                this.$el.find("#secondPrice").addClass("invalid");
                valid = false;
            }

            var validateAltDescription = this.$el.find("#altDescription").val();
            var iChars = "`~!@#^&*()_+=[]{}:;,<>./?*\\\'\"";
            for (var i = 0; i < validateAltDescription.length; i++) {
                if (iChars.indexOf(validateAltDescription.charAt(i)) != -1) {
                    this.$el.find("#altDescription").addClass("invalid");
                    valid = false;
                    break;
                }
            }
            this.$el.find("#priceLevel2").val();
            var valuePriceLevel2 = document.getElementById('priceLevel2');
            var valuePriceLevel3 = document.getElementById('priceLevel3');
            var valuePriceLevel4 = document.getElementById('priceLevel4');
            var valuePriceLevel5 = document.getElementById('priceLevel5');

            if (valuePriceLevel2.value == '' || valuePriceLevel2.value < 0 || valuePriceLevel2.value > 999999) {
                valuePriceLevel2.value = 0;
            }

            if (valuePriceLevel3.value == '' || valuePriceLevel3.value < 0 || valuePriceLevel3.value > 999999) {
                valuePriceLevel3.value = 0;
            }

            if (valuePriceLevel4.value == '' || valuePriceLevel4.value < 0 || valuePriceLevel4.value > 999999) {
                valuePriceLevel4.value = 0;
            }

            if (valuePriceLevel5.value == '' || valuePriceLevel5.value < 0 || valuePriceLevel5.value > 999999) {
                valuePriceLevel5.value = 0;
            }
        }

        return valid;
    },

    saveAddAnother: function () {
        var that = this;
        if (this.addedItem) {
            if (this.advancedOptionSwitch % 2 == 0) {
                this.$el.find('#productLine1 option:selected').text();

                if ($('#productLine1:visible').length != 0 && this.$el.find('#productLine1 option:selected').text() == "Choose Product Line") {
                    M.toast({
                        html: '{Literal}You must choose a product line{/Literal}'
                    });
                }
                else {
                    this.saveItems();

                    var delayInMilliseconds = 1000; //1 second
                    setTimeout(function() {
                        that.addAnotherItem();
                    }, delayInMilliseconds);
                }
            }
        }
        else {
            this.saveItems();

            var delayInMilliseconds = 1000; //1 second
            setTimeout(function() {
                that.addItems();
            }, delayInMilliseconds);
        }

    },

    saveItems: function (){
        var items;
        var that = this;
        var validation = this.validateForm();
        var updateCollection = that.collection;
        if (this.addedItem) {
            if (this.advancedOptionSwitch % 2 == 0) {
                var test = this.$el.find('#productLine1 option:selected').text();
                if ($('#productLine1:visible').length != 0 && test == "Choose Product Line") {
                    M.toast({
                        html: '{Literal}You must choose a product line{/Literal}'
                    });
                }
                else {
                    if(validation) {
                        this.getFormValues();
                        var productLine = this.itemsFormView.model.attributes.productLine ;
                        var sessionToken = this.getCookie();
                        $.ajax({
                            url: '/data/save-items',
                            data: {
                                accessName: (App.IDS_MODIFY_ITEMS),
                                productLine: productLine,
                                item: JSON.stringify(that.itemsFormView.model.toJSON()),
                                token: sessionToken
                            },
                            dataType: 'json',
                            type: 'POST',
                
                            success: function (data) {
                                that.collection.add(that.itemsFormView.model);
                                that.fullCollection.add(that.itemsFormView.model);
                                that.appendItem = true;
                                that.formModal.modal('close');
                                
                                M.toast({ html: '{Literal}Item updated successfully{/Literal}' });
                                that.isCreateMode = false;
                            },
                
                            error: function (e) {
                                if (e.status == 523) {
                                    window.location.href = "#/log-in";
                                    location.reload();
                                }
                                else {
                                    M.toast({ html: '{Literal}There was a problem saving this item{/Literal}' });
                                }
                            }
                        });
                    }
                }
            }
            else {
                if(validation) {
                    this.getFormValues();
                    var productLine = this.itemsFormView.model.attributes.productLine ;
                    var sessionToken = this.getCookie();
                    $.ajax({
                        url: '/data/save-items',
                        data: {
                            accessName: (App.IDS_MODIFY_ITEMS),
                            productLine: productLine,
                            item: JSON.stringify(that.itemsFormView.model.toJSON()),
                            token: sessionToken
                        },
                        dataType: 'json',
                        type: 'POST',
            
                        success: function (data) {
                            that.collection.add(that.itemsFormView.model);
                            that.fullCollection.add(that.itemsFormView.model);
                            that.formModal.modal('close');
                            that.appendItem = true;
                            M.toast({ html: '{Literal}Item updated successfully{/Literal}' });
                            that.isCreateMode = false;
                        },
            
                        error: function (e) {
                            if (e.status == 523) {
                                window.location.href = "#/log-in";
                                location.reload();
                            }
                            else {
                                M.toast({ html: '{Literal}There was a problem saving this item{/Literal}' });
                            }
                        }
                    }); 
                }
            }
        }
        else {
            if(validation) {
                this.getFormValues();
                var productLine = this.itemsFormView.model.attributes.productLine ;
                var sessionToken = this.getCookie();
                var updateCollection = that.collection;
                var updateFullCollection = that.fullCollection;
                $.ajax({
                    url: '/data/save-items',
                    data: {
                        accessName: (App.IDS_MODIFY_ITEMS),
                        productLine: productLine,
                        item: JSON.stringify(that.itemsFormView.model.toJSON()),
                        token: sessionToken
                    },
                    dataType: 'json',
                    type: 'POST',
        
                    success: function (data) {
                        updateCollection.add(that.itemsFormView.model);
                        updateFullCollection.add(that.itemsFormView.model);
                        that.formModal.modal('close');
                        M.toast({ html: '{Literal}Item updated successfully{/Literal}' });
                        that.isCreateMode = false;
                    },
        
                    error: function (e) {
                        if (e.status == 523) {
                            window.location.href = "#/log-in";
                            location.reload();
                        }
                        else {
                            M.toast({ html: '{Literal}There was a problem saving this item{/Literal}' });
                        }
                    }
                });

                var id = that.itemsFormView.model.attributes.id;

                var descriptionHTML = document.getElementById(id + 'Description');
                descriptionHTML.innerHTML = that.itemsFormView.model.attributes.description;

                var typeHTML = document.getElementById(id + 'Type');
                typeHTML.innerHTML = "{Literal}Type: {/Literal}" + that.itemsFormView.model.attributes.type;

                var priceHTML = document.getElementById(id + 'Price');
                priceHTML.innerHTML = "{Literal}Price: {/Literal}" + that.itemsFormView.model.attributes.priceLevel1;

                var allowDiscountHTML = document.getElementById(id + 'AllowDiscount');
                allowDiscountHTML.innerHTML = "{Literal}Allow Discount: {/Literal}" + that.itemsFormView.model.attributes.allowDiscount;

                var price2HTML = document.getElementById(id + 'Price2');
                price2HTML.innerHTML = "{Literal}Price Level 2: {/Literal}" + that.itemsFormView.model.attributes.priceLevel2;

                var price3HTML = document.getElementById(id + 'Price3');
                price3HTML.innerHTML = "{Literal}Price Level 3: {/Literal}" + that.itemsFormView.model.attributes.priceLevel3;

                var price4HTML = document.getElementById(id + 'Price4');
                price4HTML.innerHTML = "{Literal}Price Level 4: {/Literal}" + that.itemsFormView.model.attributes.priceLevel4;

                var price5HTML = document.getElementById(id + 'Price5');
                price5HTML.innerHTML = "{Literal}Price Level 5: {/Literal}" + that.itemsFormView.model.attributes.priceLevel5;

                var isStockHTML = document.getElementById(id + 'IsStock');
                isStockHTML.innerHTML = "{Literal}Track Stock: {/Literal}" + that.itemsFormView.model.attributes.isStock;

                var scaleHTML = document.getElementById(id + 'Scale');
                scaleHTML.innerHTML = "{Literal}Scalable: {/Literal}" + that.itemsFormView.model.attributes.scale;

                var noPartialQuantityHTML = document.getElementById(id + 'NoPartialQuantity');
                noPartialQuantityHTML.innerHTML = "{Literal}No Partial Quantity: {/Literal}" + that.itemsFormView.model.attributes.noPartialQuantity;

                var serializedHTML = document.getElementById(id + 'Serialized');
                serializedHTML.innerHTML = "{Literal}Serialized: {/Literal}" + that.itemsFormView.model.attributes.serialized;

                var taxableHTML = document.getElementById(id + 'Taxable');
                taxableHTML.innerHTML = "{Literal}Taxable: {/Literal}" + that.itemsFormView.model.attributes.taxable;

                var categoryHTML = document.getElementById(id + 'Category');
                categoryHTML.innerHTML = "{Literal}Category: {/Literal}" + that.itemsFormView.model.attributes.category;
            }
            else {
                M.toast({ html: '{Literal}Some of the required fields are missing or invalid{/Literal}' });
            }
           // this.render();
        }
    },

    /*--------------------------------------Delete Modals---------------------------------------------- */

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

    reopenModal: function () {       
        var id = this.itemsFormView.model.attributes.id;
        var items = this.collection.get(id);
        if (this.advancedOptionSwitch % 2 != 0) {
            this.itemsFormView.model.attributes.id = this.$el.find('#id').val();            
            this.itemsFormView.model.attributes.description = this.$el.find('#description').val();
            this.itemsFormView.model.attributes.vatCode = this.$el.find('#vat-tax-dropdown option:selected').text();
            this.itemsFormView.model.attributes.altDescription = this.$el.find('#altDescription').val();
            this.itemsFormView.model.attributes.price = this.$el.find('#secondPrice').val();
            this.itemsFormView.model.attributes.priceLevel2 = this.$el.find('#priceLevel2').val();
            this.itemsFormView.model.attributes.priceLevel3 = this.$el.find('#priceLevel3').val();
            this.itemsFormView.model.attributes.priceLevel4 = this.$el.find('#priceLevel4').val();
            this.itemsFormView.model.attributes.priceLevel5 = this.$el.find('#priceLevel5').val();

            if (this.$el.find('#item-category-dropdown1 option:selected').text() == "Create New Item Category") {
                this.itemsFormView.model.attributes.category = this.$el.find('#itemCategoryName').val();
            }
            else {
                this.itemsFormView.model.attributes.category = this.$el.find('#item-category-dropdown1 option:selected').text();
            }
        }
        else {
            this.itemsFormView.model.attributes.id = this.$el.find('#id').val();
            this.itemsFormView.model.attributes.description = this.$el.find('#description').val();
            this.itemsFormView.model.attributes.price = this.$el.find('#price').val();
            if (this.$el.find('#item-category-dropdown2 option:selected').text() == "Create New Item Category") {
                this.itemsFormView.model.attributes.category = this.$el.find('#itemCategoryName').val();
            }
            else {
                this.itemsFormView.model.attributes.category = this.$el.find('#item-category-dropdown2 option:selected').text();
            }
        }

        if (this.$el.find('#item-type-dropdown option:selected').text() == "Create New Item Type") {
            this.itemsFormView.model.attributes.type = this.$el.find('#itemTypeName').val();
        }
        else {
            this.itemsFormView.model.attributes.type = this.$el.find('#item-type-dropdown option:selected').text();
        }

        if (this.collection.get(id) !== null && this.collection.get(id) !== '' && this.collection.get(id) != undefined) {
            this.itemsFormView = new ItemsFormView({
                template: this.itemsFormTemplate,
                model: this.itemsFormView.model,
                itemTypes: this.itemTypes,
                choiceGroups: this.choiceGroups,
                category: this.category,
                salesAccounts: this.salesAccounts,
                productLine: this.productLine,
                vatCode: this.vatCode,
                advancedOptionSwitch: this.advancedOptionSwitch, 
            });
            $('#items-form-modal').modal().modal('close'); 
            this.$el.find('#items-form-modal').html(this.itemsFormView.render().el);
            this.$el.find('select').formSelect();
            this.formModal = this.$el.find('#items-form-modal').modal();
            this.formModal.modal('open');
        }
        else {
            var items = new Items();
            this.itemsFormView = new ItemsFormView({
                template: this.itemsFormTemplate,
                model: this.itemsFormView.model,
                itemTypes: this.itemTypes,
                choiceGroups: this.choiceGroups,
                category: this.category,
                salesAccounts: this.salesAccounts,
                productLine: this.productLine,
                vatCode: this.vatCode,
                advancedOptionSwitch: this.advancedOptionSwitch,
            });
            $('#items-form-modal').modal().modal('close'); 
            this.$el.find('#items-form-modal').html(this.itemsFormView.render().el);
            this.$el.find('select').formSelect();
            this.$el.find("select[required]").css({
                display: "block", 
                position: 'absolute',
                visibility: 'hidden'
            });  
            this.formModal = this.$el.find('#items-form-modal').modal();
            this.formModal.modal('open');
        }
    },

    chooseProductLine: function () {
        var productLine = this.$el.find('#productLine1 option:selected').text();
        var that = this;
        if (productLine != 'Choose Product Line') {
            var productLineValue = {};
            for (var i = 0; i < this.productLine.length; i++) {
                if (this.productLine[i].description == productLine) {
                    productLineValue = (this.productLine[i]);
                    var id = this.$el.find('#id').val();
                    var description = this.$el.find('#description').val();
                    var price = this.$el.find('#price').val();

                    this.itemsFormView.model.attributes.id = this.$el.find('#id').val();            
                    this.itemsFormView.model.attributes.description = this.$el.find('#description').val();
                    this.itemsFormView.model.attributes.vatCode = productLineValue['vatCode'];
                    this.itemsFormView.model.attributes.altDescription = this.$el.find('#altDescription').val();
                    this.itemsFormView.model.attributes.priceLevel1 = this.$el.find('#price').val();
                    this.itemsFormView.model.attributes.priceLevel2 = this.$el.find('#priceLevel2').val();
                    this.itemsFormView.model.attributes.priceLevel3 = this.$el.find('#priceLevel3').val();
                    this.itemsFormView.model.attributes.priceLevel4 = this.$el.find('#priceLevel4').val();
                    this.itemsFormView.model.attributes.priceLevel5 = this.$el.find('#priceLevel5').val();

                    this.itemsFormView.model.attributes.category = productLineValue['menuKeyPage'];
                    this.category.push({id: that.category.length, name: productLineValue['menuKeyPage']});

                    this.itemsFormView.model.attributes.inactive = this.$el.find('.inactive:checked').length > 0
                    this.itemsFormView.model.attributes.productLine  = productLine;
                    this.itemsFormView.model.attributes.type = productLineValue['type'];
                    this.itemsFormView.model.attributes.choiceGroup = productLineValue['choiceGroup'];
                    this.itemsFormView.model.attributes.salesAccount = productLineValue['salesAccount'];
                    this.itemsFormView.model.attributes.allowDiscount = productLineValue['allowDiscount'];
                    this.itemsFormView.model.attributes.isStock = productLineValue['isStock'];
                    this.itemsFormView.model.attributes.scale = productLineValue['scale'];
                    this.itemsFormView.model.attributes.serialized = productLineValue['serialized'];
                    this.itemsFormView.model.attributes.taxabke = productLineValue['taxable'];
                    this.itemsFormView.model.attributes.noPartialQuantity = productLineValue['noPartialQuantity'];
                    this.itemsFormView.model.attributes.vatCode = productLineValue['vatCode'];


                    this.itemsFormView = new ItemsFormView({
                        template: this.itemsFormTemplate,
                        model: this.itemsFormView.model,
                        itemTypes: this.itemTypes,
                        choiceGroups: this.choiceGroups,
                        category: this.category,
                        salesAccounts: this.salesAccounts,
                        productLine: this.productLine,
                        vatCode: this.vatCode,
                        advancedOptionSwitch: this.advancedOptionSwitch, 
                    });

                    $('#items-form-modal').modal().modal('close'); 
                    this.$el.find('#items-form-modal').html(this.itemsFormView.render().el);
                    this.$el.find('select').formSelect();
                    this.$el.find("select[required]").css({
                        display: "block", 
                        position: 'absolute',
                        visibility: 'hidden'
                    });  
                    this.formModal = this.$el.find('#items-form-modal').modal();
                    this.formModal.modal('open');
                    break;
                }
            }
        }
    }
});
