var InventoryView = Backbone.View.extend({
    fullCollection: {},
    formModal: null,
    deletionModal: {},
    itemsAutocomplete: {},
    editedCollecton: {},
    sentItems: 0,
   
    prefillState: false,

    paymentTypeMapping: {},

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-inventory-trigger': 'editInventory',
        'click .save-button': 'saveInventory',
        'click .delete-button': 'deletionModal',
        'click #delete-inventory-confirm': 'deleteInventory',
        'keyup #itemSearch': 'searchItemBySearchTerm',
        'click .add-item': 'addInventory',
        'click .update-inventory' : 'updateInventory',
        'keyup #qtyReceived' : 'validateForm'
    },

    breadcrumb: {},

    styles: [
        'ap-blue',
        '#31619e'
    ],

    inventoryStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.inventoryFormTemplate = options.inventoryFormTemplate; 
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.initInventory();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            inventory: this.collection.toJSON(),
        }));

        
        var that = this;
        App.breadCrumbToolTip = "Increase inventory quantites of items you recieve";
        
        $(document).ready(function(){
            $('.modal').modal();
            that.itemMapping = {};
            that.itemQtyMapping = {}
            document.getElementById('itemSearch').focus();
        });
            
        App.setBreadcrumbs(this.breadcrumb);

        $(document).on('keydown', 'input, select', function(e) {
            var self = $(this)
              , form = self.parents('form:eq(0)')
              , focusable
              , next
              ;
            if (e.keyCode == 13) {
                that.$el.find(".save-button").trigger("click");
                return false;
            }
        });

        $('.tooltipped').tooltip();
        this.formModal = this.$el.find('#inventory-form-modal').modal();
        return this;
    },

    searchItemBySearchTerm: function(element) {
        if (element.keyCode == 13) {
            this.$el.find(".add-item").trigger("click");
        }
        else {
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
        }
    },

    selectItemFromAutocompleteList: function (e) {
        var element = $(e.currentTarget);
    },

    getItemsBySearchTerm: function(searchTerm) {
        var that = this;
        var sessionToken = this.getCookie();

        var elems = document.querySelector('#itemSearch');
        that.itemsAutocomplete = M.Autocomplete.init(elems, {
            minLength: 1,
            sortFunction: function (a, b, inputString) {
                return a.indexOf(inputString) - b.indexOf(inputString);
            }
        });
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
                that.items = {};
                var itemCodes = results.length;
                for (var i = 0; i < results.length; i++) {
                    that.items[results[i].itemCode] = null;
                    that.itemMapping[results[i].itemCode] = results[i].itemDescription;
                    that.itemQtyMapping[results[i].itemCode] = results[i].onHand;
                }
                

                that.itemsAutocomplete.updateData(that.items); 
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

    editInventory: function (e) {
        var element = $(e.currentTarget);
        var id = $(element).attr('data-id');
        
        if (this.collection.get(id) !== null && this.collection.get(id) !== '') {
            this.inventoryFormView = new InventoryFormView({
                template: this.inventoryFormTemplate,
                model: this.collection.get(id),
            });

            this.$el.find('#inventory-form-modal').html(this.inventoryFormView.render().el);
            this.formModal.modal('open');
        }
        else {
            M.toast({ html: '{Literal}There was a problem fetching data from the server{/Literal}' });
        }
    },

    addInventory: function (e) {
        var searchValue = $('#itemSearch').val();
        var onlyAddValid = false;

        for (var key in this.items) {
            if (searchValue == key) {
                onlyAddValid = true;
            }
        }

        if (searchValue === '') {
            M.toast({ html: '{Literal}Please enter an item to search{/Literal}' });
        }
        else if (onlyAddValid == false) {
            M.toast({ html: '{Literal}Please enter a valid inventory item{/Literal}' });
        }
        else if (onlyAddValid) {
            var inventory = new Inventory();
            this.inventoryFormView = new InventoryFormView({
                template: this.inventoryFormTemplate,
                model: inventory
            });
    
            this.$el.find('#inventory-form-modal').html(this.inventoryFormView.render().el);
            this.$el.find('select').formSelect();
            this.$el.find("select[required]").css({
                display: "block", 
                position: 'absolute',
                visibility: 'hidden'
            });  
            this.formModal.modal('open');
            
            if (this.itemMapping[searchValue] !== undefined) {
                var id = document.getElementById('id');
                id.value =  searchValue;

                var qty = document.getElementById('qtyOnHand');
                qty.value = this.itemQtyMapping[searchValue];

                var description = document.getElementById('description');
                description.value = this.itemMapping[searchValue];
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

    initInventory: function () {
        this.getInventory();
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

    getInventory: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/create-receiving-session',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.generateInventoryStyleMapping(data.results);
                that.renderInventory(data.results);
                
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

    renderInventory: function (data) {
        var that = this;
        data.sort(function (a, b) {
            return a.id.toLowerCase() < b.id.toLowerCase() ? -1 : (a.id.toLowerCase() > b.id.toLowerCase() ? 1 : 0);
        });
        var collection = new InventoryCollection();
        for (var i = 0; i < data.length; i++) {
            var currentInventory = data[i];
            currentInventory.cardStyleClass = that.inventoryStyleMapping[data[i].id];
            
            collection.add(new Inventory(currentInventory));
        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },

    generateInventoryStyleMapping: function (data) {
        var inventory = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        for (var i = 0; i < data.length; i++) {
            if (inventory.indexOf(data[i].id) < 0) {
                inventory.push(data[i].id);
                this.inventoryStyleMapping[data[i].id] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
    },

    getFormValues: function () {
        var id = this.inventoryFormView.$el.find('#id').val();
        var description = this.inventoryFormView.$el.find('#description').val();
        var qtyOnHand = this.inventoryFormView.$el.find('#qtyOnHand').val();
        var total = this.inventoryFormView.$el.find('#total').val();
        
        var updatedModel = {
            id: id,
            description: description,
            qtyOnHand: qtyOnHand,
            total: total,
        };
        this.editedCollecton = new InventoryCollection();
        this.inventoryFormView.model.set(updatedModel);
        this.editedCollecton.add(this.inventoryFormView.model); 
    },

    validateForm: function () {
        var valid = true;

        var validateQtyReceived = this.$el.find("#qtyReceived").val();
        if (validateQtyReceived.trim().length < 1) {
            this.$el.find("#qtyReceived").addClass("invalid");
            valid = false;
        }
        else if (validateQtyReceived.indexOf("-") > -1 || validateQtyReceived.indexOf('e') > -1) {
            this.$el.find("#qtyReceived").addClass("invalid");
            valid = false;
        }
        else if (validateQtyReceived > 999999) {
            this.$el.find("#qtyReceived").addClass("invalid");
            valid = false;
        }

        return valid;
    },

    deletionModal: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var inventoryId = $(element).attr('data-id');
        $("#delete-inventory-id").val(inventoryId);
        $('#delete-inventory-modal').modal().modal('open');
    },

    deleteInventory: function(e) {
        var element = $(e.currentTarget);
        var inventoryId = $(element).attr("data-inventory-id");
        this.collection.remove(inventoryId);
        this.render();
    },

    saveInventory: function (){
        var that = this;
        var validation = this.validateForm();
        var updateCollection = that.collection;
        if (validation) {
            var sessionAddition = $('#qtyReceived').val();
            var session = document.getElementById('total');
            var qtyOnHand = document.getElementById('qtyOnHand');
    
            var totalNonParsed = Number(session.value) + Number(sessionAddition)
            var twoDecimalTotal = Number.parseFloat(totalNonParsed).toFixed(2);
            session.value =  twoDecimalTotal;
        }

        $('#select-type-modal').modal().modal('close');

        if(validation) { 
            this.getFormValues();
            that = (that.inventoryFormView.model);
            updateCollection.add(that);

            this.render();
        }
    },

    updateInventory: function () { 
        var inventory;
        var that = this;
        var updateCollection = that.collection;
        var sessionToken = this.getCookie();
        for (var i=0; i < that.collection.length; i++) {
            $.ajax({
                url: '/data/save-receiving-session',
                data: {
                    itemCount: that.collection.models[i].attributes.total,
                    itemCountId: (that.collection.models[i].id),
                    token: sessionToken,
                    password: sessionToken
                },
                dataType: 'json',
                type: 'POST',

                success: function (data) {
                    if (data.success) {
                        var success = false;
                        if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                            success = data.results.success;
                        }
                        that.sentItems++;
                        if (that.sentItems == that.collection.length) {
                            M.toast({ html: '{Literal}Settings saved successfully{/Literal}' });
                        }
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem saving inventory items{/Literal}' });
                    }
                    that.collection.reset();
                },

                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem saving this inventory item{/Literal}' });
                    }
                }
            });
        }

        this.render();
    }
});