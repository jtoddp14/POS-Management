var CustomersCollection = Backbone.Collection.extend({
    model: Customers,

    byCustomerId: function (id) {
        filtered = this.filter(function (customers) {
            return customers.get("id").toUpperCase().includes(id.toUpperCase());
        });
        return new CustomersCollection(filtered);
    },

    byCustomerName: function (name) {
        filtered = this.filter(function (customers) {
            return customers.get("first").toUpperCase().includes(name.toUpperCase());
        });

        return new CustomersCollection(filtered);
    },

    byCustomerPhone: function (phone) {
        filtered = this.filter(function (customers) {
            return customers.get("phone").toUpperCase().includes(phone.toUpperCase());
        });
        return new CustomersCollection(filtered);
    },
    byCustomerEmail: function (email) {
        filtered = this.filter(function (customers) {
            return customers.get("email").toUpperCase().includes(email.toUpperCase());
        });
        return new CustomersCollection(filtered);
    }
});