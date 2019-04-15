var SnapEBTView = Backbone.View.extend({
    fullCollection: {},
    deletionModal: {},
    itemTypes: {},
    items: [],
    deleteItemId: "",
    deleteItemType: "",
    deleteId: "",

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-tax-trigger': 'editTax',
        'click .save-button': 'saveTax',
        'click .delete-no-partial-trigger': 'deletionModal',
        'click #delete-snap-ebt-confirm': 'deleteSnapEBT',
        'click .select-item-type': 'selectItemType',
        'click .choose-type-trigger' : 'addSnapEBT',
    },

    breadcrumb: {},

    styles: [
        'ap-blue',
        '#31619e'
    ],

    snapStyleMapping: {},

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
            snapEBT: this.collection.toJSON(),
            itemTypes: this.itemTypes
        }));

        $(document).ready(function(){
            $('.modal').modal();
        });
        App.breadCrumbToolTip = "Choose item types that will be eligible for EBT or Snap card payments";    
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
                data.results.sort((a, b) => (a.name > b.name) ? 1 : -1)
                that.itemTypes = data.results;
                that.getSnapEBT();
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

    getSnapEBT: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-snap-ebt',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.generateSnapEBTStyleMapping(data.results);
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

    renderSnapEBT: function (data) {
        var that = this;
        data.sort(function (a, b) {
            return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
        });
        var collection = new SnapEBTCollection();
        for (var i = 0; i < data.length; i++) {
            var currentSnap = data[i];
            currentSnap.cardStyleClass = that.snapStyleMapping[data[i].id];
            
            collection.add(new SnapEBT(currentSnap));
        }

        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },

    generateSnapEBTStyleMapping: function (data) {
        var snap = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        for (var i = 0; i < data.length; i++) {
            
            if (snap.indexOf(data[i].id) < 0) {
                snap.push(data[i].id);
                this.snapStyleMapping[data[i].id] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }

        this.renderSnapEBT(data);
    },

    addSnapEBT: function (e) {
        var that = this;

        var element = $(e.currentTarget);
        var itemTypeId = $(element).attr('data-id');
        $('#select-type-modal').modal().modal('close');

        var updateCollection = that.collection;
        var sessionToken = this.getCookie();

        if (itemTypeId != "") {
            var snapEBT = new SnapEBT;
            snapEBT.attributes.itemType = itemTypeId;
        }

        $.ajax({
            url: '/data/save-snap-ebt',
            data: {
                itemType: itemTypeId,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                updateCollection.add(snapEBT);
                M.toast({ html: '{Literal}Settings saved successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem saving this Snap EBT{/Literal}' });
                }
            }
        });
    },

    deletionModal: function (e) {
        var element = $(e.currentTarget);
        this.deleteId = $(element).attr('data-id');
        this.deleteItemType = $(element).attr('type-id');
        $('#delete-snap-ebt-modal').modal().modal('open');
    },

    deleteSnapEBT: function(e) {
        var that = this;
        var sessionToken = this.getCookie();

        $.ajax({
            url: '/data/remove-snap-ebt',
            type: 'POST',
            data: {
                itemType: that.deleteItemType,
                token: sessionToken
            },
            method: 'POST',
            success: function (data) {
                that.collection.remove(that.deleteId);
                
                that.deleteItemType = "";
                that.deleteId = "";
                M.toast({ html: '{Literal}Snap EBT removed successfully{/Literal}' });
                that.render();
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem removing this Snap EBT{/Literal}' });
                }
            }
        });
    },

    selectItemType: function (e) {
        $('#select-type-modal').modal().modal('open');
    }
});