var NoPartialView = Backbone.View.extend({
    fullCollection: {},
    deletionModal: {},
    itemTypes: {},
    taxAuthorities: {},
    items: [],
    deleteItemId: "",
    deleteItemType: "",
    deleteId: "",

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-tax-trigger': 'editTax',
        'click .add-item': 'addNoPartialItem',
        'keyup #itemSearch': 'searchItemBySearchTerm',
        'click .save-button': 'saveTax',
        'click .delete-no-partial-trigger': 'deletionModal',
        'click #delete-no-partial-confirm': 'deleteNoPartial',
        'click .select-item-type': 'selectItemType',
        'click .choose-type-trigger' : 'addNoPartialType',
    },

    breadcrumb: {},

    styles: [
        'ap-blue',
        '#31619e'
    ],

    taxesStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.noPartialFormTemplate = options.noPartialFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.getItemTypes();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            noPartial: this.collection.toJSON(),
            itemTypes: this.itemTypes
        }));

        $(document).ready(function(){
            $('.modal').modal();
            document.getElementById('itemSearch').focus();
        });
        App.breadCrumbToolTip = "Set specific items or item types to not allow quantites that are not whole numbers"; 
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
        var chosenItem = null;

        for (var key in this.items) {
            if (e == key) {
                chosenItem = key;
            }
        }
        this.addNoPartialItem();
    },

    getItemsBySearchTerm: function(searchTerm) {
        var that = this;
        var sessionToken = this.getCookie();

        var elems = document.querySelector('#itemSearch');
        that.itemsAutocomplete = M.Autocomplete.init(elems, {
            minLength: 1,
            sortFunction: function (a, b, inputString) {
                return a.indexOf(inputString) - b.indexOf(inputString);
            },
            onAutocomplete: function (selection) { that.selectItemFromAutocompleteList(selection); }
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

    getCookie: function() {
        var nameEQ = "sessionCookie" + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
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
                that.getNoPartials();
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

    getNoPartials: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-no-partial-quantities',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.generateNoPartialStyleMapping(data.results);
                
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

    renderNoPartials: function (data) {
        var that = this;
        data.sort(function (a, b) {
            return a.no_partial.id < b.no_partial.id ? -1 : (a.no_partial.id > b.no_partial.id ? 1 : 0);
        });
        var collection = new NoPartialCollection();
        for (var i = 0; i < data.length; i++) {
            var currentTax = data[i].no_partial;
            
            currentTax.cardStyleClass = that.taxesStyleMapping[data[i].no_partial.id];
            
            collection.add(new NoPartial(currentTax));
        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },

    generateNoPartialStyleMapping: function (data) {
        var taxes = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        for (var i = 0; i < data.length; i++) {
            data[i].no_partial.id = i;
            if (taxes.indexOf(data[i].no_partial.id) < 0) {
                taxes.push(data[i].no_partial.id);
                this.taxesStyleMapping[data[i].no_partial.id] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }

        this.renderNoPartials(data);
    },

    addNoPartialItem: function () {
        var that = this;
        var updateCollection = that.collection;
        var sessionToken = this.getCookie();
        var selectedItem = $('#itemSearch').val();
        if (selectedItem != "" || selectedItem != undefined) {
            var newPartial = new NoPartial;
            newPartial.attributes.itemId = selectedItem;
            $.ajax({
                url: '/data/save-no-partial-quantities',
                data: {
                    item: (selectedItem),
                    itemType: "",
                    token: sessionToken
                },
                dataType: 'json',
                type: 'POST',

                success: function (data) {
                    updateCollection.add(newPartial);
                    M.toast({ html: '{Literal}Settings saved successfully{/Literal}' });
                },

                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem saving this Partial Quantitty{/Literal}' });
                    }
                }
            });
        }
    },

    addNoPartialType: function (e) {
        var that = this;

        var element = $(e.currentTarget);
        var itemTypeId = $(element).attr('data-id');
        $('#select-type-modal').modal().modal('close');

        var updateCollection = that.collection;
        var sessionToken = this.getCookie();

        if (itemTypeId != "") {
            var newPartial = new NoPartial;
            newPartial.attributes.itemType = itemTypeId;
        }

        $.ajax({
            url: '/data/save-no-partial-quantities',
            data: {
                item: "",
                itemType: itemTypeId,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                updateCollection.add(newPartial);
                M.toast({ html: '{Literal}Settings saved successfully{/Literal}' });
                that.render();
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem saving this Partial Quantitty{/Literal}' });
                }
            }
        });
    },

    deletionModal: function (e) {
        var element = $(e.currentTarget);
        this.deleteItemId = $(element).attr('item-id');
        this.deleteItemType = $(element).attr('type-id');
        this.deleteId = $(element).attr('data-id');
        $('#delete-no-partial-modal').modal().modal('open');
    },

    deleteNoPartial: function(e) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/delete-no-partial-quantities',
            type: 'POST',
            data: {
                item: that.deleteItemId,
                itemType: that.deleteItemType,
                token: sessionToken
            },
            method: 'POST',
            success: function (data) {
                that.collection.remove(that.deleteId);
                
                that.deleteItemId = "";
                that.deleteItemType = "";
                that.deleteId = "";
                M.toast({ html: '{Literal}No Partial Quantity deleted successfully{/Literal}' });
                that.render();
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem deleting this partial quantity{/Literal}' });
                }
            }
        });
        this.render();
    },

    selectItemType: function (e) {
        $('#select-type-modal').modal().modal('open');
    }
});