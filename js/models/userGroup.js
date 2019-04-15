var UserGroup = Backbone.Model.extend({

    defaults: {
        id: '',
        name: '',
        posPermissions: {
            allowSplittingChecks: {
                allowed: false,
                name: "Allow Splitting Checks"
            },
            cancelSales: {
                allowed: false,
                name: "Cancel sales"
            },
            changeItemDescriptions: {
                allowed: false,
                name: "Change Item Descriptions"
            },
            changePrices: {
                allowed: false,
                name: "Change Prices"
            },
            changeServer: {
                allowed: false,
                name: "Change Server"
            },
            changeSalesRep: {
                allowed: false,
                name: "Change Sales Rep"
            },
            editReopenedOrders: {
                allowed: false,
                name: "Edit Reopened Orders"
            },
            editPointOfSaleProgram: {
                allowed: false,
                name: "Edit Point Of Sale Program"
            },
            exitPointOfSaleProgram: {
                allowed: false,
                name: "Exit Point of Sale Program"
            },
            loadAllOrders: {
                allowed: false,
                name: "Load All Orders"
            },
            logInTillInUse: {
                allowed: false,
                name: "Log in till in use"
            },
            makeRefund: {
                allowed: false,
                name: "Make Refund"
            },
            makeReturns: {
                allowed: false,
                name: "Make Returns"
            },
            makeSales: {
                allowed: false,
                name: "Make Sales"
            },
            makeVoids: {
                allowed: false,
                name: "Make Voids"
            },
            noSale: {
                allowed: false,
                name: "No Sale"
            },
            overrideCreditLimit: {
                allowed: false,
                name: "Override Credit Limit"
            },
            overrideRequiredGuestCount: {
                allowed: false,
                name: "Override Required Guest Count"
            },
            readCashTills: {
                allowed: false,
                name: "Read Cash Tills"
            },
            reopenClosedSales: {
                allowed: false,
                name: "Reopen Closed Sales"
            },
            resetCashTills: {
                allowed: false,
                name: "Reset Cash Tills"
            },
            resetCurrentTill: {
                allowed: false,
                name: "Reset Current Till"
            }
        },
        managementPermissions: {
            accushiftManagement: {
                allowed: false,
                name: "AccuShift Management"
            },
            addDeleteItems: {
                allowed: false,
                name: "Add/Delete Items"
            },
            addEditCashTills: {
                allowed: false,
                name: "Add/Edit Cash Tills"
            },
            addEditTaxingAuthorities: {
                allowed: false,
                name: "Add/Edit Taxing Authorities"
            },
            addEditUserGroups: {
                allowed: false,
                name: "Add/Edit User Groups"
            },
            addEditUsers: {
                allowed: false,
                name: "Add/Edit Users"
            },
            adjustInventory: {
                allowed: false,
                name: "Adjust Inventory"
            },
            cardsMerchantSetup: {
                allowed: false,
                name: "Cards/Merchant Setup"
            },
            changeCurrencyConversionRate: {
                allowed: false,
                name: "Change Currency Conversion Rate"
            },
            changeCustomerInformation: {
                allowed: false,
                name: "Change Customer Information"
            },
            changeItems: {
                allowed: false,
                name: "Change Items"
            },
            changeSystemSettings: {
                allowed: false,
                name: "Change System Settings"
            },
            clearCashTills: {
                allowed: false,
                name: "Clear Cash Tills"
            },
            clearDataFiles: {
                allowed: false,
                name: "Clear Data Files"
            },
            exportFiles: {
                allowed: false,
                name: "Export Files"
            },
            foodServiceComps: {
                allowed: false,
                name: "Food Service Comps"
            },
            importFiles: {
                allowed: false,
                name: "Import Files"
            },
            manage: {
                allowed: false,
                name: "Manage"
            },
            readCashTills: {
                allowed: false,
                name: "Read Cash Tills"
            },
            receiveInventory: {
                allowed: false,
                name: "Receive Inventory"
            },
            resetCashTills: {
                allowed: false,
                name: "Reset Cash Tills"
            },
            resetCurrentTill: {
                allowed: false,
                name: "Reset Current Till"
            },
            settleCreditCardBatches: {
                allowed: false,
                name: "Settle Credit Card Batches"
            },
            isracardDashboard: {
                allowed: false,
                name: "IsraCard Dashboard"
            }
        }
    }
});