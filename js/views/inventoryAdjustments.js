var InventoryAdjustmentsView = Backbone.View.extend({
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
        'click .edit-inventory-adjustments-trigger': 'editInventoryAdjustments',
        'click .save-button': 'saveInventoryAdjustments',
        'click .delete-button': 'deletionModal',
        'click #delete-inventory-adjustments-confirm': 'deleteInventoryAdjustments',
        'keyup #itemSearch': 'searchItemBySearchTerm',
        'click .add-item': 'addInventoryAdjustments',
        'click .update-inventory-adjustments' : 'updateInventoryAdjustments',
        'keyup qtyAdjusted' : 'validateForm'
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
        this.inventoryAdjustmentsFormTemplate = options.inventoryAdjustmentsFormTemplate; 
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.initInventoryAdjustments();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            inventoryAdjustments: this.collection.toJSON(),
        }));

        
        var that = this;

        App.breadCrumbToolTip = "Set individual quantities of items that you have in stock";
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
        this.formModal = this.$el.find('#inventory-adjustments-form-modal').modal();
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

    editInventoryAdjustments: function (e) {
        var element = $(e.currentTarget);
        var id = $(element).attr('data-id');
        
        if (this.collection.get(id) !== null && this.collection.get(id) !== '') {
            this.InventoryAdjustmentsFormView = new InventoryAdjustmentsFormView({
                template: this.inventoryAdjustmentsFormTemplate,
                model: this.collection.get(id),
            });

            this.$el.find('#inventory-adjustments-form-modal').html(this.InventoryAdjustmentsFormView.render().el);
            this.formModal.modal('open');
        }
        else {
            M.toast({ html: '{Literal}There was a problem fetching data from the server{/Literal}' });
        }
    },

    addInventoryAdjustments: function (e) {
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
            var initInventoryAdjustments = new InventoryAdjustments();
            this.InventoryAdjustmentsFormView = new InventoryAdjustmentsFormView({
                template: this.inventoryAdjustmentsFormTemplate,
                model: initInventoryAdjustments
            });
    
            this.$el.find('#inventory-adjustments-form-modal').html(this.InventoryAdjustmentsFormView.render().el);
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

    initInventoryAdjustments: function () {
        this.getInventoryAdjustments();
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

    getInventoryAdjustments: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/create-adjustment-session',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.generateInventoryAdjustmentsStyleMapping(data.results);
                that.renderInventoryAdjustments(data.results);
                
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

    renderInventoryAdjustments: function (data) {
        var that = this;
        data.sort(function (a, b) {
            return a.id.toLowerCase() < b.id.toLowerCase() ? -1 : (a.id.toLowerCase() > b.id.toLowerCase() ? 1 : 0);
        });
        var collection = new InventoryAdjustmentsCollection();
        for (var i = 0; i < data.length; i++) {
            var currentInventoryAdjustments = data[i];
            currentInventoryAdjustments.cardStyleClass = that.inventoryStyleMapping[data[i].id];
            
            collection.add(new InventoryAdjustments(currentInventoryAdjustments));
        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },

    generateInventoryAdjustmentsStyleMapping: function (data) {
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
        var id = this.InventoryAdjustmentsFormView.$el.find('#id').val();
        var description = this.InventoryAdjustmentsFormView.$el.find('#description').val();
        var qtyOnHand = this.InventoryAdjustmentsFormView.$el.find('#qtyOnHand').val();
        var total = this.InventoryAdjustmentsFormView.$el.find('#total').val();
        
        var updatedModel = {
            id: id,
            description: description,
            qtyOnHand: qtyOnHand,
            total: total,
        };
        this.editedCollecton = new InventoryAdjustmentsCollection();
        this.InventoryAdjustmentsFormView.model.set(updatedModel);
        this.editedCollecton.add(this.InventoryAdjustmentsFormView.model); 
    },

    validateForm: function () {
        var valid = true;

        var validateQtyAdjusted = this.$el.find("#qtyAdjusted").val();
        if (validateQtyAdjusted.trim().length < 1) {
            this.$el.find("#qtyAdjusted").addClass("invalid");
            valid = false;
        }
        else if (validateQtyAdjusted.indexOf("-") > -1 || validateQtyAdjusted.indexOf('e') > -1) {
            this.$el.find("#qtyAdjusted").addClass("invalid");
            valid = false;
        }
        else if (validateQtyAdjusted > 999999) {
            this.$el.find("#qtyAdjusted").addClass("invalid");
            valid = false;
        }

        return valid;
    },

    deletionModal: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var inventoryId = $(element).attr('data-id');
        $("#delete-inventory-adjustments-id").val(inventoryId);
        $('#delete-inventory-adjustments-modal').modal().modal('open');
    },

    deleteInventoryAdjustments: function(e) {
        var element = $(e.currentTarget);
        var inventoryId = $(element).attr("data-inventory-adjustments-id");
        this.collection.remove(inventoryId);
        this.render();
    },

    saveInventoryAdjustments: function (){
        var that = this;
        var validation = this.validateForm();
        var updateCollection = that.collection;
        if (validation) {
            var sessionAddition = $('#qtyAdjusted').val();
            var session = document.getElementById('total');
    
            var totalNonParsed = Number(sessionAddition)
            var twoDecimalTotal = Number.parseFloat(totalNonParsed).toFixed(2);
            session.value =  twoDecimalTotal;
        }

        $('#select-type-modal').modal().modal('close');

        if(validation) { 
            this.getFormValues();
            that = (that.InventoryAdjustmentsFormView.model);
            updateCollection.add(that);

            this.render();
        }
    },

    updateInventoryAdjustments: function () { 
        var inventory;
        var that = this;
        var updateCollection = that.collection;
        var sessionToken = this.getCookie();
        for (var i=0; i < that.collection.length; i++) {
            $.ajax({
                url: '/data/save-adjustment-session',
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