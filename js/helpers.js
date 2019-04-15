var addCommas = function (nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
};

var toDecimalPlaces = function (num, count) {
    return parseFloat(num).toFixed(2);
};

var transformObjectArrayToKeyValueObject = function (array, key, value) {
    var output = {};
    for (var i = 0; i < array.length; i++) {
        output[array[i][key]] = array[i][value];
    }
    return output;
};
