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
    .domain([0, d3.max(data, d => d.a)+1])
    .range([0, 300]);

  let bScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.b)+1])
    .range([0, 300]);

  let bScaleReverse = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.b)+1])
    .range([300, 0]);

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
    .style("opacity", 1)
    .transition()
    .duration(1000)
    .style("opacity", 0)
    .attr("transform", (d, i) => `translate(18, ${iScale(i)}) scale(0, 1)`)
    .remove();

  aBarRects = aBarRectsNew.merge(aBarRects);

  aBarRects
    .attr("transform", (d, i) => `translate(18, ${iScale(i)}) scale(-1, 1)`)
    .transition().duration(500)
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
    .style("opacity", 1)
    .transition()
    .duration(1000)
    .style("opacity", 0)
    .attr("transform", (d, i) => `translate(0, ${iScale(i)}) scale(0, 1)`)
    .remove();

  bBarRects = bBarRectsNew.merge(bBarRects)

  bBarRects
    .attr("transform", (d, i) => `translate(0, ${iScale(i)})`)
    .transition().duration(500)
    .attr("width", (d, i) => bScale(d.b))
    .attr("height", 18);



  // TODO: Select and update the 'a' line chart path using this line generator

  let aLineGenerator = d3
    .line()
    .x((d, i) => iScale(i))
    .y(d => aScale(d.a));

  let aLineChart = d3.select("#aLineChart");

  aLineChart
    .attr("d", aLineGenerator(data))

  let aLineLength = aLineChart.node().getTotalLength();

  aLineChart
    .style("stroke-dasharray", `${aLineLength} ${aLineLength}`)
    .style("stroke-dashoffset", aLineLength)
    .transition()
    .duration(1500)
    .style("stroke-dashoffset", 0);


  // TODO: Select and update the 'b' line chart path (create your own generator)
  let bLineGenerator = d3
    .line()
    .x((d, i) => iScale(i))
    .y(d => bScale(d.b));

  let bLineChart = d3.select("#bLineChart");

  bLineChart
    .attr("d", bLineGenerator(data));

  let bLineLength = bLineChart.node().getTotalLength();

  bLineChart
    .style("stroke-dasharray", `${bLineLength} ${bLineLength}`)
    .style("stroke-dashoffset", bLineLength)
    .transition()
    .duration(1500)
    .style("stroke-dashoffset", 0);



  // TODO: Select and update the 'a' area chart path using this area generator
  let aAreaGenerator = d3
    .area()
    .x((d, i) => iScale(i))
    .y0(0)
    .y1(d => aScale(d.a));

  let aAreaChart = d3.select("#aAreaChart");

  if (aAreaChart.attr("d") === null) {
    aAreaChart
      .style("fill-opacity", 0)
      .style("stroke", "black")
      .style("stroke-width", 1)
      .attr("d", aAreaGenerator(data));

    let aPerimeter = aAreaChart.node().getTotalLength();

    aAreaChart
      .style("stroke-dasharray", `${aPerimeter} ${aPerimeter}`)
      .style("stroke-dashoffset", aPerimeter)
      .transition()
      .duration(1000)
      .style("stroke-dashoffset", 0)
      .transition()
      .duration(500)
      .style("fill-opacity", 1)
      .style("stroke", "#979696")
      .style("stroke-width", 0.05);

  }
  else {
    aAreaChart
      .transition()
      .duration(1500)
      .attrTween('d', function () {
        var previous = aAreaChart.attr('d');
        var current = aAreaGenerator(data);
        return d3.interpolatePath(previous, current)
      });
  }


  // TODO: Select and update the 'b' area chart path (create your own generator)
  let bAreaGenerator = d3
    .area()
    .x((d, i) => iScale(i))
    .y0(0)
    .y1(d => bScale(d.b));

  let bAreaChart = d3.select("#bAreaChart");

  if (bAreaChart.attr("d") === null) {
    bAreaChart
      .style("fill-opacity", 0)
      .style("stroke", "black")
      .style("stroke-width", 1)
      .attr("d", bAreaGenerator(data));

    let bPerimeter = bAreaChart.node().getTotalLength();

    bAreaChart
      .style("stroke-dasharray", `${bPerimeter} ${bPerimeter}`)
      .style("stroke-dashoffset", bPerimeter)
      .transition()
      .duration(1000)
      .style("stroke-dashoffset", 0)
      .transition()
      .duration(500)
      .style("fill-opacity", 1)
      .style("stroke", "#979696")
      .style("stroke-width", 0.05);

  }
  else {
    bAreaChart
      .transition()
      .duration(1500)
      .attrTween('d', function () {
        var previous = bAreaChart.attr('d');
        var current = bAreaGenerator(data);
        return d3.interpolatePath(previous, current)
      });
  }



  // TODO: Select and update the scatterplot points
  let regressionPoints = [
    {x:  2, y: 4 },
    {x: 16, y: 11}
  ];

  let regressionLine = d3
    .line()
    .x(d => aScale(d.x))
    .y(d => -bScale(d.y));

  let scatterplot = d3.select("#scatterplot");

  let regression = scatterplot.select("#regression-line");

  regression
    .transition()
    .duration(1000)
    .attr("d", regressionLine(regressionPoints));

  let aAxis = d3.axisBottom().scale(aScale);

  scatterplot.select("#x-axis").transition().duration(1000).call(aAxis);

  let bAxis = d3.axisLeft().scale(bScaleReverse);

  scatterplot.select("#y-axis").transition().duration(1000).call(bAxis);

  let points = scatterplot.selectAll("circle").data(data);

  let newPoints = points
    .enter()
    .append("circle")
    .style("opacity", 0)
    .attr("r", "2%");

  newPoints
    .attr("cx", d => aScale(d.a))
    .attr("cy", d => -bScale(d.b))
    .transition()
    .duration(1000)
    .style("opacity", 1);

  points
    .exit()
    .style("opacity", 1)
    .transition()
    .duration(1000)
    .style("opacity", 0)
    .remove();

  points = newPoints.merge(points);

  points
    .transition()
    .duration(1000)
    .attr("cx", d => aScale(d.a))
    .attr("cy", d => -bScale(d.b))
    .style("opacity", 1);

  points
    .join()
    .append("title")
    .text(d => `(${d.a}, ${d.b})`);

  points.on("click", d => console.log(`(${d.a}, ${d.b})`));

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