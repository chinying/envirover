const jawbreaker_rows = 5;
const jawbreaker_cols = 7;
const arena_cols = 3;
const arena_rows = 3;

var visited = new Array(jawbreaker_rows);
var similar_elements = 0;
var selected_cells = {};

var air_pollution_level = 50;
var water_pollution_level = 50;
var land_pollution_level = 50;

var level_nerf = 5;

const renewable_energy = {
  "air" : ["air"],
  "water" : ["water"],
  "fire" : ["fire"],
  "solar" : ["solar"]
};

const pollutant = {
  "factory": {
    "name": "factory",
    "pollutes": ["air", "water"]
  },
  "garbage": {
    "name" : "garbage",
    "pollutes": ["land", "water"]
  }
};

var active_pollutants = [];

var arena_grid_positions = [];
var pollutant_grid_positions = [];

function random_key(obj) {
  var keys = Object.keys(obj);
  return obj[keys[Math.floor(keys.length*Math.random())]];
}

const random_element = () => { return random_key(renewable_energy)[0];};
const random_pollutant  = () => { return random_key(pollutant);};

// grid functions
function init_grid() {
  var html = '<table border="solid 1px">';
  for (let i=0; i<jawbreaker_rows; i++) {
    html += '<tr>';
    for (let j=0; j<jawbreaker_cols; j++) {
      id = i + "-" + j;
      html += '<td class="' + random_element() + '_element jawbreaker_box" id="' + id + '">A</td>';
    }
    html += '</tr>';
  }
  html += '</table>';
  $("#jawbreaker_container").html(html);
}

function reset_visited_state() {
  similar_elements = 0;
  for (let i=0; i<jawbreaker_rows; i++) {
    for (let j=0; j<jawbreaker_cols; j++) visited[i][j] = false;
  }
  selected_cells = {};
}

function floodfill(i, j, type) {
  if (outside_boundaries(i,j)) {
    return 0;
  }
  if (visited[i][j]) return 0;
  else {
    visited[i][j] = true;
    var this_el = $("#" + i + "-" + j);
    var this_type = (fetch_type($(this_el).attr("class")));
    if (this_type != type) return 0;
    else {
      similar_elements++;
      selected_cells[i + "-" + j] = true;
    }
    left = floodfill(i, j-1, type);
    right = floodfill(i, j+1, type);
    up = floodfill(i-1, j, type);
    down = floodfill(i+1, j, type);
    return;
  }
}

// cell functions

function cell_xy(id) {
  var xy = id.split("-");
  var coords = xy.map(function(a) {
    return parseInt(a, 10);
  });
  return coords;
}

function fetch_type(arr) {
  classes = arr.split(" ");
  for (let i=0; i<classes.length; i++) {
    if (classes[i].indexOf("_element") !== -1) return classes[i];
  }
  return false;
}

var outside_boundaries = (i, j) => {
  return (i >= jawbreaker_rows || i < 0) || (j >= jawbreaker_cols || j < 0);
};

function update_cells() {
  Object.keys(selected_cells).forEach(function(key) {
    if (selected_cells[key]) {
      var xy = cell_xy(key);
      var _this = $("#" + xy[0] + "-" + xy[1]);
      if (xy[0] === 0) {
        _this.attr("class", (random_element() + "_element jawbreaker_box"));
      } else {
        gravity(xy[0], xy[1]);
      }
    }
  });
}

function gravity(i, j) {
  var _this = $("#" + i + "-" + j);
  var color_match = _this.attr("class");
  var stack = [];
  while (i > 0 && _this.attr("class") == color_match) {
    stack.push(_this.attr("id"));
    selected_cells[i + "-" + j] = false; // ensures it wouldn't be called later in foreach of selected_cells
    _this = $("#" + (i-1) + "-" + j);
    i--;
  }
  if (_this.attr("class") == color_match) {
    stack.push(_this.attr("id"));
    selected_cells[i + "-" + j] = false;
  }
  var translate_height = stack.length;
  var start_i = cell_xy(stack[0]);
  for (let i = start_i[0]; i>=0; i--) {
    _this = $("#" + i + "-" + j);
    if (i-translate_height < 0) {
      _this.attr("class", (random_element() + "_element jawbreaker_box"));
    } else {
      _this.attr("class", $("#" + (i-translate_height) + "-" + j).attr("class"));
    }
  }
}

function update_score(type, change) {
  id = type.split("_")[0] + "_score";
  score = parseInt($("#" + id).html(), 10);
  if (change < 3) score--;
  else score += change;
  $("#" + id).html(score);
}

var check_winstate = () => { return (air_pollution_level < 10 && water_pollution_level < 10 && land_pollution_level < 10);};

function update_pollution() {
  // foreach pollutant change the rate
  const air_change = active_pollutants.filter(p => p.pollutes.includes("air")).length / level_nerf - 1.0;
  const water_change = active_pollutants.filter(p => p.pollutes.includes("water")).length / level_nerf - 1.0;
  const land_change = active_pollutants.filter(p => p.pollutes.includes("land")).length / level_nerf - 1.0;

  air_pollution_level += air_change;
  water_pollution_level += water_change;
  land_pollution_level += land_change;

  $("#air-percentage").html(air_pollution_level);
  $("#water-percentage").html(water_pollution_level);
  $("#land-percentage").html(land_pollution_level);
}

function add_pollutant() {
  if (active_pollutants.length < 9) {
    const r = random_pollutant();
    console.log(r);
    active_pollutants.push(r);
  }
  const pollutant_contents = _(active_pollutants).each().map(x => x.name);
  //console.log(pollutant_contents);
  $("#pollutants").html(pollutant_contents.join(", "));
}

$(document).ready(function() {
  for (let i = 0; i<jawbreaker_rows; i++) {
    visited[i] = new Array(jawbreaker_cols);
  }
  reset_visited_state();

  init_grid();

  $(".jawbreaker_box").click(function() {
    var xy = (cell_xy($(this).attr("id")));
    var type = fetch_type($(this).attr("class"));
    floodfill(xy[0], xy[1], type);
    update_score(type, similar_elements);
    update_cells();
    reset_visited_state();
  });
  var pollution_interval = setInterval(update_pollution, 1000);
  var ap_interval = setInterval(add_pollutant, 5000);
});

