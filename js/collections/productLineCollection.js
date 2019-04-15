var ProductLineCollection = Backbone.Collection.extend({
    model: ProductLine,

    byItemType: function (itemType) {
        filtered = this.filter(function (productLine) {
            return productLine.get("type") === itemType;
        });
        return new ProductLineCollection(filtered);
    },

    byMenuPage: function (menuKeyPage) {
        filtered = this.filter(function (productLine) {
            return productLine.get("menuKeyPage") === menuKeyPage;
        });
        return new ProductLineCollection(filtered);
    }
});