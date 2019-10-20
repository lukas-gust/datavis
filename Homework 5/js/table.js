/** Class implementing the table. */
class Table {
    /**
     * Creates a Table Object
     */
    constructor(teamData, treeObject) {

        // Maintain reference to the tree object
        this.tree = treeObject;

        /**List of all elements that will populate the table.*/
        // Initially, the tableElements will be identical to the teamData
        this.tableElements = teamData;

        ///** Store all match data for the 2018 Fifa cup */
        this.teamData = teamData;

        this.tableHeaders = ["Delta Goals", "Result", "Wins", "Losses", "TotalGames"];

        /** letiables to be used when sizing the svgs in the table cells.*/
        this.cell = {
            "width": 70,
            "height": 20,
            "buffer": 15
        };

        this.bar = {
            "height": 20
        };

        /** Set variables for commonly accessed data columns*/
        this.goalsMadeHeader = 'Goals Made';
        this.goalsConcededHeader = 'Goals Conceded';

        /** Setup the scales*/
        this.goalScale = d3.scaleLinear()
            .domain([0,16]) // TODO use max score
            .range([this.cell.buffer ,this.cell.width*2 - (this.cell.buffer)]);


        /** Used for games/wins/losses*/
        this.gameScale = d3.scaleLinear()
            .domain([0, d3.max(this.tableElements, d => d.value['TotalGames'])])
            .range([0 ,this.cell.width]);       

        /**Color scales*/
        /**For aggregate columns*/
        /** Use colors '#feebe2' and '#690000' for the range*/
        this.aggregateColorScale = d3.scaleLinear()
            .domain([0, d3.max(this.tableElements, d => d.value['TotalGames'])])
            .range([d3.rgb('#feebe2'), d3.rgb('#690000')]);


        /**For goal Column*/
        /** Use colors '#cb181d' and '#034e7b' for the range */
        this.goalColorScale = d3.scaleLinear()
            .domain([0, d3.max(this.tableElements, d => d.value['TotalGames'])])
            .range([d3.rgb('#cb181d'), d3.rgb('#034e7b')]);
        }


    /**
     * Creates a table skeleton including headers that when clicked allow you to sort the table by the chosen attribute.
     * Also calculates aggregate values of goals, wins, losses and total games as a function of country.
     *
     */
    createTable() {
        let that = this;

        // ******* TODO: PART II *******

        //Update Scale Domains
        // this.goalScale = d3.scaleLinear()
        //     .domain([0,16]) // TODO use max score
        //     .range([this.cell.buffer ,this.cell.width*2 - (this.cell.buffer)]);

        // Create the axes
        let goalAxis = d3.axisTop(this.goalScale)

        
        //add GoalAxis to header of col 1.
        let goalHeader = d3.select('#goalHeader')
            .append('svg')
                .attr('width', this.cell.width*2)
                .attr('height', this.cell.height)
                .attr('id', 'goalAxis')
            .append('g')
                .attr('transform', `translate(0, ${this.cell.height-1})`);

        goalHeader.call(goalAxis);

        // ******* TODO: PART V *******

        let headers = d3.select('#headers');

        headers.selectAll('th').on('click', function() {that.sortColumn(this)});
        headers.selectAll('td').on('click', function() {that.sortColumn(this)});

        // Set sorting callback for clicking on headers
        

        //Set sorting callback for clicking on Team header
        //Clicking on headers should also trigger collapseList() and updateTable().

    }

    sortColumn(element) {
        this.collapseList();

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
        
        
        if (this.tableHeaders.includes(element.id)){
            teamSort = this.tableElements.sort((a,b) => nameFunc(a.key, b.key))
            if (element.id === 'Result'){
                teamSort = teamSort.sort((a,b) => sortFunc(a.value[element.id].ranking, b.value[element.id].ranking));
            }
            else{
                teamSort = teamSort.sort((a,b) => sortFunc(a.value[element.id], b.value[element.id]));
            }
        }
        else{
            teamSort = this.tableElements.sort((a,b) => nameFunc(a.key, b.key))
        }

        this.tableElements = teamSort;
        this.updateTable();
    }


    /**
     * Updates the table contents with a row for each element in the global variable tableElements.
     */
    updateTable() {
        // ******* TODO: PART III *******
        //Create table rows
        let that = this;
        let tbody = d3.select('tbody');

        let tr = tbody.selectAll('tr').data(this.tableElements);
        tr.exit().remove();

        let tr_enter = tr.enter().append('tr');

        tr = tr_enter.merge(tr);

        tr.on('mouseover', function(d) { 
                that.tree.updateTree(d) 
            })
            .on('mouseout', this.tree.clearTree)

        //Append th elements for the Team Names
        let th = tr.selectAll('th').data(function(d) {return [{name: d.key, type: d.value.type}]});
        th.exit().remove();

        let th_enter = th.enter().append('th');

        th = th_enter.merge(th);

        th.text(d => d.name)
            .attr('class', d => `${d.type}`)
            .on('click', function(d){
                that.updateList(that.tableElements.map(e => e.key).indexOf(d.name))
            });

        //Append td elements for the remaining columns. 
        //Data for each cell is of the type: {'type':<'game' or 'aggregate'>, 'vis' :<'bar', 'goals', or 'text'>, 'value':<[array of 1 or two elements]>}
        let td = tr.selectAll('td').data(function(d) {
            let data = [];
            let type = d.value.type;
            let vis;
            let value;
            for (const key of that.tableHeaders) {
                if (d.value.hasOwnProperty(key)) {
                    const element = d.value[key]
                    if (key === 'Delta Goals'){
                        vis = 'goals'
                        value = {gm: d.value['Goals Made'], gc: d.value['Goals Conceded']}
                    }
                    else if (key === 'Result'){
                        vis = 'text'
                        value = element;
                    }
                    else if (key === 'Wins'){
                        vis = 'bar'
                        value = element;
                    }
                    else if (key === 'Losses'){
                        vis = 'bar'
                        value = element;
                    }
                    else if (key === 'TotalGames'){
                        vis = 'bar'
                        value = element;
                    }

                    data.push({type: type, vis: vis, value: value})
                }
            }
            return data;
        });

        td.exit().remove();

        let td_enter = td.enter().append('td');

        td = td_enter.merge(td);
        
        //Add scores as title property to appear on hover

        //Populate cells (do one type of cell at a time )
        let goals = td.filter(d => {
                return d.vis === 'goals';
            })
            .selectAll('svg')
            .data(d => [d] )
            .join('svg')
            .attr('width', this.cell.width*2)
            .attr('height', this.cell.height);

        let goal_titles = goals
            .selectAll('title')
            .data(d => [d])
            .join('title')
            .html(d => `Goals Made: ${d.value.gm}, Goals Conceded: ${d.value.gc}`)

        let text = td.filter(d => {
                return d.vis === 'text';
            })
            .html(d => d.value.label);

        let svgs = td.filter(d => {
                return d.vis === 'bar';
            })
            .selectAll('svg')
            .data(d => [d])
            .join('svg')
            .attr('width', this.cell.width)
            .attr('height', this.cell.height);

        svgs.selectAll('rect')
            .data(d => [d])
            .join('rect')
            .attr('height', this.cell.height)
            .attr('width', d => that.gameScale(d.value))
            .style('fill', d => that.aggregateColorScale(d.value));

        svgs.selectAll('text')
            .data(d => [d]) 
            .join('text')
            .classed('label', true)
            .html(d => d.value)
            .attr('x', d => that.gameScale(d.value-1))
            .attr('y', 15);
            

        //Create diagrams in the goals column
        goals.selectAll('rect')
            .data(d => [d])
            .join('rect')
            .classed('goalBar', true)
            .attr('x', d => Math.min(that.goalScale(d.value.gm), that.goalScale(d.value.gc)) + 3)
            .attr('y', d => d.type === 'aggregate' ? 4 : 7.5)
            .attr('height', d => d.type === 'aggregate' ? 12 : 6)
            .attr('width', d => Math.abs(that.goalScale(d.value.gm) - that.goalScale(d.value.gc)) - 6 > 0 ?
                                Math.abs(that.goalScale(d.value.gm) - that.goalScale(d.value.gc)) - 6 : 0)
            .style('fill', d => d.value.gm > d.value.gc ? d3.rgb('#364e74') : d3.rgb('#be2714'))

        goals.selectAll('circle')
            .data(d => [d])
            .join('circle')
            .classed('goalTied', false)
            .classed('goalCircle goalMade', true)
            .style('fill', d => d.type === 'aggregate' ? d3.rgb('#364e74') : 'none')
            .attr('cx', d => that.goalScale(d.value.gm))
            .attr('cy', 10)

        goals.selectAll('circle')
            .filter(function() {
                return !this.classList.contains('goalMade');
            })
            .data(d => [d])
            .join('circle')
            .classed('goalTied', false)
            .classed('goalCircle goalConceded', true)
            .style('fill', d => d.type === 'aggregate' ? d3.rgb('#be2714') : 'none')
            .attr('cx', d => that.goalScale(d.value.gc))
            .attr('cy', 10);

        goals.selectAll('circle')
            .filter(d => d.value.gm === d.value.gc)
            .classed('goalConceded goalMade', false)
            .classed('goalTied', true)
            .style('fill', d => d.type === 'aggregate' ? 'lightgrey' : 'none');

        //Set the color of all games that tied to light gray

    };

    /**
     * Updates the global tableElements variable, with a row for each row to be rendered in the table.
     *
     */
    updateList(i) {
        // ******* TODO: PART IV *******     
        let clickedElement = this.tableElements[i];

        if (clickedElement.value.type === 'aggregate'){
            // console.log(clickedElement.value.type)
            if (this.tableElements[i+1].value.type === 'aggregate'){
                for (const el of clickedElement.value.games) {
                    let key = 'x' + el.key;
                    this.tableElements.splice(i+1, 0, {key: key, value: el.value});
                }
            }
            else if (this.tableElements[i+1].value.type === 'game'){
                this.tableElements.splice(i+1, clickedElement.value.games.length)
            }
        }
       
        //Only update list for aggregate clicks, not game clicks
        this.updateTable();
        
    }

    /**
     * Collapses all expanded countries, leaving only rows for aggregate values per country.
     *
     */
    collapseList() {
        // ******* TODO: PART IV *******
        this.tableElements = this.tableElements.filter(function(d) {
            return d.value.type === 'aggregate';
        });
    }

}
