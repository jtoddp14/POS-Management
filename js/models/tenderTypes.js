var TenderTypes = Backbone.Model.extend({
    defaults: {
        id: '',
        tenderName: '',
        buttonText: '',
        glAccount: '',
        paymentType: '',
        paymentTypeName: '',
        maxChange: 0, 
        openCash: false,
    }
});