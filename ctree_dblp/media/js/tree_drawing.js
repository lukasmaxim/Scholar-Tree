// drawing
var DrawView = Backbone.View.extend({
	initialize: function(args) {
		var self = this;
		this.containerID = args.containerID;
        console.log("in drawing initialize");

        _.bindAll(this, 'draw_static');
        _.bindAll(this, 'set_tree_info');

        this.model.bind('change:current_ego', this.draw_static);
        this.model.bind('change:canvas_scale', this.draw_static);
        this.model.bind('change:canvas_translate', this.draw_static);
        this.model.bind('change:new_researcher', this.set_tree_info);
        
        // self.trigger('change:time_period'); !!!reselect need to re trigger the for loop up
    },

    set_tree_info: function(){
        var self = this;
        for(var e in tree_egos){
            var img_src = tree_img_url[e];
            var img_id = "#" + e;
            self.set_tree_img(img_id, img_src);
            // $(img_id).attr('src', img_src);
        }
        // self.model.trigger('change:current_ego');
        // self.model.set({"current_ego": "tree1"});
    },

    generate_frames: function(ego){
        var amin_frame = [];
        
        for(layer in tree_points[ego]){
            if(layer == "all_leaves")
                continue;
            var obj_trunk = {"type":"trunk", "pos":{"left":[], "right":[]}};
            obj_trunk["pos"]["left"] = tree_points[ego][layer]["left"]["trunk"];
            obj_trunk["pos"]["right"] = tree_points[ego][layer]["right"]["trunk"];
            amin_frame.push(obj_trunk);
            // draw sticks
            var finish_mark_left = 0;
            var finish_mark_right = 0;
            var len = tree_points[ego][layer]["left"]["sticks"].length;
            if(tree_points[ego][layer]["right"]["sticks"].length > len)
                len = tree_points[ego][layer]["right"]["sticks"].length;

            for(var s = 0; s < len; s += 24){ // set time interval
                var obj_sticks = {"type":"sticks", "pos":[]};
                for(var i = s; i < s+24; i += 8){ 
                    if(finish_mark_left != 1){
                        if(tree_points[ego][layer]["left"]["sticks"].length < i || tree_points[ego][layer]["left"]["sticks"][i] == "end")
                            finish_mark_left = 1;
                    }
                    if(finish_mark_right != 1){
                        if(tree_points[ego][layer]["right"]["sticks"].length < i || tree_points[ego][layer]["right"]["sticks"][i] == "end")
                            finish_mark_right = 1;
                    }

                    if(finish_mark_right == 1 && finish_mark_left == 1)
                        break;

                    if(finish_mark_left != 1 && tree_points[ego][layer]["left"]["sticks"][i] != "none"){
                        for(var j = i; j < i+8; j ++){
                            obj_sticks["pos"].push(tree_points[ego][layer]["left"]["sticks"][j]);
                        }
                    }
                    
                    if(finish_mark_right != 1 && tree_points[ego][layer]["right"]["sticks"][i] != "none"){
                        for(var j = i; j < i+8; j ++){
                            obj_sticks["pos"].push(tree_points[ego][layer]["right"]["sticks"][j]);
                        }
                    }
                }
                amin_frame.push(obj_sticks);                 
            }

            var obj_fruits = {"type":"fruit", "pos":[]};
            for(var i = 0, len = tree_points[ego][layer]["fruit"].length; i < len; i++)
                obj_fruits["pos"].push(tree_points[ego][layer]["fruit"][i]);
            amin_frame.push(obj_fruits);

            for(var order in tree_points[ego][layer]["leaf"]){
                for(var i = 0, len = tree_points[ego][layer]["leaf"][order].length; i < len; i += 24){
                    var obj_leaf = {"type":"leaf", "pos":[]};
                    var sub_len = i+24;
                    if(sub_len > len)
                        sub_len = len;
                    for(var j = i; j < sub_len; j ++){
                        obj_leaf["pos"].push(tree_points[ego][layer]["leaf"][order][j]);
                    }
                    amin_frame.push(obj_leaf);
                }
            }
   
        }

        tree_amin_frame[ego] = amin_frame;
    },


    set_tree_img: function(img_id, img_src){ 
        var save_id = img_id + "_save";
        var cnt_id = img_id + "_cnt";
        var self = this;
        var alters = self.model.get("new_researcher");
        // $(img_id).attr('href', img_src);
        $(img_id).css({'height': '100%'});
        $(img_id).attr('src', img_src).load(function(){
            var tree_width = $(this).width();
            var cnt_width = $(cnt_id).width();
            if (tree_width > cnt_width){
                $(this).css({'width': '100%'});
                $(this).height('auto');
            }
            tree_util.set_anim_canvas(this.id, alters[this.id]);
            tree_amin_frame[this.id] = [];
            self.generate_frames(this.id);
            if(this.id == view_ego){
                self.model.set({"canvas_scale": tree_snap_scale[view_ego]}, {silent: true});
                self.model.set({"canvas_translate": [0.5, 0.5]}, {silent: true});
                self.model.trigger('change:current_ego');
            }
        });
                
        var pic_url = img_src.replace('image/png','image/octet-stream');
        var img_name = img_id.replace('#' , DBLP_researcher + "_");
        $(save_id).attr('download', img_name + ".png");
        $(save_id).attr('href', pic_url);

        $(cnt_id).unbind();
        $(save_id).click(function(){
            ga('send', 'event', DBLP_researcher, "save", sy + "-" + ey, this.name);
            console.log("triggle save click of", this.name);
        });
        
        $(cnt_id).unbind();
        $(cnt_id).click(function(){
            var show_snap = "#" + view_ego + "_cnt";
            var hide_snap = "#" + this.id.slice(0,5) + "_cnt";
            var hide_text = "#" + view_ego + "_text";
            var show_text = "#" + this.id.slice(0,5) + "_text";
            var hide_selector = "#" + view_ego + "_select";
            var show_selector = "#" + this.id.slice(0,5) + "_select";
            var hide_legend = "#" + view_ego + "_legend";
            var show_legend = "#" + this.id.slice(0,5) + "_legend";
            $(hide_text).hide();
            $(hide_text).hide();
            $(show_text).show();
            $(hide_legend).hide();
            $(show_legend).show();
            // $(show_snap).show();
            // $(hide_snap).hide();
            tree_util.fadeout = 1;
            $(show_snap).css({'border-width': '1px'});
            $(hide_snap).css({'border-width': '3px'});
            highlight_list["selected"] = "None";
            $(hide_selector).val("None");
            $(hide_selector).hide();
            $(show_selector).show();

            view_ego = this.id.slice(0,5); //!!! set current_ego and trgger it
            self.model.set({"canvas_scale": tree_snap_scale[view_ego]}, {silent: true});
            self.model.set({"canvas_translate": [0.5, 0.5]}, {silent: true});
            // self.model.trigger('change:new_researcher');
            self.model.set({"current_ego": view_ego});
            // anim.highlight_choose = 0; //!!! set scale and translate back [ego]
            // anim.static_img(view_ego);
            /*
            var img_src = tree_img_url[view_ego];
            $("#tree_display").attr('src', img_src);
            $("#tree_display").attr('href', img_src);
            $("#tree_display").css({'height': '100%'});

            var tree_width = $("#tree_display").width();
            var cnt_width = $("#tree_cnt").width();
            if (tree_width > cnt_width){
                $("#tree_display").css({'width': '100%'});
                $("#tree_display").height('auto');
            }
            */
            return false;
        });
        
    },


    draw_static: function(){
        var self = this;
        $("#click_info").hide();
        $('#tree_forward').attr("disabled", true);
        $('#tree_backward').attr("disabled", true);
        $('#tree_pause').attr("disabled", true);
        $(".highlight_selector").removeAttr("disabled");

    	clearInterval(mytimer.anim_timer);
    	clearInterval(mytimer.blinking_timer);
    	var context = drawing_canvas.anim_canvas.getContext('2d');
        // console.log(ego, tree_points[ego]);

        var ego = self.model.get("current_ego");
        context.lineWidth = 5; // set the style

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, drawing_canvas.anim_canvas.width, drawing_canvas.anim_canvas.height);
        context.save();

        drawing_canvas.anim_canvas.height = $("#anim_tree").height() - 10;
        drawing_canvas.anim_canvas.width = $("#anim_tree").width() - 10;

        var current_trans = this.model.get("canvas_translate");
        var current_scale = this.model.get("canvas_scale");
        context.translate(current_trans[0], current_trans[1]);
        context.scale(current_scale, current_scale);
        // var amin_frame = [];

        // self.current_idx = 0;
        // self.forward = 0;
        // self.backword = 0;
        // self.tree_height = 0;
        
        var height = 0;
        var selected_leaves = [];
        var display_text = "";
        $("#highlight_info").hide();
        // tree_util.fadeout = 1;
        if(highlight_list["selected"] != "None"){
        	selected_leaves = tree_points[ego]["all_leaves"][highlight_list["selected"]];
            // display_text = "Leaf size: " + selected_leaves[3] + " out of 100 <br> Leaf count: " + (selected_leaves.length/5);
            display_text = "<b>Highlight leaf count:</b> " + (selected_leaves.length/5);
            $("#highlight_info").show();
            $("#highlight_info").html(display_text);
            // if(highlight_list["on"] == 1)
            // tree_util.fadeout = 0.5;
        }        
    	
        for(layer in tree_points[ego]){ 
        	if(layer == "all_leaves")
        		continue;
        	mapping_color.trunk = "rgb(" + (125-(height+1)*3).toString() + "," + (96-(height+1)*3).toString() + "," + (65-(height+1)*3).toString() + ")";
            var obj_trunk = {"type":"trunk", "pos":{"left":[], "right":[]}};
        	context.fillStyle = mapping_color.trunk;
            context.strokeStyle = mapping_color.trunk;
            context.lineCap = 'round';
            context.lineWidth = 5;
            context.beginPath();
        	if(tree_points[ego][layer]["left"]["type"] == "nobranch"){
        		context.moveTo(tree_points[ego][layer]["left"]["trunk"][0], tree_points[ego][layer]["left"]["trunk"][1]);
        		context.quadraticCurveTo(tree_points[ego][layer]["left"]["trunk"][2], tree_points[ego][layer]["left"]["trunk"][3], 
        							tree_points[ego][layer]["left"]["trunk"][4], tree_points[ego][layer]["left"]["trunk"][5]);
        		context.quadraticCurveTo(tree_points[ego][layer]["left"]["trunk"][6], tree_points[ego][layer]["left"]["trunk"][7], 
        							tree_points[ego][layer]["left"]["trunk"][8], tree_points[ego][layer]["left"]["trunk"][9]);
        		context.closePath();
        		context.moveTo(tree_points[ego][layer]["left"]["trunk"][10], tree_points[ego][layer]["left"]["trunk"][11]);
        		context.lineTo(tree_points[ego][layer]["left"]["trunk"][12], tree_points[ego][layer]["left"]["trunk"][13]);
        		context.lineTo(tree_points[ego][layer]["left"]["trunk"][14], tree_points[ego][layer]["left"]["trunk"][15]);
        		context.lineTo(tree_points[ego][layer]["left"]["trunk"][16], tree_points[ego][layer]["left"]["trunk"][17]);
        		context.closePath();
        	}
        	else{
        		context.moveTo(tree_points[ego][layer]["left"]["trunk"][0], tree_points[ego][layer]["left"]["trunk"][1]);
        		context.bezierCurveTo(tree_points[ego][layer]["left"]["trunk"][2], tree_points[ego][layer]["left"]["trunk"][3], 
        							tree_points[ego][layer]["left"]["trunk"][4], tree_points[ego][layer]["left"]["trunk"][5], 
        							tree_points[ego][layer]["left"]["trunk"][6], tree_points[ego][layer]["left"]["trunk"][7]);
        		context.lineTo(tree_points[ego][layer]["left"]["trunk"][8], tree_points[ego][layer]["left"]["trunk"][9]);
        		context.bezierCurveTo(tree_points[ego][layer]["left"]["trunk"][10], tree_points[ego][layer]["left"]["trunk"][11], 
        							tree_points[ego][layer]["left"]["trunk"][12], tree_points[ego][layer]["left"]["trunk"][13], 
        							tree_points[ego][layer]["left"]["trunk"][14], tree_points[ego][layer]["left"]["trunk"][15]);
        		context.closePath();
        		context.moveTo(tree_points[ego][layer]["left"]["trunk"][16], tree_points[ego][layer]["left"]["trunk"][17]);
        		context.lineTo(tree_points[ego][layer]["left"]["trunk"][18], tree_points[ego][layer]["left"]["trunk"][19]);
        		context.lineTo(tree_points[ego][layer]["left"]["trunk"][20], tree_points[ego][layer]["left"]["trunk"][21]);
        		context.lineTo(tree_points[ego][layer]["left"]["trunk"][22], tree_points[ego][layer]["left"]["trunk"][23]);
        		context.closePath();
        	}
        	context.stroke();//draw line
            context.fill();//fill color
            context.beginPath();
        	if(tree_points[ego][layer]["right"]["type"] == "nobranch"){
        		context.moveTo(tree_points[ego][layer]["right"]["trunk"][0], tree_points[ego][layer]["right"]["trunk"][1]);
        		context.quadraticCurveTo(tree_points[ego][layer]["right"]["trunk"][2], tree_points[ego][layer]["right"]["trunk"][3], 
        							tree_points[ego][layer]["right"]["trunk"][4], tree_points[ego][layer]["right"]["trunk"][5]);
        		context.quadraticCurveTo(tree_points[ego][layer]["right"]["trunk"][6], tree_points[ego][layer]["right"]["trunk"][7], 
        							tree_points[ego][layer]["right"]["trunk"][8], tree_points[ego][layer]["right"]["trunk"][9]);
        		context.closePath();
        		context.moveTo(tree_points[ego][layer]["right"]["trunk"][10], tree_points[ego][layer]["right"]["trunk"][11]);
        		context.lineTo(tree_points[ego][layer]["right"]["trunk"][12], tree_points[ego][layer]["right"]["trunk"][13]);
        		context.lineTo(tree_points[ego][layer]["right"]["trunk"][14], tree_points[ego][layer]["right"]["trunk"][15]);
        		context.lineTo(tree_points[ego][layer]["right"]["trunk"][16], tree_points[ego][layer]["right"]["trunk"][17]);
        		context.closePath();
        	}
        	else{
        		context.moveTo(tree_points[ego][layer]["right"]["trunk"][0], tree_points[ego][layer]["right"]["trunk"][1]);
        		context.bezierCurveTo(tree_points[ego][layer]["right"]["trunk"][2], tree_points[ego][layer]["right"]["trunk"][3], 
        							tree_points[ego][layer]["right"]["trunk"][4], tree_points[ego][layer]["right"]["trunk"][5], 
        							tree_points[ego][layer]["right"]["trunk"][6], tree_points[ego][layer]["right"]["trunk"][7]);
        		context.lineTo(tree_points[ego][layer]["right"]["trunk"][8], tree_points[ego][layer]["right"]["trunk"][9]);
        		context.bezierCurveTo(tree_points[ego][layer]["right"]["trunk"][10], tree_points[ego][layer]["right"]["trunk"][11], 
        							tree_points[ego][layer]["right"]["trunk"][12], tree_points[ego][layer]["right"]["trunk"][13], 
        							tree_points[ego][layer]["right"]["trunk"][14], tree_points[ego][layer]["right"]["trunk"][15]);
        		context.closePath();
        		context.moveTo(tree_points[ego][layer]["right"]["trunk"][16], tree_points[ego][layer]["right"]["trunk"][17]);
        		context.lineTo(tree_points[ego][layer]["right"]["trunk"][18], tree_points[ego][layer]["right"]["trunk"][19]);
        		context.lineTo(tree_points[ego][layer]["right"]["trunk"][20], tree_points[ego][layer]["right"]["trunk"][21]);
        		context.lineTo(tree_points[ego][layer]["right"]["trunk"][22], tree_points[ego][layer]["right"]["trunk"][23]);
        		context.closePath();
        	}
        	context.stroke();//draw line
            context.fill();//fill color            

			// draw sticks
            var finish_mark_left = 0;
            var finish_mark_right = 0;
            var len = tree_points[ego][layer]["left"]["sticks"].length;
            if(tree_points[ego][layer]["right"]["sticks"].length > len)
            	len = tree_points[ego][layer]["right"]["sticks"].length;

            for(var s = 0; s < len; s += 24){ // set time interval
            	for(var i = s; i < s+24; i += 8){ 
            		context.beginPath();
	            	context.lineWidth = 8;
	            	if(finish_mark_left != 1){
	            		if(tree_points[ego][layer]["left"]["sticks"].length < i || tree_points[ego][layer]["left"]["sticks"][i] == "end")
	            			finish_mark_left = 1;
	            	}
	            	if(finish_mark_right != 1){
	            		if(tree_points[ego][layer]["right"]["sticks"].length < i || tree_points[ego][layer]["right"]["sticks"][i] == "end")
	            			finish_mark_right = 1;
	            	}

	            	if(finish_mark_right == 1 && finish_mark_left == 1)
	            		break;

	            	if(finish_mark_left != 1 && tree_points[ego][layer]["left"]["sticks"][i] != "none"){
	            		context.moveTo(tree_points[ego][layer]["left"]["sticks"][i], tree_points[ego][layer]["left"]["sticks"][i+1]);
	            		for(var j = i+2; j < i+8; j += 2){
	            			if(tree_points[ego][layer]["left"]["sticks"][j] != "none"){
	            				context.lineTo(tree_points[ego][layer]["left"]["sticks"][j], tree_points[ego][layer]["left"]["sticks"][j+1]);
	            			}
	            		}
	            	}
	            	
	            	if(finish_mark_right != 1 && tree_points[ego][layer]["right"]["sticks"][i] != "none"){
	            		context.moveTo(tree_points[ego][layer]["right"]["sticks"][i], tree_points[ego][layer]["right"]["sticks"][i+1]);
	            		for(var j = i+2; j < i+8; j += 2){
	            			if(tree_points[ego][layer]["right"]["sticks"][j] != "none"){
	            				context.lineTo(tree_points[ego][layer]["right"]["sticks"][j], tree_points[ego][layer]["right"]["sticks"][j+1]);
	            			}
	            		}
	            	}
	            	context.closePath();
	                context.stroke();//draw line
	                context.fill();//fill color
            	}
                 
            }

            // context.globalAlpha = tree_util.fadeout;
            for(var i = 0, len = tree_points[ego][layer]["fruit"].length; i < len; i += 3){
	        	tree_util.tree_fruit(context,
	        					tree_points[ego][layer]["fruit"][i],
	        					tree_points[ego][layer]["fruit"][i+1],
	        					tree_points[ego][layer]["fruit"][i+2]);
	        }


            //context.globalAlpha = tree_util.fadeout;
	        for(var order in tree_points[ego][layer]["leaf"]){
	        	for(var i = 0, len = tree_points[ego][layer]["leaf"][order].length; i < len; i += 6){
	        		if(tree_points[ego][layer]["leaf"][order][i+5] == highlight_list["selected"])
	        			continue;
	        		tree_util.leaf_style(context,
		        					tree_points[ego][layer]["leaf"][order][i],
		        					tree_points[ego][layer]["leaf"][order][i+1],
		        					tree_points[ego][layer]["leaf"][order][i+2],
		        					tree_points[ego][layer]["leaf"][order][i+3],
		        					tree_points[ego][layer]["leaf"][order][i+4]);
		        }
	        }
            context.globalAlpha = 1;
        
            height ++; 
        }

        tree_util.saved_rect = context.getImageData(0, 0, drawing_canvas.anim_canvas.width, drawing_canvas.anim_canvas.height);
        
        if(highlight_list["selected"] != "None" && highlight_list["on"] == 0){
            tree_util.draw_highlight_leaf(ego, 0, 1);
        }

        context.restore();

    }

});
