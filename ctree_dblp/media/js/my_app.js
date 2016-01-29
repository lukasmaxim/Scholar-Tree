window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame   ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(/* function */ callback, /* DOMElement */ element){
            return window.setTimeout(callback, 1000 / 60);
        };
})();

window.cancelRequestAnimFrame = ( function() {
    return window.cancelAnimationFrame              ||
        window.webkitCancelRequestAnimationFrame    ||
        window.mozCancelRequestAnimationFrame       ||
        window.oCancelRequestAnimationFrame         ||
        window.msCancelRequestAnimationFrame        ||
        clearTimeout;
} )();

var MyApp = function MyApp(){
    var self = this;

    if ( arguments.callee._singletonInstance )
        return arguments.callee._singletonInstance;
    arguments.callee._singletonInstance = this;
    
    // init models
    this.model = new Tree_Model();
    $(window).scrollTop(0);
    // set slider bar
    $("#period_slider").ionRangeSlider({
        min: 1990, 
        max: 2015,
        from: 1990, 
        to: 2015,
        type: 'double',
        step: 1,
        min_interval: 4,
        onChange: function(obj) {
            $("#draw_tree").removeAttr("disabled");
            // $("#no_preview").show();
            // $("#tree_result").hide();
        }
    });

    // update display container size
    $("#system_page").css({'height': $(window).height()-20-$("#header").height()-$("#footer").height()});
    $("#tree_result").css({'height': $("#system_page").height()});
    $(".thumb_cnt").css({'height': $("#tree_result").height()});
    $(".snap_view").css({'height': $(".snap_view").width()+20});
    $("#anim_container").css({'height': $("#tree_result").height()});
 
    $("#click_info").css({'max-height': $("#system_page").height()-390});
    $("#click_info").css({'overflow-y': 'auto'});
    $("#click_info").css({'overflow-x': 'hidden'});

    $("#system_page").hide();
    $("#main_display").css({'min-height': $(window).height()-20-$("#header").height()-$("#footer").height()});
   
    // $("#anim_container").css({'width': $("#tree_cnt").width()-10});
    window.onresize = function(event) {
        $("#main_display").css({'min-height': $(window).height()-20-$("#header").height()-$("#footer").height()});
        $("#system_page").css({'height': $(window).height()-20-$("#header").height()-$("#footer").height()});
        $("#tree_result").css({'height': $("#system_page").height()});
        $(".thumb_cnt").css({'height': $("#tree_result").height()});
        $(".snap_view").css({'height': $(".snap_view").width()+20});
        $("#anim_container").css({'height': $("#tree_result").height()});
        // $("#anim_container").css({'width': $("#tree_cnt").width()-10});
        for(var e in tree_egos){
            var img_id = "#" + e;
            tree_util.set_anim_canvas(img_id);
        }
        self.model.trigger('change:current_ego');
    }

    // $('.popup-link').magnificPopup({
    //     type: 'image'
    //     // other options
    // });

    var search = $('#check_url');
    var finish = $('#draw_tree');
    var start = $('#start_btn');

    start.click(function(){
        console.log("click start");
        $("#system_page").show();
        $("#search_engine").show();
        $("#start_page").hide();
        $('#anim_panel').hide();
        $('#highlight_panel').hide();        
    });

    search.click(function(){
        console.log("click search");
        var resercher = $("#dblp_url").val();
        self.model.check_researcher(resercher);
        $("#progress").show();
        $("#detail").hide();
        $("#tree_result").hide();
        $('#anim_panel').hide();
        $('#highlight_panel').hide();
    });

    finish.click(function(){
        console.log("click finish");
        finish.attr("disabled", true);
        $("#feedback").removeAttr("disabled");
        $("#loading").show();;
        $("#tree_result").hide();
        $("#tree1_cnt")[0].click();

        var slider = $("#period_slider").data("ionRangeSlider");
        var resercher = $("#dblp_url").val();
        sy = slider.result.from;
        ey = slider.result.to;
        var gap = ey - sy + 1;
        if (gap <= 10)
            gap = 1
        else if (10 < gap && gap <= 20)
            gap = 2
        else if (20 < gap && gap <= 30)
            gap = 3
        else if (30 < gap && gap <= 40)
            gap = 4
        else if (40 < gap && gap <= 50)
            gap = 5
        else
            gap = 6
        $(".b_gap").text(gap);

        ga('send', 'event', DBLP_researcher, "render", "start_year", sy);
        ga('send', 'event', DBLP_researcher, "render", "end_year", ey);
        ga('send', 'event', DBLP_researcher, "create", sy + "-" + ey);

        var request_array = [resercher, sy, ey, timeline];
        var request = JSON.stringify(request_array);

        self.model.generate_tree_structure(request);   

    });

    // open the dialog
    $( "#survey_dialog" ).dialog({
        autoOpen: false,
        height: $(window).height()*0.5,
        width: $(window).width()*0.5,
        modal: true,
        resizable: false
    });

    $( "#feedback" ).click(function() {
        $("#survey_dialog").dialog( "open" );
    });


    // util.set_events();

    this.render = new RenderingView({model: this.model, containerID: "#rendering"});
    this.animation = new AnimView({model: this.model, containerID: "#animating"});
    this.draw_tree = new DrawView({model: this.model, containerID: "#drawing"});
    this.interact_tree = new InteractView({model: this.model, containerID: "#drawing"});

    // d3.xml("http://dblp.uni-trier.de/pers/xx/m/Ma:Kwan=Liu.xml", function(error, data) {
    //     if (error) throw error;
    //     // Convert the XML document to an array of objects.
    //     // Note that querySelectorAll returns a NodeList, not a proper Array,
    //     // so we must use map.call to invoke array methods.
    //     console.log(data);
    // });

};

var myApp;
MyApp.getInstance = function() {
    if (myApp == null)
        myApp = new MyApp();
    return myApp;
};

// entry point of the whole js application
$(document).ready(function() {
    MyApp.getInstance();
});
