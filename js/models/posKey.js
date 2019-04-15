var POSKey = Backbone.Model.extend({
    
    defaults: {
        id: null,
        row: 0,
        column: 0,
        width: 0,
        height: 0,
        text: "",
        keysetName: "",
        lastChanged: null,
        imageName: "",
        noSync: false,
        keyNumber: 0,
        type: "Item",
        isActive: true,
        partialText: false,
        page: "MAIN",
        name: "",
        noRepeat: false
    }
});