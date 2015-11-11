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
    $("#main_display").css({'height': $(window).height()-30-$("#header").height()-$("#footer").height()});
    $("#introduction").css({'height': $("#main_display").height()-275});
    $("#tree_result").css({'height': $("#main_display").height() - 15});
    $("#anim_container").css({'height': $(window).height()});
    $("#anim_container").css({'width': $(window).width()});
    
    window.onresize = function(event) {
        $("#main_display").css({'height': $(window).height()-30-$("#header").height()-$("#footer").height()});
        $("#introduction").css({'height': $("#main_display").height()-275});
        $("#tree_result").css({'height': $("#main_display").height() - 15});
        $("#anim_container").css({'height': $(window).height()});
        $("#anim_container").css({'width': $(window).width()});
        // $("#search_engine").css({'height': $(window).height()-30-$("#header").height()-$("#footer").height()});
        // $("#result").css({'height': $(window).height()-30-$("#header").height()-$("#footer").height()});
    }

    $('.popup-link').magnificPopup({
        type: 'image'
        // other options
    });

    // for general event
    var search = $('#check_url');
    var finish = $('#draw_tree');

    search.click(function(){
        console.log("click search");
        var resercher = $("#dblp_url").val();
        self.model.check_researcher(resercher);
        $("#progress").show();
        $("#detail").hide();
        $("#no_preview").show();
        $("#tree_result").hide();
    });

    finish.click(function(){
        console.log("click finish");
        finish.attr("disabled", true);
        $("#loading").show();
        $("#no_preview").hide();
        $("#tree_result").hide();
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
        
        var request_array = [resercher, sy, ey];
        var request = JSON.stringify(request_array);
        self.model.generate_tree_structure(request);    
    });

    $("#anim_container").click(function(){
        $("#anim_container").hide();
    });

    $("#anim_tree").click(function(){
        return false;
    });

    this.render = new RenderingView({model: this.model, containerID: "#rendering"});
    

    // d3.xml("http://dblp.uni-trier.de/pers/xx/m/Ma:Kwan=Liu.xml", function(error, data) {
    //     if (error) throw error;
    //     // Convert the XML document to an array of objects.
    //     // Note that querySelectorAll returns a NodeList, not a proper Array,
    //     // so we must use map.call to invoke array methods.
    //     console.log(data);
    // });

    // "media/data/Ma_Kwan=Liu.xml"

    // bind with view
    // this.uploading = new UploadView({model: this.model, containerID: "#uploading"});
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
