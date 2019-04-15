var GroupItemsView = Backbone.View.extend({
    fullCollection: {},
    formModal: null,
    deletionModal: {},

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-group-item-trigger': 'editGroupItem',
        'click #add-group-item-button': 'addGroupItem',
        'click .save-button': 'saveGroupItem',
        'click .delete-button': 'deletionModal',
        'click #delete-group-item-confirm': 'deleteGroupItem',
        'keyup #id' : 'validateForm',
        'keyup #name' : 'validateForm',
        'keyup #priceAfter' : 'validateForm',
    },

    breadcrumb: {},

    styles: [
        'ap-blue',
    ],

    groupItemsStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.groupItemsFormTemplate = options.groupItemsFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.initGroupItems();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            groupItems: this.collection.toJSON(),
        }));

        $(document).ready(function(){
            $('.modal').modal();
        });

        App.breadCrumbToolTip = "Create a 'Master Item' that, when added to an order, adds a group of items of your choice";

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
        this.formModal = this.$el.find('#group-items-form-modal').modal();
        return this;
    },

    editGroupItem: function (e) {
        var element = $(e.currentTarget);
        var masterItemId = $(element).attr('data-id');  

        for(var i = 0; i < this.collection.length; i++) { 
            if (this.collection.models[i].attributes.masterItemId == masterItemId) {
                var model = this.collection.models[i];
                this.groupItemsFormView = new GroupItemsFormView({
                    template: this.groupItemsFormTemplate,
                    model: model,
                    newGroup: false,
                });
                
                this.$el.find('#group-items-form-modal').html(this.groupItemsFormView.render().el);
                this.formModal.modal('open');
                break;
            }
        }
    },

    addGroupItem: function () {
        var groupItems = new GroupItems();
        this.groupItemsFormView = new GroupItemsFormView({
            template: this.groupItemsFormTemplate,
            model: groupItems,
            newGroup: true
        });

        this.$el.find('#group-items-form-modal').html(this.groupItemsFormView.render().el);
        this.$el.find('select').formSelect();
        this.$el.find("select[required]").css({
            display: "block", 
            position: 'absolute',
            visibility: 'hidden'
        });  
        this.formModal.modal('open');
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

    initGroupItems: function () {
        this.getGroupItems();
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

    getGroupItems: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-groupitems',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.generateGroupItemsStyleMapping(data.itemGroups);
                that.renderGroupItems(data.itemGroups);
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

    renderGroupItems: function (data) {
        var that = this;
        data.sort(function (a, b) {
            return a.masterItemId.toLowerCase() < b.masterItemId.toLowerCase() ? -1 : (a.masterItemId.toLowerCase() > b.masterItemId.toLowerCase() ? 1 : 0);
        });
        var collection = new GroupItemsCollection();
        for (var i = 0; i < data.length; i++) {
            var currentGroupItem = data[i];
            currentGroupItem.cardStyleClass = that.groupItemsStyleMapping[data[i].masterItemId];    
            collection.add(new GroupItems(currentGroupItem));
        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },

    generateGroupItemsStyleMapping: function (data) {
        var groupItems = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        
        for (var i = 0; i < data.length; i++) {
            if (groupItems.indexOf(data[i].masterItemId) < 0) {
                groupItems.push(data[i].masterItemId);
                this.groupItemsStyleMapping[data[i].masterItemId] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
    },

    getFormValues: function () {
        var that = this;
        var masterItemId = this.groupItemsFormView.model.attributes.masterItemId;
        var name = this.$el.find('#name').val();
        var priceAfter = this.$el.find('#priceAfter').val();

        var itemTable = [];
        var priceArray = [];
        var qtyArray = [];
        var itemNameArray = [];
        var printArray = [];
        var detailItemArray = [];
        var itemIdArray = [];
        var isAdd = [];

        this.$el.find('.prices').each(function() {
            var currentPrice = $(this).html();
            priceArray.push(currentPrice);                
        });

        this.$el.find('.quantities').each(function() {
            var currentQty = $(this).val();
            qtyArray.push(currentQty);
        });

        this.$el.find('.itemId').each(function() {
            var currentId = $(this).html();
            itemIdArray.push(currentId);                
        });

        this.$el.find('.detailItem').each(function() {
            var currentId = $(this).html();
            detailItemArray.push(currentId);                
        });

        this.$el.find('.isAdd').each(function() {
            if ($(this)[0].textContent == 'true') { 
                var isAdded = true;
                isAdd.push(isAdded);       
            }
            else {
                var isAdded = false;
                isAdd.push(isAdded);    
            }         
        });

        for (var i = 0; i < document.getElementById("itemTable").rows.length - 2; i++) {
            printArray.push(this.$el.find('.checked'+ i +':checked').length > 0);
        }

        for (i = 0; i < document.getElementById("itemTable").rows.length - 2; i++) { 
            var getItemPrice = priceArray[i];
            var getQty = qtyArray[i];
            var getPrint = printArray[i];
            var getItemId = itemIdArray[i]
            var getDetailItem = detailItemArray[i]
            var getIsAdd = isAdd[i];
            itemTable.push({
                detailItem: getDetailItem,
                price: getItemPrice,
                quantity: getQty,
                print: getPrint,
                id: getItemId,
                masterItem: masterItemId,
                isAdd: getIsAdd
            });
        }

        var updatedModel = {
            masterItemId: masterItemId,
            masterItemDescription: name,
            masterItemPrice: priceAfter,
            detailItems: itemTable,
            priceAfterDiscount: priceAfter
        }
        this.groupItemsFormView.model.set(updatedModel);
        return updatedModel;
    },

    validateForm: function () {
        var valid = true;

        var name = this.$el.find("#name").val();
        if (name.trim().length < 1) {
            this.$el.find("#name").addClass("invalid");
            valid = false;
        }
        else {
            var iChars = "`~!^*()_+=[]{}:;,<>./?*\\\'\"";
            for (var i = 0; i < name.length; i++) {
                if (iChars.indexOf(name.charAt(i)) != -1) {
                    this.$el.find("#name").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }
        
        var priceAfter = this.$el.find("#priceAfter").val();
        if (priceAfter.trim().length < 1) {
            this.$el.find("#priceAfter").addClass("invalid");
            valid = false;
        }
        else if (priceAfter.indexOf("-") > -1 || priceAfter.indexOf('e') > -1) {
            this.$el.find("#priceAfter").addClass("invalid");
            valid = false;
        }
        else if (priceAfter > 999999) {
            this.$el.find("#priceAfter").addClass("invalid");
            valid = false;
        }

        return valid;
    },

    deletionModal: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var groupItemsId = $(element).attr('data-id');
        $("#delete-group-item-id").val(groupItemsId);
        $('#delete-group-item-modal').modal().modal('open');
    },

    deleteGroupItem: function(e) {
        var element = $(e.currentTarget);
        var groupItemsId = $(element).attr("data-group-item-id");
        var that = this;

        if (groupItemsId !== null && groupItemsId !== '') {
            var sessionToken = this.getCookie();
            $.ajax({
                url: '/data/delete-groupitem',
                type: 'POST',
                data: {
                    token: sessionToken,
                    masterItemId: groupItemsId,
                },

                success: function (data) {
                    var success = false;
                    if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                        success = data.results.success;
                    }
                    if (success !== null) {
                        M.toast({ html: '{Literal}Group Item deleted successfully{/Literal}' });
                        that.collection.remove(groupItemsId);
                    }
                    location.reload();
                },

                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem deleting this group item{/Literal}' });
                    }
                }
            });
        }
    },

    saveGroupItem: function (){
        var groupItem;
        var that = this;
        var validation = this.validateForm();
        var updateCollection = that.collection;
        
        if (validation) {
            var formValues = this.getFormValues();
            var sessionToken = this.getCookie();
            $.ajax({
                url: '/data/save-groupitem',
                data: {
                    token: sessionToken,
                    groupItem: JSON.stringify(formValues),
                    addNewGroupItem: that.groupItemsFormView.newGroupItem,
                },
                dataType: 'json',
                type: 'POST',
    
                success: function (data) {
                    var success = false;
                    if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                        success = data.results.success;
                    }
                    if (success !== null) {
                        var m = that.groupItemsFormView.model;
                        updateCollection.add(m);
                    }
                    that.formModal.modal('close');
                    M.toast({ html: '{Literal}Group Item saved successfully{/Literal}' });
                },
    
                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem saving this group item{/Literal}' });
                    }
                }
            });

            this.render();
        }
        else {
            M.toast({ html: '{Literal}Some of the required fields are missing or invalid{/Literal}' });
        }
    }
});