var Tree_Model = Backbone.Model.extend({
    defaults: {
        tree_structure: {},
        time_period: [],
        leaf_scale: 3,
        fruit_scale: 2,
        sub_leaf_len_scale: 1,
        dtl_branch_curve: 1,
    },
    initialize: function(args) {
        var self = this;
        console.log("in model initialize");
        _.bindAll(this, 'set_period');
        this.bind('change:time_period', this.set_period);
    },
    // for general event trigger
    check_researcher: function(request){
        var self = this;
        console.log("get request", request);
        var request_url = "check_searching/?researcher=" + encodeURIComponent(request);
        d3.json(request_url, function(result){
            console.log(result);
            self.set({"time_period": result});
            self.trigger('change:time_period');
        });
    },

    set_period: function(){
        var self = this;
        // $("#period_slider").slider( "destroy" );
        var researcher_period = self.get("time_period");
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

    generate_tree_structure: function(request){
        var self = this;
        console.log("get request", request);
        var request_url = "get_tree_structure/?final_setting=" + encodeURIComponent(request);
        d3.json(request_url, function(result){
            console.log(result);
            self.set({"tree_structure": result});
            self.trigger('change:tree_structure');
        });
    }
});