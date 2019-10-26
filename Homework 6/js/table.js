class Table {
    constructor(words, ordScale){
        this.words = words;
        this.tableElements = words;
        this.ordinalScale = ordScale;

        this.cell = {
            "width": 170,
            "percent_width": 200,
            "total_width": 100,
            "height": 25,
            "buffer": 12
        };

        this.headers = ['Phrase', 'Frequency', 'Percentages', "Total"];

        // f for frequency
        this.fScale = d3.scaleLinear()
            .domain([0,1])
            .range([0, this.cell.width - 2*this.cell.buffer])

        // p for percentages
        this.pScale = d3.scaleLinear()
            .domain([0, 100])
            .range([1, this.cell.percent_width/2 - this.cell.buffer])

        this.pAxisScale = d3.scaleLinear()
            .domain([-100, 100])
            .range([0, this.cell.percent_width - 2*this.cell.buffer])
    }

    initTable() {
        let that = this;

        // Table
        let table = d3.select('#table-wrap')
            .append('table')
                .attr('id', 'phrase-table');

        let thead = table.append('thead');
        let tbody = table.append('tbody');

        // Headers
        let th_tr = thead.append('tr')
            .attr('id', 'headers');

        let headers = th_tr.selectAll('th')
            .data(this.headers)
            .join('th')
                .attr('id', d => d)
                .append('div');

        d3.select('#table-wrap thead').selectAll('th').on('click', function() {that.sortColumn(this)});

        headers
            .append('div')
                .attr('id', 'table-label')
                .html(d => d);

        // Axes SVG's
        headers.append('svg')
            .attr('height', 25)
            .attr('width', this.cell.width);

        let percentAxis = headers.select('#Percentages svg')
            .attr('width', this.cell.percent_width)
            .append('g')
                .attr('id', 'percent-axis')
                .attr('transform', `translate(${this.cell.buffer}, 30)`);

        headers.select('#Total svg')
            .attr('width', this.cell.total_width);

        let freqAxis = headers.select('#Frequency svg')
            .append('g')
                .attr('id', 'frequency-axis')
                .attr('transform', `translate(${this.cell.buffer}, 30)`);

        // Axes
        let fAxis = d3.axisTop(this.fScale).ticks(3);
        let pAxis = d3.axisTop(this.pAxisScale).tickFormat(d => Math.abs(+d)).ticks(5);

        freqAxis.call(fAxis)
            .select(".domain").remove();

        percentAxis.call(pAxis)
            .select(".domain").remove();

        this.drawTable();
           
    }

    drawTable() {
        let that = this;

        let tr = d3.select('#table-wrap tbody').selectAll('tr')
                .data(this.tableElements)
                .join('tr')
        
        let td = tr.selectAll('td')
            .data(function(d){
                let type;
                let data = [];
                let phrase = d.phrase;
                let category = d.category;
                let vis;
                let value;
                for (const key of that.headers) {
                    type = key
                    if (key === 'Phrase'){
                        vis = 'text';
                        value = phrase
                    }
                    else if (key === 'Frequency'){
                        vis = 'freq'
                        value = d.total / 50;
                    }
                    else if (key === 'Percentages'){
                        vis = 'percent'
                        value = {percent_d: d.percent_of_d_speeches, percent_r: d.percent_of_r_speeches};
                    }
                    else if (key === 'Total'){
                        vis = 'text'
                        value = d.total;
                    }

                    data.push({category: category, id: phrase, vis: vis, value: value, type: key})

                }
                return data;
            })
            .join('td')
                .attr('class', d => `${d.type} ${d.id}`)

        let text = td.filter(d => d.vis === 'text')
            .attr('class', d => d.type)
            .html(d => d.value);

        let freq = td.filter(d => d.vis === 'freq')
            .selectAll('svg')
            .data(d => [d])
            .join('svg')
                .attr('width', this.cell.width - 2*this.cell.buffer)
                .attr('height', this.cell.height)
                .attr('transform', `translate(${this.cell.buffer}, 0)`);
        
        let percentages = td.filter(d => d.vis === 'percent')
            .selectAll('svg')
            .data(d => [d])
            .join('svg')
                .attr('width', this.cell.percent_width - 2*this.cell.buffer)
                .attr('height', this.cell.height)
                .attr('transform', `translate(${this.cell.buffer}, 0)`)

        freq.selectAll('rect')
            .data(d => [d])
            .join('rect')
                .attr('class', d => `${d.id}`)
                .attr('height', this.cell.height)
                .attr('width', d => that.fScale(d.value))
                .style('fill', d => that.ordinalScale(d.category))

        percentages.selectAll('rect')
            .data(d => [d])
            .join('rect')
                .attr('class', d => `${d.id}`)
                .attr('width', d => that.pScale(d.value.percent_d))
                .attr('height', this.cell.height)
                .attr('transform', `translate(${this.pScale(100)-1}, 0) scale(-1, 1)`)
                .classed('dem', true)

        percentages.selectAll('rect')
            .filter(function() {
                return !this.classList.contains('dem');
            })
            .data(d => [d])
            .join('rect')
                .attr('class', d => `${d.id}`)
                .attr('width', d => that.pScale(d.value.percent_r))
                .attr('height', this.cell.height)
                .attr('transform', `translate(${this.pScale(100)+1}, 0)`)
                .classed('rep', true)


    }



    sortColumn(element) {
        //this.collapseList();

        d3.select('#headers')
            .selectAll('.desc')
            .filter(function() {
                return this.id !== element.id;
            })
            .classed('desc', false);
        

        let sortFunc;
        let nameFunc;
        if (element.className === 'desc'){            
            element.className = null;
            sortFunc = d3.ascending;
            nameFunc = d3.descending;
        }
        else{
            element.className = 'desc';
            sortFunc = d3.descending;
            nameFunc = d3.ascending;
        }

        let teamSort;
        
        teamSort = [...this.tableElements].sort((a,b) => nameFunc(a.phrase, b.phrase))
        if (element.id === 'Frequency')
            teamSort = teamSort.sort((a,b) => sortFunc(a.total / 50, b.total / 50));
        else if (element.id === 'Percentages'){
            // sort by sum since it will capture the largest or smallest percentages
            teamSort = teamSort.sort((a,b) => 
                sortFunc(+a.percent_of_d_speeches + +a.percent_of_r_speeches, 
                    +b.percent_of_d_speeches + +b.percent_of_r_speeches));
        }
        else if (element.id === 'Total')
            teamSort = teamSort.sort((a,b) => sortFunc(+a.total, +b.total));

        this.tableElements = teamSort;
        this.drawTable();
    }

    updateTable(indices) {
        this.tableElements = [...this.words].filter(function(d) { return indices.includes(d.index) })
        this.drawTable();
    }
}