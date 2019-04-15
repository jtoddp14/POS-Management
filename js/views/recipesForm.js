var RecipesFormView = Backbone.View.extend({
    itemMapping: {},
    tableMapping: [],
    itemMapping2: [],
    itemMapping3: [],
    itemTypeModal: {},
    recipesStyleMapping: {},
    prefillState: false,
    itemsAutocomplete: {},
    test: {},

    events: {
        'change #groupItemName': 'updateName',
        'click .select-item': 'selectItem',
        'click .delete-button' : 'deleteGroupItem',
        'click .choose-item-trigger' : 'chooseItem',
        'click .cancel-item-trigger' : "closeItemModal",
        'keyup #itemSearch': 'searchItemBySearchTerm',
        'click #delete-item-confirm': 'removeDetailItem'
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.recipes = options.recipes;
        this.newRecipe = options.newRecipe;
    },

    render: function () {
        var that = this;
        that.initItems(); 
        this.$el.detach();
        $(document).ready(function() {
            $('.tooltipped').tooltip();
            
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

    removeDetailItem: function (e) { 
        var that = this;
        var element = $(e.currentTarget);
        var detailItemId = $(element).attr('data-recipe-id');
        var masterItemId = this.model.attributes['id'];
        var sessionToken = this.getCookie();
        
        $.ajax({
            url: '/data/delete-recipe-detailitem',
            type: 'POST',
            data: {
                masterItemId: masterItemId,
                detailItemId: detailItemId,
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

    selectItemFromAutocompleteList: function (e) {
        var chosenItem = null;
        var chosenPrice = null;
        var detailItem = null;
        for (var key in this.itemMapping3) {
            if (e == key) {
                chosenItem = key;
                detailItem = this.itemMapping[key]
            }
        }
        if (detailItem != this.model.attributes.id) {
            
            if (chosenItem != null ) {
                
                var qtyNumber = document.getElementById("itemTable").rows.length
                qtyNumber = qtyNumber - 2;
                var isAdd = true;
                
                if (this.model.attributes.id == "") {
                    this.model.attributes.id = detailItem;
                    this.model.attributes.description = chosenItem;
    
                    var description = document.getElementById('description');
                    description.value = chosenItem;
                }
                else {
                    $('#itemTable').append('<tr><td class="isAdd" style="display:none;">'+ isAdd + '</td><td class="itemId" style="display:none;">' + detailItem + '</td><td class="detailItem" style="display:none;">' + detailItem + '</td> <td class="names">' + chosenItem + '</td> <td><div class="input-field inline input-field-small"><input class="quantities" id="qty' + qtyNumber + '" type="number" value="1"></div></td> <td><a id="delete-item-confirm" class="waves-effect waves-green btn red" data-recipe-id="' + detailItem + '">REMOVE</a></td> </tr>');
                }
            }
            $('#select-item-modal').modal().modal('close');
        }
        else {
            html: '{Literal}You cannot add your master item as a detail item{/Literal}'
        }

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
        var itemCollection = new RecipesCollection();
        for (var i = 0; i < data.length; i++) {
            var currentItem = data[i];
            currentItem.cardStyleClass = that.recipesStyleMapping[data[i].masterItemId];
            itemCollection.add(new Recipes(currentItem));
        }
        this.editableItemCollection = itemCollection;
        this.itemFullCollection = itemCollection;
        this.$el.html(this.template({
            recipes: that.model.toJSON(),
            items: that.itemFullCollection.toJSON(),
        }));
        
        that.getItemTable(); 
    },

    updateName: function (e) {
        var element = $(e.currentTarget);
        var name = $(element).val();
        this.model.set('name', name);
    },

    selectItem: function (e) {   
        var that = this;
        var element = $(e.currentTarget);
        var salesId = $(element).attr('data-id');
        $('#select-item-modal').modal().modal('open');
    },

    chooseItem: function (e) {
        var element = $(e.currentTarget);
        var detailItem = $(element).attr('id-id');
        var itemId = $(element).attr('description-id');
        var isAdd = true
        
        var newItem = {description: itemId};
        this.model.attributes.detailItems.push(newItem);

        var qtyNumber = document.getElementById("itemTable").rows.length
        qtyNumber = qtyNumber - 2;
        

        if (detailItem != this.model.attributes.id) {
            if (0==0) {
                if (this.model.attributes.id == "") {
                    this.model.attributes.id = detailItem;
                    this.model.attributes.description = itemId;
                    $('#select-item-modal').modal().modal('close');
                    var description = document.getElementById('description');
                    description.value = itemId;
                }
                else {
                    $('#select-item-modal').modal().modal('close');
                    $('#itemTable').append('<tr><td class="isAdd" style="display:none;">' + isAdd + '</td><td class="itemId" style="display:none;">' + detailItem + '</td><td class="detailItem" style="display:none;">' + detailItem + '</td> <td class="names">' + itemId + '</td> <td><div class="input-field inline input-field-small"><input class="quantities" id="qty' + qtyNumber + '" type="number" value="1"></div></td> <td><a id="delete-item-confirm" class="waves-effect waves-green btn red" data-recipe-id="' + detailItem + '">REMOVE</a></td> </tr>');
                }
            }
            else {
                M.toast({
                    html: '{Literal}The item must be a choice item{/Literal}'
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
                for (var key in this.tableMapping) {
                    if (this.model.attributes.detailItems[i].detailItem == key) {
                        var itemName = this.tableMapping[key];
                    }
                }
                var id = this.model.attributes.detailItems[i].id;
                var detailItem = this.model.attributes.detailItems[i].detailItem;
                var qty = this.model.attributes.detailItems[i].quantity;
                var isAdd = false;
                    
                $('#itemTable tbody').append('<tr><td class="isAdd" style="display:none;">' + isAdd + '</td><td class="itemId" style="display:none;">' + id + '</td><td class="detailItem" style="display:none;">' + detailItem + '</td> <td class="names">' + itemName + '</td> <td><div class="input-field inline input-field-small"><input class="quantities" id="qty' + i + '" type="number" value="' + qty +'"></div></td> <td><a id="delete-item-confirm" class="waves-effect waves-green btn red" data-recipe-id="' + detailItem + '">REMOVE</a></td> </tr>');
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
        if (this.model.attributes.id == "") {
            $('#select-item-modal').modal().modal('open');  
        }
    }
});