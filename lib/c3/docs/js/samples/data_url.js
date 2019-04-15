var chart = c3.generate({
    data: {
        url: '/data/data/c3_test.csv'
    }
});

setTimeout(function () {
    c3.generate({
        data: {
            url: '/data/data/c3_test.json',
            mimeType: 'json'
        }
    });
}, 1000);