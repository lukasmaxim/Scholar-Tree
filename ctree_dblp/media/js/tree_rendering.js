// rendering
var RenderingView = Backbone.View.extend({

	initialize: function(args) {
		var self = this;
		this.containerID = args.containerID;
        console.log("in rendering initialize");
        _.bindAll(this, 'redraw');
        this.model.bind('change:tree_structure', this.redraw);

        this.saveCanvas = drawing_canvas.save_canvas;
        this.context =  this.saveCanvas.getContext('2d');

        this.scale = 0.3;
        this.save_scale = 0.3;
        this.translate_point = [0, 0];
        this.approx_size = 0;
        this.tree_size = {};

        this.start_x = 500; //_glx
        this.start_y = 1000; //_gly
        this.tree_tall = 2120; //ori _dist
        this.temp_height = 0;

        this.x_dist = 350;
        this.y_dist = 150;
        this.stick_length = 0; //new _dist
        this.total_layer = 0;

        this.dr = 0;
        this.dl = 0;

        this.extra_y = 0; // var outy = layer*8; //control point weight for its torson
        this.extra_x = 0; // var outx = layer*8; //control point (constant)

        this.tree_rstpoint = [0, 0, 0, 0];
        this.tree_lstpoint = [0, 0, 0, 0];

        this.stick_d = 30;
        this.fruit_d = 110;
        this.stick_variation = [50, 30, 0, 80, 15, 110]; // [30, 70, 0, 120, 10, 80];

        this.sub_stick_length = 45;
        this.sub_slop = 0;

        this.add_nature = 120;

        this.ego_label = "";
        this.save_img = 0;
        this.filter_cnt = 0;
        this.on_moving = 0;

        this.current_side = "right";
        this.current_layer = 1;
        this.current_ego = "tree1";
        this.leaf_order = 0;

        this.leaf_hovor = "-1";
	},

	// caculate the boundary
	redraw: function(){
		var self = this;
		this.context =  this.saveCanvas.getContext('2d');
		var structure = self.model.get("tree_structure");
		this.approx_size = 0; // havent get the exact boundary
		this.save_img = 0;
		// console.log(structure);
		if(jQuery.isEmptyObject(self.model.get("tree_structure"))){
			$("#no_preview").show();
			$("#tree_result").hide();
            return 0;
        }
        this.sub_stick_length = 55;
        this.sub_slop = 0;
        
        var total_tree = 0;        
        for(var e in tree_egos){
        	// console.log(e);
        	for(var t = 0; t < tree_egos[e].length; t++){ // all the ego
        		// console.log(tree_egos[e][t]);
		        this.context.setTransform(1, 0, 0, 1, 0, 0);
		        this.context.clearRect(0, 0, this.saveCanvas.width, this.saveCanvas.height);
		        this.context.save();

		        this.context.translate(0.5, 0.5);
		        this.context.scale(this.save_scale, this.save_scale);
		        this.start_x = 0; //_glx
        		this.start_y = 1000; //_gly

        		var sub = tree_egos[e][t];
                var ego = structure[sub][e];
                // console.log(ego);
                this.tree_rstpoint = [0, 0, 0, 0];
                this.tree_lstpoint = [0, 0, 0, 0];
                var left_side = 0;
                var right_side = 0;
                self.total_layer = ego["left"].length;
                self.stick_length = self.tree_tall/self.total_layer; //_dist
                var layer_total_alter = {"right": [], "left": []};
                for(var s = 0; s < self.total_layer; s++){ // !!!count twice if alter is not unique...
                    var l = ego["left"][s]["level"]["down"].length + ego["left"][s]["level"]["up"].length;
                    var r = ego["right"][s]["level"]["down"].length + ego["right"][s]["level"]["up"].length;
                    
                    layer_total_alter["right"].push(r);
                    layer_total_alter["left"].push(l);
                    left_side += l;
                    right_side += r;
                }
                trunk_size[e] = layer_total_alter;
                var ori_dr = right_side*0.65;
                var ori_dl = left_side*0.65;
                var count_dr = right_side;
                var count_dl = left_side;
                var t_scale = (right_side + left_side)/150;
                if(right_side+left_side < 100){
                    t_scale = 0.5;
                }
                else{
                    if(t_scale < 1){
                        t_scale = 1;
                    }
                }

                // for the left boundary
                var long_stick_length = 0;                
                for(var l = 0; l < layer_total_alter["left"].length; l++){
                    var down = ego["left"][l]["level"]["down"].length + l;
                    var up = ego["left"][l]["level"]["up"].length + l;
                    if(long_stick_length < down && down >= up){
                        long_stick_length = down;
                    }
                    else if(long_stick_length < up && down < up){
                        long_stick_length = up;
                    }
                }

                self.approx_size = 1;
                self.ego_label = e + "_" + sub;
                this.start_x += ((long_stick_length)*this.sub_stick_length + this.x_dist); //_glx
                self.tree_size[self.ego_label] = [this.start_x, this.start_x, this.start_y, this.start_y + this.stick_length + 300, "none", this.start_y];
            	
            	// draw tree
            	var start_h = 0;
                var add_h = 1;
                var max_h = self.total_layer;
                var mod_layer = Math.floor(8/self.total_layer);
                var layer_slop = Math.round(100/self.total_layer)/10;

                this.context.lineWidth = 5; // set the style
                var real_height = 0;
                tree_points[e] = {};
                for(var height = 0; height < self.total_layer; height++){
                    mapping_color.trunk = "rgb(" + (125-(height+1)*3).toString() + "," + (96-(height+1)*3).toString() + "," + (65-(height+1)*3).toString() + ")";
                                        
                    this.context.fillStyle = mapping_color.trunk;
                    this.context.strokeStyle = mapping_color.trunk;
                    this.context.beginPath();

                   
                    this.dr = (ori_dr/t_scale)*1.5;//1.5;
                    this.dl = (ori_dl/t_scale)*1.5;
                    
                    
                    this.temp_height = 30*height; //_d
                    if(real_height == 0){
                        this.temp_height = 60;
                    }

                    this.extra_y = height*8*layer_slop; //control point weight for its torson
                    this.extra_x = height*8*layer_slop; //control point (constant)
                    this.sub_slop = height*10*layer_slop;

                    var used_dr = 0;
                    var used_dl = 0;
                    tree_points[e][height] = {};
                    tree_points[e][height]["leaf"] = [];
                    tree_points[e][height]["fruit"] = [];
                    // draw right tree
                    if((real_height == self.total_layer-1 && layer_total_alter["right"][real_height] == 0) || (count_dr <= 0 && (count_dl-layer_total_alter["left"][real_height]) <= 0)){
                        used_dr = this.draw_right_branch(height, layer_total_alter["right"][real_height], ego["right"][real_height]["level"]);
                    }

                    else
                        used_dr = this.draw_right_branch(height, layer_total_alter["right"][real_height], ego["right"][real_height]["level"]);
                        
                    // draw left tree
                    this.context.fillStyle = mapping_color.trunk;
                    this.context.strokeStyle = mapping_color.trunk;
                    this.context.beginPath();
                    if((real_height == self.total_layer-1 && layer_total_alter["left"][real_height] == 0) || ((count_dr-layer_total_alter["right"][real_height]) <= 0)){
                        used_dl = this.draw_left_branch(height, layer_total_alter["left"][real_height], ego["left"][real_height]["level"]);
                    }

                    else
                        used_dl = this.draw_left_branch(height, layer_total_alter["left"][real_height], ego["left"][real_height]["level"]);

                    ori_dr -= used_dr*0.45;                    
                    ori_dl -= used_dl*0.45;
                    count_dr -= used_dr;                    
                    count_dl -= used_dl;
                    
                    if(count_dr + count_dl == 0){
                        break;
                    }
                    this.start_y = this.start_y - this.stick_length - this.temp_height;
                    // this.start_x = this.start_x + 100;
                    real_height += 1;
                }
                // this.x_dist*this.scale
                if(self.tree_size[self.ego_label][4] == "none"){
                    self.tree_size[self.ego_label][4] = this.start_x;
                }  
                total_tree++;
                this.context.restore();
        	}

        }

        this.draw4save();        
	},

	draw_right_branch: function(layer, num_alter, alters){
        var self = this;
        var stick_scale = 0;
        stick_scale = num_alter/50;
        if(num_alter < 15){
            stick_scale = 1/1.5;
        }
        else{
            if(stick_scale < 1){
                stick_scale = 1;
            }
        }
        this.current_side = "right";
        this.current_layer = layer;

        var stick_pos = {"up": [], "down": []};
        var long_stick, short_stick;
        
        var temp_total_leaf = this.count_total_leaf(alters);
        var total_leaf = temp_total_leaf["up"] + temp_total_leaf["down"];

        // give index of position
        if(alters["up"].length > alters["down"].length){
            var n = alters["up"].length/alters["down"].length;
            stick_pos["up"] = util.order_list(0, alters["up"].length);
            //console.log("step", n)
            var a = alters["up"].length - 1;
            var last = 0;
            while(a >= 0 && alters["down"].length > 0){
                stick_pos["down"].push(Math.round(a));
                last = Math.round(a);
                if(stick_pos["down"].length == alters["down"].length){
                    break;
                }
                a = a-n;
            }
            if(stick_pos["down"].length < alters["down"].length){
                if(last == 0)
                    stick_pos["down"].push(1);
                else
                    stick_pos["down"].push(0);
            }
            if(stick_pos["down"].length < alters["down"].length){
            	console.log(alters);
            	console.log(n);
                console.log("fuck uuuuuu!");
            }
            stick_pos["down"].sort( function(a, b){return a-b} );
            long_stick = "up";
            short_stick = "down";
        }

        else if(alters["up"].length < alters["down"].length){
            var n = alters["down"].length/alters["up"].length;
            stick_pos["down"] = util.order_list(0, alters["down"].length);
            var a = alters["down"].length - 1;
            var last = 0;
            while(a >= 0 && alters["up"].length > 0){
                stick_pos["up"].push(Math.round(a));
                last = Math.round(a);
                if(stick_pos["up"].length == alters["up"].length){
                    break;
                }
                a = a-n;
            }
            if(stick_pos["up"].length < alters["up"].length){
                if(last == 0)
                    stick_pos["up"].push(1);
                else
                    stick_pos["up"].push(0);
            }
            
            stick_pos["up"].sort( function(a, b){return a-b} );
            long_stick = "down";
            short_stick = "up";
        }

        else{
            stick_pos["up"] = util.order_list(0, alters["up"].length);
            stick_pos["down"] = util.order_list(0, alters["down"].length);
            long_stick = "up";
            short_stick = "down";
        }

        //draw stick
        var count_short_stick = 0;
        var u = alters["up"].length;
        var d = alters["down"].length;
        
        var total_draw_stick = 0;
        var cnt_short = 0;
        for(var n = 0, len = stick_pos[long_stick].length; n < len; n++){
            if(u == d){
                if(!jQuery.isEmptyObject(alters[long_stick][n])){
                    if(alters[long_stick][n]["leaf"].length > self.filter_cnt)
                        total_draw_stick++;
                    else{
                        if(!jQuery.isEmptyObject(alters[short_stick][n]))
                            if(alters[short_stick][n]["leaf"].length > self.filter_cnt)
                                total_draw_stick++;
                    }                    
                }
                else if(!jQuery.isEmptyObject(alters[short_stick][n])){
                    if(alters[short_stick][n]["leaf"].length > self.filter_cnt)
                        total_draw_stick++;
                }                
            }
            else{
                if(alters[long_stick][n]["leaf"].length > self.filter_cnt){
                    total_draw_stick++;
                    if(stick_pos[short_stick][cnt_short] == n){
                        cnt_short++;
                    }
                }
                else{
                    if(stick_pos[short_stick][cnt_short] == n){
                        if(alters[short_stick][cnt_short]["leaf"].length > self.filter_cnt){
                            total_draw_stick++;
                        }
                        cnt_short++;
                    }
                }
            }
        }
        
        // var stick_width = num_alter/stick_scale;
        var stick_width = total_draw_stick/stick_scale;
        // end point
        var tree_rstpoint = [0, 0, 0, 0];
        tree_rstpoint[0] = this.start_x + this.x_dist - this.extra_x; // down point
        tree_rstpoint[1] = this.start_y - this.y_dist - this.stick_length - this.extra_y;

        tree_rstpoint[2] = this.start_x + this.x_dist - this.extra_x; // up point
        tree_rstpoint[3] = this.start_y - this.y_dist - this.stick_length - this.extra_y - stick_width;

        // find control point
        var m = this.sub_slop/55;
        // y = m(x-x1)+y1
        var c1 = m*(tree_rstpoint[0] - (this.start_x + this.dr)) + tree_rstpoint[1];
        var c2 = m*(tree_rstpoint[2] - this.start_x) + tree_rstpoint[3];

        var cp1 = [this.start_x + this.dr, this.start_y-100];
        var cp2 = [this.start_x + this.dr, c1];
        
        var cp3 = [this.start_x, c2];
        var cp4 = [this.start_x, this.start_y-100];

        var weight = Math.abs(tree_rstpoint[3] - tree_rstpoint[1]);

        // draw branch
        this.context.moveTo(this.start_x + this.dr, this.start_y + this.temp_height);
        
        tree_points[self.current_ego][layer]["right"] = {};
        tree_points[self.current_ego][layer]["right"]["trunk"] = [this.start_x + this.dr, this.start_y + this.temp_height];
        tree_points[self.current_ego][layer]["right"]["type"] = "branch";

        tree_points[self.current_ego][layer]["total"] = total_draw_stick; // stick_pos[long_stick].length;
        tree_points[self.current_ego][layer]["right"]["sticks"] = [];
        
        if(total_draw_stick > 0){
            var temp_points = 
            [cp1[0], cp1[1], cp2[0], cp2[1], tree_rstpoint[0], tree_rstpoint[1], 
            tree_rstpoint[2], tree_rstpoint[3],
            cp3[0], cp3[1], cp4[0], cp4[1], this.start_x - this.dl, this.start_y + this.temp_height,
            this.start_x + this.dr, this.start_y + this.temp_height];

            tree_points[self.current_ego][layer]["right"]["trunk"] = tree_points[self.current_ego][layer]["right"]["trunk"].concat(temp_points)

            this.context.bezierCurveTo(cp1[0], cp1[1], cp2[0], cp2[1], tree_rstpoint[0], tree_rstpoint[1]);
            this.context.lineTo(tree_rstpoint[2], tree_rstpoint[3]);
            this.context.bezierCurveTo(cp3[0], cp3[1], cp4[0], cp4[1], this.start_x - this.dl, this.start_y + this.temp_height);
            this.context.closePath();
            // draw rectangle to fill the trunk
            this.context.moveTo(this.start_x + this.dr, this.start_y + this.temp_height);
            if(layer != 0){
                temp_points = 
                [this.start_x + this.dr, this.start_y + this.temp_height*2 + this.stick_length*2,
                this.start_x - this.dl, this.start_y + this.temp_height*2 + this.stick_length*2];
                tree_points[self.current_ego][layer]["right"]["trunk"] = tree_points[self.current_ego][layer]["right"]["trunk"].concat(temp_points)

                this.context.lineTo(this.start_x + this.dr, this.start_y + this.temp_height*2 + this.stick_length*2);
                this.context.lineTo(this.start_x - this.dl, this.start_y + this.temp_height*2 + this.stick_length*2);
            }
            else{
                temp_points = 
                [this.start_x + this.dr, this.start_y + this.temp_height + this.stick_length + 200,
                this.start_x - this.dl, this.start_y + this.temp_height + this.stick_length + 200];
                tree_points[self.current_ego][layer]["right"]["trunk"] = tree_points[self.current_ego][layer]["right"]["trunk"].concat(temp_points)

                this.context.lineTo(this.start_x + this.dr, this.start_y + this.temp_height + this.stick_length + 200);
                this.context.lineTo(this.start_x - this.dl, this.start_y + this.temp_height + this.stick_length + 200);
            }

            temp_points = 
            [this.start_x - this.dl, this.start_y + this.temp_height];
            tree_points[self.current_ego][layer]["right"]["trunk"] = tree_points[self.current_ego][layer]["right"]["trunk"].concat(temp_points)

            this.context.lineTo(this.start_x - this.dl, this.start_y + this.temp_height);
            this.context.closePath();

            this.context.stroke();//draw line
            this.context.fill();//fill color

            // this.context.beginPath();
            // this.context.lineWidth = 1;
            // this.context.arc(tree_rstpoint[0], (tree_rstpoint[1]+tree_rstpoint[3])/2, stick_width/2.5, 0, 2*Math.PI, true);
            // this.context.closePath();
            // this.context.stroke();
            // this.context.fill();
            // this.context.lineWidth = 5;
        }
        else{ // no branch
            tree_points[self.current_ego][layer]["right"]["type"] = "nobranch";
            temp_points = 
            [this.start_x + this.dr + 10 - layer*1.5, this.start_y - this.stick_length + layer*15, this.start_x + this.dr + 50, this.start_y - this.stick_length - 100 + layer*15,
            this.start_x + this.dr + 25, this.start_y - this.stick_length - 150 + layer*15, this.start_x - this.dl, this.start_y + this.temp_height,
            this.start_x + this.dr, this.start_y + this.temp_height]

            tree_points[self.current_ego][layer]["right"]["trunk"] = tree_points[self.current_ego][layer]["right"]["trunk"].concat(temp_points);

            // this.context.lineTo(this.start_x + this.dr, this.start_y - this.stick_length);
            // this.context.lineTo(this.start_x - this.dl, this.start_y - this.stick_length);
            // this.context.lineTo(this.start_x - this.dl, this.start_y + this.temp_height);
            // this.context.closePath();
            // (2*this.start_x + this.dr - this.dl)*0.5
            this.context.quadraticCurveTo(this.start_x + this.dr + 10 - layer*1.5, this.start_y - this.stick_length + layer*15, this.start_x + this.dr + 50, this.start_y - this.stick_length - 100 + layer*15);
            this.context.quadraticCurveTo(this.start_x + this.dr + 25, this.start_y - this.stick_length - 150 + layer*15, this.start_x - this.dl, this.start_y + this.temp_height);
            this.context.closePath();           

            // draw rectangle to fill the trunk
            this.context.moveTo(this.start_x + this.dr, this.start_y + this.temp_height);
            if(layer != 0){
                temp_points = 
                [this.start_x + this.dr, this.start_y + this.temp_height*2 + this.stick_length*2,
                this.start_x - this.dl, this.start_y + this.temp_height*2 + this.stick_length*2];
                tree_points[self.current_ego][layer]["right"]["trunk"] = tree_points[self.current_ego][layer]["right"]["trunk"].concat(temp_points)

                this.context.lineTo(this.start_x + this.dr, this.start_y + this.temp_height*2 + this.stick_length*2);
                this.context.lineTo(this.start_x - this.dl, this.start_y + this.temp_height*2 + this.stick_length*2);
            }
            else{
                temp_points = 
                [this.start_x + this.dr, this.start_y + this.temp_height + this.stick_length + 200,
                this.start_x - this.dl, this.start_y + this.temp_height + this.stick_length + 200];
                tree_points[self.current_ego][layer]["right"]["trunk"] = tree_points[self.current_ego][layer]["right"]["trunk"].concat(temp_points)

                this.context.lineTo(this.start_x + this.dr, this.start_y + this.temp_height + this.stick_length + 200);
                this.context.lineTo(this.start_x - this.dl, this.start_y + this.temp_height + this.stick_length + 200);
            }
            temp_points = 
            [this.start_x - this.dl, this.start_y + this.temp_height];
            tree_points[self.current_ego][layer]["right"]["trunk"] = tree_points[self.current_ego][layer]["right"]["trunk"].concat(temp_points)

            this.context.lineTo(this.start_x - this.dl, this.start_y + this.temp_height);
            this.context.closePath();

            this.context.stroke();//draw line
            this.context.fill();//fill color
            tree_points[self.current_ego][layer]["right"]["sticks"].push("end");
            return 0;
        }


        var nature_scale = self.model.get("dtl_branch_curve");
        var w = weight/total_draw_stick;
        var len_scale = self.model.get("sub_leaf_len_scale");
        var end_p = [(tree_rstpoint[2]+tree_rstpoint[0])/2, (tree_rstpoint[3]+tree_rstpoint[1])/2];
        var start_p = [(cp2[0]+cp3[0])/2, (cp2[1]+cp3[1])/2];

        var branch_v = [];
        var b_dist = 0;
        var unit_v = [];
        var stick_v = {};
        var base_stick_len = this.stick_d*len_scale;
        var stick_slop;
        var begin_index = {"up": [2, 3], "down":[0, 1]};

        for(var n = 0, len = stick_pos[long_stick].length; n < len; n++){
            var nature = n*(Math.abs(d-u)/stick_scale);
            var stick_len = (this.stick_d + this.stick_variation[n%6])*len_scale;
            if(alters[long_stick][n]["leaf"].length > 10){
                stick_len = (this.stick_d + this.stick_variation[n%2])*len_scale;
            }
            
            if(Math.abs(d-u)<len/2){
                nature = n*((this.sub_slop/10)+1)*2;
            }
            else if(len>20 && Math.abs(d-u)/stick_scale>(layer+1)*2){
                nature = n*((this.sub_slop/10)+2)*2;
            }
            nature = n*10 + layer*1.5;
            if(layer > 6 && num_alter > 50)
                nature = n*10 + layer*1.5 + 50;
            nature = nature*nature_scale;

            // using rotation matrix to find the stick vector (45 degree)
            branch_v = [end_p[0]-start_p[0], end_p[1]-start_p[1]];
            b_dist = Math.sqrt(Math.pow(branch_v[0],2) + Math.pow(branch_v[1],2));

            unit_v = [branch_v[0]/b_dist, branch_v[1]/b_dist];
            stick_v = {'up': this.find_dir(unit_v, Math.PI/4), 'down': this.find_dir(unit_v, -Math.PI/4)};

            // stick_slope = {"up":[stick_v['up'][0]*stick_len, stick_v['up'][1]*stick_len], 
            //               "down":[stick_v['down'][0]*stick_len, stick_v['down'][1]*stick_len]}
            stick_slope = {"up":[stick_v['up'][0], stick_v['up'][1]], 
                          "down":[stick_v['down'][0], stick_v['down'][1]]}

            var sub_total_leaf = 0;
            
            var start_point = [ tree_rstpoint[begin_index[long_stick][0]]+stick_slope[long_stick][0]*stick_len, tree_rstpoint[begin_index[long_stick][1]]+stick_slope[long_stick][1]*stick_len ];
                    
            // sub stick
            if(!jQuery.isEmptyObject(alters[long_stick][n])){
                stick_len = (this.stick_d + this.stick_variation[n%6])*len_scale;
                if(alters[long_stick][n]["leaf"].length > 10){
                    stick_len = (this.stick_d + this.stick_variation[n%2])*len_scale;
                }
                tree_points[self.current_ego][layer]["right"]["sticks"].push(tree_rstpoint[begin_index[long_stick][0]], tree_rstpoint[begin_index[long_stick][1]]);
                tree_points[self.current_ego][layer]["right"]["sticks"].push(tree_rstpoint[begin_index[long_stick][0]]+stick_slope[long_stick][0]*stick_len, tree_rstpoint[begin_index[long_stick][1]]+stick_slope[long_stick][1]*stick_len);
                tree_points[self.current_ego][layer]["right"]["sticks"].push("none", "none", "none", "none");
                this.context.fillStyle = mapping_color.trunk;
                this.context.strokeStyle = mapping_color.trunk;
                this.context.lineWidth = 8;
                this.context.lineCap = 'round';
                this.context.beginPath();
                this.context.moveTo(tree_rstpoint[begin_index[long_stick][0]], tree_rstpoint[begin_index[long_stick][1]]);
                this.context.lineTo(tree_rstpoint[begin_index[long_stick][0]]+stick_slope[long_stick][0]*stick_len, tree_rstpoint[begin_index[long_stick][1]]+stick_slope[long_stick][1]*stick_len);
                //context.lineTo(_rstpoint[2],_rstpoint[3])
                this.context.stroke();//draw line
                this.context.fill();//fill color
            }
            
            // draw leaf
            var stick_leaf = 0;
            if(!jQuery.isEmptyObject(alters[long_stick][n])){
                stick_leaf = this.draw_leaf(alters[long_stick][n], start_point, stick_v[long_stick]);
            }
            sub_total_leaf += stick_leaf;
            
            // short stick
            if(stick_pos[short_stick][count_short_stick] == n){
                if(jQuery.isEmptyObject(alters[short_stick][count_short_stick])){
                    count_short_stick++;
                }
                else if(alters[short_stick][count_short_stick]["leaf"].length <= self.filter_cnt){
                    sub_total_leaf += alters[short_stick][count_short_stick]["leaf"].length;
                    count_short_stick++;
                }
                else{
                    stick_len = (this.stick_d + this.stick_variation[count_short_stick%6])*len_scale;
                    if(alters[short_stick][count_short_stick]["leaf"].length > 10){
                        stick_len = (this.stick_d + this.stick_variation[count_short_stick%2])*len_scale;
                    }
                    
                    this.context.fillStyle = mapping_color.trunk;
                    this.context.strokeStyle = mapping_color.trunk;
                    this.context.lineWidth = 8;
                    this.context.lineCap = 'round';
                    this.context.beginPath();

                    tree_points[self.current_ego][layer]["right"]["sticks"].push(tree_rstpoint[begin_index[short_stick][0]], tree_rstpoint[begin_index[short_stick][1]]);
                    tree_points[self.current_ego][layer]["right"]["sticks"].push(tree_rstpoint[begin_index[short_stick][0]]+stick_slope[short_stick][0]*stick_len, tree_rstpoint[begin_index[short_stick][1]]+stick_slope[short_stick][1]*stick_len);
                    tree_points[self.current_ego][layer]["right"]["sticks"].push("none", "none", "none", "none");
                    
                    this.context.moveTo(tree_rstpoint[begin_index[short_stick][0]], tree_rstpoint[begin_index[short_stick][1]]);
                    this.context.lineTo(tree_rstpoint[begin_index[short_stick][0]]+stick_slope[short_stick][0]*stick_len, tree_rstpoint[begin_index[short_stick][1]]+stick_slope[short_stick][1]*stick_len);
                    
                    this.context.stroke();//draw line
                    this.context.fill();//fill color
                    
                    start_point = [ tree_rstpoint[begin_index[short_stick][0]]+stick_slope[short_stick][0]*stick_len, tree_rstpoint[begin_index[short_stick][1]]+stick_slope[short_stick][1]*stick_len ];
                    
                    var stick_leaf = 0;
                    stick_leaf = this.draw_leaf(alters[short_stick][count_short_stick], start_point, stick_v[short_stick]); 
                    
                    sub_total_leaf += stick_leaf;
                    
                    count_short_stick++;
                }
                
            }

            else{
                tree_points[self.current_ego][layer]["right"]["sticks"].push("none", "none", "none", "none");
                tree_points[self.current_ego][layer]["right"]["sticks"].push("none", "none", "none", "none");
            }
            
            if(total_draw_stick > 1){ 
                this.context.lineWidth = 5;
                this.context.fillStyle = mapping_color.trunk;
                this.context.strokeStyle = mapping_color.trunk;
                this.context.lineCap = 'round';
                this.context.beginPath();

                var ori_rstpoint = [0, 0, 0, 0];
                ori_rstpoint[0] = tree_rstpoint[0];
                ori_rstpoint[1] = tree_rstpoint[1];
                ori_rstpoint[2] = tree_rstpoint[2];
                ori_rstpoint[3] = tree_rstpoint[3];
                tree_rstpoint[0] = tree_rstpoint[0]+this.sub_stick_length-nature/(len/2);
                tree_rstpoint[1] = tree_rstpoint[1]-w/2-this.sub_slop-nature/(len/2);
                tree_rstpoint[2] = tree_rstpoint[2]+this.sub_stick_length-nature/(len/2);
                tree_rstpoint[3] = tree_rstpoint[3]+w/2-this.sub_slop-nature/(len/2);

                this.context.moveTo(ori_rstpoint[0],ori_rstpoint[1]);
                this.context.lineTo(tree_rstpoint[0], tree_rstpoint[1]);
                tree_points[self.current_ego][layer]["right"]["sticks"].push(ori_rstpoint[0],ori_rstpoint[1]);
                tree_points[self.current_ego][layer]["right"]["sticks"].push(tree_rstpoint[0], tree_rstpoint[1]);

                
                if(total_draw_stick > 2){
                    tree_points[self.current_ego][layer]["right"]["sticks"].push(tree_rstpoint[2], tree_rstpoint[3]);
                    tree_points[self.current_ego][layer]["right"]["sticks"].push(ori_rstpoint[2], ori_rstpoint[3]);
                    this.context.lineTo(tree_rstpoint[2], tree_rstpoint[3]);
                    this.context.lineTo(ori_rstpoint[2], ori_rstpoint[3]);
                    this.context.closePath();
                    this.context.stroke();//draw line
                    this.context.fill();//fill color
                }   
                else{
                    tree_points[self.current_ego][layer]["right"]["sticks"].push(ori_rstpoint[2], ori_rstpoint[3], "none", "none");
                    this.context.lineTo(ori_rstpoint[2], ori_rstpoint[3]);
                    this.context.closePath();
                    this.context.stroke();//draw line
                    this.context.fill();//fill color

                    tree_rstpoint[2] = tree_rstpoint[0];
                    tree_rstpoint[3] = tree_rstpoint[1];
                }    
                // update branch vector
                end_p = [(tree_rstpoint[2]+tree_rstpoint[0])/2, (tree_rstpoint[3]+tree_rstpoint[1])/2];
                start_p = [(ori_rstpoint[2]+ori_rstpoint[0])/2, (ori_rstpoint[3]+ori_rstpoint[1])/2];             
                total_draw_stick-=1;
            }
            
        }
        tree_points[self.current_ego][layer]["right"]["sticks"].push("end");
        return (stick_pos[long_stick].length + stick_pos[short_stick].length);
        
    },

    draw_left_branch: function(layer, num_alter, alters){
        var self = this;
        var stick_scale = 0;
        stick_scale = num_alter/50;
        if(num_alter < 15){
            stick_scale = 1/1.5;
        }
        else{
            if(stick_scale < 1){
                stick_scale = 1;
            }
        }

        this.current_side = "left";
        this.current_layer = layer;
        
        var stick_pos = {"up": [], "down": []};
        var long_stick, short_stick;
       
        var temp_total_leaf = this.count_total_leaf(alters);
        var total_leaf = temp_total_leaf["up"] + temp_total_leaf["down"];
        // give index of position
        if(alters["up"].length > alters["down"].length){
            var n = alters["up"].length/alters["down"].length;
            stick_pos["up"] = util.order_list(0, alters["up"].length);
            var a = alters["up"].length-1;
            var last = 0;
            while(a >= 0 && alters["down"].length > 0){
                stick_pos["down"].push(Math.round(a));
                last = Math.round(a);
                if(stick_pos["down"].length == alters["down"].length){
                    break;
                }
                a = a-n;
            }
            if(stick_pos["down"].length < alters["down"].length){
                if(last == 0)
                    stick_pos["down"].push(1);
                else
                    stick_pos["down"].push(0);
            }
            stick_pos["down"].sort( function(a, b){return a-b} );
            long_stick = "up";
            short_stick = "down";
        }

        else if(alters["up"].length < alters["down"].length){
            var n = alters["down"].length/alters["up"].length;
            stick_pos["down"] = util.order_list(0, alters["down"].length);
            var a = alters["down"].length-1;
            var last = 0;
            while(a >= 0 && alters["up"].length > 0){
                stick_pos["up"].push(Math.round(a));
                last = Math.round(a);
                if(stick_pos["up"].length == alters["up"].length){
                    break;
                }
                a = a-n;
            }
            if(stick_pos["up"].length < alters["up"].length){
                if(last == 0)
                    stick_pos["up"].push(1);
                else
                    stick_pos["up"].push(0);
            }
            stick_pos["up"].sort( function(a, b){return a-b} );
            long_stick = "down";
            short_stick = "up";
        }

        else{
            stick_pos["up"] = util.order_list(0, alters["up"].length);
            stick_pos["down"] = util.order_list(0, alters["down"].length);
            long_stick = "up";
            short_stick = "down";
        }

        var count_short_stick = 0;
        var u = alters["up"].length;
        var d = alters["down"].length;
        

        var total_draw_stick = 0;
        var cnt_short = 0;
        for(var n = 0, len = stick_pos[long_stick].length; n < len; n++){
            if(u == d){
                if(!jQuery.isEmptyObject(alters[long_stick][n])){
                    if(alters[long_stick][n]["leaf"].length > self.filter_cnt)
                        total_draw_stick++;
                    else{
                        if(!jQuery.isEmptyObject(alters[short_stick][n]))
                            if(alters[short_stick][n]["leaf"].length > self.filter_cnt)
                                total_draw_stick++;
                    }                    
                }
                else if(!jQuery.isEmptyObject(alters[short_stick][n])){
                    if(alters[short_stick][n]["leaf"].length > self.filter_cnt)
                        total_draw_stick++;
                }                
            }
            else{
                if(alters[long_stick][n]["leaf"].length > self.filter_cnt){
                    total_draw_stick++;
                    if(stick_pos[short_stick][cnt_short] == n){
                        cnt_short++;
                    }
                }
                else{
                    if(stick_pos[short_stick][cnt_short] == n){
                        if(alters[short_stick][cnt_short]["leaf"].length > self.filter_cnt){
                            total_draw_stick++;
                        }
                        cnt_short++;
                    }
                }
            }
            
        }


        var stick_width = total_draw_stick/stick_scale;
        // end point
        var tree_lstpoint = [0, 0, 0, 0];
        tree_lstpoint[0] = this.start_x - this.x_dist + this.extra_x; // down point
        tree_lstpoint[1] = this.start_y - this.y_dist - this.stick_length - this.extra_y;

        tree_lstpoint[2] = this.start_x - this.x_dist + this.extra_x; // up point
        tree_lstpoint[3] = this.start_y - this.y_dist - this.stick_length - this.extra_y - stick_width;

        // find control point
        // var m = -(layer*10)/55;
        var m = -this.sub_slop/55;
        // y = m(x-x1)+y1
        var c1 = m*(tree_lstpoint[0] - (this.start_x - this.dl)) + tree_lstpoint[1];
        var c2 = m*(tree_lstpoint[2] - this.start_x) + tree_lstpoint[3];

        var cp1 = [this.start_x - this.dl, this.start_y-100];
        var cp2 = [this.start_x - this.dl, c1];
        
        var cp3 = [this.start_x, c2];
        var cp4 = [this.start_x, this.start_y-100];

        var weight = Math.abs(tree_lstpoint[3] - tree_lstpoint[1]);

        tree_points[self.current_ego][layer]["left"] = {};
        tree_points[self.current_ego][layer]["left"]["trunk"] = [this.start_x - this.dl, this.start_y + this.temp_height];
        tree_points[self.current_ego][layer]["left"]["type"] = "branch";

        if( total_draw_stick > tree_points[self.current_ego][layer]["total"])
            tree_points[self.current_ego][layer]["total"] = total_draw_stick; // stick_pos[long_stick].length;
        tree_points[self.current_ego][layer]["left"]["sticks"] = [];        

        // draw branch
        this.context.moveTo(this.start_x - this.dl, this.start_y + this.temp_height);
        if(total_draw_stick > 0){
            tree_points[self.current_ego][layer]["left"]["trunk"].push(cp1[0], cp1[1], cp2[0], cp2[1], tree_lstpoint[0], tree_lstpoint[1]);
            tree_points[self.current_ego][layer]["left"]["trunk"].push(tree_lstpoint[2], tree_lstpoint[3]);
            tree_points[self.current_ego][layer]["left"]["trunk"].push(cp3[0], cp3[1], cp4[0], cp4[1], this.start_x + this.dr, this.start_y + this.temp_height);
            tree_points[self.current_ego][layer]["left"]["trunk"].push(this.start_x - this.dl, this.start_y + this.temp_height);

            this.context.bezierCurveTo(cp1[0], cp1[1], cp2[0], cp2[1], tree_lstpoint[0], tree_lstpoint[1]);
            this.context.lineTo(tree_lstpoint[2], tree_lstpoint[3]);
            this.context.bezierCurveTo(cp3[0], cp3[1], cp4[0], cp4[1], this.start_x + this.dr, this.start_y + this.temp_height);
            this.context.closePath();
            // draw rectangle to fill the trunk
            this.context.moveTo(this.start_x - this.dl, this.start_y + this.temp_height);
            if(layer != 0){
                tree_points[self.current_ego][layer]["left"]["trunk"].push(this.start_x - this.dl, this.start_y + this.temp_height*2 + this.stick_length*2);
                tree_points[self.current_ego][layer]["left"]["trunk"].push(this.start_x + this.dr, this.start_y + this.temp_height*2 + this.stick_length*2);
                this.context.lineTo(this.start_x - this.dl, this.start_y + this.temp_height*2 + this.stick_length*2);
                this.context.lineTo(this.start_x + this.dr, this.start_y + this.temp_height*2 + this.stick_length*2);
            }
            else{
                tree_points[self.current_ego][layer]["left"]["trunk"].push(this.start_x - this.dl, this.start_y + this.temp_height + this.stick_length + 200);
                tree_points[self.current_ego][layer]["left"]["trunk"].push(this.start_x + this.dr, this.start_y + this.temp_height + this.stick_length + 200);
                this.context.lineTo(this.start_x - this.dl, this.start_y + this.temp_height + this.stick_length + 200);
                this.context.lineTo(this.start_x + this.dr, this.start_y + this.temp_height + this.stick_length + 200);
            }
            tree_points[self.current_ego][layer]["left"]["trunk"].push(this.start_x + this.dr, this.start_y + this.temp_height);
            this.context.lineTo(this.start_x + this.dr, this.start_y + this.temp_height);
            this.context.closePath();

            this.context.stroke();//draw line
            this.context.fill();//fill color

            // this.context.beginPath();
            // this.context.lineWidth = 1;
            // this.context.arc(tree_lstpoint[0], (tree_lstpoint[1]+tree_lstpoint[3])/2, stick_width/2, 0, 2*Math.PI, true);
            // this.context.closePath();
            // this.context.stroke();
            // this.context.fill();
            // this.context.lineWidth = 5;

        }
        else{ // no branch
            tree_points[self.current_ego][layer]["left"]["type"] = "branch";
            tree_points[self.current_ego][layer]["left"]["trunk"].push(this.start_x - this.dl - 10 + layer*1.5, this.start_y - this.stick_length + layer*15, this.start_x - this.dl - 50, this.start_y - this.stick_length - 100 + layer*15);
            tree_points[self.current_ego][layer]["left"]["trunk"].push(this.start_x - this.dl - 25, this.start_y - this.stick_length - 150 + layer*15, this.start_x + this.dr, this.start_y + this.temp_height);
            tree_points[self.current_ego][layer]["left"]["trunk"].push(this.start_x - this.dl, this.start_y + this.temp_height);
            /*
            this.context.lineTo(this.start_x - this.dl, this.start_y - this.stick_length);
            this.context.lineTo(this.start_x + this.dr, this.start_y - this.stick_length);
            this.context.lineTo(this.start_x + this.dr, this.start_y + this.temp_height);
            this.context.closePath();
            */
            // (2*this.start_x + this.dr - this.dl)*0.5
            this.context.quadraticCurveTo(this.start_x - this.dl - 10 + layer*1.5, this.start_y - this.stick_length + layer*15, this.start_x - this.dl - 50, this.start_y - this.stick_length - 100 + layer*15);
            this.context.quadraticCurveTo(this.start_x - this.dl - 25, this.start_y - this.stick_length - 150 + layer*15, this.start_x + this.dr, this.start_y + this.temp_height);
            this.context.closePath();
            
            // draw rectangle to fill the trunk
            this.context.moveTo(this.start_x - this.dl, this.start_y + this.temp_height);
            if(layer != 0){
                tree_points[self.current_ego][layer]["left"]["trunk"].push(this.start_x - this.dl, this.start_y + this.temp_height*2 + this.stick_length*2);
                tree_points[self.current_ego][layer]["left"]["trunk"].push(this.start_x + this.dr, this.start_y + this.temp_height*2 + this.stick_length*2);
                this.context.lineTo(this.start_x - this.dl, this.start_y + this.temp_height*2 + this.stick_length*2);
                this.context.lineTo(this.start_x + this.dr, this.start_y + this.temp_height*2 + this.stick_length*2);
            }
            else{
                tree_points[self.current_ego][layer]["left"]["trunk"].push(this.start_x - this.dl, this.start_y + this.temp_height + this.stick_length + 200);
                tree_points[self.current_ego][layer]["left"]["trunk"].push(this.start_x + this.dr, this.start_y + this.temp_height + this.stick_length + 200);
                this.context.lineTo(this.start_x - this.dl, this.start_y + this.temp_height + this.stick_length + 200);
                this.context.lineTo(this.start_x + this.dr, this.start_y + this.temp_height + this.stick_length + 200);
            }
            tree_points[self.current_ego][layer]["left"]["trunk"].push(this.start_x + this.dr, this.start_y + this.temp_height);
            this.context.lineTo(this.start_x + this.dr, this.start_y + this.temp_height);
            this.context.closePath();

            this.context.stroke();//draw line
            this.context.fill();//fill color
            tree_points[self.current_ego][layer]["left"]["sticks"].push("end");
            return 0;
        }

        var nature_scale = self.model.get("dtl_branch_curve");
        var w = weight/total_draw_stick;
        var len_scale = self.model.get("sub_leaf_len_scale");
        var end_p = [(tree_lstpoint[2]+tree_lstpoint[0])/2, (tree_lstpoint[3]+tree_lstpoint[1])/2];
        var start_p = [(cp2[0]+cp3[0])/2, (cp2[1]+cp3[1])/2];

        var branch_v = [];
        var b_dist = 0;
        var unit_v = [];
        var stick_v = {};
        var stick_len = this.stick_d*len_scale;
        var stick_slop;
        var begin_index = {"up": [2, 3], "down":[0, 1]};

        for(var n = 0, len = stick_pos[long_stick].length; n < len; n++){
            var nature = n*(Math.abs(d-u)/stick_scale);
            var stick_len = (this.stick_d + this.stick_variation[n%6])*len_scale;
            if(alters[long_stick][n]["leaf"].length > 10){
                stick_len = (this.stick_d + this.stick_variation[n%2])*len_scale;
            }
            
            if(Math.abs(d-u)<len/2){
                nature = n*((this.sub_slop/10)+1)*2;
            }
            else if(len>20 && Math.abs(d-u)/stick_scale>(layer+1)*2){
                nature = n*((this.sub_slop/10)+2)*2;
            }

            nature = n*10 + layer*1.5;
            if(layer > 6 && num_alter > 50)
                nature = n*10 + layer*1.5 + 50;
            nature = nature*nature_scale;

            // using rotation matrix to find the stick vector (45 degree)
            branch_v = [end_p[0]-start_p[0], end_p[1]-start_p[1]];
            b_dist = Math.sqrt(Math.pow(branch_v[0],2) + Math.pow(branch_v[1],2));

            unit_v = [branch_v[0]/b_dist, branch_v[1]/b_dist];
            stick_v = {'up': this.find_dir(unit_v, -Math.PI/4), 'down': this.find_dir(unit_v, Math.PI/4)};

            // stick_slope = {"up":[stick_v['up'][0]*stick_len, stick_v['up'][1]*stick_len], 
            //               "down":[stick_v['down'][0]*stick_len, stick_v['down'][1]*stick_len]};

            stick_slope = {"up":[stick_v['up'][0], stick_v['up'][1]], 
                          "down":[stick_v['down'][0], stick_v['down'][1]]};

            var start_point = [ tree_lstpoint[begin_index[long_stick][0]]+stick_slope[long_stick][0]*stick_len, tree_lstpoint[begin_index[long_stick][1]]+stick_slope[long_stick][1]*stick_len ];
           
            var sub_total_leaf = 0;

            // sub stick
            if(!jQuery.isEmptyObject(alters[long_stick][n])){
                stick_len = (this.stick_d + this.stick_variation[n%6])*len_scale;
                if(alters[long_stick][n]["leaf"].length > 10){
                    stick_len = (this.stick_d + this.stick_variation[n%2])*len_scale;
                }

                tree_points[self.current_ego][layer]["left"]["sticks"].push(tree_lstpoint[begin_index[long_stick][0]], tree_lstpoint[begin_index[long_stick][1]]);
                tree_points[self.current_ego][layer]["left"]["sticks"].push(tree_lstpoint[begin_index[long_stick][0]]+stick_slope[long_stick][0]*stick_len, tree_lstpoint[begin_index[long_stick][1]]+stick_slope[long_stick][1]*stick_len);
                tree_points[self.current_ego][layer]["left"]["sticks"].push("none", "none", "none", "none");
                this.context.lineWidth = 8;
                this.context.fillStyle = mapping_color.trunk;
                this.context.strokeStyle = mapping_color.trunk;
                this.context.lineCap = 'round';
                this.context.beginPath();
                this.context.moveTo(tree_lstpoint[begin_index[long_stick][0]], tree_lstpoint[begin_index[long_stick][1]]);
                this.context.lineTo(tree_lstpoint[begin_index[long_stick][0]]+stick_slope[long_stick][0]*stick_len, tree_lstpoint[begin_index[long_stick][1]]+stick_slope[long_stick][1]*stick_len);
                //context.lineTo(_rstpoint[2],_rstpoint[3])
                this.context.stroke();//draw line
                // this.context.fill();//fill color
            }            

            var stick_leaf = 0;
            if(!jQuery.isEmptyObject(alters[long_stick][n])){
                stick_leaf = this.draw_leaf(alters[long_stick][n], start_point, stick_v[long_stick]);
            }
            sub_total_leaf += stick_leaf;       
            
            // short stick
            if(stick_pos[short_stick][count_short_stick] == n){
                if(jQuery.isEmptyObject(alters[short_stick][count_short_stick])){
                    count_short_stick++;
                }
                else if(alters[short_stick][count_short_stick]["leaf"].length <= self.filter_cnt){
                    sub_total_leaf += alters[short_stick][count_short_stick]["leaf"].length;
                    count_short_stick++;
                }
                else{
                    stick_len = (this.stick_d + this.stick_variation[count_short_stick%6])*len_scale;
                    if(alters[short_stick][count_short_stick]["leaf"].length > 10){
                        stick_len = (this.stick_d + this.stick_variation[count_short_stick%2])*len_scale;
                    }
                    tree_points[self.current_ego][layer]["left"]["sticks"].push(tree_lstpoint[begin_index[short_stick][0]], tree_lstpoint[begin_index[short_stick][1]]);
                    tree_points[self.current_ego][layer]["left"]["sticks"].push(tree_lstpoint[begin_index[short_stick][0]]+stick_slope[short_stick][0]*stick_len, tree_lstpoint[begin_index[short_stick][1]]+stick_slope[short_stick][1]*stick_len);
                    tree_points[self.current_ego][layer]["left"]["sticks"].push("none", "none", "none", "none");
                    
                    this.context.fillStyle = mapping_color.trunk;
                    this.context.strokeStyle = mapping_color.trunk;
                    this.context.lineWidth = 8;
                    this.context.lineCap = 'round';
                    this.context.beginPath();
                    this.context.moveTo(tree_lstpoint[begin_index[short_stick][0]], tree_lstpoint[begin_index[short_stick][1]]);
                    this.context.lineTo(tree_lstpoint[begin_index[short_stick][0]]+stick_slope[short_stick][0]*stick_len, tree_lstpoint[begin_index[short_stick][1]]+stick_slope[short_stick][1]*stick_len);
                    
                    this.context.stroke();//draw line
                    // this.context.fill();//fill color
                    
                    start_point = [ tree_lstpoint[begin_index[short_stick][0]]+stick_slope[short_stick][0]*stick_len, tree_lstpoint[begin_index[short_stick][1]]+stick_slope[short_stick][1]*stick_len ];
                    
                    stick_leaf = 0;
                    stick_leaf = this.draw_leaf(alters[short_stick][count_short_stick], start_point, stick_v[short_stick]);
                    
                    sub_total_leaf += stick_leaf;

                    count_short_stick++;
                }
                
            }

            else{
                tree_points[self.current_ego][layer]["left"]["sticks"].push("none", "none", "none", "none");
                tree_points[self.current_ego][layer]["left"]["sticks"].push("none", "none", "none", "none");
            }

            if(total_draw_stick > 1){
                this.context.lineWidth = 5;
                var ori_lstpoint = [0, 0, 0, 0];
                ori_lstpoint[0] = tree_lstpoint[0];
                ori_lstpoint[1] = tree_lstpoint[1];
                ori_lstpoint[2] = tree_lstpoint[2];
                ori_lstpoint[3] = tree_lstpoint[3];
                tree_lstpoint[0] = tree_lstpoint[0]-this.sub_stick_length+nature/(len/2);
                tree_lstpoint[1] = tree_lstpoint[1]-w/2-this.sub_slop-nature/(len/2);
                tree_lstpoint[2] = tree_lstpoint[2]-this.sub_stick_length+nature/(len/2);
                tree_lstpoint[3] = tree_lstpoint[3]+w/2-this.sub_slop-nature/(len/2);

                this.context.lineCap = 'round';
                this.context.fillStyle = mapping_color.trunk;
                this.context.strokeStyle = mapping_color.trunk;
                this.context.beginPath();
                this.context.moveTo(ori_lstpoint[0],ori_lstpoint[1]);
                this.context.lineTo(tree_lstpoint[0], tree_lstpoint[1]);
                tree_points[self.current_ego][layer]["left"]["sticks"].push(ori_lstpoint[0],ori_lstpoint[1]);
                tree_points[self.current_ego][layer]["left"]["sticks"].push(tree_lstpoint[0], tree_lstpoint[1]);

                if(total_draw_stick > 2){
                    this.context.lineTo(tree_lstpoint[2], tree_lstpoint[3]);
                    this.context.lineTo(ori_lstpoint[2], ori_lstpoint[3]);
                    this.context.closePath();
                    this.context.stroke();//draw line
                    this.context.fill();//fill color
                    tree_points[self.current_ego][layer]["left"]["sticks"].push(tree_lstpoint[2], tree_lstpoint[3]);
                    tree_points[self.current_ego][layer]["left"]["sticks"].push(ori_lstpoint[2], ori_lstpoint[3]);
                }                    
                else{
                    tree_points[self.current_ego][layer]["left"]["sticks"].push(ori_lstpoint[2], ori_lstpoint[3], "none", "none");
                    this.context.lineTo(ori_lstpoint[2], ori_lstpoint[3]);
                    this.context.closePath();
                    this.context.stroke();//draw line
                    this.context.fill();//fill color

                    tree_lstpoint[2] = tree_lstpoint[0];
                    tree_lstpoint[3] = tree_lstpoint[1];                    
                }
                // update branch vector
                end_p = [(tree_lstpoint[2]+tree_lstpoint[0])/2, (tree_lstpoint[3]+tree_lstpoint[1])/2];
                start_p = [(ori_lstpoint[2]+ori_lstpoint[0])/2, (ori_lstpoint[3]+ori_lstpoint[1])/2];             
                
                total_draw_stick-=1;               
            }            
              
        }
        tree_points[self.current_ego][layer]["left"]["sticks"].push("end");
        return (stick_pos[long_stick].length + stick_pos[short_stick].length);

    },

    draw_leaf: function(alter, p, v){
        var self = this;
        var next = 0;
        
        var leaf_scale = self.model.get("leaf_scale");
        var fruit_scale = self.model.get("fruit_scale");
        
        var len_scale = self.model.get("sub_leaf_len_scale");
        var leaf_table = [];
        for(var i=0; i<mapping_size.leaf_size_table.length; i++){
            leaf_table.push(mapping_size.leaf_size_table[i]*leaf_scale);
        }
        var sum_leaf = alter["leaf"];

        var fruit_size = mapping_size.fruit_size_table[alter["fruit"]]*fruit_scale;

        var cluster = 10;
        var len = sum_leaf.length; 
        var g = 0;
        var sub = 0;

        var point_y = p[1];
        var point_x = p[0];
        
        // var ori_m = m;
        var v_dist = Math.sqrt( Math.pow(v[0],2) + Math.pow(v[1],2) )
        var ori_v = [v[0]/v_dist, v[1]/v_dist];
        var dir_v = ori_v;
        var angle = Math.PI/2;

        if(cluster <= 1){
            cluster = 1000;
        }

        this.context.fillStyle = mapping_color.trunk;
        this.context.strokeStyle = mapping_color.trunk;
        this.context.lineCap = 'round';
        this.context.lineWidth = 8;
        var random_angle_option = [(Math.PI/4), -(Math.PI/4)];
        var random_angle = random_angle_option[Math.floor(Math.random()*2)];
        // var random_angle = random_angle_option[0]
        // var random_angle = random_angle_option[Math.floor(point_y%2)];
        while(g<len){
            next = 0;
            // angle = Math.PI/2;
            if(len <= cluster){
                sub = 2;
                var tip = 0;
                
                if(self.on_moving == 0){
                    if(len <= 3)
                        tip = fruit_size/2+2;
                    for(var t = 0; t < len; t++){
                        tip += (leaf_table[sum_leaf[t].size]/2);
                    }
                    if(fruit_size != 0)
                        this.tree_fruit(this.context, p[0]+(dir_v[0]*tip), p[1]+(dir_v[1]*tip), fruit_size);
                    else
                        tree_points[self.current_ego][self.current_layer]["fruit"].push("none", "none", "none");
                }
                
            }

            if(((sub-1)%3)!=0 && sub>0){
                m = dir_v[1]/dir_v[0];
                if(len > cluster && (len-g)<=cluster && self.on_moving == 0){
                    var tip = 0;
                    for(var t = g; t < len; t++){
                        tip += leaf_table[sum_leaf[t].size]/2;
                    }
                    if(fruit_size != 0)
                        this.tree_fruit(this.context, p[0]+(dir_v[0]*(15+tip)), p[1]+(dir_v[1]*(15+tip)), fruit_size);
                    else
                        tree_points[self.current_ego][self.current_layer]["fruit"].push("none", "none", "none");
        
                }

                for(var h = 0; h < cluster; h++){ 
                    var radius = leaf_table[sum_leaf[g].size];                    
                    var color = mapping_color.render_leaf_color[sum_leaf[g].color];
                    var leaf_detail = sum_leaf[g].size + "#" + sum_leaf[g].color;
                    var leaf_id = sum_leaf[g].leaf_id;
                    self.leaf_order = sum_leaf[g]["order"];
                    
                    if(leaf_id != "none" && self.leaf_hovor == leaf_id){
                        radius = leaf_table[sum_leaf[g].size]*2;
                        // color = mapping_color.render_leaf_color[sum_leaf[g].color];
                        if(next > 0){
                            point_y += dir_v[1]*radius*0.75;
                            point_x += dir_v[0]*radius*0.75;
                        }                        
                    }
                    else{                        
                        point_y += dir_v[1]*next*1;
                        point_x += dir_v[0]*next*1;
                    }
                    
                   
                    if(!isFinite(m)){ // m == Infinity
                        if(dir_v[1]>0)
                            angle = Math.PI/2;
                        else
                            angle = -Math.PI/2;
                    }                         
                    else if(m > 0){
                        if(dir_v[0]>0 && dir_v[1]>0)
                            angle = Math.atan(m);
                        else
                            angle = Math.PI+Math.atan(m);
                    }
                    else if(m < 0){
                        if(dir_v[0]>0 && dir_v[1]<0)
                            angle = Math.atan(m);
                        else
                            angle = Math.PI+Math.atan(m);
                    }
                    else{ //m == 0
                        if(dir_v[0]>0)
                            angle = 0;
                        else
                            angle = Math.PI;
                    }
                    
                    if(g%2==0){
                        // angle = angle + (Math.PI/4);
                        angle = angle + random_angle;
                        this.leaf_style_1(this.context, point_x, point_y, radius, color, angle, leaf_id, leaf_detail);

                    }
                    else{
                        // angle = angle - (Math.PI/4);
                        angle = angle - random_angle;
                        this.leaf_style_1(this.context, point_x, point_y, radius, color, angle, leaf_id, leaf_detail);
                        
                    }

                    if(self.tree_size[self.ego_label][4] == "none"){
                        if(point_x > self.tree_size[self.ego_label][1])
                            self.tree_size[self.ego_label][1] = point_x;
                        if(point_x < self.tree_size[self.ego_label][0])
                            self.tree_size[self.ego_label][0] = point_x;
                        if(point_y < self.tree_size[self.ego_label][2])
                            self.tree_size[self.ego_label][2] = point_y;
                    }


                    if(h>0){
                        if(h==1){
                            var max = Math.max(leaf_table[sum_leaf[g].size], leaf_table[sum_leaf[g-1].size]);
                            if(sum_leaf[g].leaf_id != "none" && self.leaf_hovor == sum_leaf[g].leaf_id){
                                max = leaf_table[sum_leaf[g].size]*4;
                            }
                            else if(sum_leaf[g].leaf_id != "none" && self.leaf_hovor == sum_leaf[g-1].leaf_id){
                                max = leaf_table[sum_leaf[g-1].size]*4;
                            }
                                                        
                            next = max/2;
                        }
                        else{
                            next = leaf_table[sum_leaf[g].size]/2;
                            if(sum_leaf[g].leaf_id != "none" && self.leaf_hovor == sum_leaf[g].leaf_id){
                                next = leaf_table[sum_leaf[g].size]*2;
                            }
                        }
                    }
                    g++;
                    if(g == len)
                        break;
                }

            }

            if(g<len){
                // control middle stick by ori_m
                this.context.beginPath();
                if(sub%3==0){
                    point_y = p[1]+ori_v[1]*20*len_scale;
                    point_x = p[0]+ori_v[0]*20*len_scale;
                }
                else if(sub%3==1){
                    dir_v = this.find_dir(ori_v, Math.PI/4);
                    point_y = p[1]+dir_v[1]*13*len_scale;
                    point_x = p[0]+dir_v[0]*13*len_scale;
                }
                if(sub%3 == 2){ 
                    point_y = p[1]+ori_v[1]*13*len_scale;
                    point_x = p[0]+ori_v[0]*13*len_scale;
                    
                    this.context.beginPath();
                    this.context.lineWidth = 8;
                    this.context.lineCap = 'round';

                    tree_points[self.current_ego][self.current_layer][self.current_side]["sticks"].push(p[0], p[1], point_x, point_y, "none", "none", "none", "none");
                    this.context.moveTo(p[0], p[1]);
                    this.context.lineTo(point_x, point_y);
                    
                    this.context.stroke();//draw line
                    p[0] = point_x;
                    p[1] = point_y;

                    dir_v = this.find_dir(ori_v, -Math.PI/4);
                    point_y = p[1]+dir_v[1]*13*len_scale;
                    point_x = p[0]+dir_v[0]*13*len_scale;
                }
                                           
                if(sub%3 > 0 || (sub%3 == 0 && sub>0 && len-g>0)){
                    this.context.fillStyle = mapping_color.trunk;
                    this.context.strokeStyle = mapping_color.trunk;
                    tree_points[self.current_ego][self.current_layer][self.current_side]["sticks"].push(p[0], p[1], point_x, point_y, "none", "none", "none", "none");
                    
                    this.context.beginPath();
                    this.context.lineWidth = 8;
                    this.context.lineCap = 'round';
                    this.context.moveTo(p[0], p[1]);
                    this.context.lineTo(point_x, point_y);
                    // this.context.closePath();
                    this.context.stroke();//draw line
                    // this.context.fill();//fill color
                }
                
                if(sub%3==0 && sub>0){
                    p[0] = point_x;
                    p[1] = point_y;
                }
                sub ++;
            }
            if(self.on_moving == 1){
                return 0;
            }
        }
        return len;
    },

    count_total_leaf: function(alter){
        var total_up = 0;
        var total_down = 0;
        for(var c = 0; c < alter["up"].length; c++){
            if(!jQuery.isEmptyObject(alter["up"][c]))
                total_up += alter["up"][c]["leaf"].length;
        }
        for(var c = 0; c < alter["down"].length; c++){
            if(!jQuery.isEmptyObject(alter["down"][c]))
                total_down += alter["down"][c]["leaf"].length;
        }
        return {"up": total_up, "down": total_down};

    },

    find_line: function(x, y, m){
        var c = y - m*x;
        return c;
    },

    find_y_point: function(m, c, x){
        var y = m*x + c;
        return y;

    },

    find_x_point: function(m, c, y){
        var x = (y-c)/m;
        return x;

    },
    // find rotate vector
    find_dir: function(v, angle){
        var rotate_matrix = [ Math.cos(angle), Math.sin(angle),
                             -Math.sin(angle), Math.cos(angle) ];

        var vx = rotate_matrix[0]*v[0] + rotate_matrix[1]*v[1];
        var vy = rotate_matrix[2]*v[0] + rotate_matrix[3]*v[1];

        return [vx, vy];
    },

    leaf_style_1: function(ctx, cx, cy, radius, color, angle, l_id, leaf_detail) {
        var self = this;        
        ctx.save();
        // tree_points[self.current_ego][self.current_layer]["leaf"].push(cx, cy, angle, radius, color);
        if(self.leaf_order in tree_points[self.current_ego][self.current_layer]["leaf"]){
            tree_points[self.current_ego][self.current_layer]["leaf"][self.leaf_order].push(cx, cy, angle, radius, color);
        }
        else{
            tree_points[self.current_ego][self.current_layer]["leaf"][self.leaf_order] = [];
            tree_points[self.current_ego][self.current_layer]["leaf"][self.leaf_order].push(cx, cy, angle, radius, color);
        }
        
        this.context.lineWidth = 1*self.model.get("leaf_scale");
        if(l_id != "none" && self.leaf_hovor == l_id){
            this.context.lineWidth = 25;
        }
        this.context.strokeStyle = mapping_color.leaf_stork;//line's color
        this.context.fillStyle = color;
        
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
                
        ctx.quadraticCurveTo(radius, radius, radius*2.5, 0);
        ctx.quadraticCurveTo(radius, -radius, 0, 0);
        this.context.closePath();
        ctx.stroke();
        this.context.fill();
        ctx.restore();
        this.context.lineWidth = 8;
        this.context.lineCap = 'round';
    },

    tree_fruit: function(context, posx, posy, r){
        var self = this;
        tree_points[self.current_ego][self.current_layer]["fruit"].push(posx, posy, r);
        
        context.fillStyle = mapping_color.fruit;//fill color
        // context.strokeStyle = mapping_color.fruit;;//line's color
        context.strokeStyle = '#ED3C3C';
        context.lineWidth = 1*self.model.get("fruit_scale");
        context.beginPath();
        var cx = posx;
        var cy = posy;
        var radius = r;
        this.circle(context, cx, cy, radius);
        context.closePath();
        context.fill();
        context.stroke();
    },

    circle: function(ctx, cx, cy, radius){
        var self = this;
        ctx.arc(cx, cy, radius, 0, 2*Math.PI, true);
    },

	// generate the image url
	draw4save:function(){
		var self = this;
        console.log("in draw4save");
		this.save_img = 1;
		this.context =  this.saveCanvas.getContext('2d');
		this.sub_stick_length = 55;
        this.sub_slop = 0;
        var structure = self.model.get("tree_structure");
        // console.log(self.tree_size);

        var total_tree = 0;        
        for(var e in tree_egos){
        	for(var t = 0; t < tree_egos[e].length; t++){ // all the ego
                self.current_ego = e;
        		// this.saveCanvas = drawing_canvas[e];
        		// this.context =   this.saveCanvas.getContext('2d');

        		var sub = tree_egos[e][t];
        		self.ego_label = e + "_" + sub;
        		var tree_width = self.tree_size[this.ego_label][1] - self.tree_size[this.ego_label][0] + 500;
        		var tree_height = self.tree_size[this.ego_label][3] - self.tree_size[this.ego_label][2] + 500;
                
                tree_boundary[e] = [tree_width, tree_height];
		        
                this.context.lineWidth = 5; // set the style

		        this.context.setTransform(1, 0, 0, 1, 0, 0);
		        this.context.clearRect(0, 0, this.saveCanvas.width, this.saveCanvas.height);
		        this.context.save();

		        this.saveCanvas.height = tree_height*this.save_scale;
        		this.saveCanvas.width = tree_width*this.save_scale;

		        this.context.lineWidth = 5; // set the style

		        this.context.setTransform(1, 0, 0, 1, 0, 0);
		        this.context.clearRect(0, 0, this.saveCanvas.width, this.saveCanvas.height);
		        this.context.save();

		        this.context.translate(0.5, 0.5);
		        this.context.scale(this.save_scale, this.save_scale);
        		
                var ego = structure[sub][e];
                var left_side = 0;
                var right_side = 0;
                self.total_layer = ego["left"].length;
                self.stick_length = self.tree_tall/self.total_layer; //_dist
                this.start_y = this.saveCanvas.height/this.save_scale - (self.tree_size[this.ego_label][3] - self.tree_size[this.ego_label][5]) - 150; // align bottom
                this.start_x = self.tree_size[this.ego_label][4] - self.tree_size[this.ego_label][0] + 200;

                // tree_points[e]["star_y"] = this.start_y;
                // tree_points[e]["start_x"] = this.start_x;

                var layer_total_alter = trunk_size[e];
                for(var s = 0; s < self.total_layer; s++){
                    left_side += layer_total_alter["left"][s];
                    right_side += layer_total_alter["right"][s];
                }
                var ori_dr = right_side*0.65;
                var ori_dl = left_side*0.65;
                var count_dr = right_side;
                var count_dl = left_side;
                var t_scale = (right_side + left_side)/150;
                if(right_side + left_side < 100){
                    t_scale = 0.5;
                }
                else{
                    if(t_scale < 1){
                        t_scale = 1;
                    }
                }

            	// draw tree
            	var start_h = 0;
                var add_h = 1;
                var max_h = self.total_layer;
                var mod_layer = Math.floor(8/self.total_layer);
                var layer_slop = Math.round(100/self.total_layer)/10;

                this.context.lineWidth = 5; // set the style
                tree_points[e] = {};
                var real_height = 0;
                for(var height = 0; height < self.total_layer; height++){
                    mapping_color.trunk = "rgb(" + (125-(height+1)*3).toString() + "," + (96-(height+1)*3).toString() + "," + (65-(height+1)*3).toString() + ")";
                                        
                    this.context.fillStyle = mapping_color.trunk;
                    this.context.strokeStyle = mapping_color.trunk;
                    this.context.beginPath();

                   
                    this.dr = (ori_dr/t_scale)*1.5;//1.5;
                    this.dl = (ori_dl/t_scale)*1.5;
                    
                    
                    this.temp_height = 30*height; //_d
                    if(real_height == 0){
                        this.temp_height = 60;
                    }

                    this.extra_y = height*8*layer_slop; //control point weight for its torson
                    this.extra_x = height*8*layer_slop; //control point (constant)
                    this.sub_slop = height*10*layer_slop;

                    var used_dr = 0;
                    var used_dl = 0;
                    
                    tree_points[e][height] = {};
                    tree_points[e][height]["leaf"] = [];
                    tree_points[e][height]["fruit"] = [];
                    // draw right tree
                    if((real_height == self.total_layer-1 && layer_total_alter["right"][real_height] == 0) || (count_dr <= 0 && (count_dl-layer_total_alter["left"][real_height]) <= 0)){
                        used_dr = this.draw_right_branch(height, layer_total_alter["right"][real_height], ego["right"][real_height]["level"]);
                    }

                    else
                        used_dr = this.draw_right_branch(height, layer_total_alter["right"][real_height], ego["right"][real_height]["level"]);
                        
                    // draw left tree
                    this.context.fillStyle = mapping_color.trunk;
                    this.context.strokeStyle = mapping_color.trunk;
                    this.context.beginPath();
                    if((real_height == self.total_layer-1 && layer_total_alter["left"][real_height] == 0) || ((count_dr-layer_total_alter["right"][real_height]) <= 0)){
                        used_dl = this.draw_left_branch(height, layer_total_alter["left"][real_height], ego["left"][real_height]["level"]);
                    }

                    else
                        used_dl = this.draw_left_branch(height, layer_total_alter["left"][real_height], ego["left"][real_height]["level"]);

                    ori_dr -= used_dr*0.45;                    
                    ori_dl -= used_dl*0.45;
                    count_dr -= used_dr;                    
                    count_dl -= used_dl;
                    
                    if(count_dr + count_dl == 0){
                        break;
                    }
                    this.start_y = this.start_y - this.stick_length - this.temp_height;
                    // this.start_x = this.start_x + 100;
                    real_height += 1;
                }
                
                // var pic_url = drawing_canvas.save_canvas.toDataURL().replace('image/png','image/octet-stream');
		        var pic_url =  drawing_canvas.save_canvas.toDataURL();
		        tree_img_url[e] = pic_url;
		        
                total_tree++;   
                this.context.restore();    
        	}
        }

        for(var e in tree_egos){
        	var img_src = tree_img_url[e];
        	var img_id = "#" + e;
            util.set_tree_img(img_id, img_src);
        	// $(img_id).attr('src', img_src);
        }

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

        for(var e in tree_egos){
            var img_id = "#" + e;
            util.set_anim_canvas(img_id);
            tree_amin_frame[e] = [];
            anim.generate_frames(e);
        }
        // anim.anim_render(view_ego);
        anim.static_img(view_ego);
        
        $("#tree_result").show();
        $("#no_preview").hide();
        $("#loading").hide();
        
	}

});