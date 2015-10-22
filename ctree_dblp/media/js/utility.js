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

    set_tree_img: function(img_id, img_src){
        var cnt_id = img_id + "_cnt"
        $(img_id).attr('src', img_src);
        $(img_id).css({'height': '100%'});
        var tree_width = $(img_id).width();
        var cnt_width = $(cnt_id).width();
        if (tree_width > cnt_width){
            $(img_id).css({'width': '100%'});
            $(img_id).removeAttr("height");
            // $(img_id).css({'margin': '0'});
        }
        /*
        $(img_id).hover(function(){
            
        });
        $(img_id).mouseout(function(){
            $(delete_id).hide();
        });
        */
    }

};

jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2)) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2)) + "px");
    return this;
};
