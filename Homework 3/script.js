/**
 * Makes the first bar chart appear as a staircase.
 *
 * Note: use only the DOM API, not D3!
 */
function staircase() {
  let aBarChart = document.getElementById("aBarChart");

  let barSelect = aBarChart.querySelectorAll("rect");

  let barSorted = Array.from(barSelect).map(node => node.getAttribute("width")) // map old widths into array

  barSorted = barSorted.sort((a, b) => +a - +b); // compute sorted widths

  for (let i = 0; i < barSorted.length; i++) {
    const sortedElement = barSorted[i];
    let rectElement = barSelect[i];
    
    rectElement.setAttribute("width", sortedElement);
  }
}

/**
 * Render the visualizations
 * @param data
 */
function update(data) {
  /**
   * D3 loads all CSV data as strings. While Javascript is pretty smart
   * about interpreting strings as numbers when you do things like
   * multiplication, it will still treat them as strings where it makes
   * sense (e.g. adding strings will concatenate them, not add the values
   * together, or comparing strings will do string comparison, not numeric
   * comparison).
   *
   * We need to explicitly convert values to numbers so that comparisons work
   * when we call d3.max()
   **/

  for (let d of data) {
    d.a = +d.a; //unary operator converts string to number
    d.b = +d.b; //unary operator converts string to number
  }

  console.log(data);
  // Set up the scales
  // TODO: The scales below are examples, modify the ranges and domains to suit your implementation.
  let aScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.a)])
    .range([0, 300]);
  let bScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.b)])
    .range([0, 300]);
  let iScale = d3
    .scaleLinear()
    .domain([0, 11])
    .range([0, 220]);

  // ****** TODO: PART III (you will also edit in PART V) ******

  // TODO: Select and update the 'a' bar chart bars
  let aBarChart = d3.select("#aBarChart");

  let aBarRects = aBarChart.selectAll("rect").data(data);

  let aBarRectsNew = aBarRects
    .enter()
    .append("rect")
    .attr("width", 0)
    .attr("height", 18);

  aBarRects
    .exit()
    .transition()
    .duration(1000)
    .attr("transform", (d, i) => `translate(18, ${iScale(i)}) scale(0, 1)`)
    .remove();

  aBarRects = aBarRectsNew.merge(aBarRects);

  aBarRects
    .attr("transform", (d, i) => `translate(18, ${iScale(i)}) scale(-1, 1)`)
    .transition().duration(200)
    .attr("width", (d, i) => aScale(d.a))
    .attr("height", 18);


  // TODO: Select and update the 'b' bar chart bars
  let bBarChart = d3.select("#bBarChart");

  let bBarRects = bBarChart.selectAll("rect").data(data);

  let bBarRectsNew = bBarRects
    .enter()
    .append("rect")
    .attr("width", 0)
    .attr("height", 18)

  bBarRects
    .exit()
    .transition()
    .duration(1000)
    .attr("transform", (d, i) => `translate(0, ${iScale(i)}) scale(0, 1)`)
    .remove();

  bBarRects = bBarRectsNew.merge(bBarRects)

  bBarRects
    .attr("transform", (d, i) => `translate(0, ${iScale(i)})`)
    .transition().duration(200)
    .attr("width", (d, i) => bScale(d.b))
    .attr("height", 18);

  // TODO: Select and update the 'a' line chart path using this line generator

  let aLineGenerator = d3
    .line()
    .x((d, i) => iScale(i))
    .y(d => aScale(d.a));

  // TODO: Select and update the 'b' line chart path (create your own generator)

  // TODO: Select and update the 'a' area chart path using this area generator
  let aAreaGenerator = d3
    .area()
    .x((d, i) => iScale(i))
    .y0(0)
    .y1(d => aScale(d.a));

  // TODO: Select and update the 'b' area chart path (create your own generator)

  // TODO: Select and update the scatterplot points

  // ****** TODO: PART IV ******
}

/**
 * Update the data according to document settings
 */
async function changeData() {
  //  Load the file indicated by the select menu
  let dataFile = document.getElementById("dataset").value;
  try {
    const data = await d3.csv("data/" + dataFile + ".csv");
    if (document.getElementById("random").checked) {
      // if random
      update(randomSubset(data)); // update w/ random subset of data
    } else {
      // else
      update(data); // update w/ full data
    }
  } catch (error) {
    alert("Could not load the dataset!");
  }
}

/**
 *  Slice out a random chunk of the provided in data
 *  @param data
 */
function randomSubset(data) {
  return data.filter(d => Math.random() > 0.5);
}

window.onload = initialize();

function initialize() {
  let stairBtn = document.getElementById("staircase");
  stairBtn.onclick = staircase;

  let dataSelect = document.getElementById("dataset");
  dataSelect.onchange = changeData;

  let rndSubset = document.getElementById("random");
  rndSubset.onchange = changeData;

  changeData();
}