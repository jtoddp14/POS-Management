var Barcode = Backbone.Model.extend({
    defaults: {
        id: '',
        description: '',
        onHand: 0,
        quantity: 0,
        barcodeCount: 0,
        printQty: 0,
    }
});