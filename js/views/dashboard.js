var DashboardView = Backbone.View.extend({
    breadcrumb: {},

    events: {

    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;
        this.model = options.model;
        this.getIsracardHash();
    },

    render: function () { 
        var that = this;

        this.$el.html(this.template({
            dashboard: this.model.toJSON(),
        }));

        App.setBreadcrumbs(this.breadcrumb);

        return this;
    },


    getIsracardHash: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-isracard-hash',
            data: {
                token: sessionToken,
                accessName: App.IDS_ISRACARD_DASHBOARD
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.setIsracardReportFrame(data.secureId);
            },
            error: function (e) {
                M.toast({ html: '{Literal}You do not have access to view the dashboard{/Literal}' });
            }
        });
    },

    setIsracardReportFrame: function (data) {
        var isracardReportFrame = document.getElementById("isracardReportFrame");
        isracardReportFrame.src = "https://tposclient.isracard.co.il/reports/iframe/?id=" + (data);
        $("#isracardReportFrame").show();
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
});