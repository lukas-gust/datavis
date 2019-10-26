class Bubble {

    /**
     * Create a new bubble object.
     * @param words parsed data
     */
    constructor(words, ordScale, table) {
        this.table = table;
        this.words = words;

        this.categories = [...new Set(this.words.map(d => d.category))];
        this.class_categories = [...new Set(this.words.map(d => d.category.replace('/', ' ')))];

        this.chart = {
            "width": 900,
            "height": 130,
            "horizontal_margin": 10,
            "vertical_margin": 12,
            "expanded_height": this.categories.length * 130 
        };

        this.ordinalScale = ordScale;

        this.xScale = d3.scaleLinear()
            .domain([Math.round(d3.min(this.words, d => d.position)/10)*10, d3.max(this.words, d => d.position)])
            .range([20, 875]); 

        this.yScale = d3.scaleLinear()
            .domain([d3.min(this.words, d => d.sourceY), d3.max(this.words, d => d.sourceY)])
            .range([this.chart.vertical_margin, this.chart.height-this.chart.vertical_margin]);
            
    }

    makeExpandBrushes() {
        let that = this;
        let svg = d3.select('#bubble-svg');

        let brushGroups = svg.select('#points').selectAll('g');
        let brushes = [];

        brushGroups.nodes().forEach(function(n, idx) {
            
            brushes.push(d3.brushX().extent([[0, that.chart.height * idx], [that.chart.width, (that.chart.height*idx) + that.chart.height]])
                .on('start', function() {
                    svg.selectAll('.selection')
                        .attr('width', null)
                        .attr('height', null);

                    that.table.updateTable([...that.words.map(d => d.index)]);
                })
                .on('brush', function() {
                    const selection = d3.brushSelection(this);                
                    const selectedIndices = [];
                    if (selection) {
                        const [left,right] = selection;

                        that.words.forEach((d, i) => {
                            if (d3.select('#toggle').property('checked')){
                                if (+d.moveX >= left && +d.moveX <= right && 
                                    +d.moveY <= that.yScale.invert((that.chart.height*idx) + that.chart.height) &&
                                    +d.moveY >= that.yScale.invert(that.chart.height*idx))             
                                    selectedIndices.push(i);
                            }
                            else{
                                if (+d.sourceX >= left && +d.sourceX <= right)                
                                    selectedIndices.push(i);
                            }
                        });                   
                    }
                    if (selectedIndices.length === 0){
                        svg.select('#points').selectAll('circle').style('fill', 'lightgrey')
                        that.table.updateTable([]);
                    }
                    else
                        svg.select('#points').selectAll('circle').style('fill', d => d3.rgb(that.ordinalScale(d.category)));

                    if (selectedIndices.length > 0) {
                        svg.select('#points').selectAll('circle')
                            .filter((d, i) => {  
                                return !selectedIndices.includes(d.index);                            
                            })
                            .style('fill', 'lightgrey');

                        that.table.updateTable(selectedIndices);
                    }

                })
                .on('end', function() {
                    const selection = d3.brushSelection(this);                
                    const selectedIndices = [];
                    if (selection) {
                        const [left,right] = selection;
                        
                        that.words.forEach((d, i) => {
                            if (d3.select('#toggle').property('checked')){
                                if (+d.moveX >= left && +d.moveX <= right && 
                                    +d.moveY <= that.yScale.invert((that.chart.height*idx) + that.chart.height) &&
                                    +d.moveY >= that.yScale.invert(that.chart.height*idx))             
                                    selectedIndices.push(i);
                            }
                            else{
                                if (+d.sourceX >= left && +d.sourceX <= right)                
                                    selectedIndices.push(i);
                            }
                        });                   
                    }
                    else
                        svg.select('#points').selectAll('circle').style('fill', d => d3.rgb(that.ordinalScale(d.category)));

                    if (selectedIndices.length > 0) {
                        svg.select('#points').selectAll('circle')
                            .filter((d, i) => {  
                                return !selectedIndices.includes(d.index);                            
                            })
                            .style('fill', 'lightgrey');

                        that.table.updateTable(selectedIndices);
                    }
                }))
        })

        return brushes;

    }

    /**
     * Initialize the plot with all the div, buttons, etc.
     */
    initPlot() {
        let that = this;

        d3.select('#bubble-wrap')
            .append('div')
                .attr('id', 'bubble-plot');

        let tooltip = d3.select('#bubble-wrap')
            .append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0);
        
        tooltip
            .append('h2')
                .classed('display-6', true)
                .attr('id', 'phrase-tool');

        tooltip
            .append('h4')
            .attr('id', 'percent-lean-tool');

        tooltip
            .append('h4')
            .attr('id', 'percent-tool');

        let buttonWrap = d3.select('#button-wrap');

        buttonWrap
            .append('span')
            .html('Grouped by Topic');

        let toggleBtn = buttonWrap
            .append('label')
            .attr('class', 'switch');

        toggleBtn
            .append('input')
            .attr('type', 'checkbox')
            .attr('id', 'toggle')
            .on('click', function(){
                let checked = d3.select(this).property('checked');

                if (checked){
                    that.groupPlot();
                }
                else{
                    that.resetPlot();
                }
            });

        toggleBtn
            .append('span')
            .attr('class', 'slider round');

        buttonWrap
            .append('button')
                .attr('type', 'button')
                .attr('id', 'extreme-btn')
                .attr('class', 'btn btn-outline-primary')
                .html('Show Extremes')
                .on('click', this.highlightExtreme.bind(this));

        let plot = d3.select('#bubble-plot');

        plot.append('div')
            .attr('id', 'labels');
        
        d3.select('#labels')
            .append('span')
            .html('Democratic Leaning');

        d3.select('#labels')
            .append('span')
            .style('float', 'right')
            .html('Republican Leaning');

        plot.append('div')
            .append('svg')
            .attr('id', 'bubble-axis-svg')
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", `0 0 ${this.chart.width} 25`);


        let svg = plot
            .append('div')
            .classed('svg-container', true)
            .append('svg')
            .attr('id', 'bubble-svg')
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", `0 0 ${this.chart.width} ${this.chart.height}`)    
            .classed("svg-content-responsive", true);

        svg.append('g')
            .attr('id', 'axis');

        svg.append('g')
            .attr('id', 'points');

        svg.selectAll('text')
            .data(this.categories)
            .join('text')
                .html(d => d)
                .classed('category-labels', true)
                .style('opacity', 0);

        d3.select('.story')
            .on('click', this.clearHighlightExtreme);

        this.drawPlot();
        
    }

    /**
     * Draw the plot
     */
    drawPlot() {
        let that = this;

        // Revert to normal if groups are toggled
        let svg = d3.select('#bubble-svg')  ;    

        let cScale = d3.scaleLinear()
            .domain([
              d3.min(this.words.map(d => +d.total)),
              d3.max(this.words.map(d => +d.total))
            ])
            .range([3, 12]);

        let xAxis = d3.axisBottom(this.xScale)
            .tickFormat(d => Math.abs(+d));

        let xAxisSvg = d3.select('#bubble-axis-svg')
            .append('g')
                .attr('transform', 'translate(0, 5)');

        xAxisSvg.call(xAxis)
            .select(".domain").remove();

        // Guide Lines
        svg.select('#points')
            .selectAll('path')
            .data([0])
            .join('path')
                .attr('d', `M${this.xScale(0)} 0 V${this.xScale(0)} ${this.chart.height}`)
                .attr('id', 'guide');

        let circle_gs = svg.select('#points')
            .selectAll('g')
            .data(this.categories)
            .join('g');

        this.expandBrushes = this.makeExpandBrushes();

        let brushGroups = svg.select('#points').selectAll('g');

        brushGroups.nodes().forEach(function(d, i) {           
            d3.select(d).call(that.expandBrushes[i]);
        });

        // Points
        circle_gs
            .selectAll('circle')
            .data(cat => that.words.filter(item => item.category === cat))
            .join('circle')
                .attr('cx', d => +d.sourceX)
                .attr('cy', d => that.yScale(d.sourceY))
                .attr('r', d => cScale(d.total))
                .style('fill', d => d3.rgb(that.ordinalScale(d.category)))
                .on('mouseover', function(d){ that.highlightCircle(this, d) })
                .on('mouseout', function(){ that.unhiglightCircle(this)});
                
    }

    highlightCircle(that, datum) {
        let circle = d3.select(that)
            .style('stroke-width', 2);


        let cRect = circle.node().getBoundingClientRect();
        
        let tooltip = d3.select('.tooltip');

        tooltip
            .style('left', `${cRect.right}px`)
            .style('top', `${cRect.top - 115 + window.scrollY}px`)
            .transition()
            .duration(500)
            .style('opacity', 1);
        
        tooltip
            .select('#phrase-tool')
            .html(datum.phrase);

        let rep_dem;
        let position = datum.position.toFixed(2);
        if (position == 0)
            rep_dem = 'N';
        else if (position > 0)
            rep_dem = 'R+';
        else
            rep_dem = 'D+';

        tooltip
            .select('#percent-lean-tool')
            .html(`${rep_dem} ${Math.abs(position)}`);

        tooltip
            .select('#percent-tool')
            .html(`In ${Math.round((datum.total / 50)*100)}% of speeches`);
            
    }

    unhiglightCircle(that){
        d3.select(that)
            .style('stroke-width', 1);

        d3.select('.tooltip')
            .interrupt()
            .style('opacity', 0);
    }

    /**
     * Draw grouped plots, i.e. transition existing data.
     */
    groupPlot() { 
        let that = this;

        let svg = d3.select('#bubble-svg');

        svg.transition()
            .duration(1000)
            .attr("viewBox", `0 0 ${this.chart.width} ${this.chart.expanded_height}`);

        // Guide Lines
        svg.select('#points')
            .classed('brush', false)
            .select('path')
            .attr('d', `M${this.xScale(0)} 0 V${this.xScale(0)} ${this.chart.expanded_height}`);


        this.resetTable();

        let circles = svg.select('#points')
            .selectAll('circle')
                .transition()
                .duration(1000)
                .attr('cx', d => +d.moveX)
                .attr('cy', d => that.yScale(d.moveY));

        let categories = svg.selectAll('text')
            .data(this.categories)
            .join('text')
                .transition()
                .duration(1000)
                .attr('x', 0)
                .attr('y', (d, i) => i * that.chart.height + 12)
                .style('opacity', 1);
    }

    /**
     * Reset the plot via transition. This is to avoid transitions on page loading.
     */
    resetPlot() {
        let that = this;
        let svg = d3.select('#bubble-svg');

        this.resetTable();

        svg.transition()
            .duration(1000)
            .attr("viewBox", `0 0 ${this.chart.width} ${this.chart.height}`)
            .selectAll('.category-labels')
                .attr('x', 0)
                .attr('y', 12)
                .style('opacity', 0);

        
        let circles = svg.select('#points')
            .selectAll('circle')
                .transition()
                .duration(1000)
                .attr('cx', d => +d.sourceX)
                .attr('cy', d => that.yScale(d.sourceY));

        
    }

    resetTable() {
        let that = this
        let brushGroups = d3.select('#bubble-svg').select('#points').selectAll('g');

        brushGroups.nodes().forEach(function(d, i) {
            d3.select(d).call(that.expandBrushes[i].move, null)
        });

        this.table.updateTable([...this.words.map(d => d.index)]);
    }

    highlightExtreme() {
        let that = this;

        //TODO find maximum circles
        let svg = d3.select('#bubble-svg');
        
        this.resetTable();

        let circles = svg.select('#points')
            .selectAll('circle');

        let minCircle = circles.filter(d => d.sourceX === d3.min(this.words, d => d.sourceX));
        let minCircleNode = minCircle.node().getBoundingClientRect();

        let maxCircle = circles.filter(d => d.sourceX === d3.max(this.words, d => d.sourceX));
        let maxCircleNode = maxCircle.node().getBoundingClientRect();
        
        d3.select('.story')
            .classed('highlight', true);

        let storySvg = d3.select('#story-svg')
            .attr('width', "100%")
            .attr('height', "100%");

        storySvg.selectAll('#dem')
            .data([minCircle])
            .join('circle')
            .transition()
            .duration(500)
                .attr('id', 'dem')
                .attr('cx', `${minCircleNode.x + minCircleNode.width/2}px`)
                .attr('cy', `${minCircleNode.y + minCircleNode.height/2 + window.scrollY}px`)
                .attr('r',  +minCircleNode.width/2)
                .style('fill', 'blue');

        storySvg.selectAll('#rep')
            .data([maxCircle])
            .join('circle')
            .transition()
            .duration(500)
                .attr('id', 'rep')
                .attr('cx', `${maxCircleNode.x + maxCircleNode.width/2}px`)
                .attr('cy', `${maxCircleNode.y + maxCircleNode.height/2 + window.scrollY}px`)
                .attr('r',  +maxCircleNode.width/2)
                .style('fill', 'red');

        storySvg.selectAll('#dem-path')
            .data([minCircle])
            .join('path')
                .transition()
                .duration(500)
                .style('opacity', 1)
                .attr('d', `M${minCircleNode.x + minCircleNode.width/2} ${minCircleNode.y + window.scrollY} 
                            V${minCircleNode.y - 25 + window.scrollY}`)
                .style('stroke', 'black');

        storySvg.selectAll('#rep-path')
            .data([maxCircle])
            .join('path')
                .transition()
                .duration(500)
                .style('opacity', 1)
                .attr('d', `M${maxCircleNode.x + maxCircleNode.width/2} ${maxCircleNode.y + window.scrollY} 
                            V${maxCircleNode.y - 25 + window.scrollY}`)
                .style('stroke', 'black');

        d3.select('.story')
            .selectAll('#dem-div')
            .data([minCircle])
            .join('div')
                .attr('id', 'dem-div')
                .style('left', `${minCircleNode.x + minCircleNode.width/2}px`)
                .style('top', `${minCircleNode.y - 25 + window.scrollY - 120}px`)
                .style('background', 'white')
                .style('display', 'inherit')
                .selectAll('h4')
                .data([minCircle])
                .join('h4')
                    .html(d => `Democratic speeches mentioned ${d.data()[0].phrase} ${Math.round((d.data()[0].total / 50)*100)}% more.`);

        d3.select('.story')
            .selectAll('#rep-div')
            .data([maxCircle])
            .join('div')
                .attr('id', 'rep-div')
                .style('left', `${maxCircleNode.x + maxCircleNode.width/2}px`)
                .style('top', `${maxCircleNode.y - 25 + window.scrollY - 120}px`)
                .style('background', 'white')
                .style('display', 'inherit')
                .selectAll('h4')
                .data([maxCircle])
                .join('h4')
                    .html(d => `Republican speeches mentioned ${d.data()[0].phrase} ${Math.round((d.data()[0].total / 50)*100)}% more.`);
    }

    clearHighlightExtreme() {
        let storySvg = d3.select('#story-svg');

        storySvg.selectAll('circle')
            .transition()
            .duration(500)
                .attr('r',  0);

        storySvg.selectAll('path')
                .style('opacity', 0);

        d3.select('.story').selectAll('div')
            .style('display', 'none');

        d3.select('.story')
            .classed('highlight', false);

    }
}