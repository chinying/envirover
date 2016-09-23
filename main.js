const rows = 5;
const cols = 7;

var visited = new Array(rows);
var similar_elements = 0;
var selected_cells = {};

function random_element() {

  var renewable_energy = {
    "air" : ["air"],
    "water" : ["water"],
    "fire" : ["fire"],
    "solar" : ["solar"]
  };
  var keys = Object.keys(renewable_energy);
  return renewable_energy[keys[Math.floor(keys.length*Math.random())]][0];
}

function remove_from_array(el, array) {
  var index = array.indexOf(el);
  if (index > -1) array.splice(index, 1);
}

// grid functions
function init_grid() {
  var html = '<table border="solid 1px">';
  for (let i=0; i<rows; i++) {
    html += '<tr>';
    for (let j=0; j<cols; j++) {
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
  for (let i=0; i<rows; i++) {
    for (let j=0; j<cols; j++) visited[i][j] = false;
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

function outside_boundaries(i, j) {
  return (i >= rows || i < 0) || (j >= cols || j < 0);
}

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

$(document).ready(function() {
  for (let i = 0; i<rows; i++) {
    visited[i] = new Array(cols);
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
});

