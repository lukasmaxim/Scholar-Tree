var Tree_Model = Backbone.Model.extend({
    defaults: {
        tree_structure: {},
        time_period: [],
        leaf_scale: 2.5,
        fruit_scale: 2,
        sub_leaf_len_scale: 1,
        dtl_branch_curve: 1,
        canvas_translate: [0.5, 0.5],
        canvas_scale: 3,
        current_ego: "tree1",
        new_researcher: 0
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
            if(result[0] == -1){
               alert("Please get the EXACT MARCHES URL!");
               $("#progress").hide();
            }
            else{
                self.set({"time_period": result});
                self.trigger('change:time_period');
            }
            
        });
    },

    set_period: function(){
        var self = this;
        // $("#period_slider").slider( "destroy" );
        var researcher_period = self.get("time_period");
        util.set_slider(researcher_period);
    },

    generate_tree_structure: function(request){
        var self = this;
        console.log("get request", request);
        var request_url = "get_tree_structure/?final_setting=" + encodeURIComponent(request);
        d3.json(request_url, function(result){
            console.log(result);
            self.set({"tree_structure": result[0]}, {silent: true});
            self.trigger('change:tree_structure');
            highlight_list["authors"] = result[1];
            highlight_list["papers"] = result[2];
            util.set_highlight_list();
        });
    }
});