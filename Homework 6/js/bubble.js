class Bubble {

    /**
     * Create a new bubble object.
     * @param words parsed data
     */
    constructor(words) {
        this.words = words;

        this.categories = [...new Set(this.words.map(d => d.category))]

        this.chart = {
            "width": 900,
            "height": 130,
            "horizontal_margin": 10,
            "vertical_margin": 12,
            "expanded_height": this.categories.length * 200
        };

        console.log(this.categories);

        this.ordinalScale = d3.scaleOrdinal()
            .domain(this.categories)
            .range(d3.schemeSet3)
        
        
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
            .style('width', '60%')
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

        plot.append('div')
            .attr('id', 'labels')
        
        d3.select('#labels')
            .append('span')
            .html('Democratic Leaning')

        d3.select('#labels')
            .append('span')
            .style('float', 'right')
            .html('Republican Leaning')

        plot.append('div')
            .append('svg')
            .attr('id', 'bubble-axis-svg')
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", `0 0 ${this.chart.width} 30`)


        let svg = plot
            .append('div')
            .classed('svg-container', true)
            .append('svg')
            .attr('id', 'bubble-svg')
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", `0 0 ${this.chart.width} ${this.chart.height}`)
            .classed("svg-content-responsive", true)

        svg.append('g')
            .attr('id', 'axis')

        svg.append('g')
            .attr('id', 'points')

        this.drawPlot();
        
    }

    /**
     * Draw the plot
     */
    drawPlot() {
        let that = this;
        let svg = d3.select('#bubble-svg')

        // Scale and axis
        let xScale = d3.scaleLinear()
            .domain([Math.round(d3.min(this.words, d => d.position)/10)*10, d3.max(this.words, d => d.position)])
            .range([20, 875]);        
      
        let yScale = d3.scaleLinear()
            .domain([d3.min(this.words, d => d.sourceY), d3.max(this.words, d => d.sourceY)])
            .range([this.chart.vertical_margin, this.chart.height-this.chart.vertical_margin]);

        let cScale = d3.scaleLinear()
            .domain([
              d3.min(this.words.map(d => +d.total)),
              d3.max(this.words.map(d => +d.total))
            ])
            .range([3, 12]);

        let xAxis = d3.axisBottom(xScale)
            .tickFormat(d => Math.abs(+d))

        let xAxisSvg = d3.select('#bubble-axis-svg')
            .append('g')
                .attr('transform', 'translate(0, 5)')

        xAxisSvg.call(xAxis)
            .select(".domain").remove()
        

        // Points

        svg.select('#points')
            .selectAll('path')
            .data([0])
            .join('path')
                .attr('d', `M${xScale(0)} 0 V${xScale(0)} ${this.chart.height}`)
                .attr('id', 'guide')

        svg.select('#points')
            .selectAll('circle')
            .data(this.words)
            .join('circle')
                .attr('cx', d => +d.sourceX)
                .attr('cy', d => yScale(d.sourceY))
                .attr('r', d => cScale(d.total))
                .attr('class', d => d.category)
                .style('fill', d => d3.rgb(that.ordinalScale(d.category)));

        // Guide lines

        svg.select('#points')
            .select('path')
            .data([0])
            .join('path')
                .attr(`M${this.chart.width/2} 0 H${this.chart.width/2} ${this.chart.height}`)
          
        
          

        // Hover Tooltip
    }

    /**
     * Draw grouped plots, i.e. transition existing data.
     */
    groupPlot() {

    }
}