var anim = {
    anim_render: function(ego){
    	var context =  drawing_canvas.anim_canvas.getContext('2d');
        console.log(ego, tree_points[ego]);

        context.lineWidth = 8; // set the style

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, drawing_canvas.anim_canvas.width, drawing_canvas.anim_canvas.height);
        context.save();

        drawing_canvas.anim_canvas.height = $("#anim_tree").height();
        drawing_canvas.anim_canvas.width = $("#anim_tree").width();

        context.translate(0.5, 0.5);
        context.scale(tree_snap_scale[ego], tree_snap_scale[ego]);

        // anim.tree_fruit(context, 100, 100, 20);
        var height = 0;
        for(layer in tree_points[ego]){ // set time interval
        	mapping_color.trunk = "rgb(" + (125-(height+1)*3).toString() + "," + (96-(height+1)*3).toString() + "," + (65-(height+1)*3).toString() + ")";
                    
        	context.fillStyle = mapping_color.trunk;
            context.strokeStyle = mapping_color.trunk;
            context.lineCap = 'round';
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

            /*
            var i = 0;
            var len = tree_points[ego][layer]["total"]*24;
            function draw_sticks() { //  create a loop function
				setTimeout(function () { //  call a 3s setTimeout when the loop is called
      				context.beginPath();
	            	context.lineWidth = 8;
	            	if(finish_mark_left != 1){
	            		if(tree_points[ego][layer]["left"]["sticks"][i] == "end")
	            			finish_mark_left == 1;
	            	}
	            	if(finish_mark_right != 1){
	            		if(tree_points[ego][layer]["right"]["sticks"][i] == "end")
	            			finish_mark_right == 1;
	            	}

	            	if(finish_mark_right == 1 && finish_mark_left == 1)
	            		i += 10000;

	            	if(finish_mark_left != 1 || tree_points[ego][layer]["left"]["sticks"][i] != "none"){
	            		context.moveTo(tree_points[ego][layer]["left"]["sticks"][i], tree_points[ego][layer]["left"]["sticks"][i+1]);
	            		for(var j = i+2; j < i+8; j += 2){
	            			if(tree_points[ego][layer]["left"]["sticks"][j] != "none"){
	            				context.lineTo(tree_points[ego][layer]["left"]["sticks"][j], tree_points[ego][layer]["left"]["sticks"][j+1]);
	            			}
	            		}
	            	}
	            	
	            	if(finish_mark_right != 1 || tree_points[ego][layer]["right"]["sticks"][i] != "none"){
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
					i += 8; //  increment the counter
					if (i < len) {  //  if the counter < 10, call the loop function
						draw_sticks(); //  ..  again which will trigger another 
					} //  ..  setTimeout()
   				}, 3000)
			}

			draw_sticks();
			*/

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

            for(var i = 0, len = tree_points[ego][layer]["fruit"].length; i < len; i += 3){
	        	anim.tree_fruit(context,
	        					tree_points[ego][layer]["fruit"][i],
	        					tree_points[ego][layer]["fruit"][i+1],
	        					tree_points[ego][layer]["fruit"][i+2]);
	        }

            for(var i = 0, len = tree_points[ego][layer]["leaf"].length; i < len; i += 5){
	        	anim.leaf_style(context,
	        					tree_points[ego][layer]["leaf"][i],
	        					tree_points[ego][layer]["leaf"][i+1],
	        					tree_points[ego][layer]["leaf"][i+2],
	        					tree_points[ego][layer]["leaf"][i+3],
	        					tree_points[ego][layer]["leaf"][i+4]);
	        }

            height ++; 
        }



        context.restore();

    },

    
    tree_fruit: function(ctx, posx, posy, r){
        ctx.fillStyle = mapping_color.fruit;//fill color
        // ctx.strokeStyle = mapping_color.fruit;;//line's color
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ED3C3C';
        ctx.beginPath();
        var cx = posx;
        var cy = posy;
        var radius = r;
        anim.circle(ctx, cx, cy, radius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.lineWidth = 8;
    },

    circle: function(ctx, cx, cy, radius){
        ctx.arc(cx, cy, radius, 0, 2*Math.PI, true);
    },

    leaf_style: function(ctx, cx, cy, angle, radius, color) {
        ctx.save();
        ctx.lineWidth = 3;
        
        ctx.strokeStyle = mapping_color.leaf_stork;//line's color
        ctx.fillStyle = color;
        
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
                
        ctx.quadraticCurveTo(radius, radius, radius*2.5, 0);
        ctx.quadraticCurveTo(radius, -radius, 0, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.restore();
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
    }

};