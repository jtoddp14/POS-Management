var HomeView = Backbone.View.extend({
    breadcrumb: {},
    chartRendered: false,
    openOrders: 0,
    totalTransactions: 0,
    resetAccess: false,
    readAccess: false,
    resetCurrentAccess: false,
    zOutSummary: {},
    salesByItemType: {},
    noSalesCount: 0,
    creditCardCount: 0,
    debitCardCount: 0,
    startingCash: 0,
    otherTips: 0,
    creditCardTips: 0,
    qtyItemTypes: {},
    resetReportsMapping: {},
    showCustomerCashSales: false,
    userBySalesRevenue: true,
    salesLabels: null,
    chosenSequence: '',
    chosenTill: '',
    
    deliveryCount: 0,
    deliveryGuestCount: 0,
    deliveryTotal: 0,

    dineInCount: 0,
    dineInGuestCount: 0,
    dineInTotal: 0,

    takeOutCount: 0,
    takeOutGuestCount: 0,
    takeOutTotal: 0,

    chartDataColors: [
        '#d1d1d1',
        '#a156c4',
        '#ebc143',
        '#8097a2',
        '#39c7c1',
        '#000000'
    ],
    dataColorIndex: 5,
    labeledDataColors: {},

    events: {
        'click .quicklink-card-title': 'toggleCard',
        'click .ap-collection-item': 'toggleTillSelection',
        'click .generate-button': 'handleGenerateAction',
        'click #firstSeeMore' : 'showFirstTable',
        'click #secondSeeMore' : 'showSecondTable',
        'click #thirdSeeMore': 'showThirdTable',
        'click #fourthSeeMore': 'showFourthTable',
        'click #fifthSeeMore': 'showFifthTable',
        'click #compSeeMore': 'showCompTable',
        'click #salesHourSeeMore' : 'showSalesHourTable',
        'click #salesByCategorySeeMore' : 'showSalesByCategoryTable',
        'click #salesByUserSeeMore' : 'showSalesByUserTable',
        'click #salesByCustomerSeeMore' : 'showSalesByCustomerTable',
        'change #date-range-preset' : 'changeDateRange',
        'change #till-dropdown' : 'changeDateRange',
        'change #report-type-filter' : 'changeReportFilter',
        'click .choose-date-range-button': 'customDateRange',
        'keyup #reset-report-autocomplete': 'searchResetReportBySearchTerm',
        'click #byHourRevenue': 'showByHourRevenue',
        'click #byHourQuantity': 'showByHourQuantity',
        'click #showCashSales' : 'showCashSales',
        'click #hideCashSales' : 'hideCashSales',
        'click #userByRevenue' : 'showUserByRevenue',
        'click #userByHour' : 'showUserByHour',
        'click #exportToExcel' : 'exportToExcel',
        'click #emailReport' : 'openEmailReportModel',
        'click #sendEmailReport' : 'sendEmailReport'
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;

        this.getCustomers();
        this.getTillsAndRender(this.renderTills);
    },

    render: function () {
        var that = this;
        App.breadCrumbToolTip = "Your main screen to see live sales, run reports, and reset tills";
        App.setBreadcrumbs(this.breadcrumb);
        this.getSalesData();
        $(document).ready(function () {
            $('.tooltipped').tooltip({delay: 0});
            $('select').formSelect();
            $('.dropdown-trigger').dropdown();
            $('.quicklink-card-content').mCustomScrollbar({
                setHeight: 150,
                axis: 'y',
                scrollInertia: 1000,
                autoHideScrollbar: true
            });
            var pickerElement = document.querySelectorAll('.datepicker');
            var instances = M.Datepicker.init(pickerElement, {
                autoClose: true,
                container: 'body'
            });
            that.datepicker = instances;
            
        });
        that.initAutoComplete();
        return this;
    },

    isTabletDevice: function() {
        try {
            var deviceWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
            return deviceWidth < 769;
        } catch (e) {
            return false;
        }
    },

    toggleCard: function (e) {
        var element = $(e.currentTarget);
        $("html, body").animate({ scrollTop: $(document).height() }, "fast");
        
        var siblings = $(element).siblings();
        
        $('.quicklink-card-content, .quicklink-card-footer').not(siblings).hide();
        $(siblings).toggle();
    },

    toggleTillSelection: function (e) {
        var element = $(e.currentTarget);
        var tillHasOpenOrders = $(element).hasClass('ap-collection-item-disabled');
        if (tillHasOpenOrders === false) {
            var previouslySelected = $(element).hasClass('ap-light-blue');
            if ($(element).parent().hasClass('master-z-till-list') === false) {
                $(element).siblings().each(function() {
                    $(this).removeClass('ap-light-blue');
                    $(this).find('.ready, .open-orders, till-users').removeClass('white-text');
                    $(this).attr('data-selected', 'false');
                });
            }
            $(element).toggleClass('ap-light-blue');
            $(element).find('.ready, .open-orders, till-users').toggleClass('white-text');
            
            $(element).attr('data-selected', !previouslySelected ? 'true' : 'false');
            this.toggleButton(element);
        } else {
            M.toast({
                html: '{Literal}You cannot Z-out tills with open orders{/Literal}'
            });
        }
    },

    getCookie: function() {
        var nameEQ = "sessionCookie" + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
    },

    getTillsAndRender: function (callback) {
        var sessionToken = this.getCookie();
        var that = this;
        $.ajax({
            url: '/data/get-tills',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                callback(data.results, that);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({
                        html: '{Literal}There was a problem fetching tills from the server{/Literal}'
                    });
                }
            }
        });
    },

    renderTills: function (tills, that) {
        var noTillsWarning = true;
        for (var i = 0; i < tills.length; i++) {
            if (typeof tills[i].hasOrders !== 'undefined' && tills[i].hasOrders === true) {
                noTillsWarning = false;
                break;
            }
        }
        that.$el.html(that.template({
            tills: tills,
            noTillsWarning: noTillsWarning
        }));

        $('select').formSelect();
        $('.dropdown-trigger').dropdown();
        var pickerElement = document.querySelectorAll('.datepicker');
        var instances = M.Datepicker.init(pickerElement, {
            autoClose: true,
            container: 'body'
        });
    },

    checkAccess: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/check-access',
            data: {
                accessName: (App.IDS_X),
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                that.readAccess = true;
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else if (e.responseJSON.hasAccess == false) {
                    that.readAccess = false;
                }
            }
        });
        $.ajax({
            url: '/data/check-access',
            data: {
                accessName: (App.IDS_Z),
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                that.resetAccess = true;
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else if (e.responseJSON.hasAccess == false) {
                    that.resetAccess = false;
                }
            }
        });
        $.ajax({
            url: '/data/check-access',
            data: {
                accessName: (App.IDS_Z_CURRENT_TILL),
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                that.resetCurrentAccess = true;
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else if (e.responseJSON.hasAccess == false) {
                    that.resetCurrentAccess = false;
                }
            }
        });
    },

    toggleButton: function (el) {
        var dataType = $(el).parent().attr('data-type');
        var elementSelected = $(el).attr('data-selected') === 'true';
        var oneOfSiblingsSelected = false;
        $(el).siblings().each(function() {
            oneOfSiblingsSelected = $(this).attr('data-selected') === 'true';
        });

        if (elementSelected || oneOfSiblingsSelected) {
            this.$el.find('.generate-button[data-type="' + dataType + '"]').removeClass('disabled');    
        } else {
            this.$el.find('.generate-button[data-type="' + dataType + '"]').addClass('disabled');    
        }        
    },

    openReportWindowWithPostRequest: function (winURL, params) {
        var winName='AccoPOS Report';
        var windowoption='resizable=yes,height=768,width=1024,location=0,menubar=0,scrollbars=1';
        var form = document.createElement("form");
        form.setAttribute("method", "post");
        form.setAttribute("action", winURL);
        form.setAttribute("target", winName);  
        for (var i in params) {
            if (params.hasOwnProperty(i)) {
                var input = document.createElement('input');
                input.type = 'text';
                input.name = i;
                input.value = params[i];
                form.appendChild(input);
            }
        }
        document.body.appendChild(form);
        window.open('', winName, windowoption);
        form.target = winName;
        form.submit();
        document.body.removeChild(form);           
    },

    handleGenerateAction: function (e) {
        var sessionToken = this.getCookie();
        var element = $(e.currentTarget);
        var type = $(element).attr('data-type');
        var that = this;
        var selectedTillsElements = this.$el.find('.ap-collection[data-type="' + type + '"]').find('.ap-collection-item[data-selected="true"]');
        var selectedTills = [];
        if (selectedTillsElements.length < 1) {
            return;
        }
        for (var i = 0; i < selectedTillsElements.length; i++) {
            selectedTills.push($(selectedTillsElements[i]).attr('data-id'));
        }
        
        if (type == 'x-out') {
            if (this.readAccess) {
                var params = {
                    selectedTill: selectedTills[0],
                    showGraphs: true,
                    token: sessionToken,
                    accessName: (App.IDS_X)
                };
                this.openReportWindowWithPostRequest('/data/get-x-out-report', params);
            }
            else {
                M.toast({ html: '{Literal}You do not have access to read cash tills{/Literal}' });
            }
        }
        else if (type == 'z-out') {
            if (this.resetCurrentAccess) {
                var tillTotal = this.$el.find('#z-out-total-cash').val();
                try {
                    tillTotal = parseFloat(tillTotal);
                } catch (e) {
                    tillTotal = 0.0;
                }
                
                var params = {
                    selectedTill: selectedTills[0],
                    showGraphs: $('#z-out-show-graphs').is(':checked'),
                    tillTotal: tillTotal,
                    token: sessionToken,
                    accessName: (App.IDS_Z_CURRENT_TILL)
                };
                this.openReportWindowWithPostRequest('/data/get-z-out-report', params);
            }
            else {
                M.toast({ html: '{Literal}You do not have access to reset the current cash tills{/Literal}' });
            }
        }
        else if (type == 'master-z') {
            if (this.resetAccess) {
                var params = {
                    selectedTills: selectedTills.join(','),
                    showGraphs: true,
                    token: sessionToken,
                    accessName: (App.IDS_Z)
                };
                this.openReportWindowWithPostRequest('/data/get-master-z-report', params);
            }
            else {
                M.toast({ html: '{Literal}You do not have access to reset cash tills{/Literal}' });
            }
        }
    },

    renderCharts: function (currency, data) {
        this.checkAccess();
        var shouldRenderCharts = typeof data.totalSales !== 'undefined' && data.totalSales > 0;
        
        if (!shouldRenderCharts) {
            this.$el.find('.no-data-message').show();
        } else {
            this.$el.find('.no-data-message').hide();
        }
        var salesByTime = data.salesByTimeData;

        var transactionByHourData = data.salesByTimeData.transactionByHourData;
        
        var salesByTenderTypeObj = data.salesByTenderType;
        
        var salesByItemTypeObj = data.salesByItemType;
        
        var salesByTimeColumns = (['Sales']).concat(salesByTime.salesData);
        var salesByTimeLabels = salesByTime.salesLabels;

        var noAMPMLabels = salesByTime.noAMPMLabels;

        var transactionByHourColumns = (['Sales']).concat(transactionByHourData);
        
        var salesByItemTypeColumns = ['Sales'];
        var salesByItemTypeLabels = [];
        for (var itemType in salesByItemTypeObj) {
            salesByItemTypeColumns.push(salesByItemTypeObj[itemType]);
            salesByItemTypeLabels.push(itemType);
        }

        var salesByTenderType = [];
        var i = 0;
        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key) && obj[key] > 0) size++;
            }
            return size;
        };
        
        // Get the size of an object
        var size = Object.size(salesByTenderTypeObj);
        if (size > 5) {
            for (var tenderType in salesByTenderTypeObj) {
                if (!isNaN(Math.abs(parseInt(salesByTenderTypeObj[tenderType]))) && Math.abs(parseInt(salesByTenderTypeObj[tenderType])) != 0 && i < 5) {
                    salesByTenderType.push(["{Literal}${/Literal}" + Math.abs(parseInt(salesByTenderTypeObj[tenderType])) + " - " + tenderType, Math.abs(parseInt(salesByTenderTypeObj[tenderType]))]);
                    i++;
                }
            }
        }
        else {
            for (var tenderType in salesByTenderTypeObj) {
                if (!isNaN(Math.abs(parseInt(salesByTenderTypeObj[tenderType]))) && Math.abs(parseInt(salesByTenderTypeObj[tenderType])) != 0) {
                    salesByTenderType.push(["{Literal}${/Literal}" + Math.abs(parseInt(salesByTenderTypeObj[tenderType])) + " - " + tenderType, Math.abs(parseInt(salesByTenderTypeObj[tenderType]))]);
                }
            }
        }
        

        var salesByTimeColumnsEmpty = true;
        for (var i = 1; i < salesByTimeColumns.length; i++) {
            if (salesByTimeColumns[i] > 0) {
                salesByTimeColumnsEmpty = false;
            }
        }

        if (salesByTimeColumnsEmpty) {
            if (!this.chartRendered) {
                var that = this;
                var chart1 = c3.generate({
                    bindto: '#sales-line-chart',
                    size: {
                        height: 150,
                    },
                    legend: {
                        show: false
                    },
                    grid: {
                        y: {
                            show: true
                        }
                    },
                    data: {
                        colors: {
                            Sales: '#000000',
                        },
                        type: 'spline',
                        columns: [ ],
                        empty: {
                            label: {
                                text: "No Data Available"
                            }
                        }
                    },
                    point: {
                        show: false
                    },
                    axis: {
                        x: {
                            show: false,
                            type: 'category',
                            categories: salesByTimeLabels
                        },
                        y: {
                            tick: {
                                count: 5,
                                format: d3.format("$,d")
                            }
                        }
                    }
                });
            }
        }
        else {
            if (!this.chartRendered) {
                var that = this;
                var chart1 = c3.generate({
                    bindto: '#sales-line-chart',
                    size: {
                        height: 150,
                    },
                    legend: {
                        show: false
                    },
                    grid: {
                        y: {
                            show: true
                        }
                    },
                    data: {
                        colors: {
                            Sales: '#000000',
                        },
                        type: 'spline',
                        columns: [ salesByTimeColumns ],
                        empty: {
                            label: {
                                text: "No Data Available"
                            }
                        }
                    },
                    point: {
                        show: false
                    },
                    axis: {
                        x: {
                            show: false,
                            type: 'category',
                            categories: salesByTimeLabels
                        },
                        y: {
                            tick: {
                                count: 5,
                                format: d3.format("$,d")
                            }
                        }
                    }
                });
            }    
        }
        
        if (!this.chartRendered) {
            if (0==0) {
                var screenSize = this.isTabletDevice();
                if (screenSize) {
                    var tenderTypesChart = c3.generate({
                        bindto: '#sales-donut-chart',
                        legend: {
                            show: false
                        },
                        size: {
                            height: 150
                        },
                        data: {
                            columns: salesByTenderType,
                            type: 'donut',
                            empty: {
                                label: {
                                    text: "No Data Available"
                                }
                            }
                        },
                        color: {
                            pattern: ['#24c1e6', '#3754a0', '#11b5ae', '#5e8acc', '#017f9d']
                        },
                        donut: {
                            title: ""
                        }
                    });
                }
                else {
                    var tenderTypesChart = c3.generate({
                        bindto: '#sales-donut-chart',
                        legend: {
                            position: 'right'
                        },
                        size: {
                            height: 150
                        },
                        data: {
                            columns: salesByTenderType,
                            type: 'donut',
                            empty: {
                                label: {
                                    text: "No Data Available"
                                }
                            }
                        },
                        color: {
                            pattern: ['#24c1e6', '#3754a0', '#11b5ae', '#5e8acc', '#017f9d']
                        },
                        donut: {
                            title: ""
                        }
                    });
                }
                

                this.dataColorIndex = 0;
                this.labeledDataColors = {};
                if (salesByTimeColumnsEmpty) {
                    var chart3 = c3.generate({
                        bindto: '#sales-bar-chart',
                        size: {
                            height: 150
                        },
                        grid: {
                            y: {
                                show: true
                            }
                        },
                        data: {
                            color: function (color, d) { return '#3754a0' },
                            columns: [],
                            type: 'bar',
                            empty: {
                                label: {
                                    text: "No Data Available"
                                }
                            }
                        },
                        legend: {
                            show: false
                        },
                        /*tooltip: {
                            format: {
                                title: function (d) { return 'Data ' + d; },
                                value: function (value, ratio, id) {
                                    
                                    return (value);
                                }
                    //            value: d3.format(',') // apply this format to both y and y2
                            }
                        },*/
                        axis: {
                            x: {
                                show: false,
                                type: 'category',
                                categories: salesByTimeLabels
                            },
                            y: {
                                tick: {
                                    format: d3.format("d"),
                                    count: 5
                                }
                            }
                        },
                        bar: {
                            width: {
                                ratio: 0.75
                            }
                        }
                    });
                }
                else {
                    var chart3 = c3.generate({
                        bindto: '#sales-bar-chart',
                        size: {
                            height: 150
                        },
                        grid: {
                            y: {
                                show: true
                            }
                        },
                        data: {
                            color: function (color, d) { return '#3754a0' },
                            columns: [salesByTimeColumns],
                            type: 'bar',
                            empty: {
                                label: {
                                    text: "No Data Available"
                                }
                            }
                        },
                        legend: {
                            show: false
                        },
                        /*tooltip: {
                            format: {
                                title: function (d) { return 'Data ' + d; },
                                value: function (value, ratio, id) {
                                    
                                    return (value);
                                }
                    //            value: d3.format(',') // apply this format to both y and y2
                            }
                        },*/
                        axis: {
                            x: {
                                show: false,
                                type: 'category',
                                categories: salesByTimeLabels
                            },
                            y: {
                                tick: {
                                    format: d3.format("d"),
                                    count: 5
                                }
                            }
                        },
                        bar: {
                            width: {
                                ratio: 0.75
                            }
                        }
                    }); 
                }

                if (App.serverInfo.isFoodService) {
                    var tipsByType = [];
                    var tipsEmpty = false
                    if (this.otherTips == undefined && this.creditCardTips == undefined && data.zOutSummary.autoGratuity == undefined) {
                        tipsEmpty = true;
                    }
                    else {
                        tipsByType[0] = ['Other Tips', this.otherTips];
                        tipsByType[1] = ['Credit Card Tips', this.creditCardTips];
                        tipsByType[2] = ['Auto Gratuity', data.zOutSummary.autoGratuity];
                    }
                    
                    if (tipsEmpty) {
                        var tenderTypesChart = c3.generate({
                            bindto: '#tips-bar-graph',
                            legend: {
                                position: 'right'
                            },
                            size: {
                                height: 150
                            },
                            data: {
                                colors: {
                                    'Other Tips': '#3754a0',
                                    'Credit Card Tips': '#24c1e6',
                                    'Auto Gratuity': '#11b5ae',
                                },
                                columns: [],
                                type: 'pie',
                                empty: {
                                    label: {
                                        text: "No Data Available"
                                    }
                                }
                            },
                            donut: {
                                title: ""
                            }
                        });
                    }
                    else {
                        var tenderTypesChart = c3.generate({
                            bindto: '#tips-bar-graph',
                            legend: {
                                position: 'right'
                            },
                            size: {
                                height: 150
                            },
                            data: {
                                colors: {
                                    'Other Tips': '#3754a0',
                                    'Credit Card Tips': '#24c1e6',
                                    'Auto Gratuity': '#11b5ae',
                                },
                                columns: tipsByType,
                                type: 'pie',
                                empty: {
                                    label: {
                                        text: "No Data Available"
                                    }
                                }
                            },
                            donut: {
                                title: ""
                            }
                        });
                    }
                   

                    var test = [];
                    test.push('Sales');
                    test.push(parseInt(data.dineInTotal.toFixed(2)));
                    test.push(parseInt(data.takeOutTotal.toFixed(2)));
                    test.push(parseInt(data.deliveryTotal.toFixed(2)));

                    var test1 = [];
                    test1[0] = ['Dine-In', parseInt(data.dineInTotal.toFixed(2))];
                    test1[1] = ['Take-Out', parseInt(data.takeOutTotal.toFixed(2))];
                    test1[2] = ['Delivery', parseInt(data.deliveryTotal.toFixed(2))];

                    var diningEmpty = false;
                    if (data.dineInTotal == 0 && data.takeOutTotal == 0 && data.deliveryTotal == 0) {
                        var tenderTypesChart = c3.generate({
                            bindto: '#dining-bar-graph',
                            legend: {
                                hide: true
                            },
                            size: {
                                height: 150
                            },
                           
                            data: {
                                columns: [], 
                                labels: {
                                    show: true,
                                    format: {
                                        Sales: d3.format('$'),
                                    }  
                                },
                                type: 'bar',
                                empty: {
                                    label: {
                                        text: "No Data Available"
                                    }
                                }
                            },
                            color: {
                                pattern: ['#3754a0', '#11b5ae', '#24c1e6']
                            },
                            axis: {
                                rotated: true,
                                x: {
                                    type: 'category',
                                    categories: ['Dine-In', 'Take-Out', 'Delivery']
                                },
                                y: {
                                    show: false,
                                }
                            },
                        });
                    }
                    else {
                        var tenderTypesChart = c3.generate({
                            bindto: '#dining-bar-graph',
                            legend: {
                                hide: true
                            },
                            size: {
                                height: 150
                            },
                           
                            data: {
                                columns: [test], 
                                labels: {
                                    show: true,
                                    format: {
                                        Sales: d3.format('$'),
                                    }  
                                },
                                type: 'bar',
                                empty: {
                                    label: {
                                        text: "No Data Available"
                                    }
                                }
                            },
                            color: {
                                pattern: ['#3754a0', '#11b5ae', '#24c1e6']
                            },
                            axis: {
                                rotated: true,
                                x: {
                                    type: 'category',
                                    categories: ['Dine-In', 'Take-Out', 'Delivery']
                                },
                                y: {
                                    show: false,
                                }
                            },
                        });
                    }
                    
                    
                }
            }
        }
        if (data.zOutSummary != '') {
            this.appendToTables();
        }
       
    },

    getSalesData: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-sales-data',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.zOutSummary = data.zOutSummary;
                that.salesByItemType = data.salesByItemType;
                that.noSalesCount = data.noSaleCount;
                that.creditCardCount = data.creditCardCount;
                that.debitCardCount = data.debitCardCount;
                that.startingCash = data.startingCash;
                that.otherTips = data.otherTips;
                that.creditCardTips = data.creditCardTips;
                that.qtyItemTypes = data.qtyItemTypes;

                var insertTotalTransactions = document.getElementById('transactionCount');
                if (data.totalTransactions == null) {
                    insertTotalTransactions.value = 0;
                    that.totalTransactions = 0;
                }
                else {
                    insertTotalTransactions.value = data.totalTransactions;
                    that.totalTransactions = data.totalTransactions;
                }

                that.deliveryCount = data.deliveryCount;
                that.deliveryGuestCount = data.deliveryGuestCount;
                that.deliveryTotal = data.deliveryTotal;

                that.dineInCount = data.dineInCount;
                that.dineInGuestCount = data.dineInGuestCount;
                that.dineInTotal = data.dineInTotal;

                that.takeOutCount = data.takeOutCount;
                that.takeOutGuestCount = data.takeOutGuestCount;
                that.takeOutTotal = data.takeOutTotal;

                that.totalSales =  Math.round(data.totalSales * 100) / 100;
                that.largestTransaction = Math.round(data.largestTransaction * 100) / 100;
                that.totalItemsSold = data.totalItemsSold;

                that.cashTransactions = data.cashCount;

                var test = "$";
                document.getElementById('totalSales').value = test + that.totalSales.toFixed(2);
                if (data.zOutSummary != '') {
                   document.getElementById('totalTender').value = test + data.zOutSummary.tenderingTotal.toFixed(2);
                }
                

                var currency = 'USD';
                that.$el.find('.preloader-col').hide();
                that.$el.find('.chart-content').show();
                that.renderCharts(currency, data);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    that.$el.find('.preloader-col').hide();
                    that.$el.find('.chart-content').show();
                    M.toast({
                        html: '{Literal}There was a problem fetching tills from the server{/Literal}'
                    });
                }
            }
        });
        this.$el.find('#loading').hide();
    }, 

    getCustomers: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-pos-users',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                for (var i=0; i < data.results.length; i++) {
                    if (data.results[i].openOrderCount != 'undefined' && data.results[i].openOrderCount > 0) {
                        that.openOrders += (data.results[i].openOrderCount)
                    }
                }
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem getting customers{/Literal}.' });
                }
            }
        });
    },

    appendToTables: function () {
        var zOutSummary = this.zOutSummary;

        $("#discountTable tbody").empty();
        $('#discountTable tbody').append('<tr><td>Comp Total</td><td style="color: black; float: right; direction: RTL;">{Literal}${/Literal}' +  zOutSummary.compTotal.toFixed(2) + '</td></tr>');
        $('#discountTable tbody').append('<tr><td>Sales Discount Total</td><td style="color: black; float: right; direction: RTL;">{Literal}${/Literal}' +  zOutSummary.salesDiscountTotal.toFixed(2) + '</td></tr>');
        $('#discountTable tbody').append('<tr><td>Price Change Total</td><td style="color: black; float: right; direction: RTL;">{Literal}${/Literal}' +  zOutSummary.priceChangeTotal.toFixed(2) + '</td></tr>');
        var disCounts = (zOutSummary.compTotal + zOutSummary.salesDiscountTotal + zOutSummary.priceChangeTotal);
        $('#discountTable tbody').append('<tr><td>Discounts Total</td><td style="color: black; float: right; direction: RTL;">{Literal}${/Literal}' +  disCounts.toFixed(2) + '</td></tr>');

        $("#secondGraphTable tbody").empty();
        $('#secondGraphTable tbody').append('<tr><td>No Sales Count</td><td style="color: black; float: right; direction: RTL;">' +  this.noSalesCount + '</td></tr>');
        $('#secondGraphTable tbody').append('<tr><td>Credit Transactions</td><td style="color: black; float: right; direction: RTL;">' +  this.creditCardCount + '</td></tr>');
        $('#secondGraphTable tbody').append('<tr><td>Debit Transactions</td><td style="color: black; float: right; direction: RTL;">' +  this.debitCardCount + '</td></tr>');
        $('#secondGraphTable tbody').append('<tr><td>Cash Transactions</td><td style="color: black; float: right; direction: RTL;">' +  this.cashTransactions + '</td></tr>');
        
        $("#thirdGraphTable tbody").empty();
        $('#thirdGraphTable tbody').append('<tr><td>Starting Cash</td><td style="color: black; float: right; direction: RTL;">{Literal}${/Literal}' +  this.startingCash + '</td></tr>');
        $('#thirdGraphTable tbody').append('<tr><td>Total Cash</td><td style="color: black; float: right; direction: RTL;">{Literal}${/Literal}' +  (this.startingCash + zOutSummary.netCash - zOutSummary.payoutsTotal).toFixed(2) + '</td></tr>');
        $('#thirdGraphTable tbody').append('<tr><td><br></td></tr>');
        $('#thirdGraphTable tbody').append('<tr><td>Payments On Account</td><td style="color: black; float: right; direction: RTL;">{Literal}${/Literal}' +  zOutSummary.customerPayments.toFixed(2) + '</td></tr>');
        $('#thirdGraphTable tbody').append('<tr><td>Cash Paid Out</td><td style="color: black; float: right; direction: RTL;">{Literal}${/Literal}' + zOutSummary.payoutsTotal.toFixed(2) + '</td></tr>');
        $('#thirdGraphTable tbody').append('<tr><td>Net Cash</td><td style="color: black; float: right; direction: RTL;">{Literal}${/Literal}' + zOutSummary.netCash.toFixed(2) + '</td></tr>');

        $("#taxTable tbody").empty();
        $('#taxTable tbody').append('<tr><td>Taxable</td><td style="color: black; float: right; direction: RTL;">{Literal}${/Literal}' + zOutSummary.reportTaxable.toFixed(2) + '</td></tr>');
        $('#taxTable tbody').append('<tr><td>Nontaxable</td><td style="color: black; float: right; direction: RTL;">{Literal}${/Literal}' + zOutSummary.reportNontaxable.toFixed(2) + '</td></tr>');
        $('#taxTable tbody').append('<tr><td>Tax Total</td><td style="color: black; float: right; direction: RTL;">{Literal}${/Literal}' + zOutSummary.taxTotal.toFixed(2) + '</td></tr>');
        $('#taxTable tbody').append('<tr><td><br></td></tr>');
        $('#taxTable tbody').append('<tr><td>Auto Gratuity Total</td><td style="color: black; float: right; direction: RTL;">{Literal}${/Literal}' +  zOutSummary.autoGratuity.toFixed(2) + '</td></tr>');
        $('#taxTable tbody').append('<tr><td>Customer Payment Total</td><td style="color: black; float: right; direction: RTL;">{Literal}${/Literal}' + zOutSummary.customerPayments.toFixed(2) + '</td></tr>');
        $('#taxTable tbody').append('<tr><td><br></td></tr>');
        $('#taxTable tbody').append('<tr><td>Total</td><td style="color: black; float: right; direction: RTL;">{Literal}${/Literal}' + zOutSummary.tenderingTotal.toFixed(2) + '</td></tr>');

        if (App.serverInfo.isFoodService) {
            $("#fourthGraphTable tbody").empty();
            $('#fourthGraphTable tbody').append('<tr><td>Credit Card Tips</td><td style="color: black; float: right; direction: RTL;">{Literal}${/Literal}' + this.creditCardTips.toFixed(2) + '</td></tr>');
            $('#fourthGraphTable tbody').append('<tr><td>AutoGratuity</td><td style="color: black; float: right; direction: RTL;">{Literal}${/Literal}' + zOutSummary.autoGratuity.toFixed(2) + '</td></tr>');
            $('#fourthGraphTable tbody').append('<tr><td>Other Tips</td><td style="color: black; float: right; direction: RTL;">{Literal}${/Literal}' + this.otherTips.toFixed(2) + '</td></tr>');
            $('#fourthGraphTable tbody').append('<tr><td>Total Tips</td><td style="color: black; float: right; direction: RTL;">{Literal}${/Literal}' + zOutSummary.tipsTotal.toFixed(2) + '</td></tr>');

            
            var diningTotal = this.deliveryTotal + this.dineInTotal + this.takeOutTotal;
            var diningChecks = this.deliveryCount  + this.dineInCount + this.takeOutCount;
            var diningGuests = this.deliveryGuestCount + this.dineInGuestCount + this.takeOutGuestCount;

            if (diningTotal != 0) {
                $("#fifthGraphTable tbody").empty();
                var dineInTotal = (((this.dineInTotal / diningTotal) * 100).toFixed(0)) + "%"
                $('#fifthGraphTable tbody').append('<tr><td>{Literal}Dine-In % of Total{/Literal}</td><td style="color: black; float: right; direction: RTL;">' + dineInTotal + '</td></tr>');

                if (diningChecks != 0) {
                    var dineInChecks = (((this.dineInCount / diningChecks) * 100).toFixed(0)) + "%";
                    $('#fifthGraphTable tbody').append('<tr><td>{Literal}Dine-In % of Checks{/Literal}</td><td style="color: black; float: right; direction: RTL;">' + dineInChecks + '</td></tr>');
                }

                if (diningGuests != 0) {
                    var dineInGuests = (((this.dineInGuestCount / diningGuests) * 100).toFixed(0)) + "%";
                    $('#fifthGraphTable tbody').append('<tr><td>{Literal}Dine-In % of Guests{/Literal}</td><td style="color: black; float: right; direction: RTL;">' + dineInGuests + '</td></tr>');
                }

                $('#fifthGraphTable tbody').append('<tr><td><br></td></tr>');

                var takeOutTotal = (((this.takeOutTotal / diningTotal) * 100).toFixed(0)) + "%"
                $('#fifthGraphTable tbody').append('<tr><td>{Literal}Take-Out % of Total{/Literal}</td><td style="color: black; float: right; direction: RTL;">' + takeOutTotal + '</td></tr>');

                if (diningChecks != 0) {
                    var takeOutChecks = (((this.takeOutCount / diningChecks) * 100).toFixed(0)) + "%";
                    $('#fifthGraphTable tbody').append('<tr><td>{Literal}Take-Out % of Checks{/Literal}</td><td style="color: black; float: right; direction: RTL;">' + takeOutChecks + '</td></tr>');
                }

                if (diningGuests != 0) {
                    var takeOutGuests = (((this.takeOutGuestCount / diningGuests) * 100).toFixed(0)) + "%";
                    $('#fifthGraphTable tbody').append('<tr><td>{Literal}Take-Out % of Guests{/Literal}</td><td style="color: black; float: right; direction: RTL;">' + takeOutGuests + '</td></tr>');
                }

                $('#fifthGraphTable tbody').append('<tr><td><br></td></tr>');

                var deliveryTotal = (((this.deliveryTotal / diningTotal) * 100).toFixed(0)) + "%";
                $('#fifthGraphTable tbody').append('<tr><td>{Literal}Delivery % of Total{/Literal}</td><td style="color: black; float: right; direction: RTL;">' + deliveryTotal + '</td></tr>');

                if (diningChecks != 0) {
                    var deliveryChecks = (((this.deliveryCount / diningChecks) * 100).toFixed(0)) + "%";
                    $('#fifthGraphTable tbody').append('<tr><td>{Literal}Delivery % of Checks{/Literal}</td><td style="color: black; float: right; direction: RTL;">' + deliveryChecks + '</td></tr>');
                }

                if (diningGuests != 0) {
                    var deliveryGuests = (((this.deliveryGuestCount / diningGuests) * 100).toFixed(0)) + "%";
                    $('#fifthGraphTable tbody').append('<tr><td>{Literal}Delivery % of Guests{/Literal}</td><td style="color: black; float: right; direction: RTL;">' + deliveryGuests + '</td></tr>');
                }
            }
        }

        const keys = Object.keys(this.salesByItemType)
        const values = Object.values(this.salesByItemType)

        const keys1 = Object.keys(this.qtyItemTypes)
        const values1 = Object.values(this.qtyItemTypes)
        
        $("#itemTypeTable tbody").empty();

        for (var i = 0; i < keys.length; i++) 
        {
           
            $('#itemTypeTable tbody').append('<tr><td>' + keys[i] + '</td> <td style="padding-left: 5px !important;">' + values1[i] + '</td> <td style="color: black; float: right; direction: RTL;">{Literal}${/Literal}' + values[i].toFixed(2) + '</td></tr>');
        }

        $('select').formSelect();

        var pickerElement = document.querySelectorAll('.datepicker');
        var instances = M.Datepicker.init(pickerElement, {
            autoClose: true,
            container: 'body'
        });
        this.datepicker = instances;
    },

    showFirstTable: function () {
        if ($('#itemTypeTable').is(":visible")) {
            $('#itemTypeTable').hide();
            $('#discountTable').hide();
            $('#itemTypeTableHr').hide();
        }
        else {
            $('#itemTypeTable').show();
            $('#discountTable').show();
            $('#itemTypeTableHr').show();
            
        }
    },
    
    showSecondTable: function () {
        if ($('#secondGraphTable').is(":visible")) {
            $('#secondGraphTable').hide();
        }
        else {
            $('#secondGraphTable').show();
        }
    },

    showThirdTable: function () {
        if ($('#thirdGraphTable').is(":visible")) {
            $('#thirdGraphTable').hide();
            $('#taxTable').hide();
            $('#taxTableHr').hide();
        }
        else {
            $('#thirdGraphTable').show();
            $('#taxTable').show();
            $('#taxTableHr').show();
        }
    },

    showFourthTable: function () {
        if ($('#fourthGraphTable').is(":visible")) {
            $('#fourthGraphTable').hide();
        }
        else {
            $('#fourthGraphTable').show();
        }
    },

    showFifthTable: function () {
        if ($('#fifthGraphTable').is(":visible")) {
            $('#fifthGraphTable').hide();
        }
        else {
            $('#fifthGraphTable').show();
        }
    },

    showCompTable: function() {
        if ($('#compReasonTable').is(":visible")) {
            $('#compReasonTable').hide();
        }
        else {
            $('#compReasonTable').show();
        }
    },

    showSalesHourTable: function() {
        if ($('#salesHourTable').is(":visible")) {
            $('#salesHourTable').hide();
        }
        else {
            $('#salesHourTable').show();
        }
    },

    showSalesByCategoryTable: function() {
        if ($('#salesByCategoryTable').is(":visible")) {
            $('#salesByCategoryTable').hide();
        }
        else {
            $('#salesByCategoryTable').show();
        }
    },

    showSalesByUserTable: function() {
        if ($('#salesByUserTable').is(":visible")) {
            $('#salesByUserTable').hide();
        }
        else {
            $('#salesByUserTable').show();
        }
    },

    showSalesByCustomerTable: function() {
        if ($('#salesByCustomerTable').is(":visible")) {
            $('#salesByCustomerTable').hide();
        }
        else {
            $('#salesByCustomerTable').show();
        }
    },

    changeDateRange: function () {
        var that = this;
        var sessionToken = this.getCookie();
        var tillVal = this.$el.find('#till-dropdown').val();
        var tillName = this.$el.find('#till-dropdown option:selected').text();
        var dateRangeVal = this.$el.find('#date-range-preset').val();

        var dateRange = this.getDateRange();

        

        if (dateRange != "custom") {
            $('#dashboardHeader').hide();
            $('#byHourHeader').hide();
            $('#byUserHeader').hide();
            $('#byCustomerHeader').hide();
            $('#byCategoryHeader').hide();
            $('#resetReportHeader').hide();
            var reportType = this.$el.find('#report-type-filter').val();
            if (reportType == "zOutSummary") {
                $('#dashboardHeader').show();
                if (tillVal == "all") {
                    $.ajax({
                        url: '/data/get-date-range-sales-data',
                        data: {
                            token: sessionToken,
                            fromDate: dateRange.fromDate,
                            thruDate: dateRange.thruDate
                        },
                        dataType: 'json',
                        type: 'POST',
                        success: function (data) {
                            var dateRangeFormModal = that.$el.find('#date-range-form-modal').modal();
                            dateRangeFormModal.modal('close');
        
                            that.zOutSummary = data.zOutSummary;
        
                            that.salesByItemType = data.salesByItemType;
                            that.noSalesCount = data.noSaleCount;
                            that.creditCardCount = data.creditCardCount;
                            that.debitCardCount = data.debitCardCount;
                            that.startingCash = data.startingCash;
                            that.otherTips = data.otherTips;
                            that.creditCardTips = data.creditCardTips;
                            that.qtyItemTypes = data.qtyItemTypes;
            
                            var insertTotalTransactions = document.getElementById('transactionCount');
                            if (data.totalTransactions == null) {
                                insertTotalTransactions.value = 0;
                                that.totalTransactions = 0;
                            }
                            else {
                                insertTotalTransactions.value = data.totalTransactions;
                                that.totalTransactions = data.totalTransactions;
                            }
            
                            that.deliveryCount = data.deliveryCount;
                            that.deliveryGuestCount = data.deliveryGuestCount;
                            that.deliveryTotal = data.deliveryTotal;
            
                            that.dineInCount = data.dineInCount;
                            that.dineInGuestCount = data.dineInGuestCount;
                            that.dineInTotal = data.dineInTotal;
            
                            that.takeOutCount = data.takeOutCount;
                            that.takeOutGuestCount = data.takeOutGuestCount;
                            that.takeOutTotal = data.takeOutTotal;
            
                            that.totalSales =  Math.round(data.totalSales * 100) / 100;
                            that.largestTransaction = Math.round(data.largestTransaction * 100) / 100;
                            that.totalItemsSold = data.totalItemsSold;
                            that.cashTransactions = data.cashCount;
                            var test = "$";
                            document.getElementById('totalSales').value = test + that.totalSales.toFixed(2);
                            if (data.zOutSummary != '') {
                               document.getElementById('totalTender').value = test + data.zOutSummary.tenderingTotal.toFixed(2);
                            }
                            
                            
                            
                            
                            var currency = 'USD';
                            that.$el.find('.preloader-col').hide();
                            that.$el.find('.chart-content').show();
                            that.renderCharts(currency, data);
                        },
                        error: function (e) {
                            if (e.status == 523) {
                                window.location.href = "#/log-in";
                                location.reload();
                            }
                            else {
                                that.$el.find('.preloader-col').hide();
                                that.$el.find('.chart-content').show();
                                M.toast({
                                    html: '{Literal}There was a problem fetching tills from the server{/Literal}'
                                });
                            }
                        }
                    }); 
                }
                else {
                    this.getSalesDataDateRangeFromTill(dateRange.fromDate, dateRange.thruDate, tillName);
                }
            }
            else if (reportType == "byHour") {
                $('#byHourHeader').show();
                this.getSalesByHourData(tillName, dateRange.fromDate, dateRange.thruDate);
            }
            else if (reportType == "byUser") {
                $('#byUserHeader').show();
                this.getSalesByUserData(tillName, dateRange.fromDate, dateRange.thruDate);
            }
            else if (reportType == "customerSummary") {
                $('#byCustomerHeader').show();
                this.getSalesByCustomerData(tillName, dateRange.fromDate, dateRange.thruDate);
            }
            else if (reportType == "itemCategory") {
                $('#byCategoryHeader').show();
                this.getSalesDataByCategory(tillName, dateRange.fromDate, dateRange.thruDate);
            }
        }
    },

    customDateRange: function () {
        var that = this;
        var sessionToken = this.getCookie();
        var fromDate = this.$el.find('#fromDate').val();
        var thruDate = this.$el.find('#thruDate').val();

        var tillVal = this.$el.find('#till-dropdown').val();
        var tillName = this.$el.find('#till-dropdown option:selected').text();

        var reportType = this.$el.find('#report-type-filter').val();

        if (fromDate != '' && thruDate != '') {
            var d = new Date(fromDate),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
        
            fromDate = [year, month, day].join('-');

            var d = new Date(thruDate),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
        
            thruDate = [year, month, day].join('-');

            M.toast({ html: '{Literal}Fetching Data From {/Literal}' + fromDate + ' {Literal}to{/Literal} ' + thruDate });

            fromDate = fromDate + ' 00:00:01.0';
            thruDate = thruDate + ' 23:59:59.0';

            $('#dashboardHeader').hide();
            $('#byHourHeader').hide();
            $('#byUserHeader').hide();
            $('#byCustomerHeader').hide();
            $('#byCategoryHeader').hide();
            $('#resetReportHeader').hide();

            if (reportType == "byHour") {
                $('#byHourHeader').show();
                this.getSalesByHourData(tillName,fromDate, thruDate);
            }
            else if (reportType == "byUser") {
                $('#byUserHeader').show();
                this.getSalesByUserData(tillName, fromDate, thruDate);
            }
            else if (reportType == "customerSummary") {
                $('#byCustomerHeader').show();
                this.getSalesByCustomerData(tillName, fromDate, thruDate);
            }
            else if (reportType == "itemCategory") {
                $('#byCategoryHeader').show();
                this.getSalesDataByCategory(tillName, fromDate, thruDate);
            }
            else if (reportType == "zOutSummary") {
                $('#dashboardHeader').show();
                if (tillVal == "all") {
                    $.ajax({
                        url: '/data/get-date-range-sales-data',
                        data: {
                            token: sessionToken,
                            fromDate: fromDate,
                            thruDate: thruDate
                        },
                        dataType: 'json',
                        type: 'POST',
                        success: function (data) {
                            that.zOutSummary = data.zOutSummary;
        
                            that.salesByItemType = data.salesByItemType;
                            that.noSalesCount = data.noSaleCount;
                            that.creditCardCount = data.creditCardCount;
                            that.debitCardCount = data.debitCardCount;
                            that.startingCash = data.startingCash;
                            that.otherTips = data.otherTips;
                            that.creditCardTips = data.creditCardTips;
                            that.qtyItemTypes = data.qtyItemTypes;
            
                            var insertTotalTransactions = document.getElementById('transactionCount');
                            if (data.totalTransactions == null) {
                                insertTotalTransactions.value = 0;
                                that.totalTransactions = 0;
                            }
                            else {
                                insertTotalTransactions.value = data.totalTransactions;
                                that.totalTransactions = data.totalTransactions;
                            }
            
                            that.deliveryCount = data.deliveryCount;
                            that.deliveryGuestCount = data.deliveryGuestCount;
                            that.deliveryTotal = data.deliveryTotal;
            
                            that.dineInCount = data.dineInCount;
                            that.dineInGuestCount = data.dineInGuestCount;
                            that.dineInTotal = data.dineInTotal;
            
                            that.takeOutCount = data.takeOutCount;
                            that.takeOutGuestCount = data.takeOutGuestCount;
                            that.takeOutTotal = data.takeOutTotal;
            
                            that.totalSales =  Math.round(data.totalSales * 100) / 100;
                            that.largestTransaction = Math.round(data.largestTransaction * 100) / 100;
                            that.totalItemsSold = data.totalItemsSold;
                            that.cashTransactions = data.cashCount;
            
                            var test = "$";
                            document.getElementById('totalSales').value = test + that.totalSales.toFixed(2);
                            if (data.zOutSummary != '') {
                               document.getElementById('totalTender').value = test + data.zOutSummary.tenderingTotal.toFixed(2);
                            }
                            
                            
                            
                            var currency = 'USD';
                            that.$el.find('.preloader-col').hide();
                            that.$el.find('.chart-content').show();
                            that.renderCharts(currency, data);
                        },
                        error: function (e) {
                            if (e.status == 523) {
                                window.location.href = "#/log-in";
                                location.reload();
                            }
                            else {
                                that.$el.find('.preloader-col').hide();
                                that.$el.find('.chart-content').show();
                                M.toast({
                                    html: '{Literal}There was a problem fetching tills from the server{/Literal}'
                                });
                            }
                        }
                    }); 
                }
                else {
                    this.getSalesDataDateRangeFromTill(fromDate, thruDate, tillName);
                }
            }
        }
        else {
            html: '{Literal}Both options must be defined{/Literal}'
        }

        var dateRangeFormModal = that.$el.find('#date-range-form-modal').modal();
        dateRangeFormModal.modal('close');
    },

    getSalesDataDateRangeFromTill: function (fromDate, thruDate, tillName) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-date-range-sales-data-by-till',
            data: {
                token: sessionToken,
                fromDate: fromDate,
                thruDate: thruDate,
                tillName: tillName
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var dateRangeFormModal = that.$el.find('#date-range-form-modal').modal();
                dateRangeFormModal.modal('close');

                that.zOutSummary = data.zOutSummary;

                that.salesByItemType = data.salesByItemType;
                that.noSalesCount = data.noSaleCount;
                that.creditCardCount = data.creditCardCount;
                that.debitCardCount = data.debitCardCount;
                that.startingCash = data.startingCash;
                that.otherTips = data.otherTips;
                that.creditCardTips = data.creditCardTips;
                that.qtyItemTypes = data.qtyItemTypes;

                var insertTotalTransactions = document.getElementById('transactionCount');
                if (data.totalTransactions == null) {
                    insertTotalTransactions.value = 0;
                    that.totalTransactions = 0;
                }
                else {
                    insertTotalTransactions.value = data.totalTransactions;
                    that.totalTransactions = data.totalTransactions;
                }

                that.deliveryCount = data.deliveryCount;
                that.deliveryGuestCount = data.deliveryGuestCount;
                that.deliveryTotal = data.deliveryTotal;

                that.dineInCount = data.dineInCount;
                that.dineInGuestCount = data.dineInGuestCount;
                that.dineInTotal = data.dineInTotal;

                that.takeOutCount = data.takeOutCount;
                that.takeOutGuestCount = data.takeOutGuestCount;
                that.takeOutTotal = data.takeOutTotal;

                that.totalSales =  Math.round(data.totalSales * 100) / 100;
                that.largestTransaction = Math.round(data.largestTransaction * 100) / 100;
                that.totalItemsSold = data.totalItemsSold;
                that.cashTransactions = data.cashCount;

                var test = "$";
                document.getElementById('totalSales').value = test + that.totalSales.toFixed(2);
                if (data.zOutSummary != '') {
                   document.getElementById('totalTender').value = test + data.zOutSummary.tenderingTotal.toFixed(2);
                }
                
                
                
                var currency = 'USD';
                that.$el.find('.preloader-col').hide();
                that.$el.find('.chart-content').show();
                that.renderCharts(currency, data);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    that.$el.find('.preloader-col').hide();
                    that.$el.find('.chart-content').show();
                    M.toast({
                        html: '{Literal}There was a problem fetching tills from the server{/Literal}'
                    });
                }
            }
        });
    },

    changeReportFilter: function() {
        $('#sequenceSearch').hide();
        $('#dateRangeSelector').show();
        $('#tillSelector').show();
        var that = this;
        var sessionToken = this.getCookie();
        var reportType = this.$el.find('#report-type-filter').val();
        var tillVal = this.$el.find('#till-dropdown').val();
        if (tillVal == "all") {
            tillVal = "All Tills"
        }

        var tillName = this.$el.find('#till-dropdown option:selected').text();
    
        if (reportType != "resetReport") {
            var dateRange = this.getDateRange();
        }
       

        $('#dashboardHeader').hide();
        $('#byHourHeader').hide();
        $('#byUserHeader').hide();
        $('#byCustomerHeader').hide();
        $('#byCategoryHeader').hide();
        $('#resetReportHeader').hide();

        if (reportType == "zOutSummary") {
            $('#compReasonGraph').hide();
            $('#salesByHourGraph').hide();
            $('#initialGraphs').show();
            $('#salesByCategory').hide();
            $('#salesByCustomer').hide();
            $('#salesByUser').hide();
            $('#dashboardHeader').show();
    
            if (tillVal == "All Tills") {
                $.ajax({
                    url: '/data/get-date-range-sales-data',
                    data: {
                        token: sessionToken,
                        fromDate: dateRange.fromDate,
                        thruDate: dateRange.thruDate
                    },
                    dataType: 'json',
                    type: 'POST',
                    success: function (data) {
                        var dateRangeFormModal = that.$el.find('#date-range-form-modal').modal();
                        dateRangeFormModal.modal('close');
    
                        that.zOutSummary = data.zOutSummary;
    
                        that.salesByItemType = data.salesByItemType;
                        that.noSalesCount = data.noSaleCount;
                        that.creditCardCount = data.creditCardCount;
                        that.debitCardCount = data.debitCardCount;
                        that.startingCash = data.startingCash;
                        that.otherTips = data.otherTips;
                        that.creditCardTips = data.creditCardTips;
                        that.qtyItemTypes = data.qtyItemTypes;
        
                        var insertTotalTransactions = document.getElementById('transactionCount');
                        if (data.totalTransactions == null) {
                            insertTotalTransactions.value = 0;
                            that.totalTransactions = 0;
                        }
                        else {
                            insertTotalTransactions.value = data.totalTransactions;
                            that.totalTransactions = data.totalTransactions;
                        }
        
                        that.deliveryCount = data.deliveryCount;
                        that.deliveryGuestCount = data.deliveryGuestCount;
                        that.deliveryTotal = data.deliveryTotal;
        
                        that.dineInCount = data.dineInCount;
                        that.dineInGuestCount = data.dineInGuestCount;
                        that.dineInTotal = data.dineInTotal;
        
                        that.takeOutCount = data.takeOutCount;
                        that.takeOutGuestCount = data.takeOutGuestCount;
                        that.takeOutTotal = data.takeOutTotal;
        
                        that.totalSales =  Math.round(data.totalSales * 100) / 100;
                        that.largestTransaction = Math.round(data.largestTransaction * 100) / 100;
                        that.totalItemsSold = data.totalItemsSold;
                        that.cashTransactions = data.cashCount;
        
                        var test = "$";
                        document.getElementById('totalSales').value = test + that.totalSales.toFixed(2);
                        if (data.zOutSummary != '') {
                           document.getElementById('totalTender').value = test + data.zOutSummary.tenderingTotal.toFixed(2);
                        }
                        
                        var currency = 'USD';
                        that.$el.find('.preloader-col').hide();
                        that.$el.find('.chart-content').show();
                        that.renderCharts(currency, data);
                    },
                    error: function (e) {
                        if (e.status == 523) {
                            window.location.href = "#/log-in";
                            location.reload();
                        }
                        else {
                            that.$el.find('.preloader-col').hide();
                            that.$el.find('.chart-content').show();
                            M.toast({
                                html: '{Literal}There was a problem fetching tills from the server{/Literal}'
                            });
                        }
                    }
                }); 
            }
            else {
                this.getSalesDataDateRangeFromTill(dateRange.fromDate, dateRange.thruDate, tillName);
            }
        }
        else if (reportType == "byHour") {
            if (dateRange != "custom") {
                $('#byHourHeader').show();
                this.getSalesByHourData(tillVal, dateRange.fromDate, dateRange.thruDate);
            }
        }
        else if (reportType == "byUser") {
            if (dateRange != "custom") {
                $('#byUserHeader').show();
                this.getSalesByUserData(tillVal, dateRange.fromDate, dateRange.thruDate);
            }
        }
        else if (reportType == "customerSummary") {
            if (dateRange != "custom") {
                $('#byCustomerHeader').show();
                this.getSalesByCustomerData(tillVal, dateRange.fromDate, dateRange.thruDate);
            }
        }
        else if (reportType == "itemCategory") {
            if (dateRange != "custom") {
                $('#byCategoryHeader').show();
                this.getSalesDataByCategory(tillVal, dateRange.fromDate, dateRange.thruDate);
            }
        }
        else if (reportType == "resetReport") {
            $('#compReasonGraph').hide();
            $('#salesByHourGraph').hide();
            $('#initialGraphs').show();
            $('#salesByCategory').hide();
            $('#salesByCustomer').hide();
            $('#salesByUser').hide();
            $('#dateRangeSelector').hide();
            $('#tillSelector').hide();
            $('#sequenceSearch').show();
            $('#resetReportHeader').show();
        }
    },

    getSalesDataByCategory: function(tillVal, fromDate, thruDate) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-sales-by-category-data',
            data: {
                token: sessionToken,
                fromDate: fromDate,
                thruDate: thruDate,
                tillVal: tillVal
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
            
                that.generateSalesByCategory(data.salesByCategory);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    that.$el.find('.preloader-col').hide();
                    that.$el.find('.chart-content').show();
                    M.toast({
                        html: '{Literal}There was a problem fetching tills from the server{/Literal}'
                    });
                }
            }
        });
    },

    getSalesByCustomerData: function(tillVal, fromDate, thruDate) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-sales-by-customer-data',
            data: {
                token: sessionToken,
                fromDate: fromDate,
                thruDate: thruDate,
                tillVal: tillVal
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
               
                that.generateSalesByCustomer(data.salesByCustomer);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    that.$el.find('.preloader-col').hide();
                    that.$el.find('.chart-content').show();
                    M.toast({
                        html: '{Literal}There was a problem fetching tills from the server{/Literal}'
                    });
                }
            }
        });
    },

    getSalesByUserData: function(tillVal, fromDate, thruDate) {
        if (this.userBySalesRevenue) {

        }
        else {

        }
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-sales-by-user-data',
            data: {
                token: sessionToken,
                fromDate: fromDate,
                thruDate: thruDate,
                tillVal: tillVal
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.salesLabels = data.salesLabels;
                that.generateSalesByUser(data.salesByUser);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    that.$el.find('.preloader-col').hide();
                    that.$el.find('.chart-content').show();
                    M.toast({
                        html: '{Literal}There was a problem fetching tills from the server{/Literal}'
                    });
                }
            }
        });
    },

    getSalesByHourData: function(tillVal, fromDate, thruDate) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-date-range-sales-data-by-till',
            data: {
                token: sessionToken,
                fromDate: fromDate,
                thruDate: thruDate,
                tillName: tillVal
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                
                var test = "$";
                if (data.zOutSummary != '') {
                    document.getElementById('totalSalesByHour').value = test + data.totalSales.toFixed(2);
                }
                else {
                    document.getElementById('totalSalesByHour').value = "";
                }

                that.generateSalesByHour(data);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    that.$el.find('.preloader-col').hide();
                    that.$el.find('.chart-content').show();
                    M.toast({
                        html: '{Literal}There was a problem fetching tills from the server{/Literal}'
                    });
                }
            }
        });
    },

    generateSalesByUser: function(data) {
        this.$el.find('.chart-content').show();
        $('#compReasonGraph').hide();
        $('#salesByHourGraph').hide();
        $('#initialGraphs').hide();
        $('#salesByCategory').hide();
        $('#salesByCustomer').hide();
        $('#salesByUser').show();
        
        $("#salesByUserTable tbody").empty();
        $('#sales-by-user-pie-chart').empty();

        var newTimeArray = data;
        newTimeArray.sort((a, b) => (a.id < b.id) ? 1 : -1)
        
        for (var i = 0; i < newTimeArray.length; i++) {
            $('#salesByUserTable tbody').append('<tr><td>' + newTimeArray[i].id + '</td> <td>{Literal}${/Literal}' + newTimeArray[i].total.toFixed(2) + '</td> <td style="color: black; direction: RTL;">' + (newTimeArray[i].percent * 100).toFixed(0) + '%</td></tr>');
        }

        if (this.userBySalesRevenue) {
            var salesByUser = [];
            var dataEmpty = false

            if (newTimeArray == []) {
                dataEmpty = true;
            }
            else {
                var test = [];
                if ( newTimeArray.length > 10) {
                    for (var i = 0; i < 10; i++) {
                        var test2 = [];
                        salesByUser[i] = [newTimeArray[i].id, newTimeArray[i].total];
                        test2.push(newTimeArray[i].id);
                        test2.push(newTimeArray[i].total.toFixed(2));
                        test.push(test2);
                    }
                }
                else {
                    for (var i = 0; i < newTimeArray.length; i++) {
                        var test2 = [];
                        salesByUser[i] = [newTimeArray[i].id, newTimeArray[i].total];
                        test2.push(newTimeArray[i].id);
                        test2.push(newTimeArray[i].total.toFixed(2));
                        test.push(test2);
                    }
                }
                
            }

            if (dataEmpty) {
                var tenderTypesChart = c3.generate({
                    bindto: '#sales-by-user-pie-chart',
                    legend: {
                        position: 'right'
                    },
                    size: {
                        //height: 150
                    },
                    data: {
                        color: {
                            pattern: ['#24c1e6', '#3754a0', '#11b5ae', '#5e8acc', '#017f9d']
                        },
                        columns: [],
                        type: 'bar',
                        empty: {
                            label: {
                                text: "No Data Available"
                            }
                        }
                    }
                });
            }
            else {
                var tenderTypesChart = c3.generate({
                    bindto: '#sales-by-user-pie-chart',
                    
                    size: {
                        height: 150
                    },
                    data: {
                        color: {
                            pattern: ['#24c1e6', '#3754a0', '#11b5ae', '#5e8acc', '#017f9d']
                        },
                        columns: test,
                        type: 'bar',
                        empty: {
                            label: {
                                text: "No Data Available"
                            }
                        }
                    },
                    axis: {
                        x: {
                            show: false,
                        },
                        y: {
                            tick: {
                                format: d3.format("d"),
                                count: 5
                            }
                        }
                    },
                });
            }
        }
        else {
            if (newTimeArray == []) {
                dataEmpty = true;
            }
            else {
                for (var i = 0; i < newTimeArray.length; i++) {
                    var objectArray = [];
                    var j = 0;
                    for (var key in newTimeArray[i].invoiced) {

                        thisHour = moment(newTimeArray[i].invoiced[key], "hh A").format("hh A");
                        objectArray[j] = thisHour;
                        j++;
                    }

                    newTimeArray[i].invoiced = objectArray;
                    newTimeArray[i].invoiced.sort();
                }

                dataArray = [];

                // I don't know why I wrote it this way but it works. Whoops
                for (var i = 0; i < newTimeArray.length; i++) {
                    var midnight = 0;
                    var oneAM = 0;
                    var twoAM = 0;
                    var threeAM = 0;
                    var fourAM = 0;
                    var fiveAM = 0;
                    var sixAM = 0;
                    var sevenAM = 0;
                    var eightAM = 0;
                    var nineAM = 0;
                    var tenAM = 0;
                    var elevenAM = 0;
                    var noon = 0;
                    var onePM = 0;
                    var twoPM = 0;
                    var threePM = 0;
                    var fourPM = 0;
                    var fivePM = 0;
                    var sixPM = 0;
                    var sevenPM = 0;
                    var eightPM = 0;
                    var ninePM = 0;
                    var tenPM = 0;
                    var elevenPM = 0;
                    
                    if (newTimeArray[i] != undefined) {
                        for (var j = 0; j < newTimeArray[i].invoiced.length; j++) {
                            if (newTimeArray[i].invoiced[j] == "12 AM") {
                                midnight++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "01 AM") {
                                oneAM++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "02 AM") {
                                twoAM++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "03 AM") {
                                threeAM++
                            }
                            else if (newTimeArray[i].invoiced[j] == "04 AM") {
                                fourAM++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "05 AM") {
                                fiveAM++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "06 AM") {
                                sixAM++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "07 AM") {
                                sevenAM++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "08 AM") {
                                eightAM++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "09 AM") {
                                nineAM++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "10 AM") {
                                tenAM++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "11 AM") {
                                elevenAM++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "12 PM") {
                                noon++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "01 PM") {
                                onePM++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "02 PM") {
                                twoPM++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "03 PM") {
                                threePM++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "04 PM") {
                                fourPM++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "05 PM") {
                                fivePM++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "06 PM") {
                                sixPM++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "07 PM") {
                                sevenPM++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "08 PM") {
                                eightPM++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "09 PM") {
                                ninePM++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "10 PM") {
                                tenPM++;
                            }
                            else if (newTimeArray[i].invoiced[j] == "11 PM") {
                                elevenPM++;
                            }
                        }
                    }
                    dataArray[i] = ([""+ newTimeArray[i].id, midnight, oneAM, twoAM, threeAM, fourAM, fiveAM, sixAM, sevenAM, eightAM, nineAM, tenAM, elevenAM, noon, onePM, twoPM, threePM, fourPM, fivePM, sixPM, sevenPM, eightPM, ninePM, tenPM, elevenPM]);
                }
            }

            if (!dataEmpty) {
                var salesLabels = [
                    "12AM",
                    "1AM",
                    "2AM",
                    "3AM",
                    "4AM",
                    "5AM",
                    "6AM",
                    "7AM",
                    "8AM",
                    "9AM",
                    "10AM",
                    "11AM",
                    "12PM",
                    "1PM",
                    "2PM",
                    "3PM",
                    "4PM",
                    "5PM",
                    "6PM",
                    "7PM",
                    "8PM",
                    "9PM",
                    "10PM",
                    "11PM"
                ];

                var chart3 = c3.generate({
                    bindto: '#sales-by-user-pie-chart',
                    size: {
                        height: 150
                    },
                    grid: {
                        y: {
                            show: true
                        }
                    },
                    data: {
                        columns: dataArray,
                        type: 'bar'
                    },
                    legend: {
                        show: false
                    },
                    axis: {
                        x: {
                            tick: {
                                multiline: true,
                                rotate: 45,
                            },
                            type: 'category',
                            categories: salesLabels
                        },
                        y: {
                            tick: {
                                format: d3.format("d"),
                                count: 5
                            }
                        }
                    },
                    bar: {
                        width: {
                            ratio: 0.75
                        }
                    }
                });     
            }
            else {
                var tenderTypesChart = c3.generate({
                    bindto: '#sales-by-user-pie-chart',
                    legend: {
                        position: 'right'
                    },
                    size: {
                        //height: 150
                    },
                    data: {
                        color: {
                            pattern: ['#24c1e6', '#3754a0', '#11b5ae', '#5e8acc', '#017f9d']
                        },
                        columns: [],
                        type: 'pie',
                        empty: {
                            label: {
                                text: "No Data Available"
                            }
                        }
                    },
                    donut: {
                        title: ""
                    }
                });
            }
        }

        
    },

    generateSalesByCustomer: function(data) {
        this.$el.find('.chart-content').show();
        $('#compReasonGraph').hide();
        $('#salesByHourGraph').hide();
        $('#initialGraphs').hide();
        $('#salesByCategory').hide();
        $('#salesByUser').hide();
        $('#salesByCustomer').show();
        $("#salesByCustomerTable tbody").empty();

        var finalArray = [];
        var test = data;
        //var checkArray = data;
        var combinedArray = [];

        

        if (this.showCustomerCashSales) {
            for (var i = 0; i < test.length; i++) {
                var thisCustomer = test[i];
                checkArray = [];
                checkArray = data;
                
                if (test[i] != undefined) {
                    for (var t = 0; t < checkArray.length; t++) {
                        if (checkArray[t] != undefined) {
                            if (thisCustomer.id == checkArray[t].id && t != i) {
                                thisCustomer.nonTaxable = thisCustomer.nonTaxable + checkArray[t].nonTaxable;
                                thisCustomer.total = thisCustomer.total + checkArray[t].total;
                                thisCustomer.taxable = thisCustomer.taxable + checkArray[t].taxable;
                                thisCustomer.subTotal = thisCustomer.subTotal + checkArray[t].subTotal;
                                delete checkArray[t];
                            }
                        }
                    }  

                    combinedArray.push(thisCustomer);
                }
            }
        }
        else {
            for (var i = 0; i < test.length; i++) {
                var thisCustomer = test[i];
                checkArray = [];
                checkArray = data;
                
                if (test[i] != undefined) {
                    if (test[i].id != "Cash Sales" && test[i].id != "") {
                        for (var t = 0; t < checkArray.length; t++) {
                            if (checkArray[t] != undefined) {
                                if (thisCustomer.id == checkArray[t].id && t != i) {
                                    
                                    thisCustomer.nonTaxable = thisCustomer.nonTaxable + checkArray[t].nonTaxable;
                                    thisCustomer.total = thisCustomer.total + checkArray[t].total;
                                    thisCustomer.taxable = thisCustomer.taxable + checkArray[t].taxable;
                                    thisCustomer.subTotal = thisCustomer.subTotal + checkArray[t].subTotal;
                                    delete checkArray[t];
                                }
                            }
                        }  

                        combinedArray.push(thisCustomer);
                    }
                }
            }
        }

        combinedArray.sort((a, b) => (a.total < b.total) ? 1 : -1)

        if (combinedArray.length > 10) {
            for (var i = 0; i < 10; i++) {
                if (combinedArray[i].companyName == "") {
                    combinedArray[i].companyName = "{Literal}N/A{/Literal}"
                }
                if (combinedArray[i].id == "") {
                    combinedArray[i].id = "{Literal}N/A{/Literal}"
                }
                $('#salesByCustomerTable tbody').append('<tr><td>' + combinedArray[i].companyName + '</td> <td>' + combinedArray[i].id + '</td><td>{Literal}${/Literal}' + combinedArray[i].taxable.toFixed(2) + '</td><td>{Literal}${/Literal}' + combinedArray[i].subTotal.toFixed(2) + '</td><td>{Literal}${/Literal}' + combinedArray[i].total.toFixed(2) + '</td></tr>');                
            }
        }
        else {
            for (var i = 0; i < combinedArray.length; i++) {
                if (combinedArray[i].companyName == "") {
                    combinedArray[i].companyName = "{Literal}N/A{/Literal}"
                }
                if (combinedArray[i].id == "") {
                    combinedArray[i].id = "{Literal}N/A{/Literal}"
                }
                $('#salesByCustomerTable tbody').append('<tr><td>' + combinedArray[i].companyName + '</td> <td>' + combinedArray[i].id + '</td><td>{Literal}${/Literal}' + combinedArray[i].taxable.toFixed(2) + '</td><td>{Literal}${/Literal}' + combinedArray[i].subTotal.toFixed(2) + '</td><td>{Literal}${/Literal}' + combinedArray[i].total.toFixed(2) + '</td></tr>');                
            }
        }

        
        var salesByCustomer = [];
        var dataEmpty = false
        if (combinedArray == []) {
            dataEmpty = true;
        }
        else {
            var test = [];
            if (combinedArray.length > 10) {
                for (var i = 0; i < 10; i++) {
                    if (combinedArray[i].companyName == "" && combinedArray[i].id == "") {
                        combinedArray[i].companyName = "{Literal}N/A{/Literal}"
                    }
                    else if (combinedArray[i].companyName == "Cash Sales") {
                        combinedArray[i].companyName = "{Literal}Cash Sales{/Literal}"
                    }
                    var test2 = [];
                    test2.push(combinedArray[i].companyName);
                    test2.push(combinedArray[i].total.toFixed(2));
                    test.push(test2);
                    salesByCustomer[i] = [combinedArray[i].companyName, combinedArray[i].total];
                }
            }
            else {
                for (var i = 0; i < combinedArray.length; i++) {
                    if (combinedArray[i].companyName == "" && combinedArray[i].id != "Cash Sales") {
                        combinedArray[i].companyName = "{Literal}N/A{/Literal}"
                    }
                    else if (combinedArray[i].id == "Cash Sales" || combinedArray[i].companyName == "{Literal}N/A{/Literal}") {
                        combinedArray[i].companyName = "{Literal}Cash Sales{/Literal}"
                    }
                    var test2 = [];
                    test2.push(combinedArray[i].companyName);
                    test2.push(combinedArray[i].total.toFixed(2));
                    test.push(test2);
                    salesByCustomer[i] = [combinedArray[i].companyName, combinedArray[i].total];
                }
            }

        }

        if (dataEmpty) {
            var tenderTypesChart = c3.generate({
                bindto: '#sales-by-customer-pie-chart',
                legend: {
                    position: 'right'
                },
                size: {
                    //height: 150
                },
                data: {
                    color: {
                        pattern: ['#24c1e6', '#3754a0', '#11b5ae', '#5e8acc', '#017f9d']
                    },
                    columns: [],
                    type: 'pie',
                    empty: {
                        label: {
                            text: "No Data Available"
                        }
                    }
                },
                donut: {
                    title: ""
                }
            });
        }
        else {
            var tenderTypesChart = c3.generate({
                bindto: '#sales-by-customer-pie-chart',
                size: {
                    height: 150
                },
                data: {
                    color: {
                        pattern: ['#24c1e6', '#3754a0', '#11b5ae', '#5e8acc', '#017f9d']
                    },
                    columns: test,
                    type: 'bar',
                    empty: {
                        label: {
                            text: "No Data Available"
                        }
                    }
                },
                axis: {
                    x: {
                        show: false,
                    },
                    y: {
                        tick: {
                            format: d3.format("d"),
                            count: 5
                        }
                    }
                },
            });
        }
    },

    generateSalesByCategory: function (data) {
        this.$el.find('.chart-content').show();
        $('#compReasonGraph').hide();
        $('#salesByHourGraph').hide();
        $('#initialGraphs').hide();
        $('#salesByCategory').show();
        $('#salesByUser').hide();
        $('#salesByCustomer').hide();
        $("#salesByCategoryTable").empty();
        var test = "$";
        dataLength = data.length;
        if (dataLength != 0) {
            var categoryTotal = 0; 
            for (var i = 0; i < dataLength; i++) {
                categoryTotal = categoryTotal + data[i].categoryTotal;
            }
            document.getElementById('totalSalesCategory').value = test + categoryTotal.toFixed(2);
        }

        for (var i = 0; i < data.length; i++) {
            if (data[i].category == "") {
                data[i].category = "{Literal}N/A{/Literal}"
            }
            var appendMe = '<thead><tr><th>' + data[i].category + '</th></tr></thead><tbody>';
            appendMe = appendMe + '<tr><td><i>{Literal}Item Id{/Literal}</i></td><td><i>{Literal}Description{/Literal}</i></td><td><i>{Literal}Quantity{/Literal}</i></td><td><i>{Literal}Total{/Literal}</i></td></tr>';
            var total = 0;
            if (data[i].lineItems.length == undefined) {
                appendMe = appendMe + '<tr><td>' + data[i].lineItems.id + '</td><td>' + data[i].lineItems.itemDescription + '</td><td>' + data[i].lineItems.itemQuantity + '</td><td>{Literal}${/Literal}' + data[i].lineItems.itemTotal.toFixed(2) + '</td></tr>';
                total = total + data[i].lineItems.itemTotal;
            }
            else {
                for (var t = 0; t < data[i].lineItems.length; t++) {
                    appendMe = appendMe + '<tr><td>' + data[i].lineItems[t].id + '</td><td>' + data[i].lineItems[t].itemDescription + '</td><td>' + data[i].lineItems[t].itemQuantity + '</td><td>{Literal}${/Literal}' + data[i].lineItems[t].itemTotal.toFixed(2) + '</td></tr>';
                    total = total + data[i].lineItems[t].itemTotal;
                }
            }

            appendMe = appendMe + '<tr><td></td><td></td><td></td><td>{Literal}${/Literal}' + total.toFixed(2) + '</td></tr>';
            appendMe = appendMe + '</tbody>';
            $('#salesByCategoryTable').append(appendMe);
        }

        var categoryByTotal = [];
        var dataEmpty = false
        if (data == []) {
            dataEmpty = true;
        }
        else {
            data.sort((a, b) => (a.categoryTotal < b.categoryTotal) ? 1 : -1)

            if (data.length > 10) {
                var test = [];
                for (var i = 0; i < 10; i++) {
                    var test2 = [];
                    if (data[i].category == "") {
                        data[i].category = "{Literal}N/A{/Literal}"
                    }
                    test2.push(data[i].category);
                    test2.push(data[i].categoryTotal.toFixed(2));
                    test.push(test2);
                    categoryByTotal[i] = [data[i].category, data[i].categoryTotal];
                }
            }
            else {
                var test = [];
                for (var i = 0; i < data.length; i++) {
                    var test2 = [];
                    if (data[i].category == "") {
                        data[i].category = "{Literal}N/A{/Literal}"
                    }
                    test2.push(data[i].category);
                    test2.push(data[i].categoryTotal.toFixed(2));
                    test.push(test2);
                    categoryByTotal[i] = [data[i].category, data[i].categoryTotal];
                }
            }
            
        }

        if (dataEmpty) {
            var tenderTypesChart = c3.generate({
                bindto: '#sales-by-category-pie-chart',
                legend: {
                    position: 'right'
                },
                size: {
                    height: 150
                },
                data: {
                    colors: {
                        pattern: ['#24c1e6', '#3754a0', '#11b5ae', '#5e8acc', '#017f9d']
                    },
                    columns: [],
                    type: 'pie',
                    empty: {
                        label: {
                            text: "No Data Available"
                        }
                    }
                },
                donut: {
                    title: ""
                }
            });
        }
        else {
            var tenderTypesChart = c3.generate({
                bindto: '#sales-by-category-pie-chart',
                size: {
                    height: 150
                },
                data: {
                    color: {
                        pattern: ['#24c1e6', '#3754a0', '#11b5ae', '#5e8acc', '#017f9d']
                    },
                    columns: test,
                    type: 'bar',
                    empty: {
                        label: {
                            text: "No Data Available"
                        }
                    }
                },
                axis: {
                    x: {
                        show: false,
                    },
                    y: {
                        tick: {
                            format: d3.format("d"),
                            count: 5
                        }
                    }
                },
            });
        }
    },

    
    generateSalesByHour: function (data) {
        this.$el.find('.chart-content').show();
        $('#compReasonGraph').hide();
        $('#salesByHourGraph').show();
        $('#initialGraphs').hide();
        $('#salesByCategory').hide();
        $('#salesByUser').hide();
        $('#salesByCustomer').hide();

        var salesByTime = data.salesByTimeData;
        var salesByTimeColumns = (['Sales']).concat(salesByTime.salesData);
        var salesLabels = salesByTime.salesLabels;
        this.salesLabels = salesByTime.salesLabels;
       
        var salesByTimeColumnsEmpty = true;
        for (var i = 1; i < salesByTimeColumns.length; i++) {
            if (salesByTimeColumns[i] > 0) {
                salesByTimeColumnsEmpty = false;
            }
        }

        var salesByQuantity = data.salesByTimeData;
        var salesByQuantityColumns = (['Sales']).concat(salesByQuantity.quantityByHourData);
        var salesByQuantityLabels = salesByQuantity.salesLabels;

        if (salesByTimeColumnsEmpty) {
            var chart3 = c3.generate({
                bindto: '#sales-by-hour-bar-chart',
                size: {
                    height: 150
                },
                grid: {
                    y: {
                        show: true
                    }
                },
                data: {
                    color: function (color, d) { return '#3754a0' },
                    columns: [],
                    type: 'bar',
                    empty: {
                        label: {
                            text: "No Data Available"
                        }
                    }
                },
                legend: {
                    show: false
                },
                axis: {
                    x: {
                        tick: {
                            multiline: true,
                            rotate: 45,
                        },
                        type: 'category',
                        categories: salesLabels
                    },
                    y: {
                        tick: {
                            format: d3.format("d"),
                            count: 5
                        }
                    }
                },
                bar: {
                    width: {
                        ratio: 0.75
                    }
                }
            });
            var chart3 = c3.generate({
                bindto: '#sales-by-hour-quantity-bar-chart',
                size: {
                    height: 150
                },
                grid: {
                    y: {
                        show: true
                    }
                },
                data: {
                    color: function (color, d) { return '#3754a0' },
                    columns: [],
                    type: 'bar',
                    empty: {
                        label: {
                            text: "No Data Available"
                        }
                    }
                },
                legend: {
                    show: false
                },
                axis: {
                    x: {
                        tick: {
                            multiline: true,
                            rotate: 45,
                        },
                        type: 'category',
                        categories: salesLabels
                    },
                    y: {
                        tick: {
                            format: d3.format("d"),
                            count: 5
                        }
                    }
                },
                bar: {
                    width: {
                        ratio: 0.75
                    }
                }
            });
            $("#salesHourTable tbody").empty();
        }
        else {
            var chart3 = c3.generate({
                bindto: '#sales-by-hour-bar-chart',
                size: {
                    height: 150
                },
                grid: {
                    y: {
                        show: true
                    }
                },
                data: {
                    color: function (color, d) { return '#3754a0' },
                    columns: [salesByTimeColumns],
                    type: 'bar'
                },
                legend: {
                    show: false
                },
                axis: {
                    x: {
                        tick: {
                            multiline: true,
                            rotate: 45,
                        },
                        type: 'category',
                        categories: salesLabels
                    },
                    y: {
                        tick: {
                            format: d3.format("d"),
                            count: 5
                        }
                    }
                },
                bar: {
                    width: {
                        ratio: 0.75
                    }
                }
            }); 

            var chart3 = c3.generate({
                bindto: '#sales-by-hour-quantity-bar-chart',
                size: {
                    height: 150
                },
                grid: {
                    y: {
                        show: true
                    }
                },
                data: {
                    color: function (color, d) { return '#3754a0' },
                    columns: [salesByQuantityColumns],
                    type: 'bar'
                },
                legend: {
                    show: false
                },
                axis: {
                    x: {
                        tick: {
                            multiline: true,
                            rotate: 45,
                        },
                        type: 'category',
                        categories: salesLabels
                    },
                    y: {
                        tick: {
                            format: d3.format("d"),
                            count: 5
                        }
                    }
                },
                bar: {
                    width: {
                        ratio: 0.75
                    }
                }
            }); 

            $("#salesHourTable tbody").empty();

            var newTimeArray = data.saleByTimeArray;
            newTimeArray.sort((a, b) => (a.date < b.date) ? 1 : -1)

            for (var i = 0; i < newTimeArray.length; i++) {
                thisHour = moment(newTimeArray[i].hour, "hh A").format("hh A");
                $('#salesHourTable tbody').append('<tr><td>' + newTimeArray[i].date + '</td> <td >' + thisHour + '</td> <td style="color: black; direction: RTL;">{Literal}${/Literal}' + newTimeArray[i].total.toFixed(2) + '</td></tr>');
            }
        }


        
    },

    getCompReasonData: function (tillVal, fromDate, thruDate) {
        var that = this;
        var sessionToken = this.getCookie();

        $.ajax({
            url: '/data/get-comp-reason-data',
            data: {
                token: sessionToken,
                tillVal: tillVal,
                fromDate: fromDate,
                thruDate: thruDate
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.generateCompReasons(data);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    that.$el.find('.preloader-col').hide();
                    that.$el.find('.chart-content').show();
                    M.toast({
                        html: '{Literal}There was a problem fetching data from the server{/Literal}'
                    });
                }
            }
        });
    },

    generateCompReasons: function (data) {
        $('#compReasonGraph').show();
        $('#initialGraphs').hide();
        $('#salesByHourGraph').hide()

        var totalCompReasons = document.getElementById("totalCompReasons");
        totalCompReasons.value = data.totalCompReasons;

        var compArray = [];
        iterator = 0;
        categoryArray = [];

        for (var key in data.compReasons) {
            compArray[iterator] = [key + ' - {Literal}${/Literal}' + data.compReasons[key], data.compReasons[key]];
            categoryArray[iterator] = key;
            iterator++;
        }

        var tenderTypesChart = c3.generate({
            bindto: '#comps-bar-chart',
            legend: {
                position: 'right'
            },
            size: {
                height: 150
            },
            data: {
                color: {
                    pattern: ['#24c1e6', '#3754a0', '#11b5ae', '#5e8acc', '#017f9d']
                },
                columns: compArray,
                type: 'pie'
            },
            donut: {
                title: ""
            }
        });

        $("#compReasonTable tbody").empty();
        const keys = Object.keys(data.compReasons)
        const values = Object.values(data.compReasons)

        for (var i = 0; i < keys.length; i++) 
        {
            $('#compReasonTable tbody').append('<tr><td>' + keys[i] + '</td><td style="color: black; float: right; direction: RTL;">{Literal}${/Literal}' + values[i].toFixed(2) + '</td></tr>');
        }
    },

    searchResetReportBySearchTerm: function(e) {
        this.initAutoComplete();
        var element = $(e.currentTarget);
        var searchTerm = $(element).val();
        var that = this;
        if (searchTerm.trim().length > 0) {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(function() {
                that.getResetReportsBySearchTerm(searchTerm);
            }, 300);
        }
    },
    
    getResetReportsBySearchTerm: function(searchTerm) {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-reset-reports',
            data: {
                searchTerm: searchTerm,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var results = data.results;
                var items = {};
                for (var i = 0; i < results.length; i++) {
                    var endDate = moment(results[i].start).format('YYYY-MM-DD');
                    var till = results[i].till;
                    var sequence = results[i].id;
                    items['Till ' + till + ' / #' + sequence + ' / ' + endDate] = null;
                    that.resetReportsMapping['Till ' + till + ' / #' + sequence + ' / ' + endDate] = { till: till, sequence: sequence };
                }
                
                that.resetReportSearchAutocomplete.updateData(items);
                that.resetReportSearchAutocomplete.open();
                
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
            }
        });
    },

    initAutoComplete: function () {
        var that = this;
        var elems = document.querySelector('#reset-report-autocomplete');
        this.resetReportSearchAutocomplete = M.Autocomplete.init(elems, {
            minLength: 1,
            lmit: 20,
            sortFunction: function (a, b, inputString) {
                return a.indexOf(inputString) - b.indexOf(inputString);
            },
            onAutocomplete: function (selection) { that.generateResetReport(selection); }
        });
    },

    generateResetReport: function (selection) {
        $('#compReasonGraph').hide();
        $('#salesByHourGraph').hide();
        $('#initialGraphs').show();
        $('#salesByCategory').hide();
        $('#salesByCustomer').hide();
        $('#salesByUser').hide();
        $('#sequenceSearch').show();

        var that = this;
        var sessionToken = this.getCookie();

        var sequence = this.resetReportsMapping[selection].sequence;
        this.chosenSequence = this.resetReportsMapping[selection].sequence;
        var till = this.resetReportsMapping[selection].till;
        this.chosenTill = this.resetReportsMapping[selection].till;

        $.ajax({
            url: '/data/get-reset-report-data',
            data: {
                token: sessionToken,
                reset: sequence,
                tillName: till
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var dateRangeFormModal = that.$el.find('#date-range-form-modal').modal();
                dateRangeFormModal.modal('close');

                that.zOutSummary = data.zOutSummary;

                that.salesByItemType = data.salesByItemType;
                that.noSalesCount = data.noSaleCount;
                that.creditCardCount = data.creditCardCount;
                that.debitCardCount = data.debitCardCount;
                that.startingCash = data.startingCash;
                that.otherTips = data.otherTips;
                that.creditCardTips = data.creditCardTips;
                that.qtyItemTypes = data.qtyItemTypes;

                var insertTotalTransactions = document.getElementById('transactionCount');
                if (data.totalTransactions == null) {
                    insertTotalTransactions.value = 0;
                    that.totalTransactions = 0;
                }
                else {
                    insertTotalTransactions.value = data.totalTransactions;
                    that.totalTransactions = data.totalTransactions;
                }

                that.deliveryCount = data.deliveryCount;
                that.deliveryGuestCount = data.deliveryGuestCount;
                that.deliveryTotal = data.deliveryTotal;

                that.dineInCount = data.dineInCount;
                that.dineInGuestCount = data.dineInGuestCount;
                that.dineInTotal = data.dineInTotal;

                that.takeOutCount = data.takeOutCount;
                that.takeOutGuestCount = data.takeOutGuestCount;
                that.takeOutTotal = data.takeOutTotal;

                that.totalSales =  Math.round(data.totalSales * 100) / 100;
                that.largestTransaction = Math.round(data.largestTransaction * 100) / 100;
                that.totalItemsSold = data.totalItemsSold;
                that.cashTransactions = data.cashCount;

                var test = "$";
                document.getElementById('totalSales').value = test + that.totalSales.toFixed(2);
                if (data.zOutSummary != '') {
                   document.getElementById('totalTender').value = test + data.zOutSummary.tenderingTotal.toFixed(2);
                }
                
                var currency = 'USD';
                that.$el.find('.preloader-col').hide();
                that.$el.find('.chart-content').show();
                that.renderCharts(currency, data);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    that.$el.find('.preloader-col').hide();
                    that.$el.find('.chart-content').show();
                    M.toast({
                        html: '{Literal}There was a problem fetching tills from the server{/Literal}'
                    });
                }
            }
        });
    },

    showByHourRevenue: function() {
        $('#sales-by-hour-quantity-bar-chart-wrapper').hide();
        $('#sales-by-hour-bar-chart-wrapper').show();
    },

    showByHourQuantity: function() {
        $('#sales-by-hour-bar-chart-wrapper').hide();
        $('#sales-by-hour-quantity-bar-chart-wrapper').show();
    },

    hideCashSales: function() {
        var tillVal = this.$el.find('#till-dropdown').val();
        var tillName = this.$el.find('#till-dropdown option:selected').text();
        var dateRange = this.getDateRange();
        this.showCustomerCashSales = false;

        this.getSalesByCustomerData(tillName, dateRange.fromDate, dateRange.thruDate);
    },

    showCashSales: function() {
        var tillVal = this.$el.find('#till-dropdown').val();
        var tillName = this.$el.find('#till-dropdown option:selected').text();
        var dateRange = this.getDateRange();
        this.showCustomerCashSales = true;

        if (dateRange != "custom") {
            this.getSalesByCustomerData(tillName, dateRange.fromDate, dateRange.thruDate);
        }
    },

    showUserByRevenue: function() {
        var tillVal = this.$el.find('#till-dropdown').val();
        var tillName = this.$el.find('#till-dropdown option:selected').text();
        var dateRange = this.getDateRange();

        if (dateRange != "custom") {
            this.userBySalesRevenue = true;
            this.getSalesByUserData(tillName, dateRange.fromDate, dateRange.thruDate);
        }
    },

    showUserByHour: function() {
        var tillVal = this.$el.find('#till-dropdown').val();
        var tillName = this.$el.find('#till-dropdown option:selected').text();
        var dateRange = this.getDateRange();

        if (dateRange != "custom") {
            this.userBySalesRevenue = false;
            this.getSalesByUserData(tillName, dateRange.fromDate, dateRange.thruDate);
        }
    },

    exportToExcel: function() {
        var dateRange = this.getDateRange();
        var reportType = this.$el.find('#report-type-filter').val();
        var tillVal = this.$el.find('#till-dropdown').val();
        if (tillVal == "all") {
            tillVal = "All Tills"
        }

        if (reportType == "zOutSummary") {
            var params = {
                fromDate: dateRange.fromDate,
                toDate: dateRange.thruDate,
                sequence: null,
                till: tillVal,
                showGraphs: "true",
                exportToExcel: "true"
            }
            
            this.openReportWindowWithPostRequest('/data/generate-z-out-summary-report', params)
        }
        else if (reportType == "byHour") {
            var params = {
                fromDate: dateRange.fromDate,
                toDate: dateRange.thruDate,
                sequence: null,
                till: tillVal,
                showGraphs: "true",
                exportToExcel: "true"
            }
            
            this.openReportWindowWithPostRequest('/data/generate-sales-by-hour-report', params)
        }
        else if (reportType == "byUser") {
            var params = {
                fromDate: dateRange.fromDate,
                toDate: dateRange.thruDate,
                sequence: null,
                till: tillVal,
                showGraphs: "true",
                exportToExcel: "true"
            }
            
            this.openReportWindowWithPostRequest('/data/generate-sales-by-user-report', params)
        }
        else if (reportType == "customerSummary") {
            var params = {
                fromDate: dateRange.fromDate,
                toDate: dateRange.thruDate,
                sequence: null,
                till: tillVal,
                showGraphs: "true",
                exportToExcel: "true"
            }
            
            this.openReportWindowWithPostRequest('/data/generate-sales-by-customer-summary-report', params)
        }
        else if (reportType == "itemCategory") {
            var params = {
                fromDate: dateRange.fromDate,
                toDate: dateRange.thruDate,
                sequence: null,
                till: tillVal,
                showGraphs: "true",
                exportToExcel: "true"
            }

            this.openReportWindowWithPostRequest('/data/generate-sales-by-item-category-report', params)
        }
        else if (reportType == "resetReport") {
            var sequence = this.chosenSequence;
            var till = this.chosenTill;

            var params = {
                exportToExcel: "true",
                sequence: sequence,
                showGraphs: "true",
                till: till
            }

            this.openReportWindowWithPostRequest('/data/generate-reset-report', params)
        }
    },


    openReportWindowWithPostRequest: function (winURL, params) {
        var winName='AccoPOS Report';
        var windowoption='resizable=yes,height=768,width=1024,location=0,menubar=0,scrollbars=1';
        var form = document.createElement("form");
        var sessionToken = this.getCookie();
        form.setAttribute("method", "post");
        form.setAttribute("token", sessionToken);
        form.setAttribute("action", winURL);
        form.setAttribute("target", winName);  
        for (var i in params) {
            if (params.hasOwnProperty(i)) {
                var input = document.createElement('input');
                input.type = 'text';
                input.name = i;
                input.value = params[i];
                form.appendChild(input);
            }
        }
        document.body.appendChild(form);
        window.open('', winName, windowoption);
        form.target = winName;
        form.submit();
        document.body.removeChild(form);           
    },

    openEmailReportModel: function() {
        $('#email-report-modal').modal().modal('open');
    },

    sendEmailReport: function() {
        var email = this.$el.find('#emailInfo').val();
        if (email == "") {
            M.toast({
                html: '{Literal}An email is required{/Literal}'
            });
        }
        else {
            var reportType = this.$el.find('#report-type-filter').val();
            var reportContent = "<div>"; 
            var reportTitle = "";

            if (reportType == "byHour") {
                $('#salesHourTable').show();
                reportContent = reportContent + document.getElementById('emailSalesHourTable').innerHTML;
                reportTitle = "Sales by Hour Report";
            }
            else if (reportType == "byUser") {
                $('#salesByUserTable').show();
                reportContent = reportContent +  document.getElementById('emailSalesUserTable').innerHTML;
                reportTitle = "Sales by User Report";
            }
            else if (reportType == "customerSummary") {
                $('#salesByCustomerTable').show();
                reportContent = reportContent +  document.getElementById('emailSalesCustomerTable').innerHTML;
                reportTitle = "Sales by Customer Report";
            }
            else if (reportType == "itemCategory") {
                $('#salesByCategoryTable').show();
                reportContent = reportContent +  document.getElementById('emailSalesByCategoryTable').innerHTML;
                reportTitle = "Sales by Item Category Report";
            }
            else if (reportType == "zOutSummary") {
                $('#itemTypeTable').show();
                $('#discountTable').show();
                $('#secondGraphTable').show();
                $('#thirdGraphTable').show();
                $('#taxTable').show();
                reportContent = reportContent +  document.getElementById('emailSummaryTable').innerHTML;
                reportContent = reportContent +  document.getElementById('transactionEmail').innerHTML;
                reportContent = reportContent +  document.getElementById('tenderEmail').innerHTML;
                
                
                reportTitle = "Z Out Summary Report";

                if (App.serverInfo.isFoodService) {
                    $('#fourthGraphTable').show();
                    $('#fifthGraphTable').show();

                    reportContent += document.getElementById('emailFoodServiceGraph1').innerHTML;
                    reportContent += document.getElementById('emailFoodServiceGraph2').innerHTML;
                }
                
            }
            else if (reportType == "resetReport") {
                $('#itemTypeTable').show();
                $('#discountTable').show();
                $('#itemTypeTableHr').show();
                $('#secondGraphTable').show();
                $('#thirdGraphTable').show();
                $('#taxTable').show();
                $('#taxTableHr').show();

                reportContent = reportContent +  document.getElementById('emailSummaryTable').innerHTML;
                reportContent = reportContent + '<br><br>'
                reportContent = reportContent +  document.getElementById('transactionEmail').innerHTML;
                reportContent = reportContent + '<br><br>'
                reportContent = reportContent +  document.getElementById('tenderEmail').innerHTML;
                reportTitle = "Reset Summary Report";
                if (App.serverInfo.isFoodService) {
                    $('#fourthGraphTable').show();
                    $('#fifthGraphTable').show();
                    reportContent += document.getElementById('emailFoodServiceGraph1').innerHTML;
                    reportContent += document.getElementById('emailFoodServiceGraph2').innerHTML;
                }
            }

            reportContent = reportContent + "</div>"

            if (reportContent != null) {
                var that = this;
                $.ajax({
                    url: '/email_report.html',
                    data: {
                        reportContent: reportContent,
                        emailAddress:  (email),
                        reportTitle: reportTitle
                    },
                    dataType: 'json',
                    type: 'POST',
                    success: function (data) {
                        M.toast({
                            html: '{Literal}Exported Successfully{/Literal}'
                        });
                    },
                    error: function (e) {
                        if (e.status == 523) {
                            window.location.href = "#/log-in";
                            location.reload();
                        }
                    }
                });

                $('#email-report-modal').modal().modal('close');
            }
        }
    },

    getDateRange: function() {
        var dateRangeVal = this.$el.find('#date-range-preset').val();
        var reportType = this.$el.find('#report-type-filter').val();

        if (dateRangeVal == "" && reportType != "resetReport") {
            var dateRangeFormModal = this.$el.find('#date-range-form-modal').modal();
            dateRangeFormModal.modal('open');
        }
        else if (dateRangeVal == "today") {
            var thruDate = new Date();
            var fromDate = new Date();

            var d = new Date();
            d.setHours(0,0,0,0);
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
        
            fromDate = [year, month, day].join('-');

            var d = new Date(thruDate),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
        
            thruDate = [year, month, day].join('-');
            var datetext = d.toTimeString();
            datetext = datetext.split(' ')[0];

            fromDate = fromDate + ' 00:00:01.0';
            thruDate = thruDate + ' ' + datetext + '.0';
          
        }
        else if (dateRangeVal == "yesterday") {
            var thruDate = new Date();
            var fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - 1);
            thruDate.setDate(thruDate.getDate() - 1);

            var d = new Date(fromDate),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
        
            fromDate = [year, month, day].join('-');

            var d = new Date(thruDate),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
        
            thruDate = [year, month, day].join('-');

            fromDate = fromDate + ' 00:00:01.0';
            thruDate = thruDate + ' 23:59:59.0';
        }
        else if (dateRangeVal == "thisWeek") {
            var today = new Date();
            var thruDate = new Date();
            var fromDate = new Date(today.setDate(today.getDate()-today.getDay()));

            var d = new Date(fromDate),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
        
            fromDate = [year, month, day].join('-');

            var d = new Date(thruDate),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
        
            thruDate = [year, month, day].join('-');

            fromDate = fromDate + ' 00:00:01.0';
            thruDate = thruDate + ' 23:59:59.0';
        }
        else if (dateRangeVal == "previousWeek") {
            var today = new Date();
            var saturday = new Date();
            
            var fromDate = new Date(today.setDate((today.getDate()-today.getDay()) - 7));
            var thruDate = new Date(saturday.setDate((saturday.getDate()-saturday.getDay()) - 1));

            var d = new Date(fromDate),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
        
            fromDate = [year, month, day].join('-');

            var d = new Date(thruDate),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
        
            thruDate = [year, month, day].join('-');

            fromDate = fromDate + ' 00:00:01.0';
            thruDate = thruDate + ' 23:59:59.0';
        }
        else if (dateRangeVal == "thisMonth") {
            var thruDate = new Date();

            var date = new Date();
            var fromDate = new Date(date.getFullYear(), date.getMonth(), 1);

            var d = new Date(fromDate),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
        
            fromDate = [year, month, day].join('-');

            var d = new Date(thruDate),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
        
            thruDate = [year, month, day].join('-');
            M.toast({ html: '{Literal}Fetching Data From {/Literal}' + fromDate + ' {Literal}to{/Literal} ' + thruDate });
            fromDate = fromDate + ' 00:00:01.0';
            thruDate = thruDate + ' 23:59:59.0';

        }
        else if (dateRangeVal == "previousMonth") {
            //var thruDate = new Date();

            var thruDate=new Date(); // current date
            thruDate.setDate(1); // going to 1st of the month
            thruDate.setHours(-1); 

            var fromDate = new Date();
            fromDate.setDate(1);
            fromDate.setMonth(fromDate.getMonth()-1);

            var d = new Date(fromDate),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
        
            fromDate = [year, month, day].join('-');

            var d = new Date(thruDate),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
        
            thruDate = [year, month, day].join('-');
            M.toast({ html: '{Literal}Fetching Data From {/Literal}' + fromDate + ' {Literal}to{/Literal} ' + thruDate });
            fromDate = fromDate + ' 00:00:01.0';
            thruDate = thruDate + ' 23:59:59.0';

        }
        else if (dateRangeVal == "previous3Months") {
            var today = new Date(),
            quarter = Math.floor((today.getMonth() / 3)),
            fromDate,
            thruDate;
    

            fromDate = new Date(today.getFullYear(), quarter * 3 - 3, 1);
            thruDate = new Date(fromDate.getFullYear(), fromDate.getMonth() + 3, 0);

            var d = new Date(fromDate),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
        
            fromDate = [year, month, day].join('-');

            var d = new Date(thruDate),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
        
            thruDate = [year, month, day].join('-');

            M.toast({ html: '{Literal}Fetching Data From {/Literal}' + fromDate + ' {Literal}to{/Literal} ' + thruDate });
            fromDate = fromDate + ' 00:00:01.0';
            thruDate = thruDate + ' 23:59:59.0';
        }
        else {
            var today = new Date(),
            quarter = Math.floor((today.getMonth() / 3)),
            fromDate,
            thruDate;
    
            fromDate = new Date(today.getFullYear(), quarter * 3, 1);
            thruDate = new Date(fromDate.getFullYear(), fromDate.getMonth() + 3, 0);

            var d = new Date(fromDate),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
        
            fromDate = [year, month, day].join('-');

            var d = new Date(thruDate),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
        
            thruDate = [year, month, day].join('-');
            M.toast({ html: '{Literal}Fetching Data From {/Literal}' + fromDate + ' {Literal}to{/Literal} ' + thruDate });

            fromDate = fromDate + ' 00:00:01.0';
            thruDate = thruDate + ' 23:59:59.0';
        }

        if (dateRangeVal == "") {
            return "custom"
        }
        else {
            var dateRange = {
                fromDate: fromDate,
                thruDate: thruDate
            }
            return dateRange;
        }
    }
});