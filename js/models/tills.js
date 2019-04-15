var Tills = Backbone.Model.extend({
    defaults: {
        id: '',
        name: '',
        cash: 0,
        glDept: '',
        tenderOrders: false,
        openDrawer2: false, 
        autoZ: false,
        zOutTime: ''
    }
});