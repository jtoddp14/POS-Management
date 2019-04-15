var RoomsTablesView = Backbone.View.extend({
    breadcrumb: {},
    gridSizeRows: 11,
    gridSizeCols: 7,
    occupiedCells: {},
    prefilledUnoccupiedCells: false,
    selectedTableDiv: null,
    selectedTable: null,
    addTable: null,
    currentRoom: "",

    pages: [],
    keySet: [],

    events: {
        'click .rooms-tables-grid-item-content': 'showMenu',
        'click .edit-modal-trigger': 'openEditModal',
        'click .delete-modal-trigger': 'openDeleteModal',
        'change #key-set-selector' : 'changePage',
        'click #addRoomButton' : 'addNewPage',
        'click #drag7' : 'openNewTableOption',
        'click #drag8' : 'openNewTableOption',
        'click #drag9' : 'openNewTableOption',
        'click #drag10' : 'openNewTableOption',
        'click #drag11' : 'openNewTableOption',
        'click #drag1' : 'openNewTableOption',
        'click #drag2' : 'openNewTableOption',
        'click #drag3' : 'openNewTableOption',
        'click #drag4' : 'openNewTableOption',
        'click #drag5' : 'openNewTableOption',
        'click #drag5' : 'openNewTableOption',
        'click #drag6' : 'openNewTableOption',
        'click .add-table-button' : 'addTable',
        'click .table' : 'showNameOptions',
        'click #deleteTable' : 'deleteTable',
        'keyup #editTableText' : 'changeTableText',
        'click .save-new-room-button' : 'saveNewRoom',
        'click .save-room-button': 'saveRoom',
        'click #delete-room-button': 'deletedRoom',
        'click #editRoomName': 'openEditNameModal',
        'click .save-room-name-button' : 'saveRoomName'
    },

    dataChangedAndNotSaved: false,

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.roomsTablesFormTemplate = options.roomsTablesFormTemplate;
        this.model = options.model;
        this.getItemKeys();
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
            url: '/data/get-tables',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.tables = data.tables;
                that.rooms = data.rooms

                var collection = new RoomsTablesCollection();
                for (var i = 0; i < data.tables.length; i++) {
                    var currentTable = data.tables[i];
                    collection.add(new RoomsTables(currentTable));
                }
                that.fullCollection = collection;
                that.collection.set(collection.models);
                //that.$el.find('#page-selector').formSelect();

               
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
    },
    
    openEditModal: function (e) {
        this.editModal.modal('open');
    },

    openDeleteModal: function (e) {
        var deleteRoomModal = this.$el.find('#delete-room-modal').modal();
        deleteRoomModal.modal('open');
    },

    showMenu: function (e) {
        var element = $(e.currentTarget);
        var parent = $(element).parent();
        var name = $(parent).attr('data-name');
        var floatingMenu = this.$el.find('.floating-menu');
        
        $(floatingMenu).hide();
        $(floatingMenu).css('top', e.originalEvent.pageY + 'px');
        $(floatingMenu).css('left', e.originalEvent.pageX + 'px');
        $(floatingMenu).fadeIn('fast');
        $(floatingMenu).find('.edited-button-name').html(name);
        
    },

    render: function () {
        var that = this;
        $('select').formSelect();

        that.$el.html(that.template({
            tables: that.collection.models,
            rooms: that.rooms,
            pages: that.pages
        }));
        $(document).ready(function () {
            $('.fixed-action-btn').floatingActionButton();
            $('.tooltipped').tooltip();
            $('select').formSelect();
            $('#droppable').empty();

            var roomDiv = document.getElementById('droppable');
            that.currentRoom = that.rooms[0];

            var numTables = that.tables.length;
            for (i = 0; i < numTables; i++)
            {
                if (that.tables[i].room == that.rooms[0])
                {
                    var newDiv = document.createElement('div');
                    var newDivId = "divTable" + i;
                    newDiv.setAttribute('id', newDivId);

                    var x = parseInt(that.tables[i].X);
                    var y = parseInt(that.tables[i].Y);
                    var rotate = parseInt(that.tables[i].turn);

                    if (App.rtl) {
                        x = "-" + x
                    }

                    newDiv.style.position = "absolute";
                    newDiv.style.left = x + 'px';
                    newDiv.style.top = y + 'px';
                    newDiv.style.transform = 'rotate(' + rotate +'deg)'
                    
                    if (that.tables[i].type == "Bar-1") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="42" height="30" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    else if (that.tables[i].type == "BarL-1") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="42" height="30" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    else if (that.tables[i].type == "BarR-1") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="42" height="30" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    else if (that.tables[i].type == "Square-2") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="30" height="52" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    else if (that.tables[i].type == "Square-4") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="57" height="52" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    else if (that.tables[i].type == "Rectangle-4") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="52" height="52" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    else if (that.tables[i].type == "Rectangle-6") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="69" height="52" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    else if (that.tables[i].type == "Oval-6") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="71" height="59" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    else if (that.tables[i].type == "Round-4") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="54" height="52" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    else if (that.tables[i].type == "Round-6") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="62" height="61" data-id="' + newDivId + '"><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    else if (that.tables[i].type == "Round-8") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="69" height="69" data-id="' + newDivId + '"><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    newDiv.innerHTML = newHTML;
                    roomDiv.appendChild(newDiv);
                    selectedTableDiv = document.getElementById(newDivId);
                    
                    $('#'+newDivId).draggable({
                        containment: $('.roomDisplay'),
                        drag: function () {
                            //that.tableSelected(this);
                            $(this).addClass("selectedTable");
                        },

                        preventCollision: true,
                        stop: function (event, ui) {
                            mousePos = that.mouseCoords(event);
                            $(this).removeClass("selectedTable");
                            that.moveRoomTable(this, mousePos);
                        },
                    });
                }
            }

            $('select').formSelect();
        });
        App.breadCrumbToolTip = "Edit and save your room and table setup that will be used on your POS."; 
        App.setBreadcrumbs(this.breadcrumb);

        return this;
    },

    tableSelected: function (e) {
        var that = this;
        var selectedDiv = e.id;
        var tables = this.tables;
        var selectedTableDiv = selectedDiv;
        
        var tableNum = selectedDiv.substring(8);

        if (tables[tableNum].type == "Bar-1") {
            var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + tables[tableNum].type + 'Selected.png" width="42" height="30" data-id="' + selectedDiv + '" ><br><span id="' + selectedDiv + 'Text" class="tableText">' + tables[tableNum].name + '</span></span>';
        }
        else if (tables[tableNum].type == "BarL-1") {
            var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + tables[tableNum].type + 'Selected.png" width="42" height="30" data-id="' + selectedDiv + '" ><br><span id="' + selectedDiv + 'Text" class="tableText">' + tables[tableNum].name + '</span></span>';
        }
        else if (tables[tableNum].type == "BarR-1") {
            var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + tables[tableNum].type + 'Selected.png" width="42" height="30" data-id="' + selectedDiv + '" ><br><span id="' + selectedDiv + 'Text" class="tableText">' + tables[tableNum].name + '</span></span>';
        }
        else if (tables[tableNum].type == "Square-2") {
            var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + tables[tableNum].type + 'Selected.png" width="30" height="52" data-id="' + selectedDiv + '" ><br><span id="' + selectedDiv + 'Text" class="tableText">' + tables[tableNum].name + '</span></span>';
        }
        else if (tables[tableNum].type == "Square-4") {
            var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + tables[tableNum].type + 'Selected.png" width="57" height="52" data-id="' + selectedDiv + '" ><br><span id="' + selectedDiv + 'Text" class="tableText">' + tables[tableNum].name + '</span></span>';
        }
        else if (tables[tableNum].type == "Rectangle-4") {
            var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + tables[tableNum].type + 'Selected.png" width="52" height="52" data-id="' + selectedDiv + '" ><br><span id="' + selectedDiv + 'Text" class="tableText">' + tables[tableNum].name + '</span></span>';
        }
        else if (tables[tableNum].type == "Rectangle-6") {
            var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + tables[tableNum].type + 'Selected.png" width="69" height="52" data-id="' + selectedDiv + '" ><br><span id="' + selectedDiv + 'Text" class="tableText">' + tables[tableNum].name + '</span></span>';
        }
        else if (tables[tableNum].type == "Oval-6") {
            var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + tables[tableNum].type + 'Selected.png" width="71" height="59" data-id="' + selectedDiv + '" ><br><span id="' + selectedDiv + 'Text" class="tableText">' + tables[tableNum].name + '</span></span>';
        }
        else if (tables[tableNum].type == "Round-4") {
            var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + tables[tableNum].type + 'Selected.png" width="54" height="52" data-id="' + selectedDiv + '" ><br><span id="' + selectedDiv + 'Text" class="tableText">' + tables[tableNum].name + '</span></span>';
        }
        else if (tables[tableNum].type == "Round-6") {
            var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + tables[tableNum].type + 'Selected.png" width="62" height="61" data-id="' + selectedDiv + '" ><br><span id="' + selectedDiv + 'Text" class="tableText">' + tables[tableNum].name + '</span></span>';
        }
        else if (tables[tableNum].type == "Round-8") {
            var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + tables[tableNum].type + 'Selected.png" width="69" height="69" data-id="' + selectedDiv + '" ><br><span id="' + selectedDiv + 'Text" class="tableText">' + tables[tableNum].name + '</span></span>';
        }
        
        selectedTableDiv = document.getElementById(selectedDiv);
        selectedTableDiv.innerHTML = newHTML;

    },

    mouseCoords: function (ev) {
        // FireFox and Chrome coordinates
        if(ev.pageX || ev.pageY)
            return {x:ev.pageX, y:ev.pageY};

        // IE coordinates
        return {x:ev.clientX, y:ev.clientY};
    },

    moveRoomTable: function(selectedTableDiv, mousePos) {
        if (selectedTableDiv != null) {
            var tables = this.tables
            var offset = $("#droppable").offset();
            var x = parseInt(mousePos.x - offset.left) - 20;
            var y = parseInt(mousePos.y - offset.top) - 20;
            var divId = selectedTableDiv.id;
            var tableNumber = divId.substring(8);
            if (x < 767 && x < 10 && y < 373 && y < 25) {
                
                tables[tableNumber].X = "" + x;
                tables[tableNumber].Y = "" + y;
                tables[tableNumber].updated = "true";
            }
            if (x > 751) {
                tables[tableNumber].X = "751"
                tables[tableNumber].updated = "true";
            }
            else if (x < 0) {
                tables[tableNumber].X = "0"
                tables[tableNumber].updated = "true";
            }
            else {
                tables[tableNumber].X = x;
                tables[tableNumber].updated = "true";
            }

            if (y < 0) {
                tables[tableNumber].Y = "0"
                tables[tableNumber].updated = "true";
            }
            else if (y > 385) {
                tables[tableNumber].Y = "385"
                tables[tableNumber].updated = "true";
            }
            else {
                tables[tableNumber].Y = y;
                tables[tableNumber].updated = "true";
            }
  
            this.clearSelected(selectedTableDiv);
        }  
    },

    clearSelected: function (selectedTableDiv) {
        var newDivId = "";
        for (i = 0; i < this.tables.length; i++)
        {
            $("#divTable" + i).removeClass("selectedTable");
        }
        
        $('#addTableOptions').hide();
        $('#editTableOptions').hide();
    },

    changePage: function () {
        var that = this;
        var page = this.$el.find('#key-set-selector option:selected').text(); 
        if (page != that.currentRoom) {
            var roomDiv = document.getElementById('droppable');
            for (var i = 0; i < this.tables.length; i++)
            {
               if (that.tables[i].room == that.currentRoom) {
                    $('#divTable'+ i).remove();
               }
               else if (that.tables[i].room == page) {
                    var newDiv = document.createElement('div');
                    var newDivId = "divTable" + i;
                    newDiv.setAttribute('id', newDivId);
    
                    var x = parseInt(that.tables[i].X);
                    if (x > 790) {
                        x = 745
                    }
                    var y = parseInt(that.tables[i].Y);
                    var rotate = parseInt(that.tables[i].turn);

                    if (App.rtl) {
                        x = "-" + x
                    }
    
                    newDiv.style.position = "absolute";
                    newDiv.style.left = x + 'px';
                    newDiv.style.top = y + 'px';
                    newDiv.style.transform = 'rotate(' + rotate +'deg)'
                    
                    if (that.tables[i].type == "Bar-1") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="42" height="30" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    else if (that.tables[i].type == "BarL-1") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="42" height="30" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    else if (that.tables[i].type == "BarR-1") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="42" height="30" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    else if (that.tables[i].type == "Square-2") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="30" height="52" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    else if (that.tables[i].type == "Square-4") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="57" height="52" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    else if (that.tables[i].type == "Rectangle-4") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="52" height="52" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    else if (that.tables[i].type == "Rectangle-6") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="69" height="52" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    else if (that.tables[i].type == "Oval-6") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="71" height="59" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    else if (that.tables[i].type == "Round-4") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="54" height="52" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    else if (that.tables[i].type == "Round-6") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="62" height="61" data-id="' + newDivId + '"><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    else if (that.tables[i].type == "Round-8") {
                        var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="69" height="69" data-id="' + newDivId + '"><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                    }
                    newDiv.innerHTML = newHTML;
                    roomDiv.appendChild(newDiv);
                    selectedTableDiv = document.getElementById(newDivId);
                    
                    $('#'+newDivId).draggable({
                        containment: $('.roomDisplay'),
                        drag: function () {
                            //that.tableSelected(this);
                            $(this).addClass("selectedTable");
                        },
    
                        preventCollision: true,
                        stop: function (event, ui) {
                            mousePos = that.mouseCoords(event);
                            $(this).removeClass("selectedTable");
                            that.moveRoomTable(this, mousePos);
                        },
                    });
               }
            }
            that.currentRoom = page;
        }
    },

    addTable: function (e) {
        var that = this;
        var tableName = this.$el.find('#addTableText').val();
        var newDiv = document.createElement('div');
        if (tableName!= "") {
            if (this.addTable != null) {
                var tableId = this.addTable;
                var numTables = that.tables.length;
                var tableNameTaken = false;
                
                for (i = 0; i < numTables; i++) {
                    if (tableName == that.tables[i].name) {
                        M.toast({ html: '{Literal}This name is already defined{/Literal}' });
                        tableNameTaken = true;
                        break;
                    }
                }
                if (!tableNameTaken) {
                    for (i = 0; i < numTables + 1; i++) {
                        if (i == numTables) {
                            var roomDiv = document.getElementById('droppable');
                            var newDiv = document.createElement('div');
                            var newDivId = "divTable" + (i);
                            newDiv.setAttribute('id', newDivId);
    
                            var type = "";
    
                            newDiv.style.left = '0px';
                            newDiv.style.top = '0px';
            
                            if (tableId == "drag1") {
                                type = "Bar-1";
                                var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/Bar-1.png" width="42" height="30"  data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + tableName + '</span></span>';
                            }
                            else if (tableId == "drag2") {
                                type = "BarL-1";
                                var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/BarL-1.png" width="42" height="30  data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + tableName + '</span></span>';
                            }
                            else if (tableId == "drag3") {
                                type = "BarR-1";
                                var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/BarR-1.png" width="42" height="30" data-id="' + newDivId + '"><br><span id="' + newDivId + 'Text" class="tableText">' + tableName + '</span></span>';
                            }
                            else if (tableId == "drag4") {
                                type = "Square-2";
                                var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/Square-2.png" width="30" height="52" data-id="' + newDivId + '"><br><span id="' + newDivId + 'Text" class="tableText">' + tableName + '</span></span>';
                            }
                            else if (tableId == "drag5") {
                                type = "Square-4";
                                var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/Square-4.png" width="57" height="52" data-id="' + newDivId + '"><br><span id="' + newDivId + 'Text" class="tableText">' + tableName + '</span></span>';
                            }
                            else if (tableId == "drag6") {
                                type = "Rectangle-4";
                                var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/Rectangle-4.png" width="52" height="52" data-id="' + newDivId + '"><br><span id="' + newDivId + 'Text" class="tableText">' + tableName + '</span></span>';
                            }
                            else if (tableId == "drag7") {
                                type = "Rectangle-6";
                                var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/Rectangle-6.png" width="69" height="52" data-id="' + newDivId + '"><br><span id="' + newDivId + 'Text" class="tableText">' + tableName + '</span></span>';
                            }
                            else if (tableId == "drag8") {
                                type = "Oval-6";
                                var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/Oval-6.png" width="71" height="59" data-id="' + newDivId + '"><br><span id="' + newDivId + 'Text" class="tableText">' + tableName + '</span></span>';
                            }
                            else if (tableId == "drag9") {
                                type = "Round-4";
                                var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/Round-4.png" width="54" height="52" data-id="' + newDivId + '"><br><span id="' + newDivId + 'Text" class="tableText">' + tableName + '</span></span>';
                            }
                            else if (tableId == "drag10") {
                                type = "Round-6";
                                var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/Round-6.png" width="62" height="61" data-id="' + newDivId + '"><br><span id="' + newDivId + 'Text" class="tableText">' + tableName + '</span></span>';
                            }
                            else if (tableId == "drag11") {
                                type = "Round-8";
                                var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/Round-8.png" width="69" height="69" data-id="' + newDivId + '"><br><span id="' + newDivId + 'Text" class="tableText">' + tableName + '</span></span>';
                            }
            
                            newDiv.innerHTML = newHTML;
                            roomDiv.appendChild(newDiv);
                            var room = that.$el.find('#key-set-selector option:selected').text();

                            var addedTable = {
                                id: tableName,
                                name: tableName,
                                room: room,
                                type: type,
                                turn: 0,
                                X: 0,
                                Y: 0,
                                isAdded: true
                            }
    
                            this.tables.push(addedTable);
                            this.addTable = null;
                        }
                    }
                }  
            }
            else {
                M.toast({ html: '{Literal}Please choose a table type to add{/Literal}' });
            }
        }
        else {
            M.toast({ html: '{Literal}Please enter a table name{/Literal}' });
        }

        $('#'+newDivId).draggable({
            containment: $('.roomDisplay'),
            drag: function () {
                //that.tableSelected(this);
                $(this).addClass("selectedTable");
            },
            preventCollision: true,
            stop: function (event, ui) {
                mousePos = that.mouseCoords(event);
                that.moveRoomTable(this, mousePos);
            },
        });
    },

    showNameOptions: function (e) {
        var that = this;
        var room = this.$el.find('#key-set-selector option:selected').text();
        var element = $(e.currentTarget);
        var selectedDiv = element.attr("data-id");
        var newDivId = "";
        $('#addTableOptions').hide();
        $('#editTableOptions').show();

        $('#drag1Image').attr('src','img/Bar-1.png');
        $('#drag2Image').attr('src','img/BarL-1.png');
        $('#drag3Image').attr('src','img/BarR-1.png');
        $('#drag4Image').attr('src','img/Square-2.png');
        $('#drag5Image').attr('src','img/Square-4.png');
        $('#drag6Image').attr('src','img/Rectangle-4.png');
        $('#drag7Image').attr('src','img/Rectangle-6.png');
        $('#drag8Image').attr('src','img/Oval-6.png');
        $('#drag9Image').attr('src','img/Round-4.png');
        $('#drag10Image').attr('src','img/Round-6.png');
        $('#drag11Image').attr('src','img/Round-8.png');

        var numTables = that.tables.length;
        for (i = 0; i < numTables; i++)
        {
            if (that.tables[i].room == room)
            {
                newDivId = "divTable" + i;
            }

            if (newDivId == selectedDiv) {
                that.selectedTable = that.tables[i];
                var editTableText = document.getElementById("editTableText");
                $('#' + selectedDiv).addClass("selectedTable");
                editTableText.value = that.tables[i].name;
                break;
            }
            else {
                $('#' + "divTable" + i).removeClass("selectedTable");
            }
        }
    },
     
    openNewTableOption: function (e) {
        var that = this;
        this.addTable = e.currentTarget.id;
        var tableId = e.currentTarget.id;

        // Selects the button to add from menu

        if (tableId == "drag1") {
            $('#drag1Image').attr('src','img/Bar-1Selected.png');
        }
        else {
            $('#drag1Image').attr('src','img/Bar-1.png');
        }

        if (tableId == "drag2") {
            $('#drag2Image').attr('src','img/BarL-1Selected.png');
        }
        else {
            $('#drag2Image').attr('src','img/BarL-1.png');
        }

        if (tableId == "drag3") {
            $('#drag3Image').attr('src','img/BarR-1Selected.png');        
        }
        else {
            $('#drag3Image').attr('src','img/BarR-1.png');
        }

        if (tableId == "drag4") {
            $('#drag4Image').attr('src','img/Square-2Selected.png');        
        }
        else {
            $('#drag4Image').attr('src','img/Square-2.png');
        }

        if (tableId == "drag5") {
            $('#drag5Image').attr('src','img/Square-4Selected.png');        
        }
        else {
            $('#drag5Image').attr('src','img/Square-4.png');
        }

        if (tableId == "drag6") {
            $('#drag6Image').attr('src','img/Rectangle-4Selected.png');        
        }
        else {
            $('#drag6Image').attr('src','img/Rectangle-4.png');
        }

        if (tableId == "drag7") {
            $('#drag7Image').attr('src','img/Rectangle-6Selected.png');        
        }
        else {
            $('#drag7Image').attr('src','img/Rectangle-6.png');
        }

        if (tableId == "drag8") {
            $('#drag8Image').attr('src','img/Oval-6Selected.png');        
        }
        else {
            $('#drag8Image').attr('src','img/Oval-6.png');
        }

        if (tableId == "drag9") {
            $('#drag9Image').attr('src','img/Round-4Selected.png');        
        }
        else {
            $('#drag9Image').attr('src','img/Round-4.png');
        }

        if (tableId == "drag10") {
            $('#drag10Image').attr('src','img/Round-6Selected.png');        
        }
        else {
            $('#drag10Image').attr('src','img/Round-6.png');
        }

        if (tableId == "drag11") {
            $('#drag11Image').attr('src','img/Round-8Selected.png');        
        }
        else {
            $('#drag11Image').attr('src','img/Round-8.png');
        }
        var room = this.$el.find('#key-set-selector option:selected').text();
        var numTables = that.tables.length;

        // Deselects all buttons from grid

        for (i = 0; i < numTables; i++)
        {
            if (that.tables[i].room == room)
            {
                var newDivId = "divTable" + i;
                if (that.tables[i].type == "Bar-1") {
                    var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="42" height="30" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                }
                else if (that.tables[i].type == "BarL-1") {
                    var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="42" height="30" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                }
                else if (that.tables[i].type == "BarR-1") {
                    var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="42" height="30" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                }
                else if (that.tables[i].type == "Square-2") {
                    var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="30" height="52" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                }
                else if (that.tables[i].type == "Square-4") {
                    var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="57" height="52" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                }
                else if (that.tables[i].type == "Rectangle-4") {
                    var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="52" height="52" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                }
                else if (that.tables[i].type == "Rectangle-6") {
                    var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="69" height="52" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                }
                else if (that.tables[i].type == "Oval-6") {
                    var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="71" height="59" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                }
                else if (that.tables[i].type == "Round-4") {
                    var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="54" height="52" data-id="' + newDivId + '" ><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                }
                else if (that.tables[i].type == "Round-6") {
                    var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="62" height="61" data-id="' + newDivId + '"><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                }
                else if (that.tables[i].type == "Round-8") {
                    var newHTML = '<span id="draggable" class="drag"><img class="table" src="img/' + that.tables[i].type + '.png" width="69" height="69" data-id="' + newDivId + '"><br><span id="' + newDivId + 'Text" class="tableText">' + that.tables[i].name + '</span></span>';
                }

                selectedTableDiv = document.getElementById(newDivId);
                selectedTableDiv.innerHTML = newHTML;
            }
        }

        $('#addTableOptions').show();
        $('#editTableOptions').hide();
    },

    changeTableText: function() {
        var that = this;
        var newDivId = "";
        if (this.selectedTable != null) {
            var tableName = this.$el.find('#editTableText').val();
            
            var numTables = that.tables.length;
            for (i = 0; i < numTables; i++)
            {
                if (that.tables[i].name == this.selectedTable.name && that.tables[i].id == this.selectedTable.id)
                {
                    newDivId = "divTable" + i;
                    selectedTableDiv = document.getElementById(newDivId + 'Text');
                    selectedTableDiv.innerHTML = tableName;
                    that.tables[i].name = tableName;
                }
            }
        }
    },

    saveRoom: function () {
        var room = this.$el.find('#key-set-selector').val(); 
        var success = true;

        if (room != "newRoom") {
            var that = this;
            var sessionToken = this.getCookie();
            var savedRoom = [];

            for (var i = 0; i < this.tables.length; i++) {
                if (this.tables[i].room == room) {
                    if (App.rtl) {
                        if (this.tables[i] < 0) {
                            this.tables[i] = this.tables[i] * -1;
                        }
                    }
                    savedRoom.push(this.tables[i]);
                }
            }
            
            for (var t = 0; t < savedRoom.length; t++) {
                var thisRoom = savedRoom[t];
                $.ajax({
                    url: '/data/save-room',
                    data: {
                        tables: JSON.stringify(thisRoom),
                        roomName: JSON.stringify(room),
                        token: sessionToken
                    },
                    dataType: 'json',
                    type: 'POST',
        
                    success: function (data) {
                       
                    },
        
                    error: function (e) {
                        success = false;
                        if (e.status == 523) {
                            window.location.href = "#/log-in";
                            location.reload();
                        }
                    }
                });
            }
            if (success) {
                M.toast({ html: '{Literal}Room updated successfully{/Literal}' });
            }
        }
        else {
            M.toast({ html: '{Literal}Please Choose A Valid Room{/Literal}' });
        }
    },

    deleteRoom: function() {

    },

    saveNewRoom: function () {
        var newRoomName = this.$el.find('#newRoomName').val();

        if (newRoomName == "") {
            M.toast({ html: '{Literal}A Room Name Must Be Defined{/Literal}' });
        }
        else {
            var foundName = false;
            for (var i = 0; i < this.rooms.length; i++) {
                if (this.rooms[i] == newRoomName) {
                    foundName = true;
                }
            }

            if (foundName == true) {
                M.toast({ html: '{Literal}This Room Name Is Already Defined{/Literal}' });
            }
            else {
                this.rooms.unshift(newRoomName);
                this.render();
            }
        }
    },

    deletedRoom: function () {
        var that = this;
        var sessionToken = this.getCookie();
        
        $.ajax({
            url: '/data/remove-room',
            data: {
                roomName: (that.currentRoom),
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                that.render();
                M.toast({ html: '{Literal}Room removed successfully{/Literal}' });

                for (i = 0; i < that.tables.length; i++)
                {
                    if (that.tables[i].room == that.currentRoom)
                    {
                        that.tables[i] = "";
                        newDivId = "divTable" + i;
                        $('#' + newDivId).remove();
                    }
                }

                
                for (i = 0; i < that.pages.length; i++)
                {
                    if (that.rooms[i] == that.currentRoom)
                    {
                        that.rooms[i] = "";
                    }
                }
                that.render();
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem deleting this room{/Literal}' });
                }
            }
        });
    },

    deleteTable: function (e) {
        var that = this;
        var sessionToken = this.getCookie();
        var tableId = this.selectedTable.id;


        for (i = 0; i < that.tables.length; i++)
        {
            if (that.tables[i].name == this.selectedTable.name && that.tables[i].id == this.selectedTable.id)
            {
                newDivId = "divTable" + i;
                break;
            }
        }

        $.ajax({
            url: '/data/remove-table',
            data: {
                tableId: (tableId),
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                that.render();
                M.toast({ html: '{Literal}Table removed successfully{/Literal}' });
                $('#' + newDivId).remove();
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem deleting this table{/Literal}' });
                }
            }
        });
    },

    addNewPage: function () {
        var newRoomModal = this.$el.find('#new-room-form-modal').modal();
        newRoomModal.modal('open');
    },

    openEditNameModal: function () {
        var roomName = document.getElementById('roomName'); 
        roomName.value = this.currentRoom;

        var roomNameModal = this.$el.find('#edit-room-name-modal').modal();
        roomNameModal.modal('open');
    },

    saveRoomName: function () {
        var that = this;
        var newRoomName = this.$el.find('#roomName').val();
        var currentRoomName = this.currentRoom;
        var sessionToken = this.getCookie();
        if (currentRoomName == "main" || currentRoomName == "ראשי") {
            M.toast({ html: '{Literal}The room "main" cannot be changed{/Literal}' }); 
        }
        else {
            $.ajax({
                url: '/data/rename-room',
                data: {
                    oldRoomName: currentRoomName,
                    newRoomName: (newRoomName),
                    token: sessionToken
                },
                dataType: 'json',
                type: 'POST',
    
                success: function (data) {
                    for (var i = 0; i < that.rooms.length; i++) {
                        if (that.rooms[i] == currentRoomName) {
                            that.rooms[i] = newRoomName;
                        }
                    }

                    for (var i = 0; i < that.tables.length; i++) {
                        if (that.tables[i].room == currentRoomName) {
                            that.tables[i].room = newRoomName;
                        }
                    }
                    that.render();
                    M.toast({ html: '{Literal}Room name changed successfully{/Literal}' });
                },
    
                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem renaming this room{/Literal}' });
                    }
                }
            });
        }
    }
});