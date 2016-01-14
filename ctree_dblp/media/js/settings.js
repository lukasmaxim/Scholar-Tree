var drawing_canvas = {
    save_canvas: document.getElementById("save_tree"),
    anim_canvas: document.getElementById("anim_tree"),
    middle: 0
};

var mapping_color = {
    // leaf_color: ["#927007", "#CF9D00", "#C2B208", "#699B1A", "#2E7523", "#214E33", "#1F4230", "#184E35", "#19432F"],
    // leaf_color: ["#806000", "#7C8E03", "#757806", "#637409", "#52700C", "#446D0E", "#376911", "#2B6513", "#216115", "#185E17", "#185A20", "#195629", "#1B5230", "#1C4F36"],
    // leaf_color: ["#927007", "#CF9D00", "#C2B208", "#94AE0F", "#5F9915", "#4A8E18", "#39831A", "#2A781B", "#1E6E1C", "#1C6324", "#1B582B", "#1A4D2E", "#19432F", "#1F3D2F"],
    // leaf_color: ["#924307", "#C2B208", "#94AE0F", "#5F9915", "#4A8E18", "#39831A", "#2A781B", "#1E6E1C", "#1C6324", "#1B582B", "#1A4D2E", "#19432F", "#1C352A", "#1F3848"],
    render_leaf_color: ["#6C1904","#924307", "#D23B14", "#D37A10", "#C2B208", 
                 "#90F415", "#8C8616", "#94AE0F", "#5F9915", "#1F861D", 
                 "#1C6324", "#315322", "#123F24", "#1F3848", "#E9D2B4", 
                 "#D4E8B2", "#B1E8BB", "#E6ADcD", "#5CD992", "#D44797"],
    // trunk: "#7D6041",
    trunk:"rgb(125, 96, 65)",
    fruit: "#C91313",
    root: "#362C21",
    leaf_stork: "#83A06E",
    // render_leaf_color: ["#924307", "#C2B208", "#94AE0F", "#5F9915"],
    render_leaf_color: ["#6C1904", "#D37A10", "#C2B208", "#8C8616", "#94AE0F", "#5F9915", "#1F861D", "#1C6324", "#123F24", "1F3848"],
    render_roots_color: ["#964343", "#90093F", "#967636", "#6B435E"],
    /*
    roots_color: ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c",
                  "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5",
                  "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f",
                  "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5" ] //Javid
                  */   
    /* 
    roots_color: ["#964343", "#FF3385", "#E6B85C", "#762D5E", "#E68A5C",
                  "#994BB4", "#E89619", "#7575FF", "#B8E6E6", "#5C5CFF",
                  "#FFCC99", "#19D1A3", "#FF99FF", "#16E6E6", "#FF8533",
                  "#E6B8E6", "#B84D70", "#75A319" ] //Random
    */
    roots_color: ["#964343", "#90093F", "#967636", "#6B435E", "#C87F5B",
                  "#77627F", "#6B4F24", "#324771", "#386161", "#283653",
                  "#948271", "#608A80", "#9F7589", "#598261", "#924607",
                  "#AC9AAA", "#92545E", "#4C5143" ] //Random
                
    // roots_color: ["#0F457F", "#D16850", "#CB5067","#C44F91", "#BE4EB7", "#964DB7", "#6B4CB0", "#91116F", "#4B51AA", "#7900D2", "#4A71A3", "#488D9C", "#469687", "#458F65", "#828A36", "#0F5C7D", "#0F727B", "#405655"] //v0
};

var mapping_size = {
    // leaf_size_table: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40],
    // fruit_size_table: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40]
    leaf_size_table: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40],
    fruit_size_table: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40]

};

var tree_img_url = {
	"tree1": "",
	"tree2": "",
  "tree3": "",
  "tree4": ""
};

var tree_egos = {"tree1": ["all"], "tree2": ["all"], "tree3": ["all"], "tree4": ["all"]};
var trunk_size = {"tree1": {}, "tree2": {}, "tree3": {}, "tree4": {}};

var DBLP_researcher = "";
var sy = 0;
var ey = 2015;

var tree_boundary = { // [w, h]
  "tree1": [], 
  "tree2": [],
  "tree3": [],
  "tree4": []
}; 

var tree_center = { // [sx, sy]
  "tree1": [], 
  "tree2": [],
  "tree3": [],
  "tree4": []
};

var tree_points = {
  "tree1": {},
  "tree2": {},
  "tree3": {},
  "tree4": {}
};

var tree_snap_scale = {
  "tree1": -1,
  "tree2": -1,
  "tree3": -1,
  "tree4": -1
};

var tree_amin_frame = {
  "tree1": [], 
  "tree2": [],
  "tree3": [],
  "tree4": []
};

var tree_click_grid = {
  "tree1": [], 
  "tree2": [],
  "tree3": [],
  "tree4": []
};

var tree_info = {
  "tree1": [], 
  "tree2": [],
  "tree3": [],
  "tree4": []
};

var view_ego = "tree1";

var mytimer = {
  anim_timer: null,
  blinking_timer: null
};

var blinking_timer = null;

var highlight_list = {
    "authors": [],
    "papers": [],
    "selected": "None",
    "on": 0,
}
