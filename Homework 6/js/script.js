/**
 * Loads in word data
 */
d3.json('data/words.json').then( data => {

    let categories = [...new Set(data.map(d => d.category))]

    let ordinalScale = d3.scaleOrdinal()
        .domain(categories)
        .range(d3.schemeSet3)

    let table = new Table(data, ordinalScale);

    table.initTable();

    let bubblePlot = new Bubble(data, ordinalScale, table);

    bubblePlot.initPlot();

});