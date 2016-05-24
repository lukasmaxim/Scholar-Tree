var Tree_Model = Backbone.Model.extend({
    defaults: {
        tree_structure: {},
        time_period: [],
        leaf_scale: 2.5,
        fruit_scale: 2,
        sub_leaf_len_scale: 1.25,
        scale_para: {"tree1":{"leaf_scale": 2.5, "fruit_scale": 2, "sub_leaf_len_scale": 1.25, "dtl_branch_curve": 1}, 
                     "tree2":{"leaf_scale": 2.5, "fruit_scale": 2, "sub_leaf_len_scale": 1.25, "dtl_branch_curve": 1}, 
                     "tree3":{"leaf_scale": 2.5, "fruit_scale": 2, "sub_leaf_len_scale": 1.25, "dtl_branch_curve": 1}, 
                     "tree4":{"leaf_scale": 2.5, "fruit_scale": 2, "sub_leaf_len_scale": 1.25, "dtl_branch_curve": 1}},
        dtl_branch_curve: 1,
        canvas_translate: [0.5, 0.5],
        canvas_scale: 3,
        current_ego: "tree1",
        new_researcher: 0,
        render_tree_egos: {"tree1": ["all"], "tree2": ["all"], "tree3": ["all"], "tree4": ["all"]}
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
        $("#search_res").hide();
        $("#progress").show();
        DBLP_url = request;
        var request_url = "check_searching/?researcher=" + encodeURIComponent(request);
        d3.json(request_url, function(result){
            console.log(result);
            if(result[0] == -1){
               // alert("Please get the CORRECT and EXACT MATCHED URL!");
               alert("Invalid URL!");
               $("#progress").hide();
            }
            else{
                self.set({"time_period": result});
                self.trigger('change:time_period');
            }
            
        });
    },

    search_researcher: function(request){
        var self = this;
        console.log("get request", request);
        var result_cnt = $("#candidates");
        result_cnt.empty();
        $("#search_res").hide();
        var request_url = "search_searching/?researcher=" + encodeURIComponent(request);
        d3.json(request_url, function(result){
            console.log(result);
            if(result[0] == -1){
               // alert("Please get the CORRECT and EXACT MATCHED URL!");
               alert("No Matched!");
               $("#progress").hide();
            }
            else{
                // for(var a in result){
                for(var a = 0, len = result.length; a < len; a++){
                    // console.log(result[a]);
                    var row = $('<span style="cursor:pointer;"></span>');
                    row.html("&#9654; " + result[a][0]).attr('name', result[a][1]);//prop("href",result[a]);
                    
                    row.click(function(){
                        self.check_researcher($(this).attr('name'));
                    });
                    row.hover(function(){
                        $(this).attr('style', 'color: #428BCA; cursor:pointer;');
                        // $(this).prop('style', 'color: #428BCA;');
                    });
                    row.mouseout(function(){
                        $(this).attr('style', 'color: black; cursor:pointer;');
                    });
                    result_cnt.append(row);
                    result_cnt.append($('</br>'));
                }
                $("#progress").hide();
                $("#search_res").show();
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
        var default_scale_para = {"tree1":{"leaf_scale": 2.5, "fruit_scale": 2, "sub_leaf_len_scale": 1.25, "dtl_branch_curve": 1},
                          "tree2":{"leaf_scale": 2.5, "fruit_scale": 2, "sub_leaf_len_scale": 1.25, "dtl_branch_curve": 1}, 
                          "tree3":{"leaf_scale": 2.5, "fruit_scale": 2, "sub_leaf_len_scale": 1.25, "dtl_branch_curve": 1}, 
                          "tree4":{"leaf_scale": 2.5, "fruit_scale": 2, "sub_leaf_len_scale": 1.25, "dtl_branch_curve": 1}};
        d3.json(request_url, function(result){
            console.log(result);
            self.set({"tree_structure": result[0]}, {silent: true});
            self.set({"render_tree_egos": tree_egos}, {silent: true});
            self.set({"scale_para": default_scale_para}, {silent: true});
            self.trigger('change:tree_structure');
            highlight_list["authors"] = result[1];
            highlight_list["papers"] = result[2];
            actual_info = result[4];
            util.set_highlight_list();
            util.set_legend(result[3]);
            get_graph_data(result[5])
        });
    },

    updata_tree_structure: function(request){
        var self = this;
        $("#block_page").show();
        $("#updating").show();        
        console.log("get update request", request);
        var request_url = "update_tree_structure/?final_setting=" + encodeURIComponent(request);
        var update_e = {};
        d3.json(request_url, function(result){
            console.log(result);
            update_e[result[1]] = ['all'];
            tree_structure = self.get("tree_structure");
            tree_structure['all'][result[1]] = result[0];
            self.set({"tree_structure": tree_structure}, {silent: true});
            self.set({"render_tree_egos": update_e}, {silent: true});
            self.trigger('change:tree_structure');
            $("#block_page").hide();
            $("#updating").hide();
        });
    }
});