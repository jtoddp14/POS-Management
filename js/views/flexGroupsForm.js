var FlexGroupsFormView = Backbone.View.extend({
    itemMapping: {},
    tableMapping: [],
    itemMapping2: [],
    itemMapping3: [],
    itemTypeModal: {},
    flexGroupsStyleMapping: {},
    prefillState: false,
    itemsAutocomplete: {},
    itemsAutocomplete2: {},
    test: {},
    flexGroupsStyleMapping: {},

    events: {
        'change #groupItemName': 'updateName',
        'click .delete-button' : 'deleteFlexGroups',
        'click .select-item' : 'chooseItem',
        'keyup #qty': 'changeQtyPrice',
        'keyup #itemSearch': 'searchItemBySearchTerm',
        'keyup .quantities': 'changeQtyPrice',
        'click #delete-item-confirm': 'removeDetailItem',
        'click .company-info-arrow-button2': 'showTable',
        'click .customer-info-button': 'showDetails',
        'keyup #name': 'searchItemBySearchTerm2'
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.flexGroups = options.flexGroups;
        this.newflexGroup = options.newflexGroup;
        
    },

    render: function () {
        var that = this;
        this.$el.detach();
        $(document).ready(function() {
            $('.tooltipped').tooltip();

            that.initItems(); 
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

    showTable: function () {
        $('#flexItemsTables').show();
        $("#flexGroupDateTimes").hide();
    },

    showDetails: function () {
        $('#flexGroupDateTimes').show();
        $('#flexItemsTables').hide();
    },

    removeDetailItem: function (e) { 
        var that = this;
        var element = $(e.currentTarget);
        var detailItemId = $(element).attr('data-flex-group-id');
        var subGroup = $(element).attr('data-sub-group-id');
        var masterItemId = this.model.attributes['id'];
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/delete-flex-group-detail-item',
            type: 'POST',
            data: {
                masterItemId: masterItemId,
                detailItemId: detailItemId,
                subgroup: subGroup,
                token: sessionToken
            },

            success: function (data) {
                var success = false;
                if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                    success = data.results.success;
                }
                if (success !== null) {
                    var tableIndex = $(e.currentTarget.parentNode.parentNode.rowIndex);
                    document.getElementById("itemTable").deleteRow(tableIndex[0]);
                }
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem deleting this detail item{/Literal}' });
                }
            }
        });
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

    searchItemBySearchTerm2: function(element) {
        var element = $(element.currentTarget);
        var searchTerm = $(element).val();
        var that = this;
        if (searchTerm.trim().length > 0) {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(function() { 
                that.getItemsBySearchTerm2(searchTerm); 
            }, 0);
        }
        that.$el.find("input.autocomplete2").trigger("click");
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


    getItemsBySearchTerm: function(searchTerm) {
        var that = this;
        var sessionToken = this.getCookie();

        var elems = document.querySelector('#itemSearch');
        this.itemsAutocomplete = M.Autocomplete.init(elems, {
            minLength: 1,
            lmit: 20,
            sortFunction: function (a, b, inputString) {
                return a.indexOf(inputString) - b.indexOf(inputString);
            }
        });

        $.ajax({
            url: '/data/get-items-by-search-term',
            data: {
                token: sessionToken,
                searchTerm: searchTerm
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var results = data.results;
                items = {};
                for (var i = 0; i < data.results.length; i++) {
                    items[results[i].itemDescription] = null;
                    that.itemMapping[results[i].itemDescription] = results[i].itemCode;
                    that.itemMapping3[results[i].itemDescription] = results[i].itemDescription;
                }
                that.itemsAutocomplete.updateData(items);   
                that.$el.find("#itemSearch").trigger("click");    
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

    getItemsBySearchTerm2: function(searchTerm) {
        var that = this;
        var sessionToken = this.getCookie();

        var names = document.querySelector('#name');
        this.itemsAutocomplete2 = M.Autocomplete.init(names, {
            minLength: 1,
            lmit: 20,
            sortFunction: function (a, b, inputString) {
                return a.indexOf(inputString) - b.indexOf(inputString);
            },
            onAutocomplete: function (selection) { that.selectItemFromAutocompleteList(selection); } 
        });

        $.ajax({
            url: '/data/get-items-by-search-term',
            data: {
                token: sessionToken,
                searchTerm: searchTerm
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var results = data.results;
                items = {};
                for (var i = 0; i < data.results.length; i++) {
                    items[results[i].itemDescription] = null;
                    that.itemMapping[results[i].itemDescription] = results[i].itemCode;
                    that.itemMapping3[results[i].itemDescription] = results[i].itemDescription;
                }
               
                that.itemsAutocomplete2.updateData(items);   
                that.$el.find("input.autocomplete2").trigger("click");    
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
    
    initItems:  function () {
        var fullItems = this.getItemsFull();
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
                var results = data.results;
                for (var i = 0; i < results.length; i++) {
                    that.tableMapping[results[i].id] = results[i].description;
                    if (that.model.attributes.id == results[i].id) {
                        that.model.attributes.itemName = results[i].description;
                    }
                }
                that.renderItems(data.results);
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

    renderItems: function (data) {
        var that = this;
        var itemCollection = new FlexGroupsCollection();
        for (var i = 0; i < data.length; i++) {
            var currentItem = data[i];
            currentItem.cardStyleClass = that.flexGroupsStyleMapping[data[i].masterItemId];
            itemCollection.add(new FlexGroups(currentItem));
        }
        this.editableItemCollection = itemCollection;
        this.itemFullCollection = itemCollection;
        this.$el.html(this.template({
            flexGroups: that.model.toJSON(),
            newflexGroup: that.newflexGroups,
            items: that.itemFullCollection.toJSON(),
        }));

        $(document).ready(function() {
            $('.tooltipped').tooltip();       
            $('select').formSelect();
            var pickerElement = document.querySelectorAll('.timepicker');
            var instances = M.Timepicker.init(pickerElement, {
                autoClose: true,
                container: 'body'
            });
            that.timepicker = instances;
        });

        that.getItemTable(); 
    },

    updateName: function (e) {
        var element = $(e.currentTarget);
        var name = $(element).val();
        this.model.set('name', name);
    },

    chooseItem: function () {
        var that = this;
        var itemId = this.$el.find("#itemSearch").val();
        var subGroup = this.$el.find('#sub-group-dropdown option:selected').text();
        var priceId = this.$el.find("#addedCost").val();

        for (var key in this.tableMapping) {
            if (itemId == this.tableMapping[key]) {
                var detailItem = key;
            }
        }

        var isAdd = true
        
        var newItem = {masterItemId: that.model.attributes.id, detailItemId: detailItem, price: priceId, subGroup: subGroup};
        this.model.attributes.detailItems.push(newItem);

        if (detailItem != this.model.attributes.id) {
            if (itemId != "" && subGroup != "" && priceId != "") {
                $('#itemTable').append('<tr><td class="isAdd" style="display:none;">' + isAdd + '</td><td class="itemId" style="display:none;">' + detailItem + '</td><td class="detailItem" style="display:none;">' + detailItem + '</td> <td class="names">' + itemId + '</td> <td class="prices">' + priceId + '</td> <td class="subgroups">' + subGroup + '</td> <td><a id="delete-item-confirm" class="waves-effect waves-green btn red" data-sub-group-id="' + subGroup + '" data-flex-group-id="' + detailItem + '">REMOVE</a></td> </tr>');
            }
            else {
                M.toast({
                    html: '{Literal}All options must be filled out{/Literal}'
                });
        
            }
        }
        else {
            M.toast({
                html: '{Literal}You cannot add your master item as a detail item{/Literal}'
            });
        }

    },

    closeItemModal: function () {
        $('#select-item-modal').modal().modal('close');
    },

    getItemTable: function () {
        var that = this;

        if (this.model.attributes.id.length > 0) {
            for (i = 0; i < this.model.attributes.detailItems.length; i++){
                var itemPrice = this.model.attributes.detailItems[i].flexDetailPrice;
                for (var key in this.tableMapping) {
                    if (this.model.attributes.detailItems[i].detailItemId == key) {
                        var itemName = this.tableMapping[key];
                    }
                }
                var detailItem = this.model.attributes.detailItems[i].detailItemId;
                var subGroup = this.model.attributes.detailItems[i].subGroup;
                var isAdd = false;
                    
                $('#itemTable tbody').append('<tr><td class="isAdd" style="display:none;">' + isAdd + '</td><td class="itemId" style="display:none;">' + detailItem + '</td><td class="detailItem" style="display:none;">' + detailItem + '</td> <td class="names">' + itemName + '</td> <td class="prices" id="price' + i + '">' + itemPrice + '</td> <td class="subgroups">' + subGroup + '</td> <td><a id="delete-item-confirm" class="waves-effect waves-green btn red"  data-sub-group-id="' + subGroup + '" data-flex-group-id="' + detailItem + '">REMOVE</a></td> </tr>');
            }
        }
    
        if (this.model.attributes.id == "") {
            $('#name').prop("disabled", false);
        }
    },

    selectItemFromAutocompleteList: function (e) {
        var nameVal = this.$el.find("#name").val();
        for (var key in this.tableMapping) {
            if (nameVal == this.tableMapping[key]) {
                this.model.attributes.id = key;
            }
        }
        $('#name').prop("disabled", true);
    }
});