/**
 * Loads in word data
 */
d3.json('data/words.json').then( data => {

    let bubblePlot = new Bubble(data);

    bubblePlot.initPlot();

});