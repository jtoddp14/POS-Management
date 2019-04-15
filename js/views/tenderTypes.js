var TenderTypesView = Backbone.View.extend({
    fullCollection: {},
    formModal: null,
    deletionModal: {},

    paymentTypeMapping: {},

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-tender-types-trigger': 'editTenderTypes',
        'click #add-tender-types-button': 'addTenderTypes',
        'click .save-button': 'saveTenderTypes',
        'click .delete-button': 'deletionModal',
        'click #delete-tender-types-confirm': 'deleteTenderTypes',
        'keyup #tenderName' : 'validateForm',
        'keyup #id' : 'validateForm',
        'keyup #maxChange' : 'validateForm',
    },

    breadcrumb: {},

    styles: [
        'ap-blue',
        '#31619e'
    ],

    tenderTypesStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.tenderTypesFormTemplate = options.tenderTypesFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.initTenderTypes();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            tenderTypes: this.collection.toJSON(),
        }));

        $(document).ready(function(){
            $('.modal').modal();
        });
        App.breadCrumbToolTip = "Create or manage the types of tender you accept as payment";     
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
        this.formModal = this.$el.find('#tender-types-form-modal').modal();
        return this;
    },

    editTenderTypes: function (e) {
        var element = $(e.currentTarget);
        var id = $(element).attr('data-id');
        if (this.collection.get(id) !== null && this.collection.get(id) !== '') {
            this.tenderTypesFormView = new TenderTypesFormView({
                template: this.tenderTypesFormTemplate,
                model: this.collection.get(id),
                paymentTypes: this.paymentTypeMapping
            });

            this.$el.find('#tender-types-form-modal').html(this.tenderTypesFormView.render().el);
            this.$el.find('select').formSelect();
            this.formModal.modal('open');
        }
        else {
            M.toast({ html: '{Literal}There was a problem fetching data from the server{/Literal}' });
        }
    },

    addTenderTypes: function () {
        var tenderTypes = new TenderTypes();
        this.tenderTypesFormView = new TenderTypesFormView({
            template: this.tenderTypesFormTemplate,
            model: tenderTypes,
            paymentTypes: this.paymentTypeMapping
        });

        this.$el.find('#tender-types-form-modal').html(this.tenderTypesFormView.render().el);
        this.$el.find('select').formSelect();
        this.$el.find("select[required]").css({
            display: "block", 
            position: 'absolute',
            visibility: 'hidden'
        });  
        this.formModal.modal('open');
        $('#id').prop("disabled", false); 
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

    initTenderTypes: function () {
        this.getPaymentTypes();
    },

    getPaymentTypes: function() {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-payment-types',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                if (typeof data.results !== 'undefined') {
                    that.paymentTypeMapping = {};
                    for (var i = 0; i < data.results.length; i++) {
                        if (Object.keys(data.results[i]).length < 1) {
                            continue;
                        }
                        var key = Object.keys(data.results[i])[0];
                        that.paymentTypeMapping[key] = data.results[i][key];
                        
                    }
                    that.getTenderTypes();
                } else {
                    that.paymentTypeMapping = {};
                }
                
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

    getCookie: function() {
        var nameEQ = "sessionCookie" + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
    },


    getTenderTypes: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-tender-types',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.generateTenderTypesStyleMapping(data.results);
                that.renderTenderTypes(data.results);
                
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

    renderTenderTypes: function (data) {
        var that = this;
        data.sort(function (a, b) {
            return a.tenderName.toLowerCase() < b.tenderName.toLowerCase() ? -1 : (a.tenderName.toLowerCase() > b.tenderName.toLowerCase() ? 1 : 0);
        });
        var collection = new TenderTypesCollection();
        for (var i = 0; i < data.length; i++) {
            var currentTenderTypes = data[i];
            currentTenderTypes.cardStyleClass = that.tenderTypesStyleMapping[data[i].id];
            if (typeof currentTenderTypes.paymentType !== 'undefined') {
                currentTenderTypes.paymentTypeName = this.paymentTypeMapping[currentTenderTypes.paymentType];
            }
            
            collection.add(new TenderTypes(currentTenderTypes));
        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },

    generateTenderTypesStyleMapping: function (data) {
        var tenderTypes = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        for (var i = 0; i < data.length; i++) {
            if (tenderTypes.indexOf(data[i].id) < 0) {
                tenderTypes.push(data[i].id);
                this.tenderTypesStyleMapping[data[i].id] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
    },

    getFormValues: function () {
        var isAdd = false;
        if (this.tenderTypesFormView.model.attributes.id == "") {
            isAdd = true;
        }
        var id = this.tenderTypesFormView.$el.find('#id').val();
        var tenderName = this.tenderTypesFormView.$el.find('#tenderName').val();
        var buttonText = this.tenderTypesFormView.$el.find('#buttonText').val();
        var openCash = this.$el.find('.openCash:checked').length > 0;
        var glAccount = this.tenderTypesFormView.$el.find('#glAccount').val();
        var paymentType = this.tenderTypesFormView.$el.find('#payment-type-form-dropdown').val();
        var maxChange = this.tenderTypesFormView.$el.find('#maxChange').val();
        
        var updatedModel = {
            id: id,
            tenderName: tenderName,
            buttonText: tenderName,
            glAccount: glAccount,
            paymentType: paymentType,
            maxChange: maxChange, 
            openCash: openCash,     
            isAdd: isAdd 
        };

        this.tenderTypesFormView.model.set(updatedModel);
    },

    validateForm: function () {
        var valid = true;
        var validateTenderName = this.$el.find("#tenderName").val();
        if (validateTenderName.trim().length < 1) {
            this.$el.find("#tenderName").addClass("invalid");
            valid = false;
        }
        else {
            var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
            for (var i = 0; i < validateTenderName.length; i++) {
                if (iChars.indexOf(validateTenderName.charAt(i)) != -1) {
                    this.$el.find("#tenderName").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }
        

        var validateTenderId = this.$el.find("#id").val();
        if (validateTenderId.trim().length < 1) {
            this.$el.find("#id").addClass("invalid");
            valid = false;
        }
        else {
            var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
            for (var i = 0; i < validateTenderId.length; i++) {
                if (iChars.indexOf(validateTenderId.charAt(i)) != -1) {
                    this.$el.find("#id").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }

        /*var validateButtonText = this.$el.find("#buttonText").val();
        if (validateButtonText.trim().length < 1) {
            this.$el.find("#buttonText").addClass("invalid");
            valid = false;
        }*/

        var validateMaxChange = this.$el.find("#maxChange").val();
        if (validateMaxChange.trim().length < 1) {
            this.$el.find("#maxChange").addClass("invalid");
            valid = false;
        }
        else if (validateMaxChange.indexOf("-") > -1 || validateMaxChange.indexOf('e') > -1) {
            this.$el.find("#maxChange").addClass("invalid");
            valid = false;
        }
        else if (validateMaxChange > 9999999.99) {
            this.$el.find("#maxChange").addClass("invalid");
            valid = false;
        }

        return valid;
    },

    deletionModal: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var tenderTypesId = $(element).attr('data-id');
        $("#delete-tender-types-id").val(tenderTypesId);
        $('#delete-tender-types-modal').modal().modal('open');
    },

    deleteTenderTypes: function(e) {
        var element = $(e.currentTarget);
        var tenderTypesId = $(element).attr("data-tender-types-id");
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/delete-tender-type',
            type: 'POST',
            data: {
                tenderTypesId: tenderTypesId,
                token: sessionToken
            },
            success: function (data) {
                var success = false;
                if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                    success = data.results.success;
                }
                if (success !== null) {
                    that.collection.remove(tenderTypesId);
                }

                M.toast({ html: '{Literal}Tender type{/Literal} ' + tenderTypesId +  ' {Literal}deleted successfully{/Literal}' });

                that.render();
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem deleting this tender type{/Literal}.' });
                }
            }
        });
        this.render();
    },

    saveTenderTypes: function (){
        var tenderTypes;
        var that = this;
        var validation = this.validateForm();
        var updateCollection = that.collection;
        
        if(validation) {
            this.getFormValues();
            var sessionToken = this.getCookie();
            $.ajax({
                url: '/data/save-tender-type',
                data: {
                    tenderType: JSON.stringify(that.tenderTypesFormView.model.toJSON()),
                    token: sessionToken
                },
                dataType: 'json',
                type: 'POST',
    
                success: function (data) {
                    
                    var success = false;
                    if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                        success = data.results.success;
                    }
                    if (success !== null) {
                        that = (that.tenderTypesFormView.model);
                        updateCollection.add(that);
                    }

                    M.toast({ html: '{Literal}Settings saved successfully{/Literal}' });
                },
    
                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem saving this tender type{/Literal}.' });
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