var util = {
    order_list: function(s, e){
		var gen_order = [];
		for(var c = 0; c < e; c++){
			gen_order.push(c);
		}
		return gen_order;
    },

    unique: function(itm, i, a){
		return i==a.indexOf(itm);
	},

    create_option: function(val, text, myclass, select){
        var option = $('<option></option>');
        option.attr("class", myclass).val(val).html(text).prop("selected", select);
        return option;
    },

    set_slider: function(researcher_period){
        $("#researcher_name").html(researcher_period[2]);
        DBLP_researcher = researcher_period[2];
        ga('send', 'event', "researcher", "search", DBLP_researcher);
        
        var slider = $("#period_slider").data("ionRangeSlider");
        // Call sliders update method with any params
        slider.update({
            min: researcher_period[0],
            max: researcher_period[1],
            from: researcher_period[0],
            to: researcher_period[1],
            // type: 'double',
            // step: 1,
            // min_interval: 3
        });
        $("#detail").show();
        $("#progress").hide();
        $("#no_preview").show();
        $("#tree_result").hide();
        $("#draw_tree").removeAttr("disabled");
    },

    set_events: function(){
        // for general events        
        var save = $('#save_icon');
        var tree_anim = $('#tree_anim');
        var tree_pic = $('#tree_pic');
        var tree_pause = $('#tree_pause');
        var tree_backward = $('#tree_backward');
        var tree_forward = $('#tree_forward');

        var selectors = [$("#tree1_select"), $("#tree2_select"), $("#tree3_select"), $("#tree4_select")];
        
        save.click(function(){
            var save_link = "#" + view_ego + "_save";
            $(save_link)[0].click();
        });

        save.hover(function(){
            save.css("cursor", "pointer");
        });

        save.mouseout(function(){
            save.css("cursor", "");
        });

        tree_anim.click(function(){
            $("#tree_backward").removeAttr("disabled");
            $("#tree_forward").removeAttr("disabled");
            // highlight_list["selected"] = "None";
            anim.highlight_choose = 0;
            anim.backword = 0;
            anim.forward = 0;
            anim.anim_render(view_ego, anim.current_idx);
        });

        tree_pic.click(function(){
            // highlight_list["selected"] = "None"; // trigger selector change!!!
            anim.highlight_choose = 0;
            anim.static_img(view_ego);
        });

        tree_pause.click(function(){
            // highlight_list["selected"] = "None";
            anim.highlight_choose = 0;
            clearInterval(anim.timer);
        });

        tree_backward.click(function(){
            $("#tree_forward").removeAttr("disabled");
            anim.backword = 1;
            anim.forward = 0;
            anim.current_idx -= 1;
            anim.anim_render(view_ego, anim.current_idx);
        });

        tree_forward.click(function(){
            $("#tree_backward").removeAttr("disabled");
            if(anim.backword != 1){
                anim.current_idx += 1;
            }
            anim.forward = 1;
            anim.backword = 0;
            anim.anim_render(view_ego, anim.current_idx);
        });

        for(var i = 0; i < 4; i++){
            selectors[i].change(function(){
                //$('.btn-group').attr("disabled", true);
                highlight_list["selected"] = this.value;
                anim.highlight_choose = 1;
                if(this.value != 'None')
                    anim.fadeout = 0.5;
                else
                    anim.fadeout = 1;
                anim.highlight_img(view_ego);
            });
        }
    },

    set_highlight_list: function(){
        var tree1_selection = $('#tree1_select');
        var tree2_selection = $('#tree2_select');
        var tree3_selection = $('#tree3_select');
        var tree4_selection = $('#tree4_select');
        
        for(var a=0; a < highlight_list["authors"].length; a++){
            var author_name = highlight_list["authors"][a];
            var opt1 = $('<option></option>');
            opt1.val(author_name).html(author_name);

            var opt2 = $('<option></option>');
            opt2.val(author_name).html(author_name);
            
            tree1_selection.append(opt1);
            tree2_selection.append(opt2);
        }

        for(var p=0; p < highlight_list["papers"].length; p++){
            var paper_title = highlight_list["papers"][p];
            var opt3 = $('<option></option>');
            opt3.val(paper_title).html(paper_title);
            var opt4 = $('<option></option>');
            opt4.val(paper_title).html(paper_title);
            
            tree3_selection.append(opt3);
            tree4_selection.append(opt4);
        }
    },


    set_tree_img: function(img_id, img_src){
        var save_id = img_id + "_save";
        var cnt_id = img_id + "_cnt";
        

        // $(img_id).attr('href', img_src);
        $(img_id).css({'height': '100%'});
        $(img_id).attr('src', img_src).load(function(){
            var tree_width = $(this).width();
            var cnt_width = $(cnt_id).width();
            if (tree_width > cnt_width){
                $(this).css({'width': '100%'});
                $(this).height('auto');
            }
            util.set_anim_canvas(this.id);
            tree_amin_frame[this.id] = [];
            anim.generate_frames(this.id);
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
            $(hide_text).hide();
            $(show_text).show();
            // $(show_snap).show();
            // $(hide_snap).hide();
            $(show_snap).css({'border-width': '1px'});
            $(hide_snap).css({'border-width': '3px'});
            highlight_list["selected"] = "None";
            view_ego = this.id.slice(0,5);
            anim.highlight_choose = 0;
            anim.static_img(view_ego);
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

    set_anim_canvas: function(ego_id){
        img_id = "#" + ego_id;
        // var anim_id = img_id + "_anim";
        // var cnt_id = img_id + "_cnt";
        // var pic_id = img_id + "_pic";
 
        var anim_cnt_h = $("#anim_container").height();
        var anim_cnt_w = $("#anim_container").height() * ($(img_id).width()/$(img_id).height());

        if (anim_cnt_w > $("#anim_container").width()){
            anim_cnt_w = $("#anim_container").width();
            anim_cnt_h = $("#anim_container").width() * ($(img_id).height()/$(img_id).width());
        }

        var snap_scale = 1;
        var snap_width = tree_boundary[img_id.slice(1, 6)][0];
        var snap_height = tree_boundary[img_id.slice(1, 6)][1];
        // var anim_cnt_w = $(window).width()-100;
        // var anim_cnt_h = $(window).height()-100;
        
        if(snap_width > anim_cnt_w || snap_height > anim_cnt_h){
            while(snap_width*snap_scale > anim_cnt_w || snap_height*snap_scale > anim_cnt_h){
                snap_scale = Math.round((snap_scale-0.001)*1000)/1000;
            }
        }
        else{
            snap_scale = 10;
            while(snap_width*snap_scale > anim_cnt_w || snap_height*snap_scale > anim_cnt_h){
                snap_scale = Math.round((snap_scale-0.001)*1000)/1000;
            }
        }

        tree_snap_scale[img_id.slice(1, 6)] = snap_scale;

        if(ego_id == view_ego){
            anim.static_img(view_ego);
        }
    }

};

jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2)) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2)) + "px");
    return this;
};
