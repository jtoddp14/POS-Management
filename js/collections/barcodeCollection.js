var BarcodeCollection = Backbone.Collection.extend({
    model: Barcode,

    byItemId: function (id) {
        filtered = this.filter(function(items) {
            return items.get("id").toUpperCase().includes(id.toUpperCase());
        });

        return new BarcodeCollection(filtered);
    },

    byItemDescription: function (description) {
        filtered = this.filter(function (items) {
            return items.get("description").toUpperCase().includes(description.toUpperCase());
        });

        return new BarcodeCollection(filtered);
    },

    byItemType: function (type) {
        filtered = this.filter(function (items) {
            return items.get("type").toUpperCase().includes(type.toUpperCase());
        });
        return new BarcodeCollection(filtered);
    },

    byCategory: function (category) {
        filtered = this.filter(function (items) {
            return items.get("category").toUpperCase().includes(category.toUpperCase());
        });
        return new BarcodeCollection(filtered);
    },

    byAltDescription: function (altDescription) {
        filtered = this.filter(function (items) {
            return items.get("altDescription").toUpperCase().includes(altDescription.toUpperCase());
        });
        return new BarcodeCollection(filtered);
    }
});