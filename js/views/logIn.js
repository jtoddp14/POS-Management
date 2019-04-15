var LogInView = Backbone.View.extend({
    breadcrumb: {},

    events: {
        'click .save-button' : 'logIn',
        'keyup #password' : 'checkForEnter'
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;
        this.israCardBuild = options.israCardBuild;
        this.model = options.model;
    },

    render: function () { 
        var that = this;
        document.cookie = "sessionCookie" + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        this.slideOut = $('.sidenav').hide();
        this.navWrapper = $('.nav-wrapper').hide();
        this.white = $('.white').hide();

        this.$el.html(this.template({
            logIn: this.model.toJSON(),
        }));
        
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

        $(document).ready(function () {
            document.getElementById('password').focus();
            if (that.israCardBuild) {
                $('.apLogInLogo').hide();
                $('.israCardLogInLogo').show();
            }
            else {
                $('.apLogInLogo').show();
                $('.israCardLogInLogo').hide();
            }
        });

        return this;
    },

    checkForEnter: function (e) {
        if (e.keyCode == 13) {
            this.$el.find(".save-button").trigger("click");
        }
    },

    logIn: function () {
        var that = this;

        var password = this.$el.find('#password').val();
        App.password = password;
        var rkEncryptionKey = CryptoJS.enc.Base64.parse('u/Gu5posvwDsXUnV5Zaq4g==');
        var rkEncryptionIv = CryptoJS.enc.Base64.parse('5D9r9ZVzEYYgha93/aUK2w==');
        var utf8Stringified = CryptoJS.enc.Utf8.parse(password);
        var encrypted = CryptoJS.AES.encrypt(password, rkEncryptionKey, {mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7, iv: rkEncryptionIv});
        var ciphertext = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

        $.ajax({
            url: '/data/log-in',
            data: {
                password: ciphertext
            },
            dataType: 'json',
            type: 'POST',
            
            success: function (data) {
                var success = false;
                that.model.set(data);
                that.setToken();
            },

            error: function (e) {
                if (e.status == 520) {
                    M.toast({ html: 'Server Not Fully Loaded. Please wait a few seconds and try again.' });
                }
                else if (e.status == 521) {
                    M.toast({ html: 'Invalid User Login' });
                }
                else if (e.status == 522) {
                    M.toast({ html: 'No Access to Web Management' });
                }
            }
        });
    },

    setToken: function () {
        if (this.model.attributes.token.length > 0) {
            this.setCookie("sessionCookie", this.model.attributes.token);
            window.location.href = "#/home";
            this.navWrapper.show();
            this.white.show();  
            this.slideOut.show();
        }
        else {
            M.toast({ html: 'Server Not Fully Loaded. Please wait a few seconds and try again.' });
        }
    },
    
    setCookie: function (name, value) {
        document.cookie = name + "=" + (value || "");
    }
});
