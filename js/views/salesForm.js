var SalesFormView = Backbone.View.extend({
    itemMapping: {},
    itemTypeModal: {},
    prefillState: false,
    itemsAutocomplete: {},

    styles: [
        'ap-blue',
    ],

    salesStyleMapping: {},

    events: {
        //'click .card-panel-entity': 'highlightCard',
        'click #byItem': 'byItem',
        'click #byType': 'byType',
        'click #everyDay': 'everyDay',
        'click #certainDays': 'certainDays',
        'click #allDay': 'allDay',
        'click #certainTimes': 'certainTimes',
        'click .select-item-type': 'selectItemType',
        'click .card-panel-entity' : 'chooseItemType',
        'click .autocomplete-content li': 'selectItemFromAutocompleteList',
        'keyup #items': 'searchItemBySearchTerm',
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.sales = options.sales;
        this.initItemTypes();
    },

    render: function () {
        var that = this;
        this.$el.detach();


        $(document).ready(function() {
            $('.tooltipped').tooltip();       
            $('select').formSelect();
            var pickerElement = document.querySelectorAll('.datepicker');
            var instances = M.Datepicker.init(pickerElement, {
                autoClose: true,
                container: 'body'
            });
            that.datepicker = instances;
        });
        
        return this;
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
            $(element).find('.edit').css('display','block');
            $(element).addClass('active');
        }
    },

    searchItemBySearchTerm: function(element) {
        var element = $(element.currentTarget);
        var searchTerm = $(element).val();
        var that = this;
        if (searchTerm.trim().length > 0) {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(function() {
                that.getItemsBySearchTerm(searchTerm);
            }, 0);
        }

        that.$el.find("input.autocomplete").trigger("click");
    },

    selectItemFromAutocompleteList: function (e) {
        var element = $(e.currentTarget);
    },

    getItemsBySearchTerm: function(searchTerm) {
        var that = this;
        var sessionToken = this.getCookie();
        if (App.israCardBuild) {
            searchTerm = CryptoJS.enc.Utf8.parse(searchTerm);
        }
        $.ajax({
            url: '/data/get-items-by-search-term',
            data: {
                searchTerm: searchTerm,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var results = data.results;
                var items = {};
                for (var i = 0; i < results.length; i++) {
                    items[results[i].itemCode] = null;
                    that.itemMapping[results[i].itemCode] = results[i].itemCode;
                }
                that.itemsAutocomplete.updateData(items);  
                that.$el.find("input.autocomplete").trigger("click");
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
            }
        });
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

    initItemTypes:  function () {
        var fullItemTypes = this.getItemTypesFull();
    },
    
    getItemTypesFull: function () {
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
                that.renderItemTypes(data.results);
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

    renderItemTypes: function (data) {
        var that = this;
        var itemCollection = new SalesCollection();
        for (var i = 0; i < data.length; i++) {
            var currentItemType = data[i];
            currentItemType.cardStyleClass = that.salesStyleMapping[data[i].name];
            itemCollection.add(new Sales(currentItemType));
        }

        this.itemTypesFullCollection = itemCollection;

        this.$el.html(that.template({
            sales: that.model.toJSON(),
            itemTypes: that.itemTypesFullCollection.toJSON(),
        }));

        var elems = document.querySelector('#items');
        this.itemsAutocomplete = M.Autocomplete.init(elems, {
            minLength: 1,
            lmit: 20,
            sortFunction: function (a, b, inputString) {
                return a.indexOf(inputString) - b.indexOf(inputString);
            }
        });

        if (that.model.attributes['start'] != null || that.model.attributes['start'] != undefined || that.model.attributes['start'] != '') {
            var startDate = new Date(that.model.attributes['start']);
            var endDate = new Date(that.model.attributes['end']);

            var setStartTime = document.getElementById('startTime');
            var setEndTime = document.getElementById('endTime');
            setStartTime.value = startDate.toLocaleTimeString();
            setEndTime.value = endDate.toLocaleTimeString();

            var setStartDate = document.getElementById('startDay');
            var setEndDate = document.getElementById('endDay');
            setStartDate.value = startDate.toLocaleDateString();
            setEndDate.value = endDate.toLocaleDateString();
        };

        var setSaleType = document.getElementById('sale-type-dropdown');
        if (that.model.attributes['forPrice'] > 0 && that.model.attributes['quantity'] > 0) {
            setSaleType.value = 1;
        }
        else if (that.model.attributes['quantityLevel'] > 0 && that.model.attributes['quantityPrice'] > 0) {
            setSaleType.value = 2;
        }
        else if (that.model.attributes['initialQuantity'] > 0 && that.model.attributes['nextDiscountPct'] > 0) {
            setSaleType.value = 3;
        }
        else if (that.model.attributes['nextDiscountPrice'] > 0 && that.model.attributes['initialQuantity'] > 0) {
            setSaleType.value = 4;
        }
        else {
            setSaleType.value = 0;
        }

        var saleType = this.$el.find('#sale-type-dropdown').val();
        if (saleType == 0) {
            $('#percent').show();
            $('#itemQuantity').hide();
            $('#quantityPrice').hide();
            $('#quantityPercent').hide();
            $('#quantityByPrice').hide();
        }
        else if (saleType == 1) {
            $('#percent').hide();
            $('#itemQuantity').show();
            $('#quantityPrice').hide();
            $('#quantityPercent').hide();
            $('#quantityByPrice').hide();
        }
        else if (saleType == 2) {
            $('#percent').hide();
            $('#itemQuantity').hide();
            $('#quantityPrice').show();
            $('#quantityPercent').hide();
            $('#quantityByPrice').hide();
        }
        else if (saleType == 3) {
            $('#percent').hide();
            $('#itemQuantity').hide();
            $('#quantityPrice').hide();
            $('#quantityPercent').show();
            $('#quantityByPrice').hide();
        }
        else if (saleType == 4) {
            $('#percent').hide();
            $('#itemQuantity').hide();
            $('#quantityPrice').hide();
            $('#quantityPercent').hide();
            $('#quantityByPrice').show();
        }

        var setType = document.getElementById('type');
        var setItem = document.getElementById('items');

        var byType = document.getElementById('byType');
        var byItem = document.getElementById('byItem');

        if (that.model.attributes['item'] != null || that.model.attributes['item'] != undefined) {
            if (that.model.attributes['item'].length > 0) {   
                byType.value = false;
                byItem.value = true;
            }
        }
        
        if (that.model.attributes['group'] != null || that.model.attributes['group'] != undefined) {
            if (that.model.attributes['group'].length > 0) {   
                byType.value = true;
                byItem.value = false;
            }
        }
    
        if (byType.value == 'true') {
            $('.byItemText').hide();
            $('.byItemButton').hide();              
            $('.byItemTypeText').show();
            $('.byItemTypeButton').show();
            this.$el.find('#byItem').not(this).prop('checked', false); 
            this.$el.find('#byType').not(this).prop('checked', true); 
            this.$el.find('#byType').attr("disabled", true);
        }
        else {
            that.$el.find("byItem").trigger("click");
            $('.byItemText').show();
            $('.byItemButton').show();              
            $('.byItemTypeText').hide();
            $('.byItemTypeButton').hide();
            this.$el.find('#byItem').not(this).prop('checked', true); 
            this.$el.find('#byType').not(this).prop('checked', false); 
            this.$el.find('#byItem').attr("disabled", true);
        }

        if (that.model.attributes['sunday'] == true && that.model.attributes['monday'] == true && that.model.attributes['tuesday'] == true) {
            if (that.model.attributes['wednesday'] == true && that.model.attributes['thursday'] == true && that.model.attributes['friday'] == true) {
                if (that.model.attributes['saturday'] == true) {
                    $('.dayCheckboxes').hide();
                    this.$el.find('#everyDay').not(this).prop('checked', true)
                    this.$el.find('#everyDay').attr("disabled", true);
                }
            }
        }
        else {
            $('.dayCheckboxes').show();
            this.$el.find('#certainDays').not(this).prop('checked', true)
            this.$el.find('#certainDays').attr("disabled", true);
        }

        var startTime = new Date(that.model.attributes['start']);
        var determineStart = startTime.toLocaleTimeString();
        var endTime = new Date(that.model.attributes['end']);
        var determineEnd = endTime.toLocaleTimeString();

        if (determineStart == '12:00:00 AM' && determineEnd == '11:59:00 PM') {
            $('.timePickers').hide();
            this.$el.find('#allDay').not(this).prop('checked', true)
            this.$el.find('#allDay').attr("disabled", true);
        }
        else {
            $('.timePickers').show();
            this.$el.find('#certainTimes').not(this).prop('checked', true);
            this.$el.find('#certainTimes').attr("disabled", true);
        }
    },

    byItem: function (){
        var byType = this.$el.find('#byType:checked').length > 0;
        if (byType) {
            this.$el.find('#byType').not(this).prop('checked', false); 
            this.$el.find('#byItem').prop("disabled", true); 
            this.$el.find('#byType').removeAttr('disabled');
            $('.byItemText').show();
            $('.byItemButton').show();              
            $('.byItemTypeText').hide();
            $('.byItemTypeButton').hide();  
        }
    },

    byType: function () {
        var byItem = this.$el.find('#byItem:checked').length > 0;
        if (byItem) {
            this.$el.find('#byItem').not(this).prop('checked', false); 
            this.$el.find('#byType').prop("disabled", true);
            this.$el.find('#byItem').removeAttr('disabled');
            $('.byItemText').hide();
            $('.byItemButton').hide();              
            $('.byItemTypeText').show();
            $('.byItemTypeButton').show();
        }
    },

    certainDays: function () {
        var everyDay = this.$el.find('#everyDay:checked').length > 0;
        if (everyDay){
            this.$el.find('#everyDay').not(this).prop('checked', false); 
            this.$el.find('#certainDays').prop("disabled", true); 
            this.$el.find('#everyDay').removeAttr('disabled');
            $('.dayCheckboxes').show();
        }
    },

    everyDay: function () {
        var certainDays = this.$el.find('#certainDays:checked').length > 0;
        if (certainDays){
            this.$el.find('#certainDays').not(this).prop('checked', false); 
            this.$el.find('#everyDay').prop("disabled", true); 
            this.$el.find('#certainDays').removeAttr('disabled');
            $('.dayCheckboxes').hide();
        }
    },

    allDay: function () {
        var certainTimes = this.$el.find('#certainTimes:checked').length > 0;
        if (certainTimes){
            this.$el.find('#certainTimes').not(this).prop('checked', false); 
            this.$el.find('#allDay').prop("disabled", true); 
            this.$el.find('#certainTimes').removeAttr('disabled');
            $('.timePickers').hide();
        }
    },

    certainTimes: function () {
        var allDay = this.$el.find('#allDay:checked').length > 0;
        if (allDay){
            this.$el.find('#allDay').not(this).prop('checked', false); 
            this.$el.find('#certainTimes').prop("disabled", true); 
            this.$el.find('#allDay').removeAttr('disabled');
            $('.timePickers').show();
        }
    },

    selectItemType: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var salesId = $(element).attr('data-id');
        $("#item-type-id").val(salesId);
        $('#select-type-modal').modal().modal('open');
    },

    chooseItemType: function (e) {
        var element = $(e.currentTarget);
        var itemTypeId = $(element).attr('data-id');
        $('#select-type-modal').modal().modal('close');
        var type = document.getElementById('type');
        type.value = itemTypeId;
    }
});