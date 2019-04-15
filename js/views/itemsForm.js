var ItemsFormView = Backbone.View.extend({
    events: {
        'change #itemsDescription': 'updateDescription',
        'change #item-type-dropdown' : 'createNewItemType',
        'change #item-category-dropdown1' : 'createNewItemCategory1',
        'change #item-category-dropdown2' : 'createNewItemCategory2',
        'keyup #price' : 'changePriceLevels',
        'keyup #secondPrice' : 'changePriceLevels',
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.items = options.items;
        this.itemTypes = options.itemTypes;
        this.choiceGroups = options.choiceGroups;
        this.category = options.category;
        this.salesAccounts = options.salesAccounts;
        this.productLine = options.productLine;
        this.vatCode = options.vatCode;
        this.advancedOptionSwitch = options.advancedOptionSwitch;
    },

    render: function () {
        var that = this;
        this.$el.detach();
        this.$el.html(this.template({
            items: this.model.toJSON(),
            itemTypes: this.itemTypes,
            choiceGroups: this.choiceGroups,
            category: this.category,
            salesAccounts: this.salesAccounts,
            productLine: this.productLine,
            vatCode: this.vatCode
        }));
        
        $(document).ready(function() {
            $('.tooltipped').tooltip();
           

            if (that.model.attributes.id == "") {
                $("#id").removeAttr('disabled')
            }
            if (that.advancedOptionSwitch % 2 != 0 && !isNaN(that.advancedOptionSwitch % 2)) {
                that.$el.find(".advanced").trigger("click");
                $('#productLine1').hide(); 
                $('#price0').hide(); 
                $('#category2').hide(); 
                $('#category1').show(); 
                $('#choiceGroup1').show()
                if (App.serverInfo.hasAccounting) {
                    $('#salesAccount1').show(); 
                }; 
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
                
            }

            if (that.model.attributes.id != "") {
                $('#productLine1').hide(); 
            }
        });

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
        return this;
    },

    updateDescription: function (e) {
        var element = $(e.currentTarget);
        var description = $(element).val();
        this.model.set('description', description);
    },

    createNewItemType: function () {
        var itemType = this.$el.find('#item-type-dropdown').val();

        if (itemType == "Create New Item Type") {
            var formModal = this.$el.find('#item-type-form-modal').modal();
            formModal.modal('open');
        }
    },

    createNewItemCategory1: function () {
        var itemType = this.$el.find('#item-category-dropdown1').val();

        if (itemType == "Create New Item Category") {
            var formModal = this.$el.find('#item-category-form-modal').modal();
            formModal.modal('open');
        }
    },

    createNewItemCategory2: function () {
        var itemType = this.$el.find('#item-category-dropdown2').val();

        if (itemType == "Create New Item Category") {
            var formModal = this.$el.find('#item-category-form-modal').modal();
            formModal.modal('open');
        }
    },

    changePriceLevels: function () {
        var price = this.$el.find('#price').val();
        var secondPrice = this.$el.find('#secondPrice').val();

        var valuePriceLevel2 = document.getElementById('priceLevel2');
        var valuePriceLevel3 = document.getElementById('priceLevel3');
        var valuePriceLevel4 = document.getElementById('priceLevel4');
        var valuePriceLevel5 = document.getElementById('priceLevel5');

        if (this.model.attributes.id == "") {
            if (this.model.attributes.priceLevel1 == "" && this.model.attributes.priceLevel2 == "" && this.model.attributes.priceLevel3 == "" && this.model.attributes.priceLevel4 == "" && this.model.attributes.priceLevel5 == "") {
                if (price != '') {
                    valuePriceLevel2.value = price;
                    valuePriceLevel3.value = price;
                    valuePriceLevel4.value = price;
                    valuePriceLevel5.value = price;
                }
                else if (secondPrice != '') {
                    valuePriceLevel2.value = secondPrice;
                    valuePriceLevel3.value = secondPrice;
                    valuePriceLevel4.value = secondPrice;
                    valuePriceLevel5.value = secondPrice;
                }
            }
        }
    },
});