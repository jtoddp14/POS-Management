var FollowOnView = Backbone.View.extend({
    fullCollection: {},
    formModal: null,
    deletionModal: {},
    itemTypes: {},
    taxAuthorities: {},
    itemMapping: [],

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-follow-on-trigger': 'editFollowOn',
        'click #add-follow-on-button': 'addFollowOn',
        'click .save-button': 'saveFollowOn',
        'click .delete-follow-on-button': 'deletionModal',
        'click #delete-follow-on-confirm': 'deleteFollowOn'
    },
    breadcrumb: {},

    styles: [
        'ap-blue',
        '#31619e'
    ],

    followOnStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.followOnFormTemplate = options.followOnFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.getItemsFull();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            followOn: this.collection.toJSON(),
        }));

        $(document).ready(function(){
            $('.modal').modal();
        });
        App.breadCrumbToolTip = "When you scan a Follow-On item, items you set are automatically added to the order.";    
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
        this.formModal = this.$el.find('#follow-on-form-modal').modal();
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
                    that.itemMapping.push(results[i]);
                }
                that.getFollowOns();
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

    getFollowOns: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-follow-on-list',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.renderFollowOns(data.followOns);
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

    renderFollowOns: function (data) {
        var that = this;

        var collection = new FollowOnCollection();
        for (var i = 0; i < data.length; i++) {
            var followOn = new FollowOn();
            followOn = data[i].masterItem.follow_ons
            followOn.items = data[i].detailItems;
            
            for (var j = 0; j < that.itemMapping.length; j++) {
                if (followOn.code == that.itemMapping[j].id) {
                    followOn.itemDescription = that.itemMapping[j].description;
                }
            }

            followOn.id = i;
            collection.add(new FollowOn(followOn));
        }

        that.followOns = collection;
        that.generateFollowOnStyleMapping(collection);

        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },

    generateFollowOnStyleMapping: function (data) {
        var followOns = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        for (var i = 0; i < data.models.length; i++) {
            if (followOns.indexOf(data.models[i].code) < 0) {
                data.models[i].id = i;
                followOns.push(data.models[i].code);
                this.followOnStyleMapping[data.models[i].code] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
    },

    editFollowOn: function (e) {
        var element = $(e.currentTarget);
        var masterItemId = $(element).attr('data-id');  
        for(var i = 0; i < this.collection.length; i++) { 
            if (this.collection.models[i].attributes.code == masterItemId) {
                var model = this.collection.models[i];
                this.followOnFormView = new FollowOnFormView({
                    template: this.followOnFormTemplate,
                    model: model,
                });
                this.$el.find('#follow-on-form-modal').html(this.followOnFormView.render().el);
                this.formModal.modal('open');
                break;
            }
        }
    },

    getFormValues: function () {
        var that = this;
        var code = this.$el.find('#code').val();
        var isItem = this.$el.find('.isItem:checked').length > 0;
        var ask = this.$el.find('.ask:checked').length > 0;

        var itemTable = [];
        
        var qtyArray = [];
        var detailItemArray = [];
        var itemIdArray = [];
        var isAdd = [];

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

        for (i = 0; i < document.getElementById("itemTable").rows.length - 2; i++) { 
            var getQty = qtyArray[i];
            var getItemId = itemIdArray[i];
            var getDetailItem = detailItemArray[i];
            var getIsAdd = isAdd[i];
            itemTable.push({
                description: getDetailItem,
                quantity: getQty,
                code: getItemId,
                isAdd: getIsAdd
            });
        }

        var updatedModel = {
            code: code,
            isItem: true,
            ask: ask,
            items: itemTable
        }
        this.followOnFormView.model.set(updatedModel);
        return updatedModel;
    },

    addFollowOn: function () {
        var followOn = new FollowOn();
        this.followOnFormView = new FollowOnFormView({
            template: this.followOnFormTemplate,
            model: followOn,
        });

        this.$el.find('#follow-on-form-modal').html(this.followOnFormView.render().el);
        this.$el.find('select').formSelect();
        this.$el.find("select[required]").css({
            display: "block", 
            position: 'absolute',
            visibility: 'hidden'
        });  
        this.formModal.modal('open');
    },

    deletionModal: function (e) {
        $('#delete-follow-on-modal').modal().modal('open');
    },

    deleteFollowOn: function(e) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/delete-follow-on',
            type: 'POST',
            data: {
                code: that.followOnFormView.model.attributes.code,
                token: sessionToken
            },
            method: 'POST',
            success: function (data) {
                that.collection.remove(that.followOnFormView.model.attributes.id);
                
                M.toast({ html: '{Literal}Follow On Item deleted successfully{/Literal}' });
                that.render();
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem deleting this Follow On Item{/Literal}' });
                }
            }
        });
        this.render();
    },

    saveFollowOn: function (){
        var that = this;
        var updateCollection = that.collection;
        this.getFormValues();
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/save-follow-on',
            data: {
                followOn: JSON.stringify(that.followOnFormView.model.toJSON()),
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                that = (that.followOnFormView.model);
                updateCollection.add(that);
                M.toast({ html: '{Literal}Settings saved successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem saving this follow on item{/Literal}' });
                }
            }
        });

        this.render();
    }
});