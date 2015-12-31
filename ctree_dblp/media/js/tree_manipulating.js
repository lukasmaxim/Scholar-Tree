// manipulating
var InteractView = Backbone.View.extend({
    
    initialize: function(args) {
        var self = this;
        this.containerID = args.containerID;
        // bind view with model
        console.log("in manipulating initialize");

        this.click = false;
        this.dragStart = null;
        this.dragged = false;

        this.myCanvas = drawing_canvas.anim_canvas;
        this.translate = [];
        this.scale = 3;

        this.set_mouse_event();
    },

    set_mouse_event: function(){
        var self = this;
        // var context =  drawing_canvas.anim_canvas.getContext('2d');
        self.myCanvas.addEventListener('mousewheel', function(evt) {
            // self.grid = self.model.get("canvas_grid");
            self.translate = self.model.get("canvas_translate");
            self.scale = self.model.get("canvas_scale");
            // var leaf_scale = self.model.get("leaf_scale");
            // var length_scale = self.model.get("sub_leaf_len_scale");

            var scaleFactor = 1.1;
            var mousePos = self.getMousePos(self.myCanvas, evt);//mousePos.x,mousePos.y
            var tx = (mousePos.x - self.translate[0]) / self.scale;
            var ty = (mousePos.y - self.translate[1]) / self.scale;

            var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? - evt.detail : 0;
           
            var delta_scale = Math.floor(evt.wheelDelta*3*10/100)/10; //for mac
        
            var factor = Math.pow(scaleFactor, delta);
            
            var nx = mousePos.x - (tx * factor * self.scale);
            var ny = mousePos.y - (ty * factor * self.scale);

            if(factor*self.scale < 0.03 || factor*self.scale > 3.5){
            }
            else{
                self.model.set({"canvas_translate":[nx, ny]});
                self.model.set({"canvas_scale":factor*self.scale});
            }
        }, false);
        
        /*
        self.myCanvas.addEventListener('mousemove',function(evt){
            // self.grid = self.model.get("canvas_grid");
            self.translate = self.model.get("canvas_translate");
            self.scale = self.model.get("canvas_scale");

            // var alter_info = self.model.get("info_table");
            // var c_detail = self.model.get("canvas_detail");
            var mousePos = self.getMousePos(self.myCanvas, evt);
            var ctx = self.myCanvas.getContext("2d");
            var img_data = ctx.getImageData(mousePos.x, mousePos.y, 1, 1).data;

            // self.el_main_canvas.css("cursor", "");
            if (self.dragStart && Math.abs(mousePos.x-self.dragStart.x)>0.1){
                self.dragged = true;
                // console.log("mousemove");
                mousePos = self.getMousePos(self.myCanvas, evt);
                var tx=self.translate[0]+(mousePos.x-self.dragStart.x);
                var ty=self.translate[1]+(mousePos.y-self.dragStart.y);
                // self.model.set({"moving": 1});
                self.model.set({"canvas_translate":[tx, ty]});
                self.model.set({"canvas_scale":self.scale});
                self.model.trigger('change:canvas_scale');
                
                self.dragStart = self.getMousePos(self.myCanvas, evt);//mousePos.x,mousePos.y
                
            }
            else{
                var point_info = self.grid[Math.floor(mousePos.x/c_detail)][Math.floor(mousePos.y/c_detail)];
                
                if(point_info != "*t*" && (125-img_data[0])/3 == (96-img_data[1])/3 && (125-img_data[0])/3 == (65-img_data[2])/3 && (65-img_data[2])/3 == (96-img_data[1])/3){
                    self.el_main_canvas.css("cursor", "pointer"); 
                }
                else if(point_info != -1){
                    var parse_grid = point_info.split("*+"); 
                    if(point_info != "*t*" && (parse_grid.length == 1 || parse_grid[0] == "leafid" || parse_grid[0] == "saveIMG" || parse_grid[0] == "popup" || parse_grid[0] == "root")){
                        self.el_main_canvas.css("cursor", "pointer");
                    }
                    else{ 
                        self.el_main_canvas.css("cursor", "");                        
                        if(parse_grid[0] == "leaf"){
                            self.model.set({"clicking_leaf":parse_grid[1]});
                            self.writeNote(Math.floor(mousePos.x), Math.floor(mousePos.y), parse_grid[1]);
                        }                     
                    }
                }
            }

        },false);

        self.myCanvas.addEventListener('mouseup',function(evt){
            // self.grid = self.model.get("canvas_grid");
            // trigger redraw!!!
            self.model.trigger('change:canvas_scale');
            self.translate = self.model.get("canvas_translate");
            self.scale = self.model.get("canvas_scale");
            var mousePos = self.getMousePos(self.myCanvas, evt);
            // var alter_info = self.model.get("info_table");
            // get image data
            var ctx = self.myCanvas.getContext("2d");
            var img_data = ctx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
            // console.log("image data:", img_data);
            // var c_detail = self.model.get("canvas_detail");
            
            if (!self.dragged && !self.click){
                var point_info = self.grid[Math.floor(mousePos.x/c_detail)][Math.floor(mousePos.y/c_detail)];
                if(point_info != "*t*" && (125-img_data[0])/3 == (96-img_data[1])/3 && (125-img_data[0])/3 == (65-img_data[2])/3 && (65-img_data[2])/3 == (96-img_data[1])/3){
                    // console.log("tree layer:", (125-img_data[0])/3);
                    // self.writeNote(Math.floor(mousePos.x), Math.floor(mousePos.y), "L" + Math.round((125-img_data[0])/3));
                    
                }
                else if(point_info != -1){    
                    var parse_grid = point_info.split("*+");
                    if(parse_grid[0] == "leaf"){
                    }
                    else if(parse_grid[0] == "root"){
                        self.writeNote(Math.floor(mousePos.x), Math.floor(mousePos.y), parse_grid[1]);
                    }
                    else if(parse_grid[0] == "leafid"){
                        var index = parse_grid[2].split("_");
                        // console.log(parse_grid[1], parse_grid[2], alter_info[index[0]][index[1]], alter_info["leaves"][parse_grid[1]]);         
                        self.writeMessage1(Math.floor(mousePos.x), Math.floor(mousePos.y), alter_info[index[0]][index[1]], alter_info["leaves"][parse_grid[1]]);
                        ga('send', 'event', event_mode, "click_leaf", session_id);
                    }
                    else{
                        if(point_info != "*t*"){
                            var index = self.grid[Math.floor(mousePos.x/c_detail)][Math.floor(mousePos.y/c_detail)].split("_");
                            self.writeMessage(Math.floor(mousePos.x), Math.floor(mousePos.y), alter_info[index[0]][index[1]]);
                            ga('send', 'event', event_mode, "click_stick", session_id);
                        }                        
                    }
                }

            }
            self.dragStart = null;
        }, true);
        */

        self.myCanvas.addEventListener('mousedown', function(evt) {
            // self.grid = self.model.get("canvas_grid");
            // self.model.set({"moving": 0});
        
            self.dragStart = self.getMousePos(self.myCanvas, evt);//mousePos.x,mousePos.y
            self.dragged = false;
            // if(self.dragged){
            //     self.model.set({"moving": 1});
            // }
            // self.model.trigger('change:canvas_scale');
        }, true);
        

    },

    getMousePos: function(canvas, evt) {
        // var rect = this.myCanvas.getBoundingClientRect();
        var rect = canvas.getBoundingClientRect();
        // console.log("mousePos", rect)
        // console.log("mousePos: ", evt.clientX - rect.left, evt.clientY - rect.top);
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };

    },

    writeMessage: function (px, py, info) {
        var self = this;
        var context = self.myCanvas.getContext('2d');
        context.fillStyle = 'rgba(225,225,225, 0.5)';
        var box = 130 + 7*(info[0].length-10)
        if (box < 130)
            box = 130
        if(display_detail["fruit"] != "none")
            context.fillRect(px-2, py, box, 110);
        else
            context.fillRect(px-2, py, box, 90);
        context.font = '12pt Calibri';
        context.fillStyle = 'black';
        context.fillText("Alter Id: " + info[0], px, py+20); //pos
        context.fillText("Total Contacts: " + info[1], px, py+40);
        // context.fillText("Fruit Size: " + info[2], px, py+60);
        context.fillText("Branch Layer: " + info[3], px, py+60);
        context.fillText("Branch Side: " + info[4], px, py+80);
        if(display_detail["fruit"] != "none"){
            context.fillText("Fruit Size: " + info[2], px, py+100);
        }
    },

    writeNote: function (px, py, info) {
        var self = this;
        var context = self.myCanvas.getContext('2d');
        
        context.font = '12pt Calibri';
        context.fillStyle = 'black';
        context.fillText(info, px+15, py+15); //pos
    },

    writeMessage1: function (px, py, info, leaf_info) {
        var self = this;
        var context = self.myCanvas.getContext('2d');
        context.fillStyle = 'rgba(225,225,225, 0.5)';
        var box = 130 + 7*(info[0].length-10)
        if (box < 130)
            box = 130
        if(display_detail["fruit"] != "none")
            context.fillRect(px-2, py, box, 150);
        else
            context.fillRect(px-2, py, box, 130);
        context.font = '12pt Calibri';
        context.fillStyle = 'black';
        context.fillText("Leaf Size: " + leaf_info[0], px, py+20);
        context.fillText("Color Group: " + leaf_info[1], px, py+40);
        context.fillText("Alter Id: " + info[0], px, py+60); //pos
        context.fillText("Total Contacts: " + info[1], px, py+80);
        // context.fillText("Fruit Size: " + info[2], px, py+60);
        context.fillText("Branch Layer: " + info[3], px, py+100);
        context.fillText("Branch Side: " + info[4], px, py+120);
        if(display_detail["fruit"] != "none"){
            context.fillText("Fruit Size: " + info[2], px, py+140);
        }
    }

});