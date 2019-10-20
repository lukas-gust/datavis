class Bubble {

    /**
     * Create a new bubble object.
     * @param words parsed data
     */
    constructor(words) {
        this.words = words;

        this.categories = [...new Set(this.words.map(d => d.category))]

        this.chart = {
            "width": 1300,
            "height": 200,
            "margin": 10,
            "expanded_height": this.categories.length * 200
        };

        console.log(this.chart.expanded_height);
        
    }

    /**
     * Initialize the plot with all the div, buttons, etc.
     */
    initPlot() {

        d3.select('#bubble-wrap')
            .append('div')
            .attr('id', 'button-wrap');

        d3.select('#bubble-wrap')
            .append('div')
            .style('width', `${this.chart.width}px`)
            .attr('id', 'bubble-plot')

        d3.select('#bubble-wrap')
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

        let buttonWrap = d3.select('#button-wrap')

        buttonWrap
            .append('span')
            .html('Grouped by Topic')

        let toggleBtn = buttonWrap
            .append('label')
            .attr('class', 'switch')

        toggleBtn
            .append('input')
            .attr('type', 'checkbox')

        toggleBtn
            .append('span')
            .attr('class', 'slider round')

        buttonWrap
            .append('button')
            .attr('type', 'button')
            .attr('id', 'extreme-btn')
            .attr('class', 'btn btn-outline-primary')
            .html('Show Extremes')

        let plot = d3.select('#bubble-plot')

        plot
            .append('div')
            .attr('id', 'labels')
        
        d3.select('#labels')
            .append('span')
            .html('Democratic Leaning')

        d3.select('#labels')
            .append('span')
            .style('float', 'right')
            .html('Republicanc Leaning')

        plot
            .append('svg')
            .attr('id', 'bubble-svg')
            .attr('width', this.chart.width)
            .attr('height', this.chart.height)
        
    }

    /**
     * Draw the plot
     */
    drawPlot() {

    }

    /**
     * Draw grouped plots, i.e. transition existing data.
     */
    groupPlot() {

    }
}