// animating
var AnimView = Backbone.View.extend({
	initialize: function(args) {
		var self = this;
		this.containerID = args.containerID;
        console.log("in animating initialize");

        this.forward = 0;
		this.backword = 0;
		this.tree_height = 0;
		this.current_idx = 0;
		this.blinking_control = 0;
	    
	    this.block = $('#block_page');
        this.set_events();
    },

    set_events: function(){
    	var self = this;
        // for general events        
        var save = $('#save_icon');
        // var block = $('#block_page');
        var tree_anim = $('#tree_anim');
        var tree_pic = $('#tree_pic');
        var tree_pause = $('#tree_pause');
        var tree_backward = $('#tree_backward');
        var tree_forward = $('#tree_forward');
        var info_page = $("#click_info");

        var selectors = [$("#tree1_select"), $("#tree2_select"), $("#tree3_select"), $("#tree4_select")];
        
        save.click(function(){
            var save_link = "#" + view_ego + "_save";
            $(save_link)[0].click();
            return false;
        });

        save.hover(function(){
            save.css("cursor", "pointer");
            return false;
        });

        save.mouseout(function(){
            save.css("cursor", "");
            return false;
        });

        tree_anim.click(function(){
            $("#tree_backward").removeAttr("disabled");
            $("#tree_forward").removeAttr("disabled");
            // highlight_list["selected"] = "None";
            highlight_list["on"] = 0;
            self.block.show();
            self.backword = 0;
            self.forward = 0;
            info_page.hide();
            self.anim_render(view_ego, self.current_idx);
        });

        tree_pic.click(function(){
            // highlight_list["selected"] = "None"; // trigger selector change!!!
            highlight_list["on"] = 0;
            self.current_idx = 0;
            self.block.hide();
            info_page.hide();
            // self.static_img(view_ego);
            // self.model.set({"current_ego": view_ego});
            self.model.set({"canvas_scale": tree_snap_scale[view_ego]}, {silent: true});
            self.model.set({"canvas_translate": [0.5, 0.5]}, {silent: true});
            self.model.trigger('change:new_researcher');
        });

        tree_pause.click(function(){
            // highlight_list["selected"] = "None";
            highlight_list["on"] = 0;
            info_page.hide();
            clearInterval(mytimer.anim_timer);
        });

        tree_backward.click(function(){
            $("#tree_forward").removeAttr("disabled");
            self.backword = 1;
            self.forward = 0;
            self.current_idx -= 1;
            info_page.hide();
            self.anim_render(view_ego, self.current_idx);
        });

        tree_forward.click(function(){
            $("#tree_backward").removeAttr("disabled");
            if(self.backword != 1){
                self.current_idx += 1;
            }
            self.forward = 1;
            self.backword = 0;
            info_page.hide();
            self.anim_render(view_ego, self.current_idx);
        });

        for(var i = 0; i < 4; i++){
            selectors[i].change(function(){
                //$('.btn-group').attr("disabled", true);
                highlight_list["selected"] = this.value;
                highlight_list["on"] = 1;
                self.model.set({"canvas_scale": tree_snap_scale[view_ego]}, {silent: true});
                self.model.set({"canvas_translate": [0.5, 0.5]}, {silent: true});
                // self.model.trigger('change:new_researcher');
                info_page.hide();
                if(this.value != 'None'){
                    tree_util.fadeout = 0.5;
                    self.block.show();
                }
                else{
                    tree_util.fadeout = 1;
                    self.block.hide();
                }

                self.highlight_anim(view_ego);
            });
        }
    },

    anim_render: function(ego, idx){
        clearInterval(mytimer.blinking_timer);
    	var amin_frame = tree_amin_frame[ego];
    	var context =  drawing_canvas.anim_canvas.getContext('2d');

        context.lineWidth = 5; // set the style

        context.setTransform(1, 0, 0, 1, 0, 0);
        if(idx == 0 || this.backword == 1){
        	context.clearRect(0, 0, drawing_canvas.anim_canvas.width, drawing_canvas.anim_canvas.height);
        	// context.save();
	        drawing_canvas.anim_canvas.height = $("#anim_tree").height() - 10;
	        drawing_canvas.anim_canvas.width = $("#anim_tree").width() - 10;
	    }

        context.translate(0.5, 0.5);
        context.scale(tree_snap_scale[ego], tree_snap_scale[ego]);

    	function draw_trunk(points) {
        	if(points.length == 18){
        		context.moveTo(points[0], points[1]);
        		context.quadraticCurveTo(points[2], points[3], points[4], points[5]);
        		context.quadraticCurveTo(points[6], points[7], points[8], points[9]);
        		context.closePath();
        		context.moveTo(points[10], points[11]);
        		context.lineTo(points[12], points[13]);
        		context.lineTo(points[14], points[15]);
        		context.lineTo(points[16], points[17]);
        		context.closePath();
        	}
        	else{
        		context.moveTo(points[0], points[1]);
        		context.bezierCurveTo(points[2], points[3], points[4], points[5], points[6], points[7]);
        		context.lineTo(points[8], points[9]);
        		context.bezierCurveTo(points[10], points[11], points[12], points[13], points[14], points[15]);
        		context.closePath();
        		context.moveTo(points[16], points[17]);
        		context.lineTo(points[18], points[19]);
        		context.lineTo(points[20], points[21]);
        		context.lineTo(points[22], points[23]);
        		context.closePath();
        	}
        };

        function draw_sticks(points){
        	for(var i = 0; i < points.length; i += 8){ 
        		context.beginPath();
            	context.moveTo(points[i], points[i+1]);
        		for(var j = i+2; j < i+8; j += 2){
        			if(points[j] != "none"){
        				context.lineTo(points[j], points[j+1]);
        			}
        		}
        		context.closePath();
                context.stroke();//draw line
                context.fill();//fill colo
        	}
        };

    	// var idx = 0;
        // var height = 0;
        if(mytimer.anim_timer != null){
        	clearInterval(mytimer.anim_timer);
        }

        // draw to specific idx
        if(this.backword == 1){
        	if(idx === -1){
				$('#tree_backward').attr("disabled", true);	
				this.current_idx = 0;
				return 0;	
			}
			this.tree_height = 0;
        	for(var f = 0; f < idx; f++){
        		var frame = amin_frame[f];
        		mapping_color.trunk = "rgb(" + (125-(this.tree_height+1)*3).toString() + "," + (96-(this.tree_height+1)*3).toString() + "," + (65-(this.tree_height+1)*3).toString() + ")";
            
				switch(frame["type"]) {
					case 'trunk':
		                context.fillStyle = mapping_color.trunk;
			            context.strokeStyle = mapping_color.trunk;
			            context.lineCap = 'round';
			            context.lineWidth = 5;
			            context.beginPath();

			            draw_trunk(frame["pos"]["left"]);
			            context.stroke();//draw line
			            context.fill();//fill color
			            draw_trunk(frame["pos"]["right"]);
			            context.stroke();//draw line
			            context.fill();//fill color

			            
			            this.tree_height ++;
		                break;
		            case 'sticks':
		                context.fillStyle = mapping_color.trunk;
			            context.strokeStyle = mapping_color.trunk;
			            context.lineCap = 'round';
		                context.lineWidth = 8;

		                draw_sticks(frame["pos"]);

		                break;
		            case 'leaf':
		                for(var i = 0, len = frame["pos"].length; i < len; i += 6){
                            if(frame["pos"][i+5] == highlight_list["selected"])
                                continue;
				        	tree_util.leaf_style(context, frame["pos"][i], frame["pos"][i+1], frame["pos"][i+2], 
		        					   		frame["pos"][i+3], frame["pos"][i+4]);
				        }

		                break;
		            case 'fruit':
		                for(var i = 0, len = frame["pos"].length; i < len; i += 3){
				        	tree_util.tree_fruit(context, frame["pos"][i], frame["pos"][i+1], frame["pos"][i+2]);
				        }
		                
		                break;
		        } // end switch
        	}

        	return 0; 
        }
        
        // for animation playing
        mytimer.anim_timer = setInterval(function (){
			var frame = amin_frame[idx];
						
			if(idx === amin_frame.length){
                if(highlight_list["selected"] != "None" && highlight_list["on"] == 0){
                    tree_util.draw_highlight_leaf(ego, 0);
                }

				clearInterval(mytimer.anim_timer);
				$('#tree_forward').attr("disabled", true);
				this.current_idx = amin_frame.length;
			}
			// var action = frame["type"];
			mapping_color.trunk = "rgb(" + (125-(this.tree_height+1)*3).toString() + "," + (96-(this.tree_height+1)*3).toString() + "," + (65-(this.tree_height+1)*3).toString() + ")";
            
			switch(frame["type"]) {
				case 'trunk':
	                context.fillStyle = mapping_color.trunk;
		            context.strokeStyle = mapping_color.trunk;
		            context.lineCap = 'round';
		            context.lineWidth = 5;
		            context.beginPath();

		            draw_trunk(frame["pos"]["left"]);
		            context.stroke();//draw line
		            context.fill();//fill color
		            draw_trunk(frame["pos"]["right"]);
		            context.stroke();//draw line
		            context.fill();//fill color

		            
		            this.tree_height ++;
	                break;
	            case 'sticks':
	                context.fillStyle = mapping_color.trunk;
		            context.strokeStyle = mapping_color.trunk;
		            context.lineCap = 'round';
	                context.lineWidth = 8;

	                draw_sticks(frame["pos"]);

	                break;
	            case 'leaf':
	                for(var i = 0, len = frame["pos"].length; i < len; i += 6){
                        if(frame["pos"][i+5] == highlight_list["selected"])
                            continue;
			        	tree_util.leaf_style(context, frame["pos"][i], frame["pos"][i+1], frame["pos"][i+2], 
	        					   		frame["pos"][i+3], frame["pos"][i+4]);
			        }

	                break;
	            case 'fruit':
	                for(var i = 0, len = frame["pos"].length; i < len; i += 3){
			        	tree_util.tree_fruit(context, frame["pos"][i], frame["pos"][i+1], frame["pos"][i+2]);
			        }
	                
	                break;
	        } // end switch
			
			if(this.forward == 0 && this.backword == 0){
				this.current_idx = idx;
				idx++;
			}
			else
				clearInterval(mytimer.anim_timer);
			
			if(idx === amin_frame.length){
                if(highlight_list["selected"] != "None" && highlight_list["on"] == 0){
                    tree_util.draw_highlight_leaf(ego, 0);
                }
                self.block.hide();
				clearInterval(mytimer.anim_timer);
				self.current_idx = 0;
	            self.forward = 0;
	            self.backword = 0;
	            self.tree_height = 0;
				// context.restore();
			}			
		}.bind(this), 30);
    },


    highlight_anim: function(ego){
    	var self = this;
    	// this.static_img(ego);
    	// this.model.set({"current_ego": view_ego});
    	self.model.trigger('change:current_ego');
        clearInterval(mytimer.blinking_timer);
    	if(highlight_list["selected"] == "None" || highlight_list["on"] == 0){
            clearInterval(mytimer.blinking_timer);
    		return;
    	}
    	if(mytimer.blinking_timer != null){
        	clearInterval(mytimer.blinking_timer);
        }
        
    	mytimer.blinkiing_timer = setInterval(function (){
            if(highlight_list["selected"] == "None" || highlight_list["on"] == 0){
                clearInterval(mytimer.blinking_timer);
                return;
            }
    		console.log(self.blinking_control);
    		if(self.blinking_control == 0) self.blinking_control = 1;
    		else self.blinking_control = 0;
    		tree_util.draw_highlight_leaf(ego, self.blinking_control);
    	}, 100); 
    	// mytimer["blinking_timer"] = temp_timer; 	
    }

});
