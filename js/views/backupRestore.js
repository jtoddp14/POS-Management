var BackupRestoreView = Backbone.View.extend({
    breadcrumb: {},
    lastBackup: "",
    data: {},

    events: {
        'click .backup': 'backup',
        'click .restore': 'openBackupsModal',
        'click #restore-confirm': 'chooseBackup',
        'click .save-button': 'save',
        'keyup #remindMe' : 'validateForm',
        //'mouseover .restore' : 'showTooltip'
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;
        this.model = options.model;
        this.taxCodes = [];
        this.listenTo(this.model, 'change', this.render);
        this.getBackups();
    },

    render: function () {        
        var that = this;

        App.breadCrumbToolTip = "Backup your database or restore from a previous point";

        App.setBreadcrumbs(this.breadcrumb);  

        $(document).ready(function(){
            $('select').formSelect();
            $('.modal').modal();
            $('.tooltipped').tooltip({delay: 0});
          });
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

    getBackups: function () {  
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-backup-list',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.backUps = data.fileList;
                that.model.set(data.backupInfo);
                that.model.attributes.fileList = data.fileList;
                that.renderBackups();
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem fetching backups from the server{/Literal}' });
                }
            }
        });

    },

    renderBackups: function () {
        var that = this;
        that.$el.html(that.template({
            backups: that.model.toJSON(),
            lastBackup: that.lastBackup
        }));
    },
    openBackupsModal: function () {
        $('#backup-modal').modal().modal('open');
    },

    chooseBackup: function () {
        var that = this;
        var backupChoice = this.$el.find('#choose-backup-dropdown').val();
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/restore-database',
            data: {
                fileName: backupChoice,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            
            success: function (data) {
                var success = false;
                if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                    success = data.results.success;
                }

                M.toast({ html: '{Literal}Restore successful{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem restoring this backup{/Literal}' });
                }
            }
        });
    },

    backup: function () {
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/backup-database',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            
            success: function (data) {
                var success = false;
                if (typeof data.results !== 'undefined' && typeof data.results.success !== 'undefined') {
                    success = data.results.success;
                }

                M.toast({ html: '{Literal}Backup successful{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem creating a backup{/Literal}' });
                }
            }
        });
    },

    validateForm: function () {
        var valid = true;

        var remindMe = this.$el.find("#remindMe").val();
        if (remindMe.trim().length < 1 || remindMe < 1 || remindMe > 99999) {
            this.$el.find("#remindMe").addClass("invalid");
            valid = false;
        }

        return valid;
    },
});
