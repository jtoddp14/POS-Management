var AppRouter = Backbone.Router.extend({
    literals: [],
    breadCrumbToolTip: '',
    isRightToLeft: false,
    rtl: false,
    foodService: false,
    accuShift: false,
    vatTax: false,
    accounting: false,
    israCardBuild: false,
    IDS_SALE: "Make Sales",
    IDS_VOID: "Make Voids",
    IDS_VOID_CF: "Annulez une Transaction",
    IDS_RETURN: "Make Returns",
    IDS_MANAGE: "Manage",
    IDS_X: "Read Cash Tills",
    IDS_Z: "Reset Cash Tills",
    IDS_Z_CURRENT_TILL: "Reset Current Till",
    IDS_SETTINGS: "Change System Settings",
    IDS_USERS: "Add/Edit Users",
    IDS_GROUPS: "Add/Edit User Groups",
    IDS_TAXES: "Add/Edit Taxing Authorities",
    IDS_IMPORT: "Import Files",
    IDS_EXPORT: "Export Files",
    IDS_TILLS: "Add/Edit Cash Tills",
    IDS_CLEAR: "Clear Cash Tills",
    IDS_CLEAR_FILES: "Clear Data Files",
    IDS_ADD_DEL_ITEMS: "Add/Delete Items",
    IDS_QUIT: "Exit Point of Sale Program",
    IDS_CHANGE_PRICE: "Change Prices",
    IDS_CHANGE_PRICE_CF: "Modifiez un Prix",
    IDS_MODIFY_ITEMS: "Change Items",
    IDS_MODIFY_CUSTOMERS: "Change Customer Information",
    IDS_SETTLE: "Settle (Close) Credit Card Batches",
    IDS_NOSALE: "No Sale",
    IDS_COMPS: "Food Service Comps",
    IDS_REOPEN: "Reopen closed sales",
    IDS_CANCEL_SALE: "Cancel sales",
    IDS_TILL_INUSE: "Log in till in use",
    IDS_LOAD_ALL_ORDERS: "Load All Orders",
    IDS_CHANGE_SERVER: "Change Server",
    IDS_REFUND: "Make Refund",
    IDS_CARDS_SETUP: "Cards/Merchant Setup",
    IDS_ADJUST_INVENTORY: "Adjust Inventory",
    IDS_RECEIVE_INVENTORY: "Receive Inventory",
    IDS_ACCUSHIFT_MGMT: "AccuShift Management",
    IDS_OVERRIDE_CREDIT_LIMIT: "Override Credit Limit",
    IDS_EDIT_REOPENED_ORDER: "Edit Reopened Orders",
    IDS_OVERRIDE_FORCE_GUEST_COUNT: "Override Required Guest Count",
    IDS_CHANGE_CONVERSION_RATE: "Change Currency Conversion Rate",
    IDS_CHANGE_ITEM_DESCRIPTIONS: "Change Item Descriptions",
    IDS_ALLOW_SPLITTING_CHECKS: "Allow Splitting Checks",
    IDS_CHANGE_SALES_REP: "Change Sales Rep",
    IDS_ISRACARD_DASHBOARD: "IsraCard Dashboard",

    serverInfo: {
        isFoodService: false,
        hasAccuShift: false,
        isRightToLeft: false,
        hasVatTax: false,
        hasIntegratedRemoteDisplay: false,
        hasSageLiveIntegration: false,
        hasQBOIntegration: false,
        hasAccounting: false,
        hasRemoteDisplay: false,
        israCardBuild: false,
        isMobileServer: false,
    },

    routes: {
        "": "logIn",
        "advanced-items" : "advancedItems",
        "alternative-taxes" : "alternativeTaxes",
        "backup-restore" : "backupRestore",
        "barcode" : "barcode",
        "breaks" : "breaks",
        "card-setup": "cardSetup",
        "clear-data" : "clearData",
        "comp-reasons": "compReasons",
        "company-info": "companyInfo",
        "customer-terms": "customerTerms",
        "customers": "customers",
        "dashboard": "dashboard",
        "deli-scale":"deliScale",
        "e-conduit": "eConduit",
        "employees":"employees",
        "flex-groups": "flexGroups",
        "follow-on": "followOn",
        "group-items" : "groupItems",
        "home": "home",
        "import-export": "importExport",
        "integrations": "integrations",
        "inventory": "inventory",
        "inventory-adjustments": "inventoryAdjustments",
        "items": "items",
        "log-in": "logIn",
        "no-partial": "noPartial",
        "operator-messages": "operatorMessages",
        "pay-period":"payPeriod",
        "pay-types": "payTypes",
        "pos-keys": "posKeys",
        "pos-users": "posUsers",
        "price-level-times": "priceLevelTimes",
        "product-lines": "productLines",
        "qbo": "qbo",
        "receipt-settings": "receiptSettings",
        "recipes": "recipes",
        "reports": "reports",
        "rooms-tables": "roomsTables",
        "sales" : "sales",
        "sales-taxes" : "salesTaxes",
        "session-expired": "sessionExpired",
        "snap-ebt": "snapEBT",
        "taxes" : "taxes",
        "tender-types" : "tenderTypes",
        "tills" : "tills",
        "units-of-measure": "unitsOfMeasure",
        "user-groups": "userGroups",
        // this route MUST be the last one:
        "*invalidRoute": "pageNotFound"
    },

    showToast: function (message) {
        M.Toast.dismissAll();
        M.toast({
            html: message
        });
    },

    isMobileDevice: function() {
        try {
            var deviceWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
            return deviceWidth < 600;
        } catch (e) {
            return false;
        }
    },

    setBreadcrumbs: function (breadcrumbs) {
        var breadcrumbsHtml = "";
        for (var i = 0; i < breadcrumbs.length; i ++) {
            if (!this.isMobileDevice() || (i === breadcrumbs.length - 1)) {
                if (breadcrumbs.length == 1) {
                    breadcrumbsHtml += '<a href="' + breadcrumbs[i].path + '" class="breadcrumb blue-text darken-2">' + breadcrumbs[i].label + '</a>';
                    breadcrumbsHtml += '<a href="javascript:void(0)" id="infoIcon" class="blue-text waves-effect waves-light"> <i class="blue-text material-icons tooltipped" data-position="bottom" data-tooltip="{Literal}' + this.breadCrumbToolTip + '{/Literal}">info_outline</i></a>'
                }
                else {
                    breadcrumbsHtml += '<a href="' + breadcrumbs[i].path + '" class="breadcrumb blue-text darken-2">' + breadcrumbs[i].label + '</a>';
                    if (i > 0) {
                        breadcrumbsHtml += '<a href="javascript:void(0)" id="infoIcon" class="blue-text waves-effect waves-light"> <i class="blue-text material-icons tooltipped" data-position="bottom" data-tooltip="{Literal}' + this.breadCrumbToolTip + '{/Literal}">info_outline</i></a>'
                    }
                }
                
            }
        }
        $("#breadcrumbs").html(breadcrumbsHtml);
    },

    initGlobalAjaxHandlers: function () {
        var that = this;
        $(document).ajaxComplete(function(request, response, meta) {
            var payload = {};
            if (typeof response !== 'undefined') {
                if (typeof response.responseJSON !== 'undefined') {
                    payload = response.responseJSON;
                } else if (typeof response.responseText !== 'undefined') {
                    try {
                        payload = JSON.parse(response.responseText);
                    } catch (e) { }
                }
            }
            if (typeof payload.error !== 'undefined' && payload.error === 'SESSION_EXPIRED') {
                that.navigate('session-expired', {trigger: true});
            }
        });
    },

    initialize: function () {
        this.initGlobalAjaxHandlers();
        var that = this;

        var initSideNavAndScrollbars = function () {
            var elems = document.querySelectorAll('.sidenav');
            var instances = M.Sidenav.init(elems, {
                edge: that.serverInfo.isRightToLeft ? 'right' : 'left',
                draggable: true
            });
            $('.collapsible').collapsible();
            /*$("main").mCustomScrollbar({
                axis: 'y',
                scrollInertia: 1000,
                autoHideScrollbar: true
            }); */
            if (that.serverInfo.isRightToLeft) {
                var linkElement = this.document.createElement('link');
                linkElement.setAttribute('rel', 'stylesheet');
                linkElement.setAttribute('type', 'text/css');
                linkElement.setAttribute('href', 'lib/materialize-css-rtl/materialize.rtl.css');
                
                $("#slide-out").css('direction', 'rtl');
                $("body").css('direction', 'rtl');
                $("main").css('direction', 'rtl');
                $("#global-wrapper").css('direction', 'rtl');

                $('.dropdown-icon').each(function() { 
                    $(this).removeClass('right');
                    $(this).addClass('left');
            });

            } else {
                $("#slide-out").css('direction', 'ltr');
                //$("#slide-out").mCustomScrollbar();
            }
            if (that.serverInfo.israCardBuild) { 
                $('#logo-img').hide();
                $('#israSideNavImg').show();
                $("#logo-wrapper").removeClass('ap-blue');
                $("#logo-wrapper").addClass('grey lighten-4');
                document.title = 'IsraPOS Management'
                var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
                document.getElementsByTagName('head')[0].appendChild(link);
                link.type = 'image/x-icon';
                link.rel = 'shortcut icon';
                link.href = 'img/isracard-logo.png';
            }
            
            $("#slide-out").show();
            
        };
        $.ajax({
            url: '/data/get-server-info',
            data: {},
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                if (typeof data.serverInfo !== 'undefined') {
                    that.serverInfo = data.serverInfo;
                } else {
                    M.toast({
                        html: 'There was a problem fetching data from the server'
                    });
                }

                if (that.serverInfo.isMobileServer) {
                    that.serverInfo.hasAccounting = false;
                    $("#integrationsBlock").hide();
                    $("#compactBlock").hide();
                }

                if (!that.serverInfo.isFoodService) {
                    $("#itemFoodServiceBlock1").hide();
                    $("#itemFoodServiceBlock2").hide();
                    $("#itemFoodServiceBlock3").hide();
                    $("#rooms-and-tables-menu-item").hide();
                    $('#CompReasonsBlock').hide();
                }
                if (!that.serverInfo.hasAccounting) {
                    $('#AccountingIndexBlock').hide();
                }
                if (!that.serverInfo.hasVatTax) {
                    $('#VatTaxBlock').hide();
                }
                else {
                    $('#TaxBlock1').hide();
                    $('#TaxBlock2').hide();
                }
                if (!that.serverInfo.hasAccuShift) {
                    $('#EmployeesBlock1').hide();
                    $('#EmployeesBlock2').hide();
                }
                try {
                    if (data.serverInfo.isRightToLeft === true) {
                        $("#rtl-supprt-css").removeAttr("disabled");
                    }
                } catch (e) {
                    
                }
                that.rtl = data.serverInfo.isRightToLeft;
                that.israCardBuild = data.serverInfo.israCardBuild;
                if (data.serverInfo.israCardBuild) {
                    $("#dashboardSideNav").show();
                }
                initSideNavAndScrollbars();
            },
            error: function (e) {
                M.toast({
                    html: 'There was a problem fetching data from the server'
                });
            }
        });
        
        
        $(document).ready(function(){
            $('.tooltipped').tooltip();
            $(window).scroll(function() {
                var scrollBottom = $(window).scrollTop() + $(window).height();
                var y = $(window).scrollTop();
                if( y > 0 ){
                    $("#top-shadow").show();
                } else {
                    $("#top-shadow").hide();
                }

                if (scrollBottom > $(window).height()) {
                    $("#bottom-shadow").show();
                }
                else {
                    $("#bottom-shadow").hide();
                }
            });
        });
    },

    sessionExpired: function() {
        $('main').children().detach();
        var message = '<div class="row"><div class="col s12" style="padding-top: 20px">Your session has expired. Please click <a href="/isracard/isracardlogin.html">here</a> to go to the IsraCard login page.</div></div>';
        $('main').html(message);
        this.setBreadcrumbs([{
            path: 'javascript:void(0)',
            label: '{Literal}Your Session Has Expired{/Literal}'
        }]);
    },

    pageNotFound: function () {
        $('main').children().detach();
        $('main').html('<div class="row"><div class="col s12" style="padding-top: 20px">The page you are looking for does not exist</div></div>');
        this.setBreadcrumbs([{
            path: 'javascript:void(0)',
            label: '{Literal}Page Not Found{/Literal}'
        }]);
    },

    home: function () {
        var that = this;
        $.get("templates/home.html").done(function (template) {
            that.homeView = new HomeView({
                template: template,
                breadcrumb: [{
                    path: '#/home',
                    label: '{Literal}Dashboard{/Literal}'
                }]
            });
            $('main').children().detach();
            $('main').html(that.homeView.render().el);
        });
    },

    posKeys: function() {
        var that = this;
        $.get("templates/posKeys.html").done(function (template) {
            that.posKeysView = new PosKeysView({
                template: template,
                breadcrumb: [{
                    path: '#/pos-keys',
                    label: '{Literal}POS Keys{/Literal}'
                }]
            });
            $('main').children().detach();
            $('main').html(that.posKeysView.render().el);
            $('select').formSelect();
            $(document).ready(function () {
                $('.modal').modal();
            });
        })
    },

    roomsTables: function() {
        var that = this;
        $.get("templates/roomsTables.html").done(function (template) {
            $.get("templates/roomsTablesForm.html").done(function (roomsTablesFormTemplate) {
                that.roomsTablesView = new RoomsTablesView({
                template: template,
                roomsTablesFormTemplate: roomsTablesFormTemplate,
                collection: new RoomsTablesCollection(),
                breadcrumb: [{
                    path: '#/rooms-tables',
                    label: '{Literal}Rooms & Tables{/Literal}'
                }]
            });
                $('main').children().detach();
                $('main').html(that.roomsTablesView.render().el);
                $('select').formSelect();
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });
    },

    productLines: function () {
        var that = this;
        $.get("templates/productLines.html").done(function (template) {
            $.get("templates/productLineForm.html").done(function (productLineFormTemplate) {
                that.productLinesView = new ProductLinesView({
                    template: template,
                    israCardBuild: that.israCardBuild,
                    productLineFormTemplate: productLineFormTemplate,
                    collection: new ProductLineCollection(),
                    breadcrumb: [{
                        path: '#/product-lines',
                        label: '{Literal}Product Lines{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.productLinesView.render().el);
                $('select').formSelect();
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });
    },
    
    items: function () {
        var that = this;
        $.get("templates/items.html").done(function (template) {
            $.get("templates/itemsForm.html").done(function (itemsFormTemplate) {
                that.itemsView = new ItemsView({
                    template: template,
                    itemsFormTemplate: itemsFormTemplate,
                    collection: new ItemsCollection(),
                    breadcrumb: [{
                    path: '#/items',
                    label: '{Literal}Item List{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.itemsView.render().el);
                $('select').formSelect();
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });
    },

    posUsers: function () {
        var that = this;
        $.get("templates/posUsers.html").done(function (template) {
            $.get("templates/posUserForm.html").done(function (posUserFormTemplate) {
                that.posUsersView = new POSUsersView({
                    template: template,
                    posUserFormTemplate: posUserFormTemplate,
                    collection: new POSUserCollection(),
                    breadcrumb: [{
                        path: '#/pos-users',
                        label: '{Literal}POS Users{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.posUsersView.render().el);
                $('select').formSelect();
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });
    },

    userGroups: function () {
        var that = this;
        $.get("templates/userGroups.html").done(function (template) {
            $.get("templates/userGroupForm.html").done(function (userGroupFormTemplate) {
                that.userGroupsView = new UserGroupsView({
                    template: template,
                    userGroupFormTemplate: userGroupFormTemplate,
                    collection: new UserGroupCollection(),
                    breadcrumb: [{
                        path: '#/user-groups',
                        label: '{Literal}User Groups{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.userGroupsView.render().el);
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });
    },

    companyInfo: function () {
        var that = this;
        $.get("templates/companyInfo.html").done(function (template) {
            that.companyInfoView = new CompanyInfoView({
                template: template,
                hasAccounting: that.serverInfo.hasAccounting,
                model: new CompanyInfo(),
                breadcrumb: [{
                    path: '#/company-info',
                    label: '{Literal}Company Information{/Literal}'
                }]
            });
            $('main').children().detach();
            $('main').html(that.companyInfoView.render().el);
            //$('select').formSelect();
        });
    },

    receiptSettings: function () {
        var that = this;
        $.get("templates/receiptSettings.html").done(function (template) {
            that.receiptSettingsView = new ReceiptSettingsView({
                template: template,
                model: new ReceiptSettings(),
                breadcrumb: [{
                    path: '#/receipt-settings',
                    label: '{Literal}Receipt Settings{/Literal}'
                }]
            });
            $('main').children().detach();
            $('main').html(that.receiptSettingsView.render().el);
            $('select').formSelect();
        });
    },

    tills: function () {
        var that = this;
        $.get("templates/tills.html").done(function (template) {
            $.get("templates/tillsForm.html").done(function (tillsFormTemplate) {
                that.tillsView = new TillsView({
                    template: template,
                    tillsFormTemplate: tillsFormTemplate,
                    collection: new TillsCollection(),
                    breadcrumb: [{
                        path: '#/tills',
                        label: '{Literal}Tills{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.tillsView.render().el);
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })

        });
    },

    deliScale: function () {
        var that = this;
        $.get("templates/deliScale.html").done(function (template) {
            that.deliScaleView = new DeliScaleView({
                template: template,
                model: new DeliScale(),
                breadcrumb: [{
                    path: '#/deli-scale',
                    label: '{Literal}Deli Scales{/Literal}'
                }]
            });
            $('main').children().detach();
            $('main').html(that.deliScaleView.render().el);
            //$('select').formSelect();
        });
    },

    customers: function () {
        var that = this;
        $.get("templates/customers.html").done(function (template) {
            $.get("templates/customersForm.html").done(function (customersFormTemplate) {
                that.customersView = new CustomersView({
                    template: template,
                    customersFormTemplate: customersFormTemplate,
                    collection: new CustomersCollection(),
                    israCardBuild: that.israCardBuild,
                    breadcrumb: [{
                        path: '#/customers',
                        label: '{Literal}Customers{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.customersView.render().el);
            });
        });
    },

    sales: function () {
        var that = this;
        if (this.israCardBuild) {
            $.get("templates/sales.html").done(function (template) {
                $.get("templates/salesForm.html").done(function (salesFormTemplate) {
                    that.salesView = new SalesView({
                        template: template,
                        salesFormTemplate: salesFormTemplate,
                        collection: new SalesCollection(),
    
                        breadcrumb: [{
                            path: '#/advanced-items',
                            label: 'Advanced Items'
                        }, {
                            path: '#/sales',
                            label: 'Sales & Promotions'
                        }]
                    });
                    $('main').children().detach();
                    $('main').html(that.salesView.render().el);
                    $(document).ready(function () {
                        $('.modal').modal();
                    });
                });
            });
        }
        else {
            $.get("templates/sales.html").done(function (template) {
                $.get("templates/salesForm.html").done(function (salesFormTemplate) {
                    that.salesView = new SalesView({
                        template: template,
                        salesFormTemplate: salesFormTemplate,
                        collection: new SalesCollection(),
                        breadcrumb: [{
                            path: '#/advanced-items',
                            label: 'Advanced Items'
                        }, {
                            path: '#/sales',
                            label: 'Sales & Promotions'
                        }]
                    });
                    $('main').children().detach();
                    $('main').html(that.salesView.render().el);
                    $(document).ready(function () {
                        $('.modal').modal();
                    });
                });
            });
        }
    },
      

    tenderTypes: function () {
        var that = this;
        $.get("templates/tenderTypes.html").done(function (template) {
            $.get("templates/tenderTypesForm.html").done(function (tenderTypesFormTemplate) {
                that.tenderTypesView = new TenderTypesView({
                    template: template,
                    tenderTypesFormTemplate: tenderTypesFormTemplate,
                    collection: new TenderTypesCollection(),
                    breadcrumb: [{
                        path: '#/tender-types',
                        label: '{Literal}Tender Types{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.tenderTypesView.render().el);
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });
    },

    advancedSettings: function () {
        var that = this;
        $.get("templates/advancedSettings.html").done(function (template) {
            that.advancedSettingsView = new AdvancedSettingsView({
                template: template,
                breadcrumb: [{
                    path: '#/advanced-settings',
                    label: 'Advanced Settings'
                }]
            });
            $('main').children().detach();
            $('main').html(that.advancedSettingsView.render().el);
        });
    },

    advancedItems: function () {
        var that = this;
        $.get("templates/advancedItems.html").done(function (template) {
            that.advancedItemsView = new AdvancedItemsView({
                template: template,
                breadcrumb: [{
                    path: '#/advanced-items',
                    label: 'Advanced Items'
                }]
            });
            $('main').children().detach();
            $('main').html(that.advancedItemsView.render().el);
        });
    },

    qbo: function() {
        var that = this;
        $.get("templates/qbo.html").done(function (template) {
            that.qboView = new QBOView({
                template: template,
                breadcrumb: [{
                    path: '#/qbo',
                    label: 'QuickBooks Online'
                }]
            });
            $('main').children().detach();
            $('main').html(that.qboView.render().el);
        });
    },

    clearData: function () {
        var that = this;
        if (this.israCardBuild) {
            $.get("templates/clearData.html").done(function (template) {
                that.clearDataView = new ClearDataView({
                    template: template,
                    breadcrumb: [{
                        path: '#/clear-data',
                        label: 'Clear Data'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.clearDataView.render().el);
            });
        }
        else {
            $.get("templates/clearData.html").done(function (template) {
                that.clearDataView = new ClearDataView({
                    template: template,
                    breadcrumb: [{
                        path: '#/clear-data',
                        label: 'Clear Data'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.clearDataView.render().el);
            });
        }
    },

    backupRestore: function () {
        var that = this;
        if (this.israCardBuild) {
            $.get("templates/backupRestore.html").done(function (template) {
                that.backupRestoreView = new BackupRestoreView({
                    template: template,
                    model: new Backup(),
                    breadcrumb: [{
                        path: '#/backup-restore',
                        label: 'Backup / Restore'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.backupRestoreView.render().el);
            }); 
        }
        else {
            $.get("templates/backupRestore.html").done(function (template) {
                that.backupRestoreView = new BackupRestoreView({
                    template: template,
                    model: new Backup(),
                    breadcrumb: [{
                        path: '#/backup-restore',
                        label: 'Backup / Restore'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.backupRestoreView.render().el);
            });
        }
    },

    groupItems: function () {
        var that = this;
        if (this.israCardBuild) {
            $.get("templates/groupItems.html").done(function (template) {
                $.get("templates/groupItemsForm.html").done(function (groupItemsFormTemplate) {
                    that.groupItemsView = new GroupItemsView({
                        template: template,
                        groupItemsFormTemplate: groupItemsFormTemplate,
                        collection: new GroupItemsCollection(),
                        breadcrumb: [{
                            path: '#/advanced-items',
                            label: 'Advanced Items'
                        }, {
                            path: '#/group-items',
                            label: 'Group Items'
                        }]
                    });
                    $('main').children().detach();
                    $('main').html(that.groupItemsView.render().el);
                    $(document).ready(function () {
                        $('.modal').modal();
                    });
                })
            });
        }
        else {
            $.get("templates/groupItems.html").done(function (template) {
                $.get("templates/groupItemsForm.html").done(function (groupItemsFormTemplate) {
                    that.groupItemsView = new GroupItemsView({
                        template: template,
                        groupItemsFormTemplate: groupItemsFormTemplate,
                        collection: new GroupItemsCollection(),
                        breadcrumb: [{
                            path: '#/advanced-items',
                            label: 'Advanced Items'
                        }, {
                            path: '#/group-items',
                            label: 'Group Items'
                        }]
                    });
                    $('main').children().detach();
                    $('main').html(that.groupItemsView.render().el);
                    $(document).ready(function () {
                        $('.modal').modal();
                    });
                })
            });
        }
    },

    taxes: function () {
        var that = this;
        $.get("templates/taxes.html").done(function (template) {
            $.get("templates/taxesForm.html").done(function (taxesFormTemplate) {
                that.taxesView = new TaxesView({
                    template: template,
                    taxesFormTemplate: taxesFormTemplate,
                    collection: new TaxesCollection(),
                    breadcrumb: [{
                        path: '#/taxes',
                        label: 'VAT Taxes'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.taxesView.render().el);
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });
    },

    salesTaxes: function () {
        var that = this;
        $.get("templates/salesTaxes.html").done(function (template) {
            $.get("templates/salesTaxesForm.html").done(function (salesTaxesFormTemplate) {
                that.salesTaxesView = new SalesTaxesView({
                    template: template,
                    salesTaxesFormTemplate: salesTaxesFormTemplate,
                    collection: new SalesTaxesCollection(),
                    breadcrumb: [{
                        path: '#/sales-taxes',
                        label: 'Sales Taxes'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.salesTaxesView.render().el);
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });
    },
 
    inventory: function () {
        var that = this;

        $.get("templates/inventory.html").done(function (template) {
            $.get("templates/inventoryForm.html").done(function (inventoryFormTemplate) {
                that.inventoryView = new InventoryView({
                    template: template,
                    inventoryFormTemplate: inventoryFormTemplate,
                    collection: new InventoryCollection(),
                    breadcrumb: [{
                        path: '#/advanced-items',
                        label: 'Advanced Items'
                    }, {
                        path: '#/inventory',
                        label: '{Literal}Inventory-Receive{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.inventoryView.render().el);
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });
        
    },

    inventoryAdjustments: function () {
        var that = this;
        if (this.israCardBuild) {
            $.get("templates/inventoryAdjustments.html").done(function (template) {
                $.get("templates/inventoryAdjustmentsForm.html").done(function (inventoryAdjustmentsFormTemplate) {
                    that.inventoryAdjustmentsView = new InventoryAdjustmentsView({
                        template: template,
                        inventoryAdjustmentsFormTemplate: inventoryAdjustmentsFormTemplate,
                        collection: new InventoryAdjustmentsCollection(),
                        breadcrumb: [{
                            path: '#/advanced-items',
                            label: 'Advanced Items'
                        }, {
                            path: '#/advanced-items',
                            label: '{Literal}Advanced Items{/Literal}'
                        }]
                    });
                    $('main').children().detach();
                    $('main').html(that.inventoryAdjustmentsView.render().el);
                    $(document).ready(function () {
                        $('.modal').modal();
                    });
                })
            });
        }
        else {
            $.get("templates/inventoryAdjustments.html").done(function (template) {
                $.get("templates/inventoryAdjustmentsForm.html").done(function (inventoryAdjustmentsFormTemplate) {
                    that.inventoryAdjustmentsView = new InventoryAdjustmentsView({
                        template: template,
                        inventoryAdjustmentsFormTemplate: inventoryAdjustmentsFormTemplate,
                        collection: new InventoryAdjustmentsCollection(),
                        breadcrumb: [{
                            path: '#/advanced-items',
                            label: 'Advanced Items'
                        }, {
                            path: '#/inventory-adjustments',
                            label: '{Literal}Inventory-Adjust{/Literal}'
                        }]
                    });
                    $('main').children().detach();
                    $('main').html(that.inventoryAdjustmentsView.render().el);
                    $(document).ready(function () {
                        $('.modal').modal();
                    });
                })
            });
        }
    },

    reports: function () {
        var that = this;
        $.get("templates/reports.html").done(function (reportsTemplate) {
            $.get("templates/sequenceTiles.html").done(function (sequenceTilesTemplate) {
                that.reportsView = new ReportsView({
                    template: reportsTemplate,
                    sequenceTilesTemplate: sequenceTilesTemplate,
                    sequenceTilesView: new SequenceTilesView({
                        template: sequenceTilesTemplate,
                        collection: new SequenceCollection()
                    }),
                    breadcrumb: [{
                        path: '#/reports',
                        label: '{Literal}Generate Reports{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.reportsView.render().el);
                $('select').formSelect();

                $(document).ready(function () {
                    $('.modal').modal();
                });
            });
        });
    },

    logIn: function () {
        var that = this;
        $.get("templates/logIn.html").done(function (template) {
            that.logInView = new LogInView({
                israCardBuild: that.israCardBuild,
                template: template,
                model: new LogIn(),
                breadcrumb: [{
                    path: '#/log-in',
                    label: '{Literal}Log In{/Literal}'
                }]
            });
            $('main').children().detach();
            $('main').html(that.logInView.render().el);
        });
    },

    dashboard: function () {
        var that = this;
        $.get("templates/dashboard.html").done(function (template) {
            that.dashboardView = new DashboardView({
                template: template,
                model: new Dashboard(),
                breadcrumb: [{
                    path: '#/dashboard',
                    label: '{Literal}Dashboard{/Literal}'
                }]
            });
            $('main').children().detach();
            $('main').html(that.dashboardView.render().el);
        });
    },

    cardSetup: function () {
        var that = this;
        $.get("templates/cardSetup.html").done(function (template) {
            that.cardSetupView = new CardSetupView({
                template: template,
                model: new CardSetup(),
                breadcrumb: [{
                    path: '#/card-setup',
                    label: '{Literal}Cards & Merchant Services{/Literal}'
                }]
            });
            $('main').children().detach();
            $('main').html(that.cardSetupView.render().el);
            //$('select').formSelect();
        });
    },

    integrations: function () {
        var that = this;
        $.get("templates/integrations.html").done(function (template) {
            that.integrationsView = new IntegrationsView({
                template: template,
                model: new Integrations(),
                breadcrumb: [{
                    path: '#/integrations',
                    label: '{Literal}Integrations{/Literal}'
                }]
            });
            $('main').children().detach();
            $('main').html(that.integrationsView.render().el);
            //$('select').formSelect();
        });
    },

    importExport: function () {
        var that = this;
        $.get("templates/importExport.html").done(function (template) {
            $.get("templates/sequenceTiles.html").done(function (sequenceTilesTemplate) {
                that.importExportView = new ImportExportView({
                    template: template,
                    sequenceTilesTemplate: sequenceTilesTemplate,
                    sequenceTilesView: new SequenceTilesView({
                        template: sequenceTilesTemplate,
                        collection: new SequenceCollection()
                    }),
                    breadcrumb: [{
                        path: '#/import-export',
                        label: 'Import/Export'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.importExportView.render().el);
            });
        });
    },

    compReasons: function () {
        var that = this;
        $.get("templates/compReasons.html").done(function (template) {
            $.get("templates/compReasonsForm.html").done(function (compReasonsFormTemplate) {
                that.compReasonsView = new CompReasonsView({
                    template: template,
                    compReasonsFormTemplate: compReasonsFormTemplate,
                    collection: new CompReasonsCollection(),
                    breadcrumb: [{
                        path: '#/comp-reasons',
                        label: '{Literal}Comp Reasons{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.compReasonsView.render().el);
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });
    },

    alternativeTaxes: function () {
        var that = this;
        $.get("templates/alternativeTaxes.html").done(function (template) {
            $.get("templates/alternativeTaxesForm.html").done(function (alternativeTaxesFormTemplate) {
                that.alternativeTaxesView = new AlternativeTaxesView({
                    template: template,
                    alternativeTaxesFormTemplate: alternativeTaxesFormTemplate,
                    collection: new AlternativeTaxesCollection(),
                    breadcrumb: [{
                        path: '#alternative-taxes',
                        label: '{Literal}Alternative Taxes{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.alternativeTaxesView.render().el);
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });
    },

    priceLevelTimes: function () {
        var that = this;
        $.get("templates/priceLevelTimes.html").done(function (template) {
            $.get("templates/priceLevelTimesForm.html").done(function (priceLevelTimesFormTemplate) {
                that.priceLevelTimesView = new PriceLevelTimesView({
                    template: template,
                    priceLevelTimesFormTemplate: priceLevelTimesFormTemplate,
                    collection: new PriceLevelTimesCollection(),
                    breadcrumb: [{
                        path: '#/advanced-items',
                        label: 'Advanced Items'
                    }, {
                        path: '#price-level-times',
                        label: '{Literal}Price Level Times{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.priceLevelTimesView.render().el);
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });
    },

    followOn: function () {
        var that = this;
        $.get("templates/followOn.html").done(function (template) {
            $.get("templates/followOnForm.html").done(function (followOnFormTemplate) {
                that.followOnView = new FollowOnView({
                    template: template,
                    followOnFormTemplate: followOnFormTemplate,
                    collection: new FollowOnCollection(),
                    breadcrumb: [{
                        path: '#/advanced-items',
                        label: 'Advanced Items'
                    }, {
                        path: '#follow-on',
                        label: '{Literal}Follow On Items{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.followOnView.render().el);
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });
    },

    operatorMessages: function () {
        var that = this;
        $.get("templates/operatorMessages.html").done(function (template) {
            $.get("templates/operatorMessagesForm.html").done(function (operatorMessagesFormTemplate) {
                that.operatorMessagesView = new OperatorMessagesView({
                    template: template,
                    operatorMessagesFormTemplate: operatorMessagesFormTemplate,
                    collection: new OperatorMessagesCollection(),
                    breadcrumb: [{
                        path: '#/advanced-items',
                        label: 'Advanced Items'
                    }, {
                        path: '#operator-messages',
                        label: '{Literal}Opertator Messages{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.operatorMessagesView.render().el);
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });
    },

    noPartial: function () {
        var that = this;
        $.get("templates/noPartial.html").done(function (template) {
            that.noPartialView = new NoPartialView({
                template: template,
                collection: new NoPartialCollection(),
                breadcrumb: [{
                    path: '#/advanced-items',
                    label: 'Advanced Items'
                }, {
                    path: '#/no-partial',
                    label: '{Literal}No Partial Quantities{/Literal}'
                }]
            });
            $('main').children().detach();
            $('main').html(that.noPartialView.render().el);
            //$('select').formSelect();
        });
    },

    barcode: function () {
        var that = this;
        $.get("templates/barcode.html").done(function (template) {
            that.barcodeView = new BarcodeView({
                template: template,
                collection: new BarcodeCollection(),
                breadcrumb: [{
                    path: '#/advanced-items',
                    label: 'Advanced Items'
                }, {
                    path: '#/barcode',
                    label: '{Literal}Barcode Labels{/Literal}'
                }]
            });
            $('main').children().detach();
            $('main').html(that.barcodeView.render().el);
            $('select').formSelect();
        });
    },

    snapEBT: function () {
        var that = this;
        $.get("templates/snapEBT.html").done(function (template) {
            that.snapEBTView = new SnapEBTView({
                template: template,
                collection: new SnapEBTCollection(),
                breadcrumb: [{
                    path: '#/snap-ebt',
                    label: '{Literal}SNAP / EBT{/Literal}'
                }]
            });
            $('main').children().detach();
            $('main').html(that.snapEBTView.render().el);
        });
    },

    customerTerms: function () {
        var that = this;
        $.get("templates/customerTerms.html").done(function (template) {
            $.get("templates/customerTermsForm.html").done(function (customerTermsFormTemplate) {
                that.customerTermsView = new CustomerTermsView({
                    template: template,
                    customerTermsFormTemplate: customerTermsFormTemplate,
                    collection: new CustomerTermsCollection(),
                    breadcrumb: [{
                        path: '#/customer-terms',
                        label: '{Literal}Customer Account Terms{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.customerTermsView.render().el);
            })
        });
    },

    unitsOfMeasure: function () {
        var that = this;
        $.get("templates/unitsOfMeasure.html").done(function (template) {
            $.get("templates/unitsOfMeasureForm.html").done(function (unitsOfMeasureFormTemplate) {
                that.unitsOfMeasuresView = new UnitsOfMeasureView({
                    template: template,
                    unitsOfMeasureFormTemplate: unitsOfMeasureFormTemplate,
                    collection: new UnitsOfMeasureCollection(),
                    breadcrumb: [{
                        path: '#/advanced-items',
                        label: 'Advanced Items'
                    }, {
                        path: '#/units-of-measure',
                        label: '{Literal}Units of Measure{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.unitsOfMeasuresView.render().el);
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });
    },

    payTypes: function () {
        var that = this;
        $.get("templates/payTypes.html").done(function (template) {
            $.get("templates/payTypesForm.html").done(function (payTypesFormTemplate) {
                that.payTypesView = new PayTypesView({
                    template: template,
                    payTypesFormTemplate: payTypesFormTemplate,
                    collection: new PayTypesCollection(),
                    breadcrumb: [{
                        path: '#/pay-types',
                        label: '{Literal}Add/Edit Pay Types{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.payTypesView.render().el);
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });
    },

    payPeriod: function () {
        var that = this;
        $.get("templates/payPeriod.html").done(function (template) {
            $.get("templates/payPeriodForm.html").done(function (payPeriodsFormTemplate) {
                that.payPeriodsView = new PayPeriodsView({
                    template: template,
                    payPeriodsFormTemplate: payPeriodsFormTemplate,
                    collection: new PayPeriodsCollection(),
                    breadcrumb: [{
                        path: '#/pay-period',
                        label: '{Literal}View/Edit Pay Periods{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.payPeriodsView.render().el);
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });
    },

    recipes: function () {
        var that = this;
        $.get("templates/recipes.html").done(function (template) {
            $.get("templates/recipesForm.html").done(function (recipesFormTemplate) {
                that.recipesView = new RecipesView({
                    template: template,
                    recipesFormTemplate: recipesFormTemplate,
                    collection: new RecipesCollection(),
                    breadcrumb: [{
                        path: '#/advanced-items',
                        label: 'Advanced Items'
                    }, {
                        path: '#/recipes',
                        label: '{Literal}Item Recipes{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.recipesView.render().el);
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });
    },
    
    flexGroups: function () {
        var that = this;
        $.get("templates/flexGroups.html").done(function (template) {
            $.get("templates/flexGroupsForm.html").done(function (flexGroupsFormTemplate) {
                that.flexGroupsView = new FlexGroupsView({
                    template: template,
                    flexGroupsFormTemplate: flexGroupsFormTemplate,
                    collection: new FlexGroupsCollection(),
                    breadcrumb: [{
                        path: '#/advanced-items',
                        label: 'Advanced Items'
                    }, {
                        path: '#flex-groups',
                        label: '{Literal}Flex Group Items{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.flexGroupsView.render().el);
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });
    },

    employees: function () {
        var that = this;
        $.get("templates/employees.html").done(function (template) {
            $.get("templates/employeesForm.html").done(function (employeesFormTemplate) {
                that.employeesView = new EmployeesView({
                    template: template,
                    employeesFormTemplate: employeesFormTemplate,
                    collection: new EmployeeCollection(),
                    breadcrumb: [{
                        path: '#employees',
                        label: '{Literal}Employees{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.employeesView.render().el);
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });
    },

    breaks: function () {
        var that = this;
        $.get("templates/breaks.html").done(function (template) {
            $.get("templates/breaksForm.html").done(function (breaksFormTemplate) {
                that.breaksView = new BreaksView({
                    template: template,
                    breaksFormTemplate: breaksFormTemplate,
                    collection: new BreaksCollection(),
                    breadcrumb: [{
                        path: '#/breaks',
                        label: '{Literal}Breaks{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.breaksView.render().el);
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });
    },

    eConduit: function () {
        var that = this;
        $.get("templates/eConduit.html").done(function (template) {
            $.get("templates/eConduitForm.html").done(function (eConduitFormTemplate) {
                that.eConduitView = new EConduitView({
                    template: template,
                    eConduitFormTemplate: eConduitFormTemplate,
                    collection: new EConduitCollection(),
                    breadcrumb: [{
                        path: '#/eConduit',
                        label: '{Literal}eConduit Setup{/Literal}'
                    }]
                });
                $('main').children().detach();
                $('main').html(that.eConduitView.render().el);
                $(document).ready(function () {
                    $('.modal').modal();
                });
            })
        });  
    }
});

App = new AppRouter();
$(function () {
    if (!Backbone.history.start()) App.trigger('404');
});