var PosKeysView = Backbone.View.extend({
    breadcrumb: {},
    gridSizeRows: 11,
    gridSizeCols: 7,
    occupiedCells: {},
    prefilledUnoccupiedCells: false,
    chosenKey: {},
    chosenKeyId: '',
    currentKeySet: '',
    itemsStyleMapping: {},
    itemMapping: {},

    pages: [],
    keySet: [],

    events: {
        'keyup #itemSearch': 'searchItemBySearchTerm',

        'mouseup .grid-stack-item-content': 'showMenu',
        'click .edit-modal-trigger': 'openEditModal',
        'click .delete-modal-trigger': 'openDeleteModal',
        'click #deleteKey': 'deleteKey',
        'contextmenu .grid-stack' : 'createNew',
        'click .addKeyButton' : 'createNew',

        'click #itemCard' : 'showItems',
        'click #pageCard' : 'showPages',
        'click #labelCard' : 'showLabelPage',
        'click #priceLevelCard' : 'showPriceLevel',
        'click #changeKeySetCard' : 'showKeySetPage',
        'click #tareCard' : 'showTare',
        'click #saleDiscountCard' : 'showSaleDiscount',
        'click #itemDiscountCard' : 'showItemDiscount',

        'change #page-selector' : 'changePage',
        'change #key-set-selector' : 'changeKeySet',

        'click #editPageName': 'openEditNameModal',
        'click #addKeySetButton': 'openAddKeySetModal',
        'click .save-menu-page-button' : 'saveNewMenuPage',
        'click #addPageButton' : 'addNewPage',
        'click .save-new-page-button' : 'saveNewPage',
        'click .save-page-name-button' : 'savePageName',
        'click .save-key-button' : 'saveEditedKey',
        'click .save-keys-button' : 'saveKeys',
        'click .save-key-set-button1': 'addKeySet',
        //'click .delete-page-trigger': 'openDeletePageModal',
        //'click #delete-page-button': 'deletePage',

        'click .pagesCards' : 'choosePageCard',
        'click .save-label-button' : 'choosePageLabel',
        'click .save-tare-button' : 'chooseTareLabel',
        'click .save-sale-reprice-button' : 'chooseRepriceLabel',
        'click .save-price-level-button' : 'choosePriceLevel',
        'click .save-key-set-button' : 'chooseKeysetCards',
        'click .save-item-button' : 'chooseItemCard',
        'click .save-item-discount-button' : 'chooseItemDiscount',

        'click .cancel-key-set-button1' : 'closeNewModals',
        'click .cancel-new-page-button' : 'closeNewModals',
        'click .cancel-items-button' : 'closeNewModals',
        'click .cancel-pages-button' : 'closeNewModals',
        'click .cancel-label-button' : 'closeNewModals',
        'click .cancel-price-level-button' : 'closeNewModals',
        'click .cancel-key-set-button' : 'closeNewModals',
        'click .cancel-tare-button' : 'closeNewModals',
        'click .cancel-item-discount-button' : 'closeNewModals',
        'click .cancel-sale-reprice-button' : 'closeNewModals'

    },

    dataChangedAndNotSaved: false,

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;
        this.posKeyFormTemplate = options.posKeyFormTemplate;
        this.model = options.model;
        //this.getItemKeys();
        this.getKeySet();
    },

    showItems: function () {
        var itemFormModal = this.$el.find('#item-form-modal').modal();
        itemFormModal.modal('open');
    },

    showPages: function () {
        var pageModal = this.$el.find('#page-form-modal').modal();
        pageModal.modal('open');
    },

    showLabelPage: function () {
        var modal = this.$el.find('#label-form-modal').modal();
        modal.modal('open');
    },

    showPriceLevel: function () {
        var modal = this.$el.find('#price-level-form-modal').modal();
        modal.modal('open');
        $('select').formSelect();
    },

    showKeySetPage: function () {
        var modal = this.$el.find('#key-set-form-modal').modal();
        modal.modal('open');
    },

    showTare: function () {
        var modal = this.$el.find('#tare-form-modal').modal();
        modal.modal('open');
    },

    showSaleDiscount: function () {
        var modal = this.$el.find('#sale-reprice-form-modal').modal();
        modal.modal('open');
    },

    showItemDiscount: function () {
        var modal = this.$el.find('#item-discount-form-modal').modal();
        modal.modal('open');
    },

    createNew: function (e) {
        e.preventDefault();
        var target = e.target;
        var that = this;

        this.currentKeySet = this.$el.find('#key-set-selector option:selected').text();
        if (this.currentKeySet == "MAIN" || this.currentKeySet == "ראשי" ) {
            this.currentKeySet = "";
        }

        this.currentPage = this.$el.find('#page-selector option:selected').text();

        if (target.classList.length < 3){
            that.formModal = that.$el.find('#pos-key-form-modal').modal();
            that.formModal.modal('open');
            $('#item-form-modal').hide();
            $('#page-form-modal').hide();
            $('#label-form-modal').hide();
            $('#price-level-form-modal').hide();
            $('#key-set-form-modal').hide();
            $('#tare-form-modal').hide();
            $('#sale-reprice-form-modal').hide();
            $('#item-discount-form-modal').hide();

            var newKeySetName = document.getElementById('newKeySetName');
            newKeySetName.value = "";
            var newPageName = document.getElementById('newPageName');
            newPageName.value = "";
            var itemSearch = document.getElementById('itemSearch');
            itemSearch.value = "";
            var itemText = document.getElementById('itemText');
            itemText.value = "";
            var label = document.getElementById('label');
            label.value = "";
            var priceLevelText = document.getElementById('priceLevelText');
            priceLevelText.value = "";
            var keySetText = document.getElementById('keySetText');
            keySetText.value = "";
            var tareText = document.getElementById('tareText');
            tareText.value = "";
            var tareWeight = document.getElementById('tareWeight');
            tareWeight.value = "";
            var saleRepriceText = document.getElementById('saleRepriceText');
            saleRepriceText.value = "";
            var saleRepricePercent = document.getElementById('saleRepricePercent');
            saleRepricePercent.value = "";
            var itemDiscountTextForm = document.getElementById('itemDiscountTextForm');
            itemDiscountTextForm.value = "";
            var itemDiscountPercent = document.getElementById('itemDiscountPercent');
            itemDiscountPercent.value = "";
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

    getItemKeys: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-menu-keys',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.items = data.results;
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}Problem fetching Item Keys{/Literal}' });
                }
            }
        });
    },
    
    openEditModal: function (e) {
        var that = this;
        var page = this.$el.find('#page-selector option:selected').text(); 
        var keySet = this.$el.find('#key-set-selector option:selected').text();
        if (keySet == "MAIN" || keySet == "ראשי") {
            keySet = "";
        }

        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].id == this.chosenKeyId && this.items[i].keysetName == keySet)
            {
                if (this.items[i].page == page) {
                    this.chosenKey = this.items[i];
                    break;
                }
                else if (this.items[i].page == "TOP") {
                    this.chosenKey = this.items[i];
                    break;
                }
            }
        }

        $('#itemForm').hide();
        $('#pageForm').hide();
        $('#percentForm').hide();
        $('#priceLevelForm').hide();
        $('#tareForm').hide();
        $('#keysetForm').hide();
        $('#itemDiscountForm').hide();

        if (this.chosenKey.type == "Item") {
            var itemVal = document.getElementById('itemButtonText');
            itemVal.value = this.chosenKey.name;

            document.getElementById('itemId').value = this.chosenKey.id;

            if (this.chosenKey.cr) {
                $('.cr').prop('checked', true);
            }
            else {
                $('.cr').prop('checked', false);
            }

            if (this.chosenKey.noRepeat) {
                $('.noRepeat').prop('checked', true);
            }
            else {
                $('.noRepeat').prop('checked', false);
            }

            if (this.chosenKey.imageName == "posBtn01") {
                $('#itemBlue').prop('checked', false);
                $('#itemGray').prop('checked', true);
                $('#itemGreen').prop('checked', false);
                $('#itemOrange').prop('checked', false);
                $('#itemPink').prop('checked', false);
                $('#itemPurple').prop('checked', false);
                $('#itemRed').prop('checked', false);
                $('#itemTeal').prop('checked', false);
                $('#itemYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn02") {
                $('#itemBlue').prop('checked', false);
                $('#itemGray').prop('checked', false);
                $('#itemGreen').prop('checked', false);
                $('#itemOrange').prop('checked', false);
                $('#itemPink').prop('checked', false);
                $('#itemPurple').prop('checked', false);
                $('#itemRed').prop('checked', false);
                $('#itemTeal').prop('checked', true);
                $('#itemYellow').prop('checked', false);

            }
            else if (this.chosenKey.imageName == "posBtn03") {
                $('#itemBlue').prop('checked', false);
                $('#itemGray').prop('checked', false);
                $('#itemGreen').prop('checked', true);
                $('#itemOrange').prop('checked', false);
                $('#itemPink').prop('checked', false);
                $('#itemPurple').prop('checked', false);
                $('#itemRed').prop('checked', false);
                $('#itemTeal').prop('checked', false);
                $('#itemYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn04") {
                $('#itemBlue').prop('checked', false);
                $('#itemGray').prop('checked', false);
                $('#itemGreen').prop('checked', false);
                $('#itemOrange').prop('checked', false);
                $('#itemPink').prop('checked', false);
                $('#itemPurple').prop('checked', false);
                $('#itemRed').prop('checked', false);
                $('#itemTeal').prop('checked', false);
                $('#itemYellow').prop('checked', true);
            }
            else if (this.chosenKey.imageName == "posBtn05") {
                $('#itemBlue').prop('checked', false);
                $('#itemGray').prop('checked', false);
                $('#itemGreen').prop('checked', false);
                $('#itemOrange').prop('checked', false);
                $('#itemPink').prop('checked', false);
                $('#itemPurple').prop('checked', false);
                $('#itemRed').prop('checked', true);
                $('#itemTeal').prop('checked', false);
                $('#itemYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn06") {
                $('#itemBlue').prop('checked', false);
                $('#itemGray').prop('checked', false);
                $('#itemGreen').prop('checked', false);
                $('#itemOrange').prop('checked', false);
                $('#itemPink').prop('checked', true);
                $('#itemPurple').prop('checked', false);
                $('#itemRed').prop('checked', false);
                $('#itemTeal').prop('checked', false);
                $('#itemYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn07") {
                $('#itemBlue').prop('checked', false);
                $('#itemGray').prop('checked', false);
                $('#itemGreen').prop('checked', false);
                $('#itemOrange').prop('checked', false);
                $('#itemPink').prop('checked', false);
                $('#itemPurple').prop('checked', true);
                $('#itemRed').prop('checked', false);
                $('#itemTeal').prop('checked', false);
                $('#itemYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn08") {
                $('#itemBlue').prop('checked', true);
                $('#itemGray').prop('checked', false);
                $('#itemGreen').prop('checked', false);
                $('#itemOrange').prop('checked', false);
                $('#itemPink').prop('checked', false);
                $('#itemPurple').prop('checked', false);
                $('#itemRed').prop('checked', false);
                $('#itemTeal').prop('checked', false);
                $('#itemYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn09") {
                $('#itemBlue').prop('checked', false);
                $('#itemGray').prop('checked', false);
                $('#itemGreen').prop('checked', false);
                $('#itemOrange').prop('checked', true);
                $('#itemPink').prop('checked', false);
                $('#itemPurple').prop('checked', false);
                $('#itemRed').prop('checked', false);
                $('#itemTeal').prop('checked', false);
                $('#itemYellow').prop('checked', false);
            }

            this.editModal.modal('open');
            $('#itemForm').show();
        }
        
        else if (this.chosenKey.type == "Page") {

            var pageButtonText = document.getElementById('pageButtonText');
            pageButtonText.value = this.chosenKey.name;

            document.getElementById('pageId').value = this.chosenKey.id;

            if (this.chosenKey.imageName == "posBtn01") {
                $('#pageBlue').prop('checked', false);
                $('#pageGray').prop('checked', true);
                $('#pageGreen').prop('checked', false);
                $('#pageOrange').prop('checked', false);
                $('#pagePink').prop('checked', false);
                $('#pagePurple').prop('checked', false);
                $('#pageRed').prop('checked', false);
                $('#pageTeal').prop('checked', false);
                $('#pageYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn02") {
                $('#pageBlue').prop('checked', false);
                $('#pageGray').prop('checked', false);
                $('#pageGreen').prop('checked', false);
                $('#pageOrange').prop('checked', false);
                $('#pagePink').prop('checked', false);
                $('#pagePurple').prop('checked', false);
                $('#pageRed').prop('checked', false);
                $('#pageTeal').prop('checked', true);
                $('#pageYellow').prop('checked', false);

            }
            else if (this.chosenKey.imageName == "posBtn03") {
                $('#pageBlue').prop('checked', false);
                $('#pageGray').prop('checked', false);
                $('#pageGreen').prop('checked', true);
                $('#pageOrange').prop('checked', false);
                $('#pagePink').prop('checked', false);
                $('#pagePurple').prop('checked', false);
                $('#pageRed').prop('checked', false);
                $('#pageTeal').prop('checked', false);
                $('#pageYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn04") {
                $('#pageBlue').prop('checked', false);
                $('#pageGray').prop('checked', false);
                $('#pageGreen').prop('checked', false);
                $('#pageOrange').prop('checked', false);
                $('#pagePink').prop('checked', false);
                $('#pagePurple').prop('checked', false);
                $('#pageRed').prop('checked', false);
                $('#pageTeal').prop('checked', false);
                $('#pageYellow').prop('checked', true);
            }
            else if (this.chosenKey.imageName == "posBtn05") {
                $('#pageBlue').prop('checked', false);
                $('#pageGray').prop('checked', false);
                $('#pageGreen').prop('checked', false);
                $('#pageOrange').prop('checked', false);
                $('#pagePink').prop('checked', false);
                $('#pagePurple').prop('checked', false);
                $('#pageRed').prop('checked', true);
                $('#pageTeal').prop('checked', false);
                $('#pageYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn06") {
                $('#pageBlue').prop('checked', false);
                $('#pageGray').prop('checked', false);
                $('#pageGreen').prop('checked', false);
                $('#pageOrange').prop('checked', false);
                $('#pagePink').prop('checked', true);
                $('#pagePurple').prop('checked', false);
                $('#pageRed').prop('checked', false);
                $('#pageTeal').prop('checked', false);
                $('#pageYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn07") {
                $('#pageBlue').prop('checked', false);
                $('#pageGray').prop('checked', false);
                $('#pageGreen').prop('checked', false);
                $('#pageOrange').prop('checked', false);
                $('#pagePink').prop('checked', false);
                $('#pagePurple').prop('checked', true);
                $('#pageRed').prop('checked', false);
                $('#pageTeal').prop('checked', false);
                $('#pageYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn08") {
                $('#pageBlue').prop('checked', true);
                $('#pageGray').prop('checked', false);
                $('#pageGreen').prop('checked', false);
                $('#pageOrange').prop('checked', false);
                $('#pagePink').prop('checked', false);
                $('#pagePurple').prop('checked', false);
                $('#pageRed').prop('checked', false);
                $('#pageTeal').prop('checked', false);
                $('#pageYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn09") {
                $('#pageBlue').prop('checked', false);
                $('#pageGray').prop('checked', false);
                $('#pageGreen').prop('checked', false);
                $('#pageOrange').prop('checked', true);
                $('#pagePink').prop('checked', false);
                $('#pagePurple').prop('checked', false);
                $('#pageRed').prop('checked', false);
                $('#pageTeal').prop('checked', false);
                $('#pageYellow').prop('checked', false);
            }

            this.editModal.modal('open');
            $('#pageForm').show();
        }
        else if (this.chosenKey.type == "SaleDiscount") {

            var percentButtonText = document.getElementById('percentButtonText');
            percentButtonText.value = this.chosenKey.name;

            var discountPercent = document.getElementById('discountPercent');
            discountPercent.value = this.chosenKey.text;

            document.getElementById('discountPercentId').value = this.chosenKey.id;

            if (this.chosenKey.imageName == "posBtn01") {
                $('#percentBlue').prop('checked', false);
                $('#percentGray').prop('checked', true);
                $('#percentGreen').prop('checked', false);
                $('#percentOrange').prop('checked', false);
                $('#percentPink').prop('checked', false);
                $('#percentPurple').prop('checked', false);
                $('#percentRed').prop('checked', false);
                $('#percentTeal').prop('checked', false);
                $('#percentYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn02") {
                $('#percentBlue').prop('checked', false);
                $('#percentGray').prop('checked', false);
                $('#percentGreen').prop('checked', false);
                $('#percentOrange').prop('checked', false);
                $('#percentPink').prop('checked', false);
                $('#percentPurple').prop('checked', false);
                $('#percentRed').prop('checked', false);
                $('#percentTeal').prop('checked', true);
                $('#percentYellow').prop('checked', false);

            }
            else if (this.chosenKey.imageName == "posBtn03") {
                $('#percentBlue').prop('checked', false);
                $('#percentGray').prop('checked', false);
                $('#percentGreen').prop('checked', true);
                $('#percentOrange').prop('checked', false);
                $('#percentPink').prop('checked', false);
                $('#percentPurple').prop('checked', false);
                $('#percentRed').prop('checked', false);
                $('#percentTeal').prop('checked', false);
                $('#percentYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn04") {
                $('#percentBlue').prop('checked', false);
                $('#percentGray').prop('checked', false);
                $('#percentGreen').prop('checked', false);
                $('#percentOrange').prop('checked', false);
                $('#percentPink').prop('checked', false);
                $('#percentPurple').prop('checked', false);
                $('#percentRed').prop('checked', false);
                $('#percentTeal').prop('checked', false);
                $('#percentYellow').prop('checked', true);
            }
            else if (this.chosenKey.imageName == "posBtn05") {
                $('#percentBlue').prop('checked', false);
                $('#percentGray').prop('checked', false);
                $('#percentGreen').prop('checked', false);
                $('#percentOrange').prop('checked', false);
                $('#percentPink').prop('checked', false);
                $('#percentPurple').prop('checked', false);
                $('#percentRed').prop('checked', true);
                $('#percentTeal').prop('checked', false);
                $('#percentYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn06") {
                $('#percentBlue').prop('checked', false);
                $('#percentGray').prop('checked', false);
                $('#percentGreen').prop('checked', false);
                $('#percentOrange').prop('checked', false);
                $('#percentPink').prop('checked', true);
                $('#percentPurple').prop('checked', false);
                $('#percentRed').prop('checked', false);
                $('#percentTeal').prop('checked', false);
                $('#percentYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn07") {
                $('#percentBlue').prop('checked', false);
                $('#percentGray').prop('checked', false);
                $('#percentGreen').prop('checked', false);
                $('#percentOrange').prop('checked', false);
                $('#percentPink').prop('checked', false);
                $('#percentPurple').prop('checked', true);
                $('#percentRed').prop('checked', false);
                $('#percentTeal').prop('checked', false);
                $('#percentYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn08") {
                $('#percentBlue').prop('checked', true);
                $('#percentGray').prop('checked', false);
                $('#percentGreen').prop('checked', false);
                $('#percentOrange').prop('checked', false);
                $('#percentPink').prop('checked', false);
                $('#percentPurple').prop('checked', false);
                $('#percentRed').prop('checked', false);
                $('#percentTeal').prop('checked', false);
                $('#percentYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn09") {
                $('#percentBlue').prop('checked', false);
                $('#percentGray').prop('checked', false);
                $('#percentGreen').prop('checked', false);
                $('#percentOrange').prop('checked', true);
                $('#percentPink').prop('checked', false);
                $('#percentPurple').prop('checked', false);
                $('#percentRed').prop('checked', false);
                $('#percentTeal').prop('checked', false);
                $('#percentYellow').prop('checked', false);
            }

            this.editModal.modal('open');
            $('#percentForm').show();
        }
        else if (this.chosenKey.type == "ItemDiscount") {

            var itemDiscountText = document.getElementById('itemDiscountText');
            itemDiscountText.value = this.chosenKey.name;

            var itemDiscount = document.getElementById('itemDiscount');
            itemDiscount.value = this.chosenKey.text;

            document.getElementById('itemDiscountId').value = this.chosenKey.id;

            if (this.chosenKey.imageName == "posBtn01") {
                $('#itemDiscountBlue').prop('checked', false);
                $('#itemDiscountGray').prop('checked', true);
                $('#itemDiscountGreen').prop('checked', false);
                $('#itemDiscountOrange').prop('checked', false);
                $('#itemDiscountPink').prop('checked', false);
                $('#itemDiscountPurple').prop('checked', false);
                $('#itemDiscountRed').prop('checked', false);
                $('#itemDiscountTeal').prop('checked', false);
                $('#itemDiscountYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn02") {
                $('#itemDiscountBlue').prop('checked', false);
                $('#itemDiscountGray').prop('checked', false);
                $('#itemDiscountGreen').prop('checked', false);
                $('#itemDiscountOrange').prop('checked', false);
                $('#itemDiscountPink').prop('checked', false);
                $('#itemDiscountPurple').prop('checked', false);
                $('#itemDiscountRed').prop('checked', false);
                $('#itemDiscountTeal').prop('checked', true);
                $('#itemDiscountYellow').prop('checked', false);

            }
            else if (this.chosenKey.imageName == "posBtn03") {
                $('#itemDiscountBlue').prop('checked', false);
                $('#itemDiscountGray').prop('checked', false);
                $('#itemDiscountGreen').prop('checked', true);
                $('#itemDiscountOrange').prop('checked', false);
                $('#itemDiscountPink').prop('checked', false);
                $('#itemDiscountPurple').prop('checked', false);
                $('#itemDiscountRed').prop('checked', false);
                $('#itemDiscountTeal').prop('checked', false);
                $('#itemDiscountYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn04") {
                $('#itemDiscountBlue').prop('checked', false);
                $('#itemDiscountGray').prop('checked', false);
                $('#itemDiscountGreen').prop('checked', false);
                $('#itemDiscountOrange').prop('checked', false);
                $('#itemDiscountPink').prop('checked', false);
                $('#itemDiscountPurple').prop('checked', false);
                $('#itemDiscountRed').prop('checked', false);
                $('#itemDiscountTeal').prop('checked', false);
                $('#itemDiscountYellow').prop('checked', true);
            }
            else if (this.chosenKey.imageName == "posBtn05") {
                $('#itemDiscountBlue').prop('checked', false);
                $('#itemDiscountGray').prop('checked', false);
                $('#itemDiscountGreen').prop('checked', false);
                $('#itemDiscountOrange').prop('checked', false);
                $('#itemDiscountPink').prop('checked', false);
                $('#itemDiscountPurple').prop('checked', false);
                $('#itemDiscountRed').prop('checked', true);
                $('#itemDiscountTeal').prop('checked', false);
                $('#itemDiscountYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn06") {
                $('#itemDiscountBlue').prop('checked', false);
                $('#itemDiscountGray').prop('checked', false);
                $('#itemDiscountGreen').prop('checked', false);
                $('#itemDiscountOrange').prop('checked', false);
                $('#itemDiscountPink').prop('checked', true);
                $('#itemDiscountPurple').prop('checked', false);
                $('#itemDiscountRed').prop('checked', false);
                $('#itemDiscountTeal').prop('checked', false);
                $('#itemDiscountYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn07") {
                $('#itemDiscountBlue').prop('checked', false);
                $('#itemDiscountGray').prop('checked', false);
                $('#itemDiscountGreen').prop('checked', false);
                $('#itemDiscountOrange').prop('checked', false);
                $('#itemDiscountPink').prop('checked', false);
                $('#itemDiscountPurple').prop('checked', true);
                $('#itemDiscountRed').prop('checked', false);
                $('#itemDiscountTeal').prop('checked', false);
                $('#itemDiscountYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn08") {
                $('#itemDiscountBlue').prop('checked', true);
                $('#itemDiscountGray').prop('checked', false);
                $('#itemDiscountGreen').prop('checked', false);
                $('#itemDiscountOrange').prop('checked', false);
                $('#itemDiscountPink').prop('checked', false);
                $('#itemDiscountPurple').prop('checked', false);
                $('#itemDiscountRed').prop('checked', false);
                $('#itemDiscountTeal').prop('checked', false);
                $('#itemDiscountYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn09") {
                $('#itemDiscountBlue').prop('checked', false);
                $('#itemDiscountGray').prop('checked', false);
                $('#itemDiscountGreen').prop('checked', false);
                $('#itemDiscountOrange').prop('checked', true);
                $('#itemDiscountPink').prop('checked', false);
                $('#itemDiscountPurple').prop('checked', false);
                $('#itemDiscountRed').prop('checked', false);
                $('#itemDiscountTeal').prop('checked', false);
                $('#itemDiscountYellow').prop('checked', false);
            }

            this.editModal.modal('open');
            $('#itemDiscountForm').show();
        }
        else if (this.chosenKey.type == "Level") {

            var priceLevelButtonText = document.getElementById('priceLevelButtonText');
            priceLevelButtonText.value = this.chosenKey.name;

            document.getElementById('priceLevelId').value = this.chosenKey.id;
            
            if (this.chosenKey.imageName == "posBtn01") {
                $('#priceLevelBlue').prop('checked', false);
                $('#priceLevelGray').prop('checked', true);
                $('#priceLevelGreen').prop('checked', false);
                $('#priceLevelOrange').prop('checked', false);
                $('#priceLevelPink').prop('checked', false);
                $('#priceLevelPurple').prop('checked', false);
                $('#priceLevelRed').prop('checked', false);
                $('#priceLevelTeal').prop('checked', false);
                $('#priceLevelYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn02") {
                $('#priceLevelBlue').prop('checked', false);
                $('#priceLevelGray').prop('checked', false);
                $('#priceLevelGreen').prop('checked', false);
                $('#priceLevelOrange').prop('checked', false);
                $('#priceLevelPink').prop('checked', false);
                $('#priceLevelPurple').prop('checked', false);
                $('#priceLevelRed').prop('checked', false);
                $('#priceLevelTeal').prop('checked', true);
                $('#priceLevelYellow').prop('checked', false);

            }
            else if (this.chosenKey.imageName == "posBtn03") {
                $('#priceLevelBlue').prop('checked', false);
                $('#priceLevelGray').prop('checked', false);
                $('#priceLevelGreen').prop('checked', true);
                $('#priceLevelOrange').prop('checked', false);
                $('#priceLevelPink').prop('checked', false);
                $('#priceLevelPurple').prop('checked', false);
                $('#priceLevelRed').prop('checked', false);
                $('#priceLevelTeal').prop('checked', false);
                $('#priceLevelYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn04") {
                $('#priceLevelBlue').prop('checked', false);
                $('#priceLevelGray').prop('checked', false);
                $('#priceLevelGreen').prop('checked', false);
                $('#priceLevelOrange').prop('checked', false);
                $('#priceLevelPink').prop('checked', false);
                $('#priceLevelPurple').prop('checked', false);
                $('#priceLevelRed').prop('checked', false);
                $('#priceLevelTeal').prop('checked', false);
                $('#priceLevelYellow').prop('checked', true);
            }
            else if (this.chosenKey.imageName == "posBtn05") {
                $('#priceLevelBlue').prop('checked', false);
                $('#priceLevelGray').prop('checked', false);
                $('#priceLevelGreen').prop('checked', false);
                $('#priceLevelOrange').prop('checked', false);
                $('#priceLevelPink').prop('checked', false);
                $('#priceLevelPurple').prop('checked', false);
                $('#priceLevelRed').prop('checked', true);
                $('#priceLevelTeal').prop('checked', false);
                $('#priceLevelYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn06") {
                $('#priceLevelBlue').prop('checked', false);
                $('#priceLevelGray').prop('checked', false);
                $('#priceLevelGreen').prop('checked', false);
                $('#priceLevelOrange').prop('checked', false);
                $('#priceLevelPink').prop('checked', true);
                $('#priceLevelPurple').prop('checked', false);
                $('#priceLevelRed').prop('checked', false);
                $('#priceLevelTeal').prop('checked', false);
                $('#priceLevelYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn07") {
                $('#priceLevelBlue').prop('checked', false);
                $('#priceLevelGray').prop('checked', false);
                $('#priceLevelGreen').prop('checked', false);
                $('#priceLevelOrange').prop('checked', false);
                $('#priceLevelPink').prop('checked', false);
                $('#priceLevelPurple').prop('checked', true);
                $('#priceLevelRed').prop('checked', false);
                $('#priceLevelTeal').prop('checked', false);
                $('#priceLevelYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn08") {
                $('#priceLevelBlue').prop('checked', true);
                $('#priceLevelGray').prop('checked', false);
                $('#priceLevelGreen').prop('checked', false);
                $('#priceLevelOrange').prop('checked', false);
                $('#priceLevelPink').prop('checked', false);
                $('#priceLevelPurple').prop('checked', false);
                $('#priceLevelRed').prop('checked', false);
                $('#priceLevelTeal').prop('checked', false);
                $('#priceLevelYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn09") {
                $('#priceLevelBlue').prop('checked', false);
                $('#priceLevelGray').prop('checked', false);
                $('#priceLevelGreen').prop('checked', false);
                $('#priceLevelOrange').prop('checked', true);
                $('#priceLevelPink').prop('checked', false);
                $('#priceLevelPurple').prop('checked', false);
                $('#priceLevelRed').prop('checked', false);
                $('#priceLevelTeal').prop('checked', false);
                $('#priceLevelYellow').prop('checked', false);
            }

            this.editModal.modal('open');
            $('#priceLevelForm').show();
            this.$el.find(".select-dropdown").trigger("click");
        }
        else if (this.chosenKey.type == "Tare") {
            var tareWeight = document.getElementById('editTareWeight');
            tareWeight.value = this.chosenKey.text;
            
            var tareText = document.getElementById('editTareText');
            tareText.value = this.chosenKey.name;

            document.getElementById('tareId').value = this.chosenKey.id;

            if (this.chosenKey.imageName == "posBtn01") {
                $('#tareBlue').prop('checked', false);
                $('#tareGray').prop('checked', true);
                $('#tareGreen').prop('checked', false);
                $('#tareOrange').prop('checked', false);
                $('#tarePink').prop('checked', false);
                $('#tarePurple').prop('checked', false);
                $('#tareRed').prop('checked', false);
                $('#tareTeal').prop('checked', false);
                $('#tareYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn02") {
                $('#tareBlue').prop('checked', false);
                $('#tareGray').prop('checked', false);
                $('#tareGreen').prop('checked', false);
                $('#tareOrange').prop('checked', false);
                $('#tarePink').prop('checked', false);
                $('#tarePurple').prop('checked', false);
                $('#tareRed').prop('checked', false);
                $('#tareTeal').prop('checked', true);
                $('#tareYellow').prop('checked', false);

            }
            else if (this.chosenKey.imageName == "posBtn03") {
                $('#tareBlue').prop('checked', false);
                $('#tareGray').prop('checked', false);
                $('#tareGreen').prop('checked', true);
                $('#tareOrange').prop('checked', false);
                $('#tarePink').prop('checked', false);
                $('#tarePurple').prop('checked', false);
                $('#tareRed').prop('checked', false);
                $('#tareTeal').prop('checked', false);
                $('#tareYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn04") {
                $('#tareBlue').prop('checked', false);
                $('#tareGray').prop('checked', false);
                $('#tareGreen').prop('checked', false);
                $('#tareOrange').prop('checked', false);
                $('#tarePink').prop('checked', false);
                $('#tarePurple').prop('checked', false);
                $('#tareRed').prop('checked', false);
                $('#tareTeal').prop('checked', false);
                $('#tareYellow').prop('checked', true);
            }
            else if (this.chosenKey.imageName == "posBtn05") {
                $('#tareBlue').prop('checked', false);
                $('#tareGray').prop('checked', false);
                $('#tareGreen').prop('checked', false);
                $('#tareOrange').prop('checked', false);
                $('#tarePink').prop('checked', false);
                $('#tarePurple').prop('checked', false);
                $('#tareRed').prop('checked', true);
                $('#tareTeal').prop('checked', false);
                $('#tareYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn06") {
                $('#tareBlue').prop('checked', false);
                $('#tareGray').prop('checked', false);
                $('#tareGreen').prop('checked', false);
                $('#tareOrange').prop('checked', false);
                $('#tarePink').prop('checked', true);
                $('#tarePurple').prop('checked', false);
                $('#tareRed').prop('checked', false);
                $('#tareTeal').prop('checked', false);
                $('#tareYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn07") {
                $('#tareBlue').prop('checked', false);
                $('#tareGray').prop('checked', false);
                $('#tareGreen').prop('checked', false);
                $('#tareOrange').prop('checked', false);
                $('#tarePink').prop('checked', false);
                $('#tarePurple').prop('checked', true);
                $('#tareRed').prop('checked', false);
                $('#tareTeal').prop('checked', false);
                $('#tareYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn08") {
                $('#tareBlue').prop('checked', true);
                $('#tareGray').prop('checked', false);
                $('#tareGreen').prop('checked', false);
                $('#tareOrange').prop('checked', false);
                $('#tarePink').prop('checked', false);
                $('#tarePurple').prop('checked', false);
                $('#tareRed').prop('checked', false);
                $('#tareTeal').prop('checked', false);
                $('#tareYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn09") {
                $('#tareBlue').prop('checked', false);
                $('#tareGray').prop('checked', false);
                $('#tareGreen').prop('checked', false);
                $('#tareOrange').prop('checked', true);
                $('#tarePink').prop('checked', false);
                $('#tarePurple').prop('checked', false);
                $('#tareRed').prop('checked', false);
                $('#tareTeal').prop('checked', false);
                $('#tareYellow').prop('checked', false);
            }

            this.editModal.modal('open');
            $('#tareForm').show();
        }
        else if (this.chosenKey.type == "Keyset") {
            var keySetText = document.getElementById('editKeysetText');
            keySetText.value = this.chosenKey.name;

            document.getElementById('keySetId').value = this.chosenKey.id;

            if (this.chosenKey.imageName == "posBtn01") {
                $('#keysetBlue').prop('checked', false);
                $('#keysetGray').prop('checked', true);
                $('#keysetGreen').prop('checked', false);
                $('#keysetOrange').prop('checked', false);
                $('#keysetPink').prop('checked', false);
                $('#keysetPurple').prop('checked', false);
                $('#keysetRed').prop('checked', false);
                $('#keysetTeal').prop('checked', false);
                $('#keysetYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn02") {
                $('#keysetBlue').prop('checked', false);
                $('#keysetGray').prop('checked', false);
                $('#keysetGreen').prop('checked', false);
                $('#keysetOrange').prop('checked', false);
                $('#keysetPink').prop('checked', false);
                $('#keysetPurple').prop('checked', false);
                $('#keysetRed').prop('checked', false);
                $('#keysetTeal').prop('checked', true);
                $('#keysetYellow').prop('checked', false);

            }
            else if (this.chosenKey.imageName == "posBtn03") {
                $('#keysetBlue').prop('checked', false);
                $('#keysetGray').prop('checked', false);
                $('#keysetGreen').prop('checked', true);
                $('#keysetOrange').prop('checked', false);
                $('#keysetPink').prop('checked', false);
                $('#keysetPurple').prop('checked', false);
                $('#keysetRed').prop('checked', false);
                $('#keysetTeal').prop('checked', false);
                $('#keysetYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn04") {
                $('#keysetBlue').prop('checked', false);
                $('#keysetGray').prop('checked', false);
                $('#keysetGreen').prop('checked', false);
                $('#keysetOrange').prop('checked', false);
                $('#keysetPink').prop('checked', false);
                $('#keysetPurple').prop('checked', false);
                $('#keysetRed').prop('checked', false);
                $('#keysetTeal').prop('checked', false);
                $('#keysetYellow').prop('checked', true);
            }
            else if (this.chosenKey.imageName == "posBtn05") {
                $('#keysetBlue').prop('checked', false);
                $('#keysetGray').prop('checked', false);
                $('#keysetGreen').prop('checked', false);
                $('#keysetOrange').prop('checked', false);
                $('#keysetPink').prop('checked', false);
                $('#keysetPurple').prop('checked', false);
                $('#keysetRed').prop('checked', true);
                $('#keysetTeal').prop('checked', false);
                $('#keysetYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn06") {
                $('#keysetBlue').prop('checked', false);
                $('#keysetGray').prop('checked', false);
                $('#keysetGreen').prop('checked', false);
                $('#keysetOrange').prop('checked', false);
                $('#keysetPink').prop('checked', true);
                $('#keysetPurple').prop('checked', false);
                $('#keysetRed').prop('checked', false);
                $('#keysetTeal').prop('checked', false);
                $('#keysetYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn07") {
                $('#keysetBlue').prop('checked', false);
                $('#keysetGray').prop('checked', false);
                $('#keysetGreen').prop('checked', false);
                $('#keysetOrange').prop('checked', false);
                $('#keysetPink').prop('checked', false);
                $('#keysetPurple').prop('checked', true);
                $('#keysetRed').prop('checked', false);
                $('#keysetTeal').prop('checked', false);
                $('#keysetYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn08") {
                $('#keysetBlue').prop('checked', true);
                $('#keysetGray').prop('checked', false);
                $('#keysetGreen').prop('checked', false);
                $('#keysetOrange').prop('checked', false);
                $('#keysetPink').prop('checked', false);
                $('#keysetPurple').prop('checked', false);
                $('#keysetRed').prop('checked', false);
                $('#keysetTeal').prop('checked', false);
                $('#keysetYellow').prop('checked', false);
            }
            else if (this.chosenKey.imageName == "posBtn09") {
                $('#keysetBlue').prop('checked', false);
                $('#keysetGray').prop('checked', false);
                $('#keysetGreen').prop('checked', false);
                $('#keysetOrange').prop('checked', true);
                $('#keysetPink').prop('checked', false);
                $('#keysetPurple').prop('checked', false);
                $('#keysetRed').prop('checked', false);
                $('#keysetTeal').prop('checked', false);
                $('#keysetYellow').prop('checked', false);
            }

            this.editModal.modal('open');
            $('#keysetForm').show();
        }
    },

    openDeleteModal: function (e) {
        this.deleteModal.modal('open');
    },

    showMenu: function (e) {
        var element = $(e.currentTarget);
        var parent = $(element).parent();
        var id = $(parent).attr('data-id');
        var name = $(parent).attr('data-name');
        this.chosenKeyId = id;
        var floatingMenu = this.$el.find('.floating-menu');
        
        $(floatingMenu).hide();
        $(floatingMenu).css('top', e.originalEvent.pageY - 75 + 'px');
        $(floatingMenu).css('left', e.originalEvent.pageX + 'px');
        $(floatingMenu).fadeIn('fast');
        $(floatingMenu).find('.edited-button-name').html(name);
        
    },

    /*-----------------------------------------------------------------------------------------------------------------------------------------*/

    //https://github.com/gridstack/gridstack.js/tree/develop/doc
    render: function () {
        this.gridInit = true;
        
        var that = this;
        $('select').formSelect();
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-menu-keys',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.items = data.keys;
                that.pages = data.pages;
                
                //that.$el.find('#page-selector').formSelect();
                

                $(document).ready(function () {
                    that.$el.html(that.template({
                        items: that.items,
                        keySet: that.keySet,
                        pages: that.pages
                    }));
                    that.initItems(); 
                    $('.tooltipped').tooltip();
                    $('select').formSelect();
                    $('.fixed-action-btn').floatingActionButton();
                    $(document.body).click(function (e) {
                        var target = e.target;
                        //that.$el.find('.floating-menu').hide();
                        if (!$(target).hasClass('grid-stack-item-content')) {
                            that.$el.find('.floating-menu').hide();
                        }
                    });
                    if (that.gridInit) {
                        var options = {
                            width: 7,
                            height: 12,
                            cellHeight: 49,
                            verticalMargin: 1,
                            alwaysShowResizeHandle: true,
                            disableOneColumnMode: true,
                            removable: false,
                            locked: true,
                        };
                        $('.grid-stack').gridstack(options);
                        $('.grid-stack').on('dragstart', function(event, ui) {
                            var grid = this;
                            var element = event.target;
                            that.$el.find('.floating-menu').hide();
                        });

                        that.grid = that.$el.find('.grid-stack').data('gridstack');
                        that.items.map(function (item) {
                            let foundPage = 0;
                            for (var i = 0; i < that.pages.length; i++) {
                                if (that.pages[i] == "MAIN") {
                                    foundPage = i;
                                }
                            }
                            if (item.page.toUpperCase() == that.pages[foundPage].toUpperCase() && item.keysetName == "" && item.text != "" || item.page == "TOP" && item.keysetName == "") {
                                if (item.page == "TOP") {
                                    var node = {
                                        x: item.column - 1,
                                        y: item.row - 1,
                                        width: item.width,
                                        height: item.height
                                    };
                                }
                                else {
                                    var node = {
                                        x: item.column - 1,
                                        y: item.row + 1,
                                        width: item.width,
                                        height: item.height,
                                    };
                                }

                                var widget = $('<div>');
                                var widgetContent = $('<div class="grid-stack-item-content valign-wrapper" id="' + item.id +'">');
                                
                                   
                                $(widgetContent).css('display', 'flex');
                                $(widgetContent).css('justify-content', 'center');
                                $(widgetContent).css('border', '1px solid #555');
                                $(widgetContent).css('font-size', '0.8rem');
                                
                                if (item.imageName == "posBtn01") {
                                    $(widgetContent).css('background-color', '#E2E3E2');
                                }
                                else if (item.imageName == "posBtn02") {
                                    $(widgetContent).css('background-color', '#4ABD98');
                                }
                                else if (item.imageName == "posBtn03") {
                                    $(widgetContent).css('background-color', '#A4D391');
                                }
                                else if (item.imageName == "posBtn04") {
                                    $(widgetContent).css('background-color', '#F6F3B0');
                                }
                                else if (item.imageName == "posBtn05") {
                                    $(widgetContent).css('background-color', '#F1AFAF');
                                }
                                else if (item.imageName == "posBtn06") {
                                    $(widgetContent).css('background-color', '#DEBEDB');
                                }
                                else if (item.imageName == "posBtn07") {
                                    $(widgetContent).css('background-color', '#B4B3DF');
                                }
                                else if (item.imageName == "posBtn08") {
                                    $(widgetContent).css('background-color', '#97CAEB');
                                }
                                else if (item.imageName == "posBtn09") {
                                    $(widgetContent).css('background-color', '#252525');
                                    $(widgetContent).css('color', '#ffffff');
                                }
                                else {
                                    $(widgetContent).css('background-color', '#ffffff');
                                }
    
                                $(widgetContent).html(item.name);
                                
                                $(widget).attr("data-gs-locked", "yes");
                                $(widget).attr("data-gs-max-width", 2);
                                $(widget).attr("data-gs-max-height", 2);
                                $(widget).attr("data-id", item.id);
                                $(widget).attr("data-name", item.name);
                                $(widget).append(widgetContent);
                                that.grid.addWidget($(widget), node.x, node.y, node.width, node.height);
                            }
                            
                        });
                        
                    }
                    that.gridInit = false;
        
                    $('select').formSelect();
                    that.editModal = that.$el.find('#pos-key-edit-modal').modal();
                    that.deleteModal = that.$el.find('#pos-key-delete-modal').modal();
                });
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}Occured a problem while rendering this page{/Literal}' });
                }
            }
        });
        
        App.breadCrumbToolTip = "Create, manage, and edit your POS Menu Keys"
        App.setBreadcrumbs(this.breadcrumb);
        return this;
    },

    getMenuPages: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-menu-pages',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.pages = data.results;
                that.$el.find('#page-selector').formSelect();
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}Problem fetching Menu Pages{/Literal}' });
                }
            }
        });
    },

    getKeySet: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-menu-keys',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.keySet = data.keySets;
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}Problem fetching Key Set{/Literal}' });
                }
            }
        });
    },

    initItems:  function () {
        var fullItems = this.getItemsFull();
    },

    getItemsFull: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-items-full',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.renderItems(data.results);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({
                        html: '{Literal}There was a problem fetching data from the server{/Literal}'
                    });
                }
            }
        });
    },

    renderItems: function (data) {
        var that = this;
        var itemCollection = {};
        for (var i = 0; i < data.length; i++) {
            var currentItem = data[i];
            currentItem.cardStyleClass = that.itemsStyleMapping[data[i].name];
            itemCollection[i] = (currentItem);
        }
        this.itemFullCollection = itemCollection;

        $('select').formSelect();

        var elems = document.querySelector('#itemSearch');
        this.itemsAutocomplete = M.Autocomplete.init(elems, {
            minLength: 1,
            lmit: 20,
            sortFunction: function (a, b, inputString) {
                return a.indexOf(inputString) - b.indexOf(inputString);
            },
            onAutocomplete: function (selection) { that.selectItemFromAutocompleteList(selection); }
        });
    },

    searchItemBySearchTerm: function(element) {
        var element = $(element.currentTarget);
        var searchTerm = $(element).val();
        var that = this;
        if (searchTerm.trim().length > 0) {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(function() { 
                that.getItemsBySearchTerm(searchTerm); 
            }, 0);
        }
        that.$el.find("input.autocomplete").trigger("click"); 
    },

    getItemsBySearchTerm: function(searchTerm) {
        var that = this;
        $.ajax({
            url: '/data/get-items-by-search-term',
            data: {
                searchTerm: searchTerm
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                var results = data.results;
                var items = {};
                for (var i = 0; i < results.length; i++) {
                    items[results[i].itemDescription] = null;
                    that.itemMapping[results[i].itemDescription] = results[i].itemCode;
                }
                that.itemsAutocomplete.updateData(items);    

                that.$el.find("input.autocomplete").trigger("click"); 
                  
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                }
            }
        });
    },

    selectItemFromAutocompleteList: function (selection) {
        var that = this;
        var itemId = document.getElementById('itemSearch');
        var itemDesc = document.getElementById('itemText');

        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };
        
        for (var i = 0; i < Object.size(that.itemMapping); i++) {
            if (Object.entries(that.itemMapping)[i][0] == selection) {
                itemId.value = Object.entries(that.itemMapping)[i][1];
                itemDesc.value = Object.entries(that.itemMapping)[i][0];
            }
        }
    },

    /*-----------------------------------------------------------------------------------------------------------------------------------------*/

    changePage: function () {
        var that = this;
        var page = this.$el.find('#page-selector option:selected').text(); 
        var keySet = this.$el.find('#key-set-selector option:selected').text();
        if (keySet.toUpperCase() == "MAIN" || keySet == "ראשי") {
            keySet = "";
        }
        var options = {
            width: 7,
            height: 11,
            cellHeight: 49,
            verticalMargin: 1,
            alwaysShowResizeHandle: true,
            disableOneColumnMode: true,
            removable: false,
            locked: true,
        };
        $('.grid-stack').gridstack(options);
        $('.grid-stack').on('dragstart', function(event, ui) {
            var grid = this;
            var element = event.target;
            that.$el.find('.floating-menu').hide();
        });

        for (var i = 0; i < that.pages.length; i++) {
            if (page == that.pages[i]) {
                grid = $('.grid-stack').data('gridstack');
                grid.removeAll();
                that.items.map(function (item) {
                    if ((item.page.toUpperCase() == that.pages[i].toUpperCase() && item.keysetName == keySet && item.text != "") || item.page == "TOP" && item.keysetName == keySet) {
                        if (keySet == "") {
                            if (item.page == "TOP") {
                                var node = {
                                    x: item.column - 1,
                                    y: item.row - 1,
                                    width: item.width,
                                    height: item.height
                                };
                            }
                            else {
                                var node = {
                                    x: item.column - 1,
                                    y: item.row + 1,
                                    width: item.width,
                                    height: item.height,
                                };
                            }
                        }
                        else {
                            if (item.page == "TOP") {
                                var node = {
                                    x: item.column - 1,
                                    y: item.row - 1,
                                    width: item.width,
                                    height: item.height
                                };
                            }
                            else {
                                var node = {
                                    x: item.column - 1,
                                    y: item.row - 1,
                                    width: item.width,
                                    height: item.height,
                                };
                            }
                        }
                        
                        var widget = $('<div>');
                        var widgetContent = $('<div class="grid-stack-item-content valign-wrapper" id="' + item.id +'">');

                        $(widgetContent).css('display', 'flex');
                        $(widgetContent).css('justify-content', 'center');
                        $(widgetContent).css('border', '1px solid #555');
                        $(widgetContent).css('font-size', '0.8rem');
                        
                        if (item.imageName == "posBtn01") {
                            $(widgetContent).css('background-color', '#E2E3E2');
                        }
                        else if (item.imageName == "posBtn02") {
                            $(widgetContent).css('background-color', '#4ABD98');
                        }
                        else if (item.imageName == "posBtn03") {
                            $(widgetContent).css('background-color', '#A4D391');
                        }
                        else if (item.imageName == "posBtn04") {
                            $(widgetContent).css('background-color', '#F6F3B0');
                        }
                        else if (item.imageName == "posBtn05") {
                            $(widgetContent).css('background-color', '#F1AFAF');
                        }
                        else if (item.imageName == "posBtn06") {
                            $(widgetContent).css('background-color', '#DEBEDB');
                        }
                        else if (item.imageName == "posBtn07") {
                            $(widgetContent).css('background-color', '#B4B3DF');
                        }
                        else if (item.imageName == "posBtn08") {
                            $(widgetContent).css('background-color', '#97CAEB');
                        }
                        else if (item.imageName == "posBtn09") {
                            $(widgetContent).css('background-color', '#252525');
                            $(widgetContent).css('color', '#ffffff');
                        }
                        else {
                            $(widgetContent).css('background-color', '#ffffff');
                        }

                        $(widgetContent).html(item.name);
                        
                        $(widget).attr("data-gs-locked", "yes");
                        $(widget).attr("data-gs-max-width", 2);
                        $(widget).attr("data-gs-max-height", 2);
                        $(widget).attr("data-id", item.id);
                        $(widget).attr("data-name", item.name);
                        $(widget).append(widgetContent);
                        that.grid.addWidget($(widget), node.x, node.y, node.width, node.height);
                    }
                });
                break;
            }
        }
    },

    changeKeySet: function () {
        var that = this;
        var page = this.$el.find('#page-selector option:selected').text(); 
        var keySet = this.$el.find('#key-set-selector option:selected').text();
        if (keySet == "MAIN" || keySet == "ראשי") {
            keySet = "";
        }
        for (var i = 0; i < that.pages.length; i++) {
            if (page == that.pages[i]) {
                grid = $('.grid-stack').data('gridstack');
                grid.removeAll();
                that.items.map(function (item) {
                    if ((item.page.toUpperCase() == that.pages[i].toUpperCase() && item.keysetName == keySet && item.text != "") || item.page == "TOP" && item.keysetName == keySet) {
                        if (keySet == "") {
                            if (item.page == "TOP") {
                                var node = {
                                    x: item.column - 1,
                                    y: item.row - 1,
                                    width: item.width,
                                    height: item.height
                                };
                            }
                            else {
                                var node = {
                                    x: item.column - 1,
                                    y: item.row + 1,
                                    width: item.width,
                                    height: item.height,
                                };
                            }
                        }
                        else {
                            if (item.page == "TOP") {
                                var node = {
                                    x: item.column - 1,
                                    y: item.row - 1,
                                    width: item.width,
                                    height: item.height
                                };
                            }
                            else {
                                var node = {
                                    x: item.column - 1,
                                    y: item.row - 1,
                                    width: item.width,
                                    height: item.height,
                                };
                            }
                        }
                        var widget = $('<div>');
                        var widgetContent = $('<div class="grid-stack-item-content valign-wrapper" id="' + item.id +'">');

                        $(widgetContent).css('display', 'flex');
                        $(widgetContent).css('justify-content', 'center');
                        $(widgetContent).css('border', '1px solid #555');
                        $(widgetContent).css('font-size', '0.8rem');
                        
                        if (item.imageName == "posBtn01") {
                            $(widgetContent).css('background-color', '#E2E3E2');
                        }
                        else if (item.imageName == "posBtn02") {
                            $(widgetContent).css('background-color', '#4ABD98');
                        }
                        else if (item.imageName == "posBtn03") {
                            $(widgetContent).css('background-color', '#A4D391');
                        }
                        else if (item.imageName == "posBtn04") {
                            $(widgetContent).css('background-color', '#F6F3B0');
                        }
                        else if (item.imageName == "posBtn05") {
                            $(widgetContent).css('background-color', '#F1AFAF');
                        }
                        else if (item.imageName == "posBtn06") {
                            $(widgetContent).css('background-color', '#DEBEDB');
                        }
                        else if (item.imageName == "posBtn07") {
                            $(widgetContent).css('background-color', '#B4B3DF');
                        }
                        else if (item.imageName == "posBtn08") {
                            $(widgetContent).css('background-color', '#97CAEB');
                        }
                        else if (item.imageName == "posBtn09") {
                            $(widgetContent).css('background-color', '#252525');
                            $(widgetContent).css('color', '#ffffff');
                        }
                        else {
                            $(widgetContent).css('background-color', '#ffffff');
                        }

                        $(widgetContent).html(item.name);
                        
                        $(widget).attr("data-gs-locked", "yes");
                        $(widget).attr("data-gs-max-width", 2);
                        $(widget).attr("data-gs-max-height", 2);
                        $(widget).attr("data-id", item.id);
                        $(widget).attr("data-name", item.name);
                        $(widget).append(widgetContent);
                        that.grid.addWidget($(widget), node.x, node.y, node.width, node.height);
                    }
                });
            }
        }
    },
    choosePriceLevel: function (e) {
        var priceLevelText = this.$el.find('#priceLevelText').val();
        var priceLevel = this.$el.find('#price-level-dropdown').val();
        var priceLevelId = this.$el.find('#priceLevelId').val();
        
        if (priceLevelText != null && priceLevelText != '' && priceLevelText != undefined) { 
            var grid = $('.grid-stack').data('gridstack');
            var widget = $('<div>');
            var widgetContent = $('<div>');
            $(widgetContent)
                .addClass("grid-stack-item-content")
                .addClass('valign-wrapper');
            $(widgetContent).css('display', 'flex');
            $(widgetContent).css('justify-content', 'center');
            $(widgetContent).css('border', '1px solid #555');
            $(widgetContent).css('font-size', '0.8rem');
            $(widgetContent).css('color', 'black');
            $(widgetContent).css('background-color', 'rgb(226,227,226)');

            $(widgetContent).html(priceLevelText);
            $(widget).attr("data-gs-locked", true);
            $(widget).attr("data-gs-max-width", 2);
            $(widget).attr("data-gs-max-height", 2);
            $(widget).attr("data-id", 0);
            $(widget).attr("data-name", priceLevelText);
            $(widget).append(widgetContent);
            if (App.serverInfo.isFoodService) {
                grid.addWidget($(widget), 1, 1, 1, 1, true);
            }
            else {
                grid.addWidget($(widget), 1, 1, 1, 1, true);
            }
            
            for (var i = 0; i < grid.grid.nodes.length; i++)
            {   
                if (grid.grid.nodes[i].el[0].innerText == priceLevelText) {
                    var updatedModel = {
                        id: 0,
                        name: priceLevelText,
                        row: grid.grid.nodes[i].y - 1,
                        column: grid.grid.nodes[i].x + 1,
                        width: 1,
                        height: 1,
                        imageName: 'posBtn01',
                        type: 'L',
                        text: priceLevel,
                        cr: true,
                        keysetName: this.currentKeySet,
                        page: this.currentPage,
                        noRepeat: false,
                        keyNumber: Math.floor(Math.random() * 100) + 1,
                        noSync: false,
                        isActive: true,
                        textColor: "Black"
                    }
                    if (this.grid.grid.nodes[i].y <= 1) {
                        updatedModel.page = "TOP";
                        updatedModel.row = grid.grid.nodes[i].y + 1;
                    }
        
                    this.addNewPosKey(updatedModel)
        
                    $('#pos-key-form-modal').modal().modal('close');
                }
            }
        }
        else {
            M.toast({ html: '{Literal}Please enter label name{/Literal}' });
        }
    },

    chooseItemCard: function (e) {
        var itemSearch = this.$el.find('#itemSearch').val();
        var itemText = this.$el.find('#itemText').val();
        if (itemSearch != null && itemSearch != '' && itemText != '' && itemText != null) { 
            var grid = $('.grid-stack').data('gridstack');
            var widget = $('<div>');
            var widgetContent = $('<div>');
            $(widgetContent)
                .addClass("grid-stack-item-content")
                .addClass('valign-wrapper');
            $(widgetContent).css('display', 'flex');
            $(widgetContent).css('justify-content', 'center');
            $(widgetContent).css('border', '1px solid #555');
            $(widgetContent).css('font-size', '0.8rem');
            $(widgetContent).css('color', 'black');
            $(widgetContent).css('background-color', 'rgb(226,227,226)');

            $(widgetContent).html(itemText);
            $(widget).attr("data-gs-locked", true);
            $(widget).attr("data-gs-max-width", 2);
            $(widget).attr("data-gs-max-height", 2);
            $(widget).attr("data-id", 0);
            $(widget).attr("data-name", itemText);
            $(widget).append(widgetContent);
            if (App.serverInfo.isFoodService) {
                grid.addWidget($(widget), 1, 1, 1, 1, true);
            }
            else {
                grid.addWidget($(widget), 1, 1, 2, 1, true);
            }
            for (var i = 0; i < grid.grid.nodes.length; i++)
            {   
                if (grid.grid.nodes[i].el[0].innerText == itemText) {
                    if (grid.grid.nodes[i].y <= 1) {
                        var updatedModel = {
                            id: 0,
                            name: itemText,
                            row: grid.grid.nodes[i].y + 1,
                            column: grid.grid.nodes[i].x + 1,
                            width: 1,
                            height: 1,
                            imageName: 'posBtn01',
                            type: 'I',
                            text: itemSearch,
                            cr: true,
                            keysetName: this.currentKeySet,
                            page: "TOP",
                            noRepeat: false,
                            keyNumber: Math.floor(Math.random() * 100) + 1,
                            noSync: false,
                            isActive: true,
                            textColor: "Black"
                        }
                    }
                    else {
                        var updatedModel = {
                            id: 0,
                            name: itemText,
                            row: grid.grid.nodes[i].y - 1,
                            column: grid.grid.nodes[i].x + 1,
                            width: 1,
                            height: 1,
                            imageName: 'posBtn01',
                            type: 'I',
                            text: itemSearch,
                            cr: true,
                            keysetName: this.currentKeySet,
                            page: this.currentPage,
                            noRepeat: false,
                            keyNumber: Math.floor(Math.random() * 100) + 1,
                            noSync: false,
                            isActive: true,
                            textColor: "Black"
                        }
                    }
                    this.addNewPosKey(updatedModel)
        
                    $('#pos-key-form-modal').modal().modal('close');
                }
            }
        }
        else {
            M.toast({ html: '{Literal}A button name and item are required{/Literal}' });
        }
    },

    choosePageCard: function (e) {
        var element = $(e.currentTarget);
        var itemId = $(element).attr('description-id');

        var grid = $('.grid-stack').data('gridstack');
        var widget = $('<div>');
        var widgetContent = $('<div>');
        $(widgetContent)
            .addClass("grid-stack-item-content")
            .addClass('valign-wrapper');
        $(widgetContent).css('display', 'flex');
        $(widgetContent).css('justify-content', 'center');
        $(widgetContent).css('border', '1px solid #555');
        $(widgetContent).css('font-size', '0.8rem');
        $(widgetContent).css('color', 'black');
        $(widgetContent).css('background-color', 'rgb(226,227,226)');

        $(widgetContent).html(itemId);
        $(widget).attr("data-gs-locked", true);
        $(widget).attr("data-gs-max-width", 2);
        $(widget).attr("data-gs-max-height", 2);
        $(widget).attr("data-id", 0);
        $(widget).attr("data-name", itemId);
        $(widget).append(widgetContent);
        if (App.serverInfo.isFoodService) {
            grid.addWidget($(widget), 1, 1, 1, 1, true);
        }
        else {
            grid.addWidget($(widget), 1, 1, 1, 1, true);
        }

        for (var i = 0; i < grid.grid.nodes.length; i++)
        {   
            if (grid.grid.nodes[i].el[0].innerText == itemId) {
                if (grid.grid.nodes[i].y <= 1) {
                    var updatedModel = {
                        id: 0,
                        name: itemId,
                        row: grid.grid.nodes[i].y + 1,
                        column: grid.grid.nodes[i].x + 1,
                        width: 1,
                        height: 1,
                        imageName: 'posBtn01',
                        type: 'P',
                        text: itemId,
                        cr: true,
                        keysetName: this.currentKeySet,
                        page: "TOP",
                        noRepeat: false,
                        keyNumber: Math.floor(Math.random() * 100) + 1,
                        noSync: false,
                        isActive: true,
                        textColor: "Black"
                    }
                }
                else {
                    var updatedModel = {
                        id: 0,
                        name: itemId,
                        row: grid.grid.nodes[i].y - 1,
                        column: grid.grid.nodes[i].x + 1,
                        width: 1,
                        height: 1,
                        imageName: 'posBtn01',
                        type: 'P',
                        text: itemId,
                        cr: true,
                        keysetName: this.currentKeySet,
                        page: this.currentPage,
                        noRepeat: false,
                        keyNumber: Math.floor(Math.random() * 100) + 1,
                        noSync: false,
                        isActive: true,
                        textColor: "Black"
                    }
                }
               
                this.addNewPosKey(updatedModel)
                $('#pos-key-form-modal').modal().modal('close');
                break;
            }
        }

        this.grid = grid;
    },

    choosePageLabel: function () {
        var that = this;
        var label = this.$el.find('#label').val();

        if (label != null && label != '' && label != undefined) { 
            $('#pos-key-form-modal').modal().modal('close');
            var grid = $('.grid-stack').data('gridstack');
            var widget = $('<div>');
            var widgetContent = $('<div>');
            $(widgetContent)
                .addClass("grid-stack-item-content")
                .addClass("gray")
                .addClass('valign-wrapper');
            $(widgetContent).css('display', 'flex');
            $(widgetContent).css('justify-content', 'center');
            $(widgetContent).css('border', '1px solid #555');
            $(widgetContent).css('font-size', '0.8rem');
            $(widgetContent).css('color', 'black');
            $(widgetContent).css('background-color', 'rgb(226,227,226)');

            $(widgetContent).html(label);
            $(widget).attr("data-gs-locked", true);
            $(widget).attr("data-gs-max-width", 2);
            $(widget).attr("data-gs-max-height", 2);
            $(widget).attr("data-id", 0);
            $(widget).attr("data-name", label);
            $(widget).append(widgetContent);
            if (App.serverInfo.isFoodService) {
                grid.addWidget($(widget), 1, 1, 1, 1, true);
            }
            else {
                grid.addWidget($(widget), 1, 1, 2, 1, true);
            }

            for (var i = 0; i < grid.grid.nodes.length; i++)
            {   
                if (grid.grid.nodes[i].el[0].innerText == label) {
                    
                    var updatedModel = {
                        id: 0,
                        name: label,
                        row: grid.grid.nodes[i].y - 1,
                        column: grid.grid.nodes[i].x + 1,
                        width: 1,
                        height: 1,
                        imageName: 'posBtn01',
                        type: 'I',
                        text: label,
                        textColor: 0,
                        cr: true,
                        keysetName: that.currentKeySet,
                        page: that.currentPage,
                        noRepeat: false,
                        keyNumber: Math.floor(Math.random() * 100) + 1,
                        noSync: false,
                        isActive: true,
                        textColor: "Black"
                    }
                    if (this.grid.grid.nodes[i].y <= 1) {
                        updatedModel.page = "TOP";
                        updatedModel.row = grid.grid.nodes[i].y + 1;
                    }
                    this.addNewPosKey(updatedModel)
                    break;
                }
            }
        }
        else {
            M.toast({ html: '{Literal}Please enter label name{/Literal}' });
        }
        
    },

    chooseTareLabel: function () {
        var tareText = this.$el.find('#tareText').val();
        var tareWeight = this.$el.find('#tareWeight').val();

        if (tareText != null && tareText != '' && tareText != undefined && tareWeight != null && tareWeight != '' && tareWeight != undefined) { 
            var grid = $('.grid-stack').data('gridstack');
            var widget = $('<div>');
            var widgetContent = $('<div>');
            $(widgetContent)
                .addClass("grid-stack-item-content")
                .addClass('valign-wrapper');
            $(widgetContent).css('display', 'flex');
            $(widgetContent).css('justify-content', 'center');
            $(widgetContent).css('border', '1px solid #555');
            $(widgetContent).css('font-size', '0.8rem');
            $(widgetContent).css('color', 'black');
            $(widgetContent).css('background-color', 'rgb(226,227,226)');

            $(widgetContent).html(tareText);
            $(widget).attr("data-gs-locked", true);
            $(widget).attr("data-gs-max-width", 2);
            $(widget).attr("data-gs-max-height", 2);
            $(widget).attr("data-id", 0);
            $(widget).attr("data-name", tareText);
            $(widget).append(widgetContent);
            if (App.serverInfo.isFoodService) {
                grid.addWidget($(widget), 1, 1, 1, 1, true);
            }
            else {
                grid.addWidget($(widget), 1, 1, 2, 1, true);
            }
            
            for (var i = 0; i < grid.grid.nodes.length; i++)
            {   
                if (grid.grid.nodes[i].el[0].innerText == tareText) {
                    var updatedModel = {
                        id: 0,
                        name: tareText,
                        row: grid.grid.nodes[i].y - 1,
                        column: grid.grid.nodes[i].x + 1,
                        width: 1,
                        height: 1,
                        imageName: 'posBtn01',
                        type: '#',
                        text: tareWeight,
                        cr: true,
                        keysetName: this.currentKeySet,
                        page: this.currentPage,
                        noRepeat: false,
                        keyNumber: Math.floor(Math.random() * 100) + 1,
                        noSync: false,
                        isActive: true,
                        textColor: "Black"
                    }
                    if (this.grid.grid.nodes[i].y <= 1) {
                        updatedModel.page = "TOP";
                        updatedModel.row = grid.grid.nodes[i].y + 1;
                    }
                    this.addNewPosKey(updatedModel)
                    $('#pos-key-form-modal').modal().modal('close');
                }
            }
        }
        else if (tareText == '') {
            M.toast({ html: '{Literal}Please enter label name{/Literal}' });
        }
        else if (tareWeight == '') {
            M.toast({ html: '{Literal}Please enter desired weight{/Literal}' });
        }
    },

    chooseRepriceLabel: function () {
        var saleRepriceText = this.$el.find('#saleRepriceText').val();
        var saleRepricePercent = this.$el.find('#saleRepricePercent').val();

        if(saleRepricePercent < 0 || saleRepricePercent > 100) {
            M.toast({ html: '{Literal}Please choose a valid percent{/Literal}' });
        }
        else if (saleRepriceText != '' && saleRepriceText != undefined && saleRepricePercent != '') { 
            var grid = $('.grid-stack').data('gridstack');
            var widget = $('<div>');
            var widgetContent = $('<div>');
            $(widgetContent)
                .addClass("grid-stack-item-content")
                .addClass('valign-wrapper');
            $(widgetContent).css('display', 'flex');
            $(widgetContent).css('justify-content', 'center');
            $(widgetContent).css('border', '1px solid #555');
            $(widgetContent).css('font-size', '0.8rem');
            $(widgetContent).css('color', 'black');
            $(widgetContent).css('background-color', 'rgb(226,227,226)');

            $(widgetContent).html(saleRepriceText);
            $(widget).attr("data-gs-locked", true);
            $(widget).attr("data-gs-max-width", 2);
            $(widget).attr("data-gs-max-height", 2);
            $(widget).attr("data-id", 0);
            $(widget).attr("data-name", saleRepriceText);
            $(widget).append(widgetContent);
            if (App.serverInfo.isFoodService) {
                grid.addWidget($(widget), 1, 1, 1, 1, true);
            }
            else {
                grid.addWidget($(widget), 1, 1, 2, 1, true);
            }
            for (var i = 0; i < grid.grid.nodes.length; i++)
            {   
                if (grid.grid.nodes[i].el[0].innerText == saleRepriceText) {
                    var updatedModel = {
                        id: 0,
                        name: saleRepriceText,
                        row: grid.grid.nodes[i].y - 1,
                        column: grid.grid.nodes[i].x + 1,
                        width: 1,
                        height: 1,
                        imageName: 'posBtn01',
                        type: 'S',
                        text: saleRepricePercent,
                        cr: true,
                        keysetName: this.currentKeySet,
                        page: this.currentPage,
                        noRepeat: false,
                        keyNumber: Math.floor(Math.random() * 100) + 1,
                        noSync: false,
                        isActive: true,
                        textColor: "Black"
                    }
                    if (this.grid.grid.nodes[i].y <= 1) {
                        updatedModel.page = "TOP";
                        updatedModel.row = grid.grid.nodes[i].y + 1;
                    }
        
                    this.addNewPosKey(updatedModel)
                    $('#pos-key-form-modal').modal().modal('close');
                }
            }
        }
        else if (saleRepriceText == '') {
            M.toast({ html: '{Literal}Please enter label name{/Literal}' });
        }
        else if (saleRepricePercent == '')  {
            M.toast({ html: '{Literal}Please enter a discount percent{/Literal}' });
        }
    },

    chooseItemDiscount: function () {
        var itemDiscountText = this.$el.find('#itemDiscountTextForm').val();
        var itemDiscountPercent = this.$el.find('#itemDiscountPercent').val();

        if(itemDiscountPercent < 0 || itemDiscountPercent > 100) {
            M.toast({ html: '{Literal}Please choose a valid percent{/Literal}' });
        }
        else if (itemDiscountText != '' && itemDiscountText != undefined && itemDiscountPercent != '') { 
            var grid = $('.grid-stack').data('gridstack');
            var widget = $('<div>');
            var widgetContent = $('<div>');
            $(widgetContent)
                .addClass("grid-stack-item-content")
                .addClass('valign-wrapper');
            $(widgetContent).css('display', 'flex');
            $(widgetContent).css('justify-content', 'center');
            $(widgetContent).css('border', '1px solid #555');
            $(widgetContent).css('font-size', '0.8rem');
            $(widgetContent).css('color', 'black');
            $(widgetContent).css('background-color', 'rgb(226,227,226)');

            $(widgetContent).html(itemDiscountText);
            $(widget).attr("data-gs-locked", true);
            $(widget).attr("data-gs-max-width", 2);
            $(widget).attr("data-gs-max-height", 2);
            $(widget).attr("data-id", 0);
            $(widget).attr("data-name", itemDiscountText);
            $(widget).append(widgetContent);
            if (App.serverInfo.isFoodService) {
                grid.addWidget($(widget), 1, 1, 1, 1, true);
            }
            else {
                grid.addWidget($(widget), 1, 1, 2, 1, true);
            }

            for (var i = 0; i < grid.grid.nodes.length; i++)
            {   
                if (grid.grid.nodes[i].el[0].innerText == itemDiscountText) {
                    var updatedModel = {
                        id: 0,
                        name: itemDiscountText,
                        row: grid.grid.nodes[i].y - 1,
                        column: grid.grid.nodes[i].x + 1,
                        width: 1,
                        height: 1,
                        imageName: 'posBtn01',
                        type: 'D',
                        text: itemDiscountPercent,
                        cr: true,
                        keysetName: this.currentKeySet,
                        page: this.currentPage,
                        noRepeat: false,
                        keyNumber: Math.floor(Math.random() * 100) + 1,
                        noSync: false,
                        isActive: true,
                        textColor: "Black"
                    }
                    if (this.grid.grid.nodes[i].y <= 1) {
                        updatedModel.page = "TOP";
                        updatedModel.row = grid.grid.nodes[i].y + 1;
                    }
        
                    this.addNewPosKey(updatedModel)
                    $('#pos-key-form-modal').modal().modal('close');
                }
            }
        }
        else if (saleRepriceText == '') {
            M.toast({ html: '{Literal}Please enter label name{/Literal}' });
        }
        else if (saleRepricePercent == '')  {
            M.toast({ html: '{Literal}Please enter a discount percent{/Literal}' });
        }
    },

    chooseKeysetCards: function (e) {
        var that = this;
        var keySetText = this.$el.find('#keySetText').val();
        var keySet = this.$el.find('#change-key-set-select option:selected').text();
        var keySetValue = this.$el.find('#change-key-set-select').val();
        
        if (keySetText != null && keySetText != '' && keySetText != undefined && keySetValue != 'chooseKeySet') { 
            if (keySet == "") {
                keySet = "MAIN";
            }
            
            var grid = $('.grid-stack').data('gridstack');
            var widget = $('<div>');
            var widgetContent = $('<div>');
            $(widgetContent)
                .addClass("grid-stack-item-content")
                .addClass('valign-wrapper');
            $(widgetContent).css('display', 'flex');
            $(widgetContent).css('justify-content', 'center');
            $(widgetContent).css('border', '1px solid #555');
            $(widgetContent).css('font-size', '0.8rem');
            $(widgetContent).css('color', 'black');
            $(widgetContent).css('background-color', 'rgb(226,227,226)');

            $(widgetContent).html(keySetText);
            $(widget).attr("data-gs-locked", true);
            $(widget).attr("data-gs-max-width", 2);
            $(widget).attr("data-gs-max-height", 2);
            $(widget).attr("data-id", 0);
            $(widget).attr("data-name", keySetText);
            $(widget).append(widgetContent);
            if (App.serverInfo.isFoodService) {
                grid.addWidget($(widget), 1, 1, 1, 1, true);
            }
            else {
                grid.addWidget($(widget), 1, 1, 2, 1, true);
            }

            for (var i = 0; i < grid.grid.nodes.length; i++)
            {   
                if (grid.grid.nodes[i].el[0].innerText == keySetText) {
                    var updatedModel = {
                        id: 0,
                        name: keySetText,
                        row: grid.grid.nodes[i].y + 1,
                        column: grid.grid.nodes[i].x + 1,
                        width: 1,
                        height: 1,
                        imageName: 'posBtn01',
                        type: 'k',
                        text: keySet,
                        cr: true,
                        keysetName: this.currentKeySet,
                        page: this.currentPage,
                        noRepeat: false,
                        keyNumber: Math.floor(Math.random() * 100) + 1,
                        noSync: false,
                        isActive: true,
                        textColor: "Black"
                    }
                    if (this.grid.grid.nodes[i].y <= 1) {
                        updatedModel.page = "TOP";
                        updatedModel.row = grid.grid.nodes[i].y + 1;
                    }

                    $('#pos-key-form-modal').modal().modal('close');
                    this.addNewPosKey(updatedModel)
                    break;
                }
            }
        }
        else if (keySetValue == 'chooseKeySet') {
            M.toast({ html: '{Literal}Please choose a Key Set{/Literal}' });
        }
        else if (keySetText == '') {
            M.toast({ html: '{Literal}Please enter a button name{/Literal}' });
        }
        
    },

    addNewPosKey: function (updatedModel) {
        var that = this;
        var sessionToken = this.getCookie();

        $.ajax({
            url: '/data/add-pos-key',
            data: {
                menuKey: JSON.stringify(updatedModel),
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            
            success: function (data) {
                var grid = $('.grid-stack').data('gridstack');

                for (var i = 0; i < grid.grid.nodes.length; i++)
                {
                    if (grid.grid.nodes[i].el[0].innerText == updatedModel.name) {
                        $(grid.grid.nodes[i].el[0]).attr('data-id', '' + data.id)
                        $(grid.grid.nodes[i].el[0]).attr('id', '' + data.id)
                        grid.grid.nodes[i].id = data.id;
                    }
                }

                that.grid = grid;
                updatedModel.id = data.id;
                that.items.push(updatedModel);
                M.toast({ html: '{Literal}Menu Key added successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem adding this Menu Key{/Literal}.' });
                }
            }
        });
        
    },

    deleteKey: function (e) {
        var that = this;
        var page = this.$el.find('#page-selector option:selected').text(); 
        var keySet = this.$el.find('#key-set-selector option:selected').text();
        if (keySet == "MAIN" || keySet == "ראשי") {
            keySet = "";
        }
        var sessionToken = this.getCookie();

        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].id == this.chosenKeyId && this.items[i].keysetName == keySet)
            {
                this.chosenKey = this.items[i];
            }
        }

        var grid = that.grid;
        for (var i = 0; i < that.grid.grid.nodes.length; i ++) {
            var chosenId = $(grid.grid.nodes[i].el[0]).attr('data-id');
            if (chosenId == 0) {
                chosenId = grid.grid.nodes[i].el[0].id;
            }
            if (that.chosenKey.id == chosenId) {
                el = $(grid.grid.nodes[i].el)
                grid.removeWidget(el);
                break;
            }
        }
        
        $.ajax({
            url: '/data/remove-menu-key',
            data: {
                buttonId: (that.chosenKeyId),
                keySetName: keySet,
                page: page,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {

                M.toast({ html: '{Literal}Menu Key removed successfully{/Literal}' });
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem deleting this menu key{/Literal}' });
                }
            }
        });
    },

    saveNewMenuPage: function () {
        var menuPage = this.$el.find('#menuPageName').val();
        that = this;
        var isTaken = false;
        if (menuPage != '' && menuPage != undefined && menuPage != null) {
            for (var i in that.pages) {
                if (that.pages[i] === menuPage) {
                    isTaken = true;
                    break;
                }
            }

            if (isTaken) {
                M.toast({ html: '{Literal}This Menu Page is already defined{/Literal}' });
            }
            else {
                that.pages.push(menuPage);  
                this.render();
            }
        }
        else {
            M.toast({ html: '{Literal}Please enter a valid Menu Page name{/Literal}' });
        }
    },

    openEditNameModal: function () {
        var currentPage = this.$el.find('#page-selector option:selected').text();
        var pageName = document.getElementById('pageName'); 
        pageName.value = currentPage;

        var pageNameModal = this.$el.find('#edit-page-name-modal').modal();
        pageNameModal.modal('open');
    },

    openDeletePageModal: function (e) {
        var deletePageModal = this.$el.find('#delete-page-modal').modal();
        deletePageModal.modal('open');
    },

    addNewPage: function () {
        var newPageModal = this.$el.find('#new-page-form-modal').modal();
        newPageModal.modal('open');
    },

    openAddKeySetModal: function () {
        var newRoomModal = this.$el.find('#new-key-set-modal').modal();
        newRoomModal.modal('open');
    },

    saveNewPage: function () {
        var that = this;
        var sessionToken = this.getCookie();
        var newPageName = this.$el.find('#newPageName').val();
        var keySetName = this.$el.find('#key-set-selector option:selected').text();

        if (newPageName == "") {
            M.toast({ html: '{Literal}A Page Name Must Be Defined{/Literal}' });
        }
        else {
            var foundName = false;
            for (var i = 0; i < this.pages.length; i++) {
                if (this.pages[i] == newPageName) {
                    foundName = true;
                }
            }

            if (foundName == true) {
                M.toast({ html: '{Literal}This Page Name Is Already Defined{/Literal}' });
            }
            else {
                this.pages.unshift(newPageName);

                var updatedModal = {
                    id: 0,
                    name: 'New Button',
                    row: 3,
                    column: 1,
                    width: 1,
                    height: 1,
                    imageName: 'posBtn01',
                    type: 'I',
                    text: 'New Button',
                    cr: true,
                    keysetName: keySetName,
                    page: newPageName,
                    noRepeat: false,
                    keyNumber: Math.floor(Math.random() * 100) + 1,
                    noSync: false,
                    isActive: true
                }

                $.ajax({
                    url: '/data/add-pos-key',
                    data: {
                        menuKey: JSON.stringify(updatedModal),
                        token: sessionToken
                    },
                    dataType: 'json',
                    type: 'POST',
        
                    success: function (data) {
                        M.toast({ html: '{Literal}Page added successfully{/Literal}' });
                        that.render();
                    },
        
                    error: function (e) {
                        if (e.status == 523) {
                            window.location.href = "#/log-in";
                            location.reload();
                        }
                        else {
                            M.toast({ html: '{Literal}There was a problem deleting this page{/Literal}' });
                        }
                    }
                });
            }
        }
    },

    savePageName: function () {
        var that = this;
        var newPageName = this.$el.find('#pageName').val();
        var currentPage = this.$el.find('#page-selector option:selected').text();
        var sessionToken = this.getCookie();
        
        if (currentPage.toUpperCase() == "MAIN" || currentPage == "ראשי") {
            M.toast({ html: '{Literal}The room "main" cannot be changed{/Literal}' }); 
        }
        else {
            $.ajax({
                url: '/data/rename-page',
                data: {
                    oldPageName: currentPage,
                    newPageName: (newPageName),
                    token: sessionToken
                },
                dataType: 'json',
                type: 'POST',
    
                success: function (data) {
                    for (var i = 0; i < that.pages.length; i++) {
                        if (that.pages[i] == currentPage) {
                            that.pages[i] = newPageName;
                        }
                    }

                    for (var i = 0; i < that.items.length; i++) {
                        if (that.items[i].page == currentPage) {
                            that.items[i].page = newPageName;
                        }
                    }
                    that.render();
                    M.toast({ html: '{Literal}Page name changed successfully{/Literal}' });
                },
    
                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem renaming this page{/Literal}' });
                    }
                }
            });
        }
    },

    deletePage: function () {
        var that = this;
        var sessionToken = this.getCookie();
        var currentPage = this.$el.find('#page-selector option:selected').text();
        var keySetName = this.$el.find('#key-set-selector option:selected').text();

        if (keySetName == "MAIN" || keySetName == "ראשי") {
            keySetName = "";
        }
        
        $.ajax({
            url: '/data/remove-menu-page',
            data: {
                page: currentPage,
                keySetName: keySetName,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                that.render();
                M.toast({ html: '{Literal}Page removed successfully{/Literal}' });

                for (i = 0; i < that.items.length; i++)
                {
                    if (that.items[i].page == currentPage)
                    {
                        that.items[i] = "";
                        //newDivId = "divTable" + i;
                        //$('#' + newDivId).remove();
                    }
                }

                
                for (i = 0; i < that.pages.length; i++)
                {
                    if (that.pages[i] == that.pages)
                    {
                        that.pages[i] = "";
                    }
                }
                //that.render();
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem deleting this page{/Literal}' });
                }
            }
        });
    },

    addKeySet: function() {
        var that = this;
        var sessionToken = this.getCookie();
        var newKeySetName = this.$el.find('#newKeySetName').val();
        var foundName = false;

        for (var i = 0; i < this.keySet; i++) {
            if (newKeySetName == this.keySet[i].name) {
                foundName = true;
            }
        }

        if (newKeySetName == "" || newKeySetName.toUpperCase() === 'MAIN' || newKeySetName === 'ראשי') {
            M.toast({ html: '{Literal}Please enter a valid key set name{/Literal}' });
        }
        else if (!foundName) {

            var updatedModal = {
                id: 0,
                name: 'New Button',
                row: 3,
                column: 1,
                width: 1,
                height: 1,
                imageName: 'posBtn01',
                type: 'I',
                text: 'New Button',
                cr: true,
                keysetName: newKeySetName,
                page: "Main",
                noRepeat: false,
                keyNumber: Math.floor(Math.random() * 100) + 1,
                noSync: false,
                isActive: true
            }

            $.ajax({
                url: '/data/add-pos-key',
                data: {
                    menuKey: JSON.stringify(updatedModal),
                    token: sessionToken
                },
                dataType: 'json',
                type: 'POST',
    
                success: function (data) {
                    M.toast({ html: '{Literal}Key Set added successfully{/Literal}' });
                    that.render();
                },
    
                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem deleting this page{/Literal}' });
                    }
                }
            });
        }
        else {
            M.toast({ html: '{Literal}This Key Set has already been defined{/Literal}' });
        }
    },

    saveEditedKey: function() {
        var that = this;
        var currentKeySet = this.$el.find('#key-set-selector option:selected').text();
        var currentPage = this.$el.find('#page-selector option:selected').text();

        if (currentKeySet == "MAIN" || currentKeySet == "ראשי") {
            currentKeySet = "";
        }
        if (this.chosenKey.page.toUpperCase() == 'TOP') {
            currentPage = this.chosenKey.page;
        }

        if ($('#tareForm').is(":visible")) {
            var tareWeight = this.$el.find('#editTareWeight').val();
            var tareText = this.$el.find('#editTareText').val();

            var tareBlue = this.$el.find('#tareBlue:checked:checked').length > 0;
            var tareGray = this.$el.find('#tareGray:checked:checked').length > 0;
            var tareGreen = this.$el.find('#tareGreen:checked:checked').length > 0;
            var tareOrange = this.$el.find('#tareOrange:checked:checked').length > 0;
            var tarePink = this.$el.find('#tarePink:checked:checked').length > 0;
            var tarePurple = this.$el.find('#tarePurple:checked:checked').length > 0;
            var tareRed = this.$el.find('#tareRed:checked:checked').length > 0;
            var tareTeal = this.$el.find('#tareTeal:checked:checked').length > 0;
            var tareYellow = this.$el.find('#tareYellow:checked:checked').length > 0;

            if (tareBlue) {
                this.chosenKey.imageName = 'posBtn08';
            }
            else if (tareGray) {
                this.chosenKey.imageName = 'posBtn01';
            }
            else if (tareGreen) {
                this.chosenKey.imageName = 'posBtn03';
            }
            else if (tarePink) {
                this.chosenKey.imageName = 'posBtn06';
            }
            else if (tareOrange) {
                this.chosenKey.imageName = 'posBtn09';
                this.chosenKey.textColor = "White";
            }
            else if (tarePurple) {
                this.chosenKey.imageName = 'posBtn07';
            }
            else if (tareRed) {
                this.chosenKey.imageName = 'posBtn05';
            }
            else if (tareTeal) {
                this.chosenKey.imageName = 'posBtn02';
            }
            else if (tareYellow) {
                this.chosenKey.imageName = 'posBtn04';
            }
            
            var updatedModal = {
                id: this.chosenKey.id,
                name: tareText,
                row: this.chosenKey.row,
                column: this.chosenKey.column,
                width: this.chosenKey.width,
                height: this.chosenKey.height,
                imageName:  this.chosenKey.imageName,
                textColor: this.chosenKey.textColor,
                type: '#',
                text: tareWeight,
                cr: true,
                keysetName: currentKeySet,
                page: currentPage,
                noRepeat: false,
                keyNumber:  this.chosenKey.keyNumber,
                noSync: false,
                isActive: true
            }

            this.chosenKey = updatedModal;

            this.editPosKey();
            
        }
        else if ($('#keysetForm').is(":visible")) {
            var keySet = this.$el.find('#key-set-form-selector option:selected').text();
            var keySetVal = this.$el.find('#key-set-form-selector').val();
            var keySetText = this.$el.find('#editKeysetText').val();

            var keysetBlue = this.$el.find('#keysetBlue:checked').length > 0;
            var keysetGray = this.$el.find('#keysetGray:checked').length > 0;
            var keysetGreen = this.$el.find('#keysetGreen:checked').length > 0;
            var keysetOrange = this.$el.find('#keysetOrange:checked').length > 0;
            var keysetPink = this.$el.find('#keysetPink:checked').length > 0;
            var keysetPurple = this.$el.find('#keysetPurple:checked').length > 0;
            var keysetRed = this.$el.find('#keysetRed:checked').length > 0;
            var keysetYellow = this.$el.find('#keysetYellow:checked').length > 0;
            var keysetTeal = this.$el.find('#keysetTeal:checked').length > 0;

            if (keysetBlue) {
                this.chosenKey.imageName = 'posBtn08';
            }
            else if (keysetGray) {
                this.chosenKey.imageName = 'posBtn01';
            }
            else if (keysetGreen) {
                this.chosenKey.imageName = 'posBtn03';
            }
            else if (keysetPink) {
                this.chosenKey.imageName = 'posBtn06';
            }
            else if (keysetOrange) {
                this.chosenKey.imageName = 'posBtn09';
                this.chosenKey.textColor = "White";
            }
            else if (keysetPurple) {
                this.chosenKey.imageName = 'posBtn07';
            }
            else if (keysetRed) {
                this.chosenKey.imageName = 'posBtn05';
            }
            else if (keysetTeal) {
                this.chosenKey.imageName = 'posBtn02';
            }
            else if (keysetYellow) {
                this.chosenKey.imageName = 'posBtn04';
            }

            if (keySetVal == "") {
                keySet = this.chosenKey.keysetName;

                if (keySet == "") {
                    keySet = "MAIN"
                }
            }

            var updatedModal = {
                id: this.chosenKey.id,
                name: keySetText,
                row: this.chosenKey.row,
                column: this.chosenKey.column,
                width: this.chosenKey.width,
                height: this.chosenKey.height,
                imageName:  this.chosenKey.imageName,
                textColor: this.chosenKey.textColor,
                type: 'k',
                text: keySet,
                cr: true,
                keysetName: currentKeySet,
                page: currentPage,
                noRepeat: false,
                keyNumber:  this.chosenKey.keyNumber,
                noSync: false,
                isActive: true
            }

            this.chosenKey = updatedModal;

            this.editPosKey();
        }
        else if ($('#percentForm').is(":visible")) {
            var percentButtonText = this.$el.find('#percentButtonText').val();
            var discountPercent = this.$el.find('#discountPercent').val();

            var percentBlue = this.$el.find('#percentBlue:checked').length > 0;
            var percentGray = this.$el.find('#percentGray:checked').length > 0;
            var percentGreen = this.$el.find('#percentGreen:checked').length > 0;
            var percentOrange = this.$el.find('#percentOrange:checked').length > 0;
            var percentPink = this.$el.find('#percentPink:checked').length > 0;
            var percentPurple = this.$el.find('#percentPurple:checked').length > 0;
            var percentRed = this.$el.find('#percentRed:checked').length > 0;
            var percentTeal = this.$el.find('#percentTeal:checked').length > 0;
            var percentYellow = this.$el.find('#percentYellow:checked').length > 0;

            if (percentBlue) {
                this.chosenKey.imageName = 'posBtn08';
            }
            else if (percentGray) {
                this.chosenKey.imageName = 'posBtn01';
            }
            else if (percentGreen) {
                this.chosenKey.imageName = 'posBtn03';
            }
            else if (percentOrange) {
                this.chosenKey.imageName = 'posBtn09';
                this.chosenKey.textColor = "White";
            }
            else if (percentPink) {
                this.chosenKey.imageName = 'posBtn06';
            }
            else if (percentPurple) {
                this.chosenKey.imageName = 'posBtn07';
            }
            else if (percentRed) {
                this.chosenKey.imageName = 'posBtn05';
            }
            else if (percentTeal) {
                this.chosenKey.imageName = 'posBtn02';
            }
            else if (percentYellow) {
                this.chosenKey.imageName = 'posBtn04';
            }

            var updatedModal = {
                id: this.chosenKey.id,
                name: percentButtonText,
                row: this.chosenKey.row,
                column: this.chosenKey.column,
                width: this.chosenKey.width,
                height: this.chosenKey.height,
                imageName:  this.chosenKey.imageName,
                textColor: this.chosenKey.textColor,
                type: 'S',
                text: discountPercent,
                cr: true,
                keysetName: currentKeySet,
                page: currentPage,
                noRepeat: false,
                keyNumber:  this.chosenKey.keyNumber,
                noSync: false,
                isActive: true
            }

            this.chosenKey = updatedModal;

            this.editPosKey();
        }
        else if ($('#itemDiscountForm').is(":visible")) {
            var itemDiscountText = this.$el.find('#itemDiscountText').val();
            var itemDiscount = this.$el.find('#itemDiscount').val();

            if (itemDiscountText != '' && itemDiscount !=  '') {
                var itemDiscountBlue = this.$el.find('#itemDiscountBlue:checked').length > 0;
                var itemDiscountGray = this.$el.find('#itemDiscountGray:checked').length > 0;
                var itemDiscountGreen = this.$el.find('#itemDiscountGreen:checked').length > 0;
                var itemDiscountOrange = this.$el.find('#itemDiscountOrange:checked').length > 0;
                var itemDiscountPink = this.$el.find('#itemDiscountPink:checked').length > 0;
                var itemDiscountPurple = this.$el.find('#itemDiscountPurple:checked').length > 0;
                var itemDiscountRed = this.$el.find('#itemDiscountRed:checked').length > 0;
                var itemDiscountTeal = this.$el.find('#itemDiscountTeal:checked').length > 0;
                var itemDiscountYellow = this.$el.find('#itemDiscountYellow:checked').length > 0;
    
                if (itemDiscountBlue) {
                    this.chosenKey.imageName = 'posBtn08';
                }
                else if (itemDiscountGray) {
                    this.chosenKey.imageName = 'posBtn01';
                }
                else if (itemDiscountGreen) {
                    this.chosenKey.imageName = 'posBtn03';
                }
                else if (itemDiscountOrange) {
                    this.chosenKey.imageName = 'posBtn09';
                    this.chosenKey.textColor = "White";
                }
                else if (itemDiscountPink) {
                    this.chosenKey.imageName = 'posBtn06';
                }
                else if (itemDiscountPurple) {
                    this.chosenKey.imageName = 'posBtn07';
                }
                else if (itemDiscountRed) {
                    this.chosenKey.imageName = 'posBtn05';
                }
                else if (itemDiscountTeal) {
                    this.chosenKey.imageName = 'posBtn02';
                }
                else if (itemDiscountYellow) {
                    this.chosenKey.imageName = 'posBtn04';
                }
    
                var updatedModal = {
                    id: this.chosenKey.id,
                    name: itemDiscountText,
                    row: this.chosenKey.row,
                    column: this.chosenKey.column,
                    width: this.chosenKey.width,
                    height: this.chosenKey.height,
                    imageName:  this.chosenKey.imageName,
                    textColor: this.chosenKey.textColor,
                    type: 'S',
                    text: itemDiscount,
                    cr: true,
                    keysetName: currentKeySet,
                    page: currentPage,
                    noRepeat: false,
                    keyNumber:  this.chosenKey.keyNumber,
                    noSync: false,
                    isActive: true
                }
    
                this.chosenKey = updatedModal;
    
                this.editPosKey();
            }
            else {
                M.toast({ html: '{Literal}Both Inputs Are Required{/Literal}' });
            }
        }
        else if ($('#priceLevelForm').is(":visible")) {
            var priceLevel = this.$el.find('#price-level-selector option:selected').text();
            var priceLevelButtonText = this.$el.find('#priceLevelButtonText').val();

            var priceLevelBlue = this.$el.find('#priceLevelBlue:checked').length > 0;
            var priceLevelGray = this.$el.find('#priceLevelGray:checked').length > 0;
            var priceLevelGreen = this.$el.find('#priceLevelGreen:checked').length > 0;
            var priceLevelOrange = this.$el.find('#priceLevelOrange:checked').length > 0;
            var priceLevelPink = this.$el.find('#priceLevelPink:checked').length > 0;
            var priceLevelPurple = this.$el.find('#priceLevelPurple:checked').length > 0;
            var priceLevelRed = this.$el.find('#priceLevelRed:checked').length > 0;
            var priceLevelTeal = this.$el.find('#priceLevelTeal:checked').length > 0;
            var priceLevelYellow = this.$el.find('#priceLevelYellow:checked').length > 0;

            if (priceLevelBlue) {
                this.chosenKey.imageName = 'posBtn08';
            }
            else if (priceLevelGray) {
                this.chosenKey.imageName = 'posBtn01';
            }
            else if (priceLevelGreen) {
                this.chosenKey.imageName = 'posBtn03';
            }
            else if (priceLevelOrange) {
                this.chosenKey.imageName = 'posBtn09';
                this.chosenKey.textColor = "White";
            }
            else if (priceLevelPink) {
                this.chosenKey.imageName = 'posBtn06';
            }
            else if (priceLevelPurple) {
                this.chosenKey.imageName = 'posBtn07';
            }
            else if (priceLevelRed) {
                this.chosenKey.imageName = 'posBtn05';
            }
            else if (priceLevelTeal) {
                this.chosenKey.imageName = 'posBtn02';
            }
            else if (priceLevelYellow) {
                this.chosenKey.imageName = 'posBtn04';
            }

            var updatedModal = {
                id: this.chosenKey.id,
                name: priceLevelButtonText,
                row: this.chosenKey.row,
                column: this.chosenKey.column,
                width: this.chosenKey.width,
                height: this.chosenKey.height,
                imageName:  this.chosenKey.imageName,
                textColor: this.chosenKey.textColor,
                type: 'S',
                text: priceLevel,
                cr: this.chosenKey.cr,
                keysetName: currentKeySet,
                page: currentPage,
                noRepeat: this.chosenKey.noRepeat,
                keyNumber:  this.chosenKey.keyNumber,
                noSync: this.chosenKey.noSync,
                isActive: this.chosenKey.isActive
            }

            this.chosenKey = updatedModal;

            this.editPosKey();
        }
        else if ($('#labelForm').is(":visible")) {
            var labelButtonText = this.$el.find('#labelButtonText').val();

            var labelBlue = this.$el.find('#labelBlue:checked').length > 0;
            var labelGray = this.$el.find('#labelGray:checked').length > 0;
            var labelGreen = this.$el.find('#labelGreen:checked').length > 0;
            var labelOrange = this.$el.find('#labelOrange:checked').length > 0;
            var labelPink = this.$el.find('#labelPink:checked').length > 0;
            var labelPurple = this.$el.find('#labelPurple:checked').length > 0;
            var labelRed = this.$el.find('#labelRed:checked').length > 0;
            var labelTeal = this.$el.find('#labelTeal:checked').length > 0;
            var labelYellow = this.$el.find('#labelYellow:checked').length > 0;

            if (labelBlue) {
                this.chosenKey.imageName = 'posBtn08';
            }
            else if (labelGray) {
                this.chosenKey.imageName = 'posBtn01';
            }
            else if (labelGreen) {
                this.chosenKey.imageName = 'posBtn03';
            }
            else if (labelOrange) {
                this.chosenKey.imageName = 'posBtn09';
                this.chosenKey.textColor = "White";
            }
            else if (labelPink) {
                this.chosenKey.imageName = 'posBtn06';
            }
            else if (labelPurple) {
                this.chosenKey.imageName = 'posBtn07';
            }
            else if (labelRed) {
                this.chosenKey.imageName = 'posBtn05';
            }
            else if (labelTeal) {
                this.chosenKey.imageName = 'posBtn02';
            }
            else if (labelYellow) {
                this.chosenKey.imageName = 'posBtn04';
            }

            var updatedModal = {
                id: this.chosenKey.id,
                name: labelButtonText,
                row: this.chosenKey.row,
                column: this.chosenKey.column,
                width: this.chosenKey.width,
                height: this.chosenKey.height,
                imageName:  this.chosenKey.imageName,
                textColor: this.chosenKey.textColor,
                type: 'I',
                text: labelButtonText,
                cr: this.chosenKey.cr,
                keysetName: currentKeySet,
                page: currentPage,
                noRepeat: this.chosenKey.noRepeat,
                keyNumber:  this.chosenKey.keyNumber,
                noSync: this.chosenKey.noSync,
                isActive: this.chosenKey.isActive
            }

            this.chosenKey = updatedModal;

            this.editPosKey();
        }
        else if ($('#itemForm').is(":visible")) {
            var pageButtonText = this.$el.find('#itemButtonText').val();
            var cr = this.$el.find('.cr:checked').length > 0;
            var noRepeat = this.$el.find('.noRepeat:checked').length > 0;

            var itemBlue = this.$el.find('#itemBlue:checked').length > 0;
            var itemGray = this.$el.find('#itemGray:checked').length > 0;
            var itemGreen = this.$el.find('#itemGreen:checked').length > 0;
            var itemOrange = this.$el.find('#itemOrange:checked').length > 0;
            var itemPink = this.$el.find('#itemPink:checked').length > 0;
            var itemPurple = this.$el.find('#itemPurple:checked').length > 0;
            var itemRed = this.$el.find('#itemRed:checked').length > 0;
            var itemTeal = this.$el.find('#itemTeal:checked').length > 0;
            var itemYellow = this.$el.find('#itemYellow:checked').length > 0;

            if (itemBlue) {
                this.chosenKey.imageName = 'posBtn08';
            }
            else if (itemGray) {
                this.chosenKey.imageName = 'posBtn01';
            }
            else if (itemGreen) {
                this.chosenKey.imageName = 'posBtn03';
            }
            else if (itemOrange) {
                this.chosenKey.imageName = 'posBtn09';
                this.chosenKey.textColor = "White";
            }
            else if (itemPink) {
                this.chosenKey.imageName = 'posBtn06';
            }
            else if (itemPurple) {
                this.chosenKey.imageName = 'posBtn07';
            }
            else if (itemRed) {
                this.chosenKey.imageName = 'posBtn05';
            }
            else if (itemTeal) {
                this.chosenKey.imageName = 'posBtn02';
            }
            else if (itemYellow) {
                this.chosenKey.imageName = 'posBtn04';
            }

            var updatedModal = {
                id: this.chosenKey.id,
                name: pageButtonText,
                row: this.chosenKey.row,
                column: this.chosenKey.column,
                width: this.chosenKey.width,
                height: this.chosenKey.height,
                imageName:  this.chosenKey.imageName,
                textColor: this.chosenKey.textColor,
                type: 'I',
                text: this.chosenKey.text,
                cr: cr,
                keysetName: currentKeySet,
                page: currentPage,
                noRepeat: noRepeat,
                keyNumber:  this.chosenKey.keyNumber,
                noSync: this.chosenKey.noSync,
                isActive: this.chosenKey.isActive
            }

            this.chosenKey = updatedModal;

            this.editPosKey();
        }
        else if ($('#pageForm').is(":visible")) {
            var pageSelected = this.$el.find('#page-form-selector option:selected').text();
            var pageSelectedVal = this.$el.find('#page-form-selector').val();
            var pageButtonText = this.$el.find('#pageButtonText').val();

            var pageBlue = this.$el.find('#pageBlue:checked').length > 0;
            var pageGray = this.$el.find('#pageGray:checked').length > 0;
            var pageGreen = this.$el.find('#pageGreen:checked').length > 0;
            var pageOrange = this.$el.find('#pageOrange:checked').length > 0;
            var pagePink = this.$el.find('#pagePink:checked').length > 0;
            var pagePurple = this.$el.find('#pagePurple:checked').length > 0;
            var pageRed = this.$el.find('#pageRed:checked').length > 0;
            var pageTeal = this.$el.find('#pageTeal:checked').length > 0;
            var pageYellow = this.$el.find('#pageYellow:checked').length > 0;

            if (pageBlue) {
                this.chosenKey.imageName = 'posBtn08';
            }
            else if (pageGray) {
                this.chosenKey.imageName = 'posBtn01';
            }
            else if (pageGreen) {
                this.chosenKey.imageName = 'posBtn03';
            }
            else if (pageOrange) {
                this.chosenKey.imageName = 'posBtn09';
                this.chosenKey.textColor = "White";
            }
            else if (pagePink) {
                this.chosenKey.imageName = 'posBtn06';
            }
            else if (pagePurple) {
                this.chosenKey.imageName = 'posBtn07';
            }
            else if (pageRed) {
                this.chosenKey.imageName = 'posBtn05';
            }
            else if (pageTeal) {
                this.chosenKey.imageName = 'posBtn02';
            }
            else if (pageYellow) {
                this.chosenKey.imageName = 'posBtn04';
            }

            if (pageSelectedVal == "") {
                pageSelected = this.chosenKey.text;
            }

            var updatedModal = {
                id: this.chosenKey.id,
                name: pageButtonText,
                row: this.chosenKey.row,
                column: this.chosenKey.column,
                width: this.chosenKey.width,
                height: this.chosenKey.height,
                imageName:  this.chosenKey.imageName,
                textColor: this.chosenKey.textColor,
                type: 'P',
                text: pageSelected,
                cr: this.chosenKey.cr,
                keysetName: currentKeySet,
                page: this.chosenKey.page,
                noRepeat: this.chosenKey.noRepeat,
                keyNumber:  this.chosenKey.keyNumber,
                noSync: this.chosenKey.noSync,
                isActive: this.chosenKey.isActive
            }

            this.chosenKey = updatedModal;

            this.editPosKey();
        }

        var grid = that.grid;
        for (var i = 0; i < that.grid.grid.nodes.length; i ++) {
            var chosenId = $(grid.grid.nodes[i].el[0]).attr('data-id');
            if (chosenId == 0) {
                chosenId = grid.grid.nodes[i].id;
            }
            if (that.chosenKey.id == chosenId) {
                if (that.chosenKey.imageName == "posBtn01") {
                    $('#'+ that.chosenKey.id).css({
                        'background-color': '#E2E3E2'
                    });
                }
                else if (that.chosenKey.imageName == "posBtn02") {
                    $('#'+ that.chosenKey.id).css({
                        'background-color': '#4ABD98'
                    });
                }
                else if (that.chosenKey.imageName == "posBtn03") {
                    $('#'+ that.chosenKey.id).css({
                        'background-color': '#A4D391'
                    });
                }
                else if (that.chosenKey.imageName == "posBtn04") {
                    $('#'+ that.chosenKey.id).css({
                        'background-color': '#F6F3B0'
                    });
                }
                else if (that.chosenKey.imageName == "posBtn05") {
                    $('#'+ that.chosenKey.id).css({
                        'background-color': '#F1AFAF'
                    });
                }
                else if (that.chosenKey.imageName == "posBtn06") {
                    $('#'+ that.chosenKey.id).css({
                        'background-color': '#DEBEDB'
                    });
                }
                else if (that.chosenKey.imageName == "posBtn07") {
                    $('#'+ that.chosenKey.id).css({
                        'background-color': '#B4B3DF'
                    });
                }
                else if (that.chosenKey.imageName == "posBtn08") {
                    $('#'+ that.chosenKey.id).css({
                        'background-color': '#97CAEB'
                    });
                }
                else if (that.chosenKey.imageName == "posBtn09") {
                    $('#'+ that.chosenKey.id).css({
                        'background-color': '#252525',
                        'color': '#ffffff'
                    });
                }
                else {
                    $('#'+ that.chosenKey.id).css({
                        'background-color': '#ffffff'
                    });
                }
                
            }
        }
    },
    
    editPosKey: function () {
        var that = this;
        var sessionToken = this.getCookie();

        $.ajax({
            url: '/data/edit-pos-key',
            data: {
                menuKey: JSON.stringify(that.chosenKey),
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            
            success: function (data) {
                M.toast({ html: '{Literal}Menu Key added successfully{/Literal}' });
                for (var i = 0; i < that.items.length; i++) {
                    if (that.items[i].id == that.chosenKey.id) {
                        that.items[i] = that.chosenKey
                    }
                }

            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem adding this Menu Key{/Literal}.' });
                }
            }
        });
    },

    saveKeys: function () {
        var that = this;
        var sessionToken = this.getCookie();
        grid = this.grid;

        var updatedPageModels = {};
        
        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };

        var currentKeySet = this.$el.find('#key-set-selector option:selected').text();
        if (currentKeySet.toUpperCase() == "MAIN" || currentKeySet == "ראשי") {
            currentKeySet = "";
        }

        var currentPage = this.$el.find('#page-selector option:selected').text();

        for (var i = 0; i < this.grid.grid.nodes.length; i ++) {
            for (var j = 0; j < this.items.length; j++) {
                var chosenId = $(grid.grid.nodes[i].el[0]).attr('data-id');
                
                if (chosenId == 0) {
                    chosenId = grid.grid.nodes[i].id;
                }
                if (currentKeySet != "") {
                    if (this.items[j].page == currentPage && this.items[j].keysetName == currentKeySet && this.items[j].id == chosenId || this.items[j].page == "TOP" && this.items[j].keysetName == currentKeySet && this.items[j].id == chosenId) {
                        if (this.items[j].page == "TOP") {
                            this.items[j].column = this.grid.grid.nodes[i].x + 1;
                            this.items[j].row = this.grid.grid.nodes[i].y + 1;
                            this.items[j].height = this.grid.grid.nodes[i].height;
                            this.items[j].width = this.grid.grid.nodes[i].width;
                            if (this.grid.grid.nodes[i].y > 1) {
                                this.items[j].page = currentPage;
                            }
                        }
                        else {
                            this.items[j].column = this.grid.grid.nodes[i].x + 1;
                            this.items[j].row = this.grid.grid.nodes[i].y + 1;
    
                            this.items[j].height = this.grid.grid.nodes[i].height;
                            this.items[j].width = this.grid.grid.nodes[i].width;
                            if (this.grid.grid.nodes[i].y <= 1) {
                                this.items[j].page = "TOP";
                            }
                        }
    
                        if (this.items[j].name == "\r\n\r\nMAIN\r\n\r\nPAGE") {
                            this.items[j].name = "MAIN";
                        }
                        else if (this.items[j].name == "\r\nPAGE 1") {
                            this.items[j].name = "PAGE 1";
                        }
                        else if (this.items[j].name == "\r\nPAGE 2") {
                            this.items[j].name = "PAGE 2";
                        }
                        else if (this.items[j].name == "\r\nPAGE 3") {
                            this.items[j].name = "PAGE 3";
                        }
                        else if (this.items[j].name == "\r\nPAGE 4") {
                            this.items[j].name = "PAGE 4";
                        }
                        else if (this.items[j].name == "\r\nPAGE 5") {
                            this.items[j].name = "PAGE 5";
                        }
                        else if (this.items[j].name == "\r\nPAGE 6") {
                            this.items[j].name = "PAGE 6";
                        }
    
                        
                        updatedPageModels[Object.size(updatedPageModels)] = this.items[j];
                    }
                }
                else {
                    if (this.items[j].page == currentPage && this.items[j].keysetName == currentKeySet && this.items[j].id == chosenId || this.items[j].page == "TOP" && this.items[j].keysetName == currentKeySet && this.items[j].id == chosenId) {
                        if (this.items[j].page == "TOP") {
                            this.items[j].column = this.grid.grid.nodes[i].x + 1;
                            this.items[j].row = this.grid.grid.nodes[i].y + 1;
                            this.items[j].height = this.grid.grid.nodes[i].height;
                            this.items[j].width = this.grid.grid.nodes[i].width;
                            if (this.grid.grid.nodes[i].y > 1) {
                                this.items[j].page = currentPage;
                                this.items[j].column = this.grid.grid.nodes[i].x + 1;
                                this.items[j].row = this.grid.grid.nodes[i].y - 1;
                            }
                        }
                        else {
                            this.items[j].column = this.grid.grid.nodes[i].x + 1;
                            this.items[j].row = this.grid.grid.nodes[i].y - 1;
    
                            this.items[j].height = this.grid.grid.nodes[i].height;
                            this.items[j].width = this.grid.grid.nodes[i].width;
                            if (this.grid.grid.nodes[i].y <= 1) {
                                this.items[j].page = "TOP";
                            }
                        }
    
                        if (this.items[j].name == "\r\n\r\nMAIN\r\n\r\nPAGE") {
                            this.items[j].name = "MAIN";
                        }
                        else if (this.items[j].name == "\r\nPAGE 1") {
                            this.items[j].name = "PAGE 1";
                        }
                        else if (this.items[j].name == "\r\nPAGE 2") {
                            this.items[j].name = "PAGE 2";
                        }
                        else if (this.items[j].name == "\r\nPAGE 3") {
                            this.items[j].name = "PAGE 3";
                        }
                        else if (this.items[j].name == "\r\nPAGE 4") {
                            this.items[j].name = "PAGE 4";
                        }
                        else if (this.items[j].name == "\r\nPAGE 5") {
                            this.items[j].name = "PAGE 5";
                        }
                        else if (this.items[j].name == "\r\nPAGE 6") {
                            this.items[j].name = "PAGE 6";
                        }
    
                        
                        updatedPageModels[Object.size(updatedPageModels)] = this.items[j];
                    }
                }

            }
        }

        var keysSent = 0;

        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };

        /*$.ajax({
            url: '/data/save-all-pos-keys',
            data: {
                savedMenuKeys: JSON.stringify(updatedPageModels),
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            
            success: function (data) {
                keysSent++;

                if (keysSent == Object.size(updatedPageModels) - 1) {
                    M.toast({ html: '{Literal}Menu Page save successfully{/Literal}' });
                }
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem adding this Menu Key{/Literal}.' });
                }
            }
        });*/
        
        for (var t = 0; t < Object.size(updatedPageModels); t++) {
            $.ajax({
                url: '/data/edit-pos-key',
                data: {
                    menuKey: JSON.stringify(updatedPageModels[t]),
                    token: sessionToken
                },
                dataType: 'json',
                type: 'POST',
                
                success: function (data) {
                    keysSent++;

                    if (keysSent == Object.size(updatedPageModels) - 1) {
                        M.toast({ html: '{Literal}Menu Page save successfully{/Literal}' });
                    }
                },

                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem adding this Menu Key{/Literal}.' });
                    }
                }
            });
        }
    },

    closeNewModals: function () {
       $("#new-key-set-modal").hide();
       var itemFormModal = this.$el.find('#new-key-set-modal').modal();
       itemFormModal.modal('close');

       $("#new-page-form-modal").hide();
       var itemFormModal = this.$el.find('#new-page-form-modal').modal();
       itemFormModal.modal('close');
       
       $("#item-form-modal").hide();
       var itemFormModal = this.$el.find('#item-form-modal').modal();
       itemFormModal.modal('close');
       
       $("#page-form-modal").hide();
       var itemFormModal = this.$el.find('#page-form-modal').modal();
       itemFormModal.modal('close');

       $("#label-form-modal").hide();
       var itemFormModal = this.$el.find('#label-form-modal').modal();
       itemFormModal.modal('close');

       $("#price-level-form-modal").hide();
       var itemFormModal = this.$el.find('#price-level-form-modal').modal();
       itemFormModal.modal('close');

       $("#key-set-form-modal").hide();
       var itemFormModal = this.$el.find('#key-set-form-modal').modal();
       itemFormModal.modal('close');
       
       $("#tare-form-modal").hide();
       var itemFormModal = this.$el.find('#tare-form-modal').modal();
       itemFormModal.modal('close');
       
       $("#sale-reprice-form-modal").hide();
       var itemFormModal = this.$el.find('#sale-reprice-form-modal').modal();
       itemFormModal.modal('close');
       
       $("#item-discount-form-modal").hide();
       var itemFormModal = this.$el.find('#item-discount-form-modal').modal();
       itemFormModal.modal('close');
    }
});