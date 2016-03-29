// manipulating
var InteractView = Backbone.View.extend({
    
    initialize: function(args) {
        var self = this;
        this.containerID = args.containerID;
        // bind view with model
        console.log("in manipulating initialize");

        this.el_main_canvas = $('#anim_container');
        this.click = false;
        this.dragStart = null;
        this.dragged = false;
        this.info_label = ["<b>Stick: </b>", "<b>Trunk side: </b>", "<b>Branch layer: </b>", "<b>Branch side: </b>", "<b>Leaves: </b>"];
        this.leaves_label = {"paper_tree": "<b>Authors: </b>", "unique_author_tree": "<b>Papers: </b>"};

        this.myCanvas = drawing_canvas.anim_canvas;
        this.translate = [];
        this.scale = 3;
        this.grid = [];
        this.detail = [];
        this.stay = 0;

        this.set_mouse_event();
        this.slider_event();

    },

    slider_event: function(){
        var self = this;
        // var slider = $("#l_scale").data("ionRangeSlider");
        for(var e in tree_egos){
            var l_id = "#l_scale_" + e;
            var f_id = "#f_scale_" + e;
            var s_id = "#s_scale_" + e;
            $(l_id).ionRangeSlider({
                min: 0.5, 
                max: 3,
                from: 1,
                type: 'single',
                step: 0.1,
                onFinish: function(obj) {
                    console.log(obj.from);
                    var update_e = {};
                    var all_scale = self.model.get("scale_para");
                    update_e[view_ego] = ['all'];
                    all_scale[view_ego]["leaf_scale"] = 2.5*obj.from;
                    self.model.set({"scale_para": all_scale}, {silent: true});
                    self.model.set({"render_tree_egos": update_e}, {silent: true});
                    self.model.trigger('change:render_tree_egos');
                }
            });
            $(f_id).ionRangeSlider({
                min: 0.5, 
                max: 3,
                from: 1,
                type: 'single',
                step: 0.1,
                onFinish: function(obj) {
                    console.log(obj.from);
                    var update_e = {};
                    var all_scale = self.model.get("scale_para");
                    update_e[view_ego] = ['all'];
                    all_scale[view_ego]["fruit_scale"] = 2*obj.from;
                    self.model.set({"scale_para": all_scale}, {silent: true});
                    self.model.set({"render_tree_egos": update_e}, {silent: true});
                    self.model.trigger('change:render_tree_egos');
                }
            });
            $(s_id).ionRangeSlider({
                min: 0.5, 
                max: 3,
                from: 1,
                type: 'single',
                step: 0.1,
                onFinish: function(obj) {
                    console.log(obj.from);
                    var update_e = {};
                    var all_scale = self.model.get("scale_para");
                    update_e[view_ego] = ['all'];
                    all_scale[view_ego]["sub_leaf_len_scale"] = 1.25*obj.from;
                    self.model.set({"scale_para": all_scale}, {silent: true});
                    self.model.set({"render_tree_egos": update_e}, {silent: true});
                    self.model.trigger('change:render_tree_egos');
                }
            });
            if(e == view_ego){
                $(".para_" + e).show();
            }
            else{
                $(".para_" + e).hide();
            }
        }
    },

    set_mouse_event: function(){
        var self = this;
        // var context =  drawing_canvas.anim_canvas.getContext('2d');
        self.myCanvas.addEventListener('mousewheel', function(evt) {
            self.translate = self.model.get("canvas_translate");
            self.scale = self.model.get("canvas_scale");
            ga('send', 'event', unique_search, "detail", "zoom");

            var scaleFactor = 1.1;
            // get mouse position
            var mousePos = self.getMousePos(self.myCanvas, evt);//mousePos.x,mousePos.y
            var tx = (mousePos.x - self.translate[0]) / self.scale;
            var ty = (mousePos.y - self.translate[1]) / self.scale;

            // get tree center
            // tx = tree_center[view_ego][0];
            // ty = tree_center[view_ego][1];

            var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? - evt.detail : 0;
           
            var delta_scale = Math.floor(evt.wheelDelta*3*10/100)/10; //for mac
        
            var factor = Math.pow(scaleFactor, delta);
            
            // zoom in based on mouse cursor
            // var nx = mousePos.x - (tx * factor * self.scale);
            // var ny = mousePos.y - (ty * factor * self.scale);

            // zoom in from tree center
            var nx = (tx*self.scale + self.translate[0]) - (tx * factor * self.scale);
            var ny = (ty*self.scale + self.translate[1]) - (ty * factor * self.scale);

            if(factor*self.scale < 0.05 || factor*self.scale > 3.5){
            }
            else{
                self.model.set({"canvas_translate":[nx, ny]});
                self.model.set({"canvas_scale":factor*self.scale});
            }
            evt.preventDefault();
            return false;
        }, false);

        self.myCanvas.addEventListener('DOMMouseScroll', function(evt) {
            self.translate = self.model.get("canvas_translate");
            self.scale = self.model.get("canvas_scale");
            ga('send', 'event', unique_search, "detail", "zoom");

            var scaleFactor = 1.1;
            var mousePos = self.getMousePos(self.myCanvas, evt);//mousePos.x,mousePos.y
            var tx = (mousePos.x - self.translate[0]) / self.scale;
            var ty = (mousePos.y - self.translate[1]) / self.scale;

            // get tree center
            // tx = tree_center[view_ego][0];
            // ty = tree_center[view_ego][1];
            
            var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? - evt.detail : 0;
           
            var delta_scale = Math.floor(evt.wheelDelta*3*10/100)/10; //for mac
        
            var factor = Math.pow(scaleFactor, delta);
            
            // zoom in based on mouse cursor
            // var nx = mousePos.x - (tx * factor * self.scale);
            // var ny = mousePos.y - (ty * factor * self.scale);

            // zoom in from tree center
            var nx = (tx*self.scale + self.translate[0]) - (tx * factor * self.scale);
            var ny = (ty*self.scale + self.translate[1]) - (ty * factor * self.scale);

            if(factor*self.scale < 0.05 || factor*self.scale > 3.5){
            }
            else{
                self.model.set({"canvas_translate":[nx, ny]});
                self.model.set({"canvas_scale":factor*self.scale});
            }
            evt.preventDefault();
            return false;
        }, false);
        
        
        self.myCanvas.addEventListener('mousemove',function(evt){
            self.grid = tree_click_grid[view_ego];
            self.detail = tree_info[view_ego];
            self.translate = self.model.get("canvas_translate");
            self.scale = self.model.get("canvas_scale");
            
            // var alter_info = self.model.get("info_table");
            // var c_detail = self.model.get("canvas_detail");
            var mousePos = self.getMousePos(self.myCanvas, evt);
            var ctx = self.myCanvas.getContext("2d");
            var img_data = ctx.getImageData(mousePos.x, mousePos.y, 1, 1).data;

            // var renderscale = 0.15/self.scale;
            if(self.stay == 0){
                $("#click_info").hide();
            }
            self.el_main_canvas.css("cursor", "");
            
            var canvas_point = [Math.round((mousePos.x-self.translate[0])/self.scale), Math.round((mousePos.y-self.translate[1])/self.scale)];
            var grid_point = [Math.round(canvas_point[0]*0.15), Math.round(canvas_point[1]*0.15)];
            if (self.dragStart && Math.abs(mousePos.x-self.dragStart.x)>0.1){
                self.dragged = true;
                // console.log("mousemove");
                mousePos = self.getMousePos(self.myCanvas, evt);
                // console.log("mousePos: ", mousePos.x, mousePos.y);
                var tx = self.translate[0]+(mousePos.x-self.dragStart.x);
                var ty = self.translate[1]+(mousePos.y-self.dragStart.y);
                // self.model.set({"moving": 1});
                self.model.set({"canvas_translate":[tx, ty]}, {silent: true});
                self.model.trigger('change:canvas_scale');
                
                self.dragStart = self.getMousePos(self.myCanvas, evt);//mousePos.x,mousePos.y
            }
            else if( grid_point[0] >= 0 && grid_point[1] >= 0 && grid_point[0] < self.grid.length-1 && grid_point[1] < self.grid[0].length-1){
                // var grid_point = [Math.round(canvas_point[0]*0.15), Math.round(canvas_point[1]*0.15)];
                // console.log(grid_point[0], grid_point[1]);
                // console.log(self.grid);
                var point_idx = self.grid[grid_point[0]][grid_point[1]];
                var point_info = self.detail[point_idx];
                if(point_idx != -1){
                    self.el_main_canvas.css("cursor", "pointer");
                    if(self.stay == 0)
                        self.display_info(point_info);
                    // console.log(point_idx, [Math.round((mousePos.x-self.translate[0]))/self.scale, Math.round((mousePos.y-self.translate[1]))/self.scale], [canvas_point[0], canvas_point[1]]);
                    // self.testGrid(canvas_point[0], canvas_point[1], point_idx);
                }
            }

        },false);

        self.myCanvas.addEventListener('mouseup',function(evt){
            // trigger redraw!!!
            self.model.trigger('change:canvas_scale');
            self.grid = tree_click_grid[view_ego];
            self.detail = tree_info[view_ego];
            self.translate = self.model.get("canvas_translate");
            self.scale = self.model.get("canvas_scale");

            // self.translate = self.model.get("canvas_translate");
            // self.scale = self.model.get("canvas_scale");
            // var mousePos = self.getMousePos(self.myCanvas, evt);
            // var alter_info = self.model.get("info_table");
            // get image data
            // var ctx = self.myCanvas.getContext("2d");
            // var img_data = ctx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
            // console.log("image data:", img_data);
            // var c_detail = self.model.get("canvas_detail");

            // var canvas_point = [Math.round((mousePos.x-self.translate[0])/self.scale), Math.round((mousePos.y-self.translate[1])/self.scale)];
            // var grid_point = [Math.round(canvas_point[0]*0.15), Math.round(canvas_point[1]*0.15)];
            
            var mousePos = self.getMousePos(self.myCanvas, evt);
            var ctx = self.myCanvas.getContext("2d");
            // var img_data = ctx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
            $("#click_info").hide();
            self.stay = 0;
            // information
            if (!self.dragged && !self.click){
                var canvas_point = [Math.round((mousePos.x-self.translate[0])/self.scale), Math.round((mousePos.y-self.translate[1])/self.scale)];
                var grid_point = [Math.round(canvas_point[0]*0.15), Math.round(canvas_point[1]*0.15)];
            
                if( grid_point[0] < self.grid.length && grid_point[1] < self.grid[0].length){
                    // var grid_point = [Math.round(canvas_point[0]*0.15), Math.round(canvas_point[1]*0.15)];
                    var point_idx = self.grid[grid_point[0]][grid_point[1]];
                    var point_info = self.detail[point_idx];
                    if(point_idx != -1){
                        self.display_info(point_info);
                        self.stay = 1;
                        // self.point_grid(canvas_point[0], canvas_point[1], point_idx, self.scale);
                        // self.el_main_canvas.css("cursor", "pointer");
                        // console.log(point_idx, [Math.round((mousePos.x-self.translate[0]))/self.scale, Math.round((mousePos.y-self.translate[1]))/self.scale], [canvas_point[0], canvas_point[1]]);
                        
                    }
                }
            }
            else if(self.dragged){
                ga('send', 'event', unique_search, "detail", "drag");
            }
            self.dragStart = null;
        }, true);
        

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

    testGrid: function (px, py, info) {
        var self = this;
        var context = drawing_canvas.anim_canvas.getContext('2d');
        context.restore();
        context.font = '12pt Calibri';
        context.fillStyle = 'black';
        context.fillText(info, px, py); //pos
    },

    point_grid: function(px, py, info, s) {
        var self = this;
        var context = drawing_canvas.anim_canvas.getContext('2d');
        var radius = s*1000;
        context.restore();
        context.beginPath();
        context.fillStyle = 'red';
        context.strokeStyle = 'red';
        context.lineWidth = 5;
        context.arc(px, py, radius, 0, 2*Math.PI, true);
        context.closePath();
        // context.fill();
        context.stroke();
    },


    display_info: function (info) {
        var self = this;
        var info_page = $("#click_info");
        info_page.show();
        ga('send', 'event', unique_search, "detail", "click");

        // for(var t = 0; t < 4; t++){
        //     info_text += this.info_label[t] + info[t] + "<br>" ;
        // }
        var tree_cat = tree_type[view_ego];
        var tree_id = info[0];
        var info_text = "<b>Paper:</b> " + info[0] + "<br>" ;
        // if (tree_cat == "author_tree"){
        //     tree_id += info[2]-1;
        //     info_text = "<b>Co-author:</b> " + info[0] + "<br>" ;
        // }
        if (tree_cat != "paper_tree"){
            info_text = "<b>Co-author:</b> " + info[0] + "<br>" ;
        }
        var viewing_alter = actual_info[tree_cat][tree_id];

        for(var attr in viewing_alter){
            if(attr != "Leaves")
                info_text += '<b>' + attr + ':</b> ' + viewing_alter[attr] + "<br>" ;
        }
        // info_text += this.info_label[4];
        // for(var t = 4; t < info.length; t++){
        //     info_text += "<br> &bull; " + info[t];
        // }
        info_text += this.leaves_label[tree_cat];
        for(var t = 0; t < viewing_alter['Leaves'].length; t++){
            info_text += "<br> &bull; " + viewing_alter['Leaves'][t];
        }
        info_page.html(info_text);
    }

});