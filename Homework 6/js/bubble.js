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
            "expanded_height": this.categories.length * 130 
        };

        this.ordinalScale = d3.scaleOrdinal()
            .domain(this.categories)
            .range(d3.schemeSet3)

        this.xScale = d3.scaleLinear()
            .domain([Math.round(d3.min(this.words, d => d.position)/10)*10, d3.max(this.words, d => d.position)])
            .range([20, 875]); 

        this.yScale = d3.scaleLinear()
            .domain([d3.min(this.words, d => d.sourceY), d3.max(this.words, d => d.sourceY)])
            .range([this.chart.vertical_margin, this.chart.height-this.chart.vertical_margin]);       
    }

    /**
     * Initialize the plot with all the div, buttons, etc.
     */
    initPlot() {
        let that = this;

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
            .attr('id', 'toggle')
            .on('click', function(){
                let checked = d3.select(this).property('checked')

                if (checked){
                    that.groupPlot();
                }
                else{
                    that.resetPlot();
                }
            });

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
            .attr("viewBox", `0 0 ${this.chart.width} 25`)


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

        svg.selectAll('text')
            .data(this.categories)
            .join('text')
                .html(d => d)
                .classed('category-labels', true)
                .style('opacity', 0)

        this.drawPlot();
        
    }

    /**
     * Draw the plot
     */
    drawPlot() {
        let that = this;

        // Revert to normal if groups are toggled
        let svg = d3.select('#bubble-svg')      

        let cScale = d3.scaleLinear()
            .domain([
              d3.min(this.words.map(d => +d.total)),
              d3.max(this.words.map(d => +d.total))
            ])
            .range([3, 12]);

        let xAxis = d3.axisBottom(this.xScale)
            .tickFormat(d => Math.abs(+d))

        let xAxisSvg = d3.select('#bubble-axis-svg')
            .append('g')
                .attr('transform', 'translate(0, 5)')

        xAxisSvg.call(xAxis)
            .select(".domain").remove()
        
        // Guide Lines
        svg.select('#points')
            .selectAll('path')
            .data([0])
            .join('path')
                .attr('d', `M${this.xScale(0)} 0 V${this.xScale(0)} ${this.chart.height}`)
                .attr('id', 'guide')

        // Points
        svg.select('#points')
            .selectAll('circle')
            .data(this.words)
            .join('circle')
                .attr('cx', d => +d.sourceX)
                .attr('cy', d => that.yScale(d.sourceY))
                .attr('r', d => cScale(d.total))
                .attr('class', d => d.category)
                .style('fill', d => d3.rgb(that.ordinalScale(d.category)))
                .on('mouseover', function(){ that.highlightCircle(this) })
                .on('mouseout', function(){ that.unhiglightCircle(this)})
                
    
        // Hover Tooltip
    }

    highlightCircle(that) {
        d3.select(that)
            .style('stroke-width', 2);
    }

    unhiglightCircle(that){
        d3.select(that)
        .style('stroke-width', 1);
    }

    /**
     * Draw grouped plots, i.e. transition existing data.
     */
    groupPlot() { //TODO transitions
        let that = this;

        let svg = d3.select('#bubble-svg')

        svg.transition()
            .duration(1000)
            .attr("viewBox", `0 0 ${this.chart.width} ${this.chart.expanded_height}`)

        // Guide Lines
        svg.select('#points')
            .select('path')
            .attr('d', `M${this.xScale(0)} 0 V${this.xScale(0)} ${this.chart.expanded_height}`)

        let circles = svg.select('#points')
            .selectAll('circle')
                .transition()
                .duration(1000)
                .attr('cx', d => +d.moveX)
                .attr('cy', d => that.yScale(d.moveY))

        let categories = svg.selectAll('text')
            .data(this.categories)
            .join('text')
                .transition()
                .duration(1000)
                .attr('x', 0)
                .attr('y', (d, i) => i * that.chart.height + 12)
                .style('opacity', 1)

    }

    /**
     * Reset the plot via transition. This is to avoid transitions on page loading.
     */
    resetPlot() {
        let that = this
        let svg = d3.select('#bubble-svg')

        svg.transition()
            .duration(1000)
            .attr("viewBox", `0 0 ${this.chart.width} ${this.chart.height}`)
            .selectAll('.category-labels')
                .attr('x', 0)
                .attr('y', 12)
                .style('opacity', 0)

        
        let circles = svg.select('#points')
            .selectAll('circle')
                .transition()
                .duration(1000)
                .attr('cx', d => +d.sourceX)
                .attr('cy', d => that.yScale(d.sourceY))
    }
}