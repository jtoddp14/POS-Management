var QBOView = Backbone.View.extend({
    events: {
        'click #connectToQbo': 'openQBO',
    },

    breadcrumb: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;
        this.model = options.model;
        this.listenTo(this.model, 'change', this.render);
        this.openQBO();
    },

    render: function () {
        var that = this;
        this.$el.html(this.template());
        App.breadCrumbToolTip = "Connect to QuickBooks Online"; 
        App.setBreadcrumbs(this.breadcrumb);
        
        return this;
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

    openQBO: function() {
        var sessionToken = this.getCookie();
        var that = this
        $.ajax({
            url: '/data/connect-to-qbo',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                console.log(data);
                that.grantUrl = data.grantUrl;

                intuit.ipp.anywhere.setup(
                {
                    menuProxy: '',
                    grantUrl: data.grantUrl
                });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}An error has occured{/Literal}' });
                }
            }
        });
    }
});