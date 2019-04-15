var EConduitView = Backbone.View.extend({
    fullCollection: {},
    deletionModal: {},
    formModal: null,
    deleteId: "",
    companyInfo: {},

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-e-conduit-trigger': 'editEConduit',
        'click #add-e-conduit': 'addEConduit',
        'click .delete-button' : 'deletionModal',
        'click .save-button': 'saveEConduit',
        'click #delete-e-conduit-confirm': 'deleteEConduit',
    },

    breadcrumb: {},

    styles: [
        'ap-blue',
        '#31619e'
    ],

    eConduitStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.eConduitFormTemplate = options.eConduitFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.getEConduit();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            eConduits: this.collection.toJSON()
        }));

        $(document).ready(function(){
            $('.tooltipped').tooltip();
            $('.modal').modal();
        });

        App.breadCrumbToolTip = "Set up or edit your eConduit Terminals";
            
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

        this.formModal = this.$el.find('#e-conduit-form-modal').modal();
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
    
    getEConduit: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-e-conduit-terminals',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.companyInfo = data.results[data.results.length - 1]
                that.generateEConduitStyleMapping(data.results);
                that.renderEConduit(data.results);
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

    renderEConduit: function (data) {
        var that = this;
        data.sort(function (a, b) {
            return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
        });
        var collection = new EConduitCollection();
        for (var i = 0; i < data.length - 1; i++) {
            var currentTerminal = data[i];
            currentTerminal.cardStyleClass = that.eConduitStyleMapping[data[i].id];
            
            collection.add(new EConduit(currentTerminal));
        }
        that.fullCollection = collection;
        that.collection.reset(collection.models);
    },

    generateEConduitStyleMapping: function (data) {
        var term = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        for (var i = 0; i < data.length; i++) {
            
            if (term.indexOf(data[i].id) < 0) {
                term.push(data[i].id);
                this.eConduitStyleMapping[data[i].id] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
    },

    editEConduit: function (e) {
        var element = $(e.currentTarget);
        var id = $(element).attr('data-id');

        if (this.collection.get(id) !== null && this.collection.get(id) !== '') {
            this.eConduitFormView = new EConduitFormView({
                template: this.eConduitFormTemplate,
                model: this.collection.get(id),
            });

            this.$el.find('#e-conduit-form-modal').html(this.eConduitFormView.render().el);
            this.formModal.modal('open');
        }
        else {
            M.toast({ html: '{Literal}There was a problem fetching data from the server{/Literal}' });
        }
    },

    addEConduit: function (e) {
        this.isAdded = true;
        var eConduit = new EConduit();

        eConduit.attributes.address1 = this.companyInfo.address1
        eConduit.attributes.address2 = this.companyInfo.address2
        eConduit.attributes.city = this.companyInfo.city
        eConduit.attributes.name = this.companyInfo.name
        eConduit.attributes.phone = this.companyInfo.phone
        eConduit.attributes.state = this.companyInfo.state
        eConduit.attributes.zip = this.companyInfo.zip

        this.eConduitFormView = new EConduitFormView({
            template: this.eConduitFormTemplate,
            model: eConduit
        });

        this.$el.find('#e-conduit-form-modal').html(this.eConduitFormView.render().el);
        this.$el.find('select').formSelect();
        this.$el.find("select[required]").css({
            display: "block", 
            position: 'absolute',
            visibility: 'hidden'
        });  
        this.formModal.modal('open');
    },

    validateForm: function () {
        var valid = true;

        var validateTerminalId = this.$el.find("#id").val();
       
        var validateTerminalName = this.$el.find("#terminalName").val();
        var validateSerialNumber = this.$el.find("#serialNumber").val();
        var iChars = "`~!@#$%^&*()_+=[]{}:;,<>/?*\\\'\"";
        var numberChars = "0123456789`~!@#$%^&*()_+=[]{}:;,<>/?*\\\'\"";
        var letterChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`~!@#$%^&*_+=[]{}:;,<>./?*\\\'\"";


        if (validateTerminalName.trim().length < 1) {
            this.$el.find("#terminalName").addClass("invalid");
            valid = false;
        }

        if (validateSerialNumber.trim().length < 1) {
            this.$el.find("#serialNumber").addClass("invalid");
            valid = false;
        }

        if (validateTerminalId == '') {

            var validateName = this.$el.find("#companyName").val();
            var validateAddress1 = this.$el.find("#address1").val();
            var validateCity = this.$el.find("#city").val();
            var validateState = this.$el.find("#state").val();
            var validateZip = this.$el.find("#zip").val();
            var validateEmail = this.$el.find("#email").val();
            var validatePhone = this.$el.find("#phone").val();
            var validateContactName = this.$el.find('#contactName').val();
            
            if (validateName.trim().length < 1) {
                this.$el.find("#companyName").addClass("invalid");
                valid = false;
            }

            if (validateAddress1.trim().length < 1) {
                this.$el.find("#address1").addClass("invalid");
                valid = false;
            }
            else {
                for (var i = 0; i < validateAddress1.length; i++) {
                    if (iChars.indexOf(validateAddress1.charAt(i)) != -1) {
                        this.$el.find("#address1").addClass("invalid");
                        valid = false;
                        break;
                    }
                }
            }

            if (validateCity.trim().length < 1) {
                this.$el.find("#city").addClass("invalid");
                valid = false;
            }
            else {
                for (var i = 0; i < validateCity.length; i++) {
                    if (iChars.indexOf(validateCity.charAt(i)) != -1) {
                        this.$el.find("#city").addClass("invalid");
                        valid = false;
                        break;
                    }
                }
            }
            
            if (validateContactName.trim().length < 1) {
                this.$el.find("#contactName").addClass("invalid");
                valid = false;
            }
            else {
                for (var i = 0; i < validateContactName.length; i++) {
                    if (iChars.indexOf(validateContactName.charAt(i)) != -1) {
                        this.$el.find("#contactName").addClass("invalid");
                        valid = false;
                        break;
                    }
                }
            }

            if (validateState.trim().length < 1) {
                this.$el.find("#state").addClass("invalid");
                valid = false;
            }
            for (var i = 0; i < validateState.length; i++) {
                if (numberChars.indexOf(validateState.charAt(i)) != -1) {
                    this.$el.find("#state").addClass("invalid");
                    valid = false;
                    break;
                }
            }

            if (validateZip.trim().length < 1) {
                this.$el.find("#zip").addClass("invalid");
                valid = false;
            }
            else if (validateZip.indexOf("-") > -1 || validateZip.indexOf('e') > -1) {
                this.$el.find("#zip").addClass("invalid");
                valid = false;
            }

            if (validateEmail.trim().length < 1) {
                this.$el.find("#email").addClass("invalid");
                valid = false;
            }

            if (validatePhone.trim().length < 1) {
                this.$el.find("#phone").addClass("invalid");
                valid = false;
            }
            else {
                for (var i = 0; i < validatePhone.length; i++) {
                    if (letterChars.indexOf(validatePhone.charAt(i)) != -1) {
                        this.$el.find("#telephone").addClass("invalid");
                        valid = false;
                        break;
                    }
                }
            }
        }

        return valid;
    },

    deletionModal: function () {
        $('#delete-e-conduit-modal').modal().modal('open');
    },

    saveEConduit: function () {
        var that = this;
        var validation = this.validateForm();
        var sessionToken = this.getCookie();
        var updateCollection = that.collection;

        if (validation) {
            var terminalId = this.$el.find("#id").val();
            var terminalName = this.$el.find("#terminalName").val();
            var serialNumber = this.$el.find("#serialNumber").val();

            if (terminalId == '') {
                var name = this.$el.find('#companyName').val();
                var email = this.$el.find('#email').val();
                var address1 = this.$el.find('#address1').val();
                var city = this.$el.find('#city').val();
                var state = this.$el.find('#state').val();
                var phone = this.$el.find('#phone').val();
                var zip = this.$el.find('#zip').val();
                var contactName = this.$el.find('#contactName').val();

                $.ajax({
                    url: '/data/add-e-conduit-terminal',
                    data: {
                        terminalName: terminalName,
                        serialNumber: serialNumber,
                        name: name,
                        email: email,
                        address1: address1,
                        city: city,
                        state: state,
                        phone: phone,
                        zip: zip,
                        contactName: contactName,
                        token: sessionToken
                    },
                    dataType: 'json',
                    type: 'POST',
        
                    success: function (data) {
                        var success = false;
                        if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                            success = data.results.success;
                        }
                        App.showToast('{Literal}Settings saved successfully{/Literal}');
                    },
        
                    error: function (e) {
                        if (e.status == 523) {
                            window.location.href = "#/log-in";
                            location.reload();
                        }
                        else if (e.status == 533) {
                            App.showToast('{Literal}The terminal has not been registered yet{/Literal}');
                        }
                        else {
                            App.showToast('{Literal}There was a problem saving receipt settings{/Literal}');
                        }
                    }
                });
            }
            else {
                $.ajax({
                    url: '/data/edit-e-conduit-terminal',
                    data: {
                        terminalName: terminalName,
                        terminalId: terminalId,
                        token: sessionToken
                    },
                    dataType: 'json',
                    type: 'POST',
        
                    success: function (data) {
                        that.eConduitFormView.model.attributes.terminalName = terminalName;

                        updateCollection.add(that.eConduitFormView.model);
                        M.toast({ html: '{Literal}Settings saved successfully{/Literal}' });
                        that.render();
                    },
        
                    error: function (e) {
                        if (e.status == 523) {
                            window.location.href = "#/log-in";
                            location.reload();
                        }
                        else {
                            App.showToast('{Literal}There was a problem saving receipt settings{/Literal}');
                        }
                    }
                });
            }
        }
        else {
            App.showToast('{Literal}Some of the required fields are missing or invalid{/Literal}');
        }
    },

    deleteEConduit: function(e) {
        var that = this;
        var element = $(e.currentTarget);
        var terminalId = $(element).attr("data-e-conduit-id");
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/remove-e-conduit-terminal',
            data: {
                terminalId: terminalId,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                that.collection.remove(terminalId);
                M.toast({ html: '{Literal}eConduit Terminal removed successfully{/Literal}' });
                        
                that.render();
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem removing this eConduit Terminal{/Literal}' });
                }
            }
        });
    },

});