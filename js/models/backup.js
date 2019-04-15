var Backup = Backbone.Model.extend({
    defaults: { 
        backupInfo: {
            backupPath: '',
            nextBackupDays: 0,
            lastBackupDate: ''
        },
        fileList: [
            
        ]
    }
});