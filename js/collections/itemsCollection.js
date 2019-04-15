var ItemsCollection = Backbone.Collection.extend({
    model: Items,

    byItemId: function (id) {
            return this.filter(function(items) {
                return items.get("id").toUpperCase().includes(id.toUpperCase());
            });
    },

    byItemDescription: function (description) {
        filtered = this.filter(function (items) {
            return items.get("description").toUpperCase().includes(description.toUpperCase());
        });

        return new ItemsCollection(filtered);
    },

    byItemType: function (type) {
        filtered = this.filter(function (items) {
            return items.get("type").toUpperCase().includes(type.toUpperCase());
        });
        return new ItemsCollection(filtered);
    },

    byCategory: function (category) {
        filtered = this.filter(function (items) {
            return items.get("category").toUpperCase().includes(category.toUpperCase());
        });
        return new ItemsCollection(filtered);
    },

    byAltDescription: function (altDescription) {
        filtered = this.filter(function (items) {
            return items.get("altDescription").toUpperCase().includes(altDescription.toUpperCase());
        });
        return new ItemsCollection(filtered);
    }
});