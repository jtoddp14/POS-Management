var TillsView = Backbone.View.extend({
    fullCollection: {},
    formModal: null,
    deletionModal: {},
    hasAccess: false,

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-tills-trigger': 'editTills',
        'click #add-tills-button': 'addTills',
        'click .save-button': 'saveTills',
        'click .delete-button': 'deletionModal',
        'click #delete-tills-confirm': 'deleteTills',
        'keyup #tillName' : 'validateForm',
        'keyup #startCash' : 'validateForm',
    },

    breadcrumb: {},

    styles: [
        'ap-blue',
    ],

    tillsStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.tillsFormTemplate = options.tillsFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.initTills();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            tills: this.collection.toJSON(),
        }));

        $(document).ready(function(){
            $('.modal').modal();
        });
        App.breadCrumbToolTip = "Create, manage, and edit your tills";     
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
        this.formModal = this.$el.find('#tills-form-modal').modal();
        return this;
    },

    editTills: function (e) {
        if (this.hasAccess) {
            var element = $(e.currentTarget);
            var id = $(element).attr('data-id');
    
            if (this.collection.get(id) !== null && this.collection.get(id) !== '') {
                this.tillsFormView = new TillsFormView({
                    template: this.tillsFormTemplate,
                    model: this.collection.get(id),
                    newTill: false
                });
    
    
                this.$el.find('#tills-form-modal').html(this.tillsFormView.render().el);
                this.$el.find('select').formSelect();
                this.formModal.modal('open');
            }
            else {
                M.toast({ html: '{Literal}There was a problem fetching data from the server{/Literal}' });
            }
        }
        else {
            M.toast({ html: '{Literal}You do not have access to edit tills{/Literal}' });
        }
    },

    addTills: function () {
        if (this.hasAccess) {
            var tills = new Tills();
            this.tillsFormView = new TillsFormView({
                template: this.tillsFormTemplate,
                model: tills,
                newTill: true
            });
    
            this.$el.find('#tills-form-modal').html(this.tillsFormView.render().el);
            this.$el.find('select').formSelect();
            this.$el.find("select[required]").css({
                display: "block", 
                position: 'absolute',
                visibility: 'hidden'
            });  
            this.formModal.modal('open');
        }
        else {
            M.toast({ html: '{Literal}You do not have access to add tills{/Literal}' });
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

    initTills: function () {
        this.getTills();
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

    getTills: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-tills-list',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.generateTillsStyleMapping(data.results);
                that.renderTills(data.results);
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

    renderTills: function (data) {
        this.checkAccess();
        var that = this;
        data.sort(function (a, b) {
            return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0);
        });
        var collection = new TillsCollection();
        for (var i = 0; i < data.length; i++) {
            var currentTills = data[i];
            currentTills.cardStyleClass = that.tillsStyleMapping[data[i].id];    
            collection.add(new Tills(currentTills));
        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },

    generateTillsStyleMapping: function (data) {
        var tills = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        for (var i = 0; i < data.length; i++) {
            if (tills.indexOf(data[i].id) < 0) {
                tills.push(data[i].id);
                this.tillsStyleMapping[data[i].id] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
    },

    checkAccess: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/check-access',
            data: {
                accessName: (App.IDS_TILLS),
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                that.hasAccess = true;
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else if (e.responseJSON.hasAccess == false) {
                    that.hasAccess = false;
                }
            }
        });
    },

    getFormValues: function () {

        var name = this.$el.find('#tillName').val();
        var cash = this.$el.find('#startCash').val();
        var glDept = this.$el.find('#glDept').val();
        var tenderOrders = this.$el.find('#tenderOrders:checked').length > 0
        var openDrawer2 = this.$el.find('#openDrawer2:checked').length > 0
        var autoZ = this.$el.find('#autoZ:checked').length > 0
        var zOutTime = this.$el.find('#z-out-time-picker').val();

        var updatedModel = {
            id: name,
            name: name,
            cash: cash,
            glDept: glDept,
            tenderOrders: tenderOrders,
            openDrawer2: openDrawer2,
            autoZ: autoZ,
            zOutTime: zOutTime
        };
        this.tillsFormView.model.set(updatedModel);
        return updatedModel;
    },

    checkDuplicateId: function () {
        var tillName = this.$el.find("#tillName").val();
        valid = true;
        if (typeof this.collection.get(tillName) !== 'undefined' && this.tillsFormView.newTill === true) {
            valid = false;
            M.toast({ html: '{Literal}A till with this name already exists{/Literal}' });
        }
        return valid;
    },

    validateForm: function () {
        var valid = true;
        var tillName = this.$el.find("#tillName").val();
        if (tillName.trim().length < 1) {
            this.$el.find("#tillName").addClass("invalid");
            valid = false;
        }
        else {
            var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
            for (var i = 0; i < tillName.length; i++) {
                if (iChars.indexOf(tillName.charAt(i)) != -1) {
                    this.$el.find("#tillName").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }
            
        var validateStartCash = this.$el.find("#startCash").val();
        if (validateStartCash.trim().length < 1) {
            this.$el.find("#startCash").addClass("invalid");
            valid = false;
        }
        else if (validateStartCash.indexOf("-") > -1 || validateStartCash.indexOf('e') > -1) {
            this.$el.find("#startCash").addClass("invalid");
            valid = false;
        }
        else if (validateStartCash > 99999) {
            this.$el.find("#startCash").addClass("invalid");
            valid = false;
        }

        return valid;
    },

    deletionModal: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var tillsId = $(element).attr('data-id');
        $("#delete-tills-id").val(tillsId);
        $('#delete-tills-modal').modal().modal('open');
    },

    deleteTills: function(e) {
        var element = $(e.currentTarget);
        var tillId = $(element).attr("data-till-id");
        var that = this;

        if (tillId !== null && tillId !== '') {
            var sessionToken = this.getCookie();
            $.ajax({
                url: '/data/delete-till',
                type: 'POST',
                data: {
                    tillId: tillId,
                    token: sessionToken,
                    accessName: (App.IDS_TILLS),
                },

                success: function (data) {
                    var success = false;
                    if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                        success = data.results.success;
                    }
                    if (success !== null) {
                        that.collection.remove(tillId);
                    }

                    M.toast({ html: '{Literal}Till{/Literal} ' + tillId +  ' {Literal}deleted successfully{/Literal}' });
                },

                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem deleting this till{/Literal}.' });
                    }
                }
            });
            this.render();
        }
    },

    saveTills: function (){
        var tills;
        var that = this;

        if (!this.checkDuplicateId()) {
            return;
        }
        var validation = this.validateForm();
        var updateCollection = that.collection;
        
        if (validation) {
            var formValues = this.getFormValues();
            var sessionToken = this.getCookie();
            $.ajax({
                url: '/data/save-till',
                data: {
                    till: JSON.stringify(formValues),
                    addNewTill: that.tillsFormView.newTill,
                    token: sessionToken,
                    accessName: (App.IDS_TILLS),
                },
                dataType: 'json',
                type: 'POST',
    
                success: function (data) {
                    var success = false;
                    if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                        success = data.results.success;
                    }
                    if (success !== null) {
                        var m = that.tillsFormView.model;
                        updateCollection.add(m);
                    }
                    that.formModal.modal('close');
                    M.toast({ html: '{Literal}Settings saved successfully{/Literal}' });
                },
    
                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem saving this till{/Literal}.' });
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