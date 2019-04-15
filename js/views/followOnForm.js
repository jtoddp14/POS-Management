var FollowOnFormView = Backbone.View.extend({
    itemMapping: {},
    tableMapping: [],
    itemMapping2: [],
    itemMapping3: [],
    itemTypeModal: {},
    itemsStyleMapping: {},

    events: {
        'click .select-item': 'selectItem',
        'click .choose-item-trigger' : 'chooseItem',
        'click .cancel-item-trigger' : "closeItemModal",
        'keyup #itemSearch': 'searchItemBySearchTerm',
        'click #delete-item-confirm': 'removeDetailItem'
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.followOn = options.followOn;
    },

    render: function () {
        var that = this;
        this.$el.detach();

        $(document).ready(function() {
            $('.tooltipped').tooltip();
            that.initItems();
        });
        return this;
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
                    that.tableMapping[results[i].description] = results[i].description;
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
        var itemCollection = new FollowOnCollection();
        for (var i = 0; i < data.length; i++) {
            var currentItem = data[i];
            currentItem.cardStyleClass = that.itemsStyleMapping[data[i].masterItemId];
            itemCollection.add(new FollowOn(currentItem));
        }
        this.editableItemCollection = itemCollection;
        this.itemFullCollection = itemCollection;
        this.$el.html(this.template({
            followOn: that.model.toJSON(),
            items: that.itemFullCollection.toJSON(),
        }));
        
        that.getItemTable(); 
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

    getItemsBySearchTerm: function(searchTerm) {
        var that = this;
        var sessionToken = this.getCookie();
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
                    that.itemMapping2[results[i].itemDescription] = results[i].itemPrice;
                    that.itemMapping3[results[i].itemDescription] = results[i].itemDescription;
                }
                that.itemsAutocomplete.updateData(items);   
                that.$el.find("input.autocomplete").trigger("click");    
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

    chooseItem: function (e) {
        var element = $(e.currentTarget);
        var detailItem = $(element).attr('id-id');
        var itemId = $(element).attr('description-id');
        var priceId = $(element).attr('price-id');
        var choiceGroupId = $(element).attr('choiceGroup-id');
        var price = document.getElementById('price');
        var beforeDiscount = document.getElementById('priceBefore');
        var isAdd = true
        
        var newItem = {description: itemId, price: priceId};
        this.model.attributes.items.push(newItem);

        var qtyNumber = document.getElementById("itemTable").rows.length
        qtyNumber = qtyNumber - 2;
        

        if (detailItem != this.model.attributes.masterItemId) {
            if (choiceGroupId == "") {
                if (this.model.attributes.code == "") {
                    this.model.attributes.code = detailItem;

                    var code = document.getElementById('code');
                    code.value = detailItem;

                    $('#select-item-modal').modal().modal('close');
                }
                else {
                    $('#select-item-modal').modal().modal('close');
                    $('#itemTable').append('<tr id="' + detailItem + '"><td class="isAdd" style="display:none;">' + isAdd + '</td><td class="itemId">' + detailItem + '</td> <td class="detailItem">' + itemId + '</td> <td><div class="input-field inline input-field-small"><input class="quantities" id="qty' + qtyNumber + '" type="number" value="1"></div></td><td><a id="delete-item-confirm" class="waves-effect waves-green btn red" data-follow-on-id="' + detailItem + '">REMOVE</a></td> </tr>');
                }
            }
            else {
                M.toast({
                    html: '{Literal}The item can not be a choice item{/Literal}'
                });
        
            }
        }
        else {
            M.toast({
                html: '{Literal}You cannot add your master item as a detail item{/Literal}'
            });
        }

    },

    selectItem: function (e) {   
        var that = this;
        var element = $(e.currentTarget);
        var salesId = $(element).attr('data-id');
        $('#select-item-modal').modal().modal('open');
    },

    closeItemModal: function () {
        $('#select-item-modal').modal().modal('close');
    },

    getItemTable: function () {
        var that = this;
        if (this.model.attributes.items.length > 0) {
            for (i = 0; i < this.model.attributes.items.length; i++){
                for (var key in this.tableMapping) {
                    if (this.model.attributes.items[i].description == key) {
                        var itemName = this.tableMapping[key];
                    }
                }
                var id = this.model.attributes.items[i].id;
                var qty = this.model.attributes.items[i].quantity;
                var isAdd = false;
                    
                if (print) {
                    $('#itemTable tbody').append('<tr id="' + id + '"><td class="isAdd" style="display:none;">' + isAdd + '</td> <td class="itemId">' + id + '</td> <td class="detailItem" id="detailItem' + i + '">' + itemName + '</td> <td><div class="input-field inline input-field-small"><input class="quantities" id="qty' + i + '" type="number" value="' + qty +'"></div><td><a id="delete-item-confirm" class="waves-effect waves-green btn red" data-follow-on-id="' + id + '">REMOVE</a></td> </tr>');
                }
                else {
                    $('#itemTable tbody').append('<tr id="' + id + '"><td class="isAdd" style="display:none;">' + isAdd + '</td> <td class="itemId">' + id + '</td> <td class="detailItem" id="detailItem' + i + '">' + itemName + '</td> <td><div class="input-field inline input-field-small"><input class="quantities" id="qty' + i + '" type="number" value="' + qty +'"></div><td><a id="delete-item-confirm" class="waves-effect waves-green btn red" data-follow-on-id="' + id + '">REMOVE</a></td> </tr>');
                }
            }
        }

        var elems = document.querySelector('#itemSearch');
        var that = this;
        this.itemsAutocomplete = M.Autocomplete.init(elems, {
            minLength: 1,
            lmit: 20,
            sortFunction: function (a, b, inputString) {
                return a.indexOf(inputString) - b.indexOf(inputString);
            },
            onAutocomplete: function (selection) { that.selectItemFromAutocompleteList(selection); } 
        });
        if (this.model.attributes.code == "") {
            $('#select-item-modal').modal().modal('open');  
        }
    },

    selectItemFromAutocompleteList: function (e) {
        var chosenItem = null;
        var chosenPrice = null;
        var detailItem = null;
        for (var key in this.itemMapping2) {
            if (e == key) {
                chosenItem = key;
                detailItem = this.itemMapping[key]
            }
        }
        if (detailItem != this.model.attributes.code) {
            if (chosenItem != null ) {
                var qtyNumber = document.getElementById("itemTable").rows.length
                qtyNumber = qtyNumber - 2;
                var isAdd = true;
                
                if (this.model.attributes.code == "") {
                    this.model.attributes.code = detailItem;
    
                    var code = document.getElementById('code');
                    code.value = detailItem;
                }
                else {
                    $('#itemTable').append('<tr id="' + detailItem + '"><td class="isAdd" style="display:none;">' + isAdd + '</td><td class="itemId">' + detailItem + '</td> <td class="detailItem">' + chosenItem + '</td> <td><div class="input-field inline input-field-small"><input class="quantities" id="qty' + qtyNumber + '" type="number" value="1"></div></td><td><a id="delete-item-confirm" class="waves-effect waves-green btn red" data-follow-on-id="' + detailItem + '">REMOVE</a></td> </tr>');
                }
            }
            $('#select-item-modal').modal().modal('close');
        }
        else {
            html: '{Literal}You cannot add your master item as a detail item{/Literal}'
        }

    },

    
    removeDetailItem: function (e) { 
        var that = this;
        var element = $(e.currentTarget);
        var detailItemId = $(element).attr('data-follow-on-id');
        $('#' + detailItemId).remove();
    },
});