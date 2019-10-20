/** Class implementing the tree view. */
class Tree {
    /**
     * Creates a Tree Object
     */
    constructor() {
        
    }

    /**
     * Creates a node/edge structure and renders a tree layout based on the input data
     *
     * @param treeData an array of objects that contain parent/child information.
     */
    createTree(treeData) {
        function diagonal(s, d) {

            let path = `M ${s.y} ${s.x}
                    C ${(s.y + d.y - 10) / 2} ${s.x},
                      ${(s.y + d.y - 10) / 2} ${d.x},
                      ${d.y} ${d.x}`
        
            return path
          }       

        // ******* TODO: PART VI *******
        let height = 900;
        let width = 400;

        let svg = d3.select('#tree')

        //Create a tree and give it a size() of 800 by 300.
        var tree = d3.tree()
	        .size([height, width]);

        //Create a root for the tree using d3.stratify(); 
        let root = d3.stratify()
            .id(d => { return  d.id; })
            .parentId(d => { return d.ParentGame ? treeData[d.ParentGame].id : null; })
            (treeData);

        //Add nodes and links to the tree.
        treeData = tree(root)

        let nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

        nodes.forEach(function(d){ d.y = d.depth * 80});

        let node = svg.selectAll('g')
            .data(nodes, d => d.id || (d.id = ++i));

        let nodeEnter = node.enter().append('g')
            .attr('class', d => d.data.Wins == 1 ? 'winner' : 'node')
            .attr("transform", d => `translate(${d.y+75}, ${d.x})`)

        nodeEnter.append('circle')
            .attr('r', 6)

        nodeEnter.append('text')
            .attr("dy", ".35em")
            .attr("x", d => d.children || d._children ? -13 : 13)
            .attr("text-anchor", d => d.children || d._children ? "end" : "start")
            .text(d => d.data.Team);

        // No need to exit since tree is static

        let link = svg.selectAll('path.link')
            .data(links, d => d.id);

        let linkEnter = link.enter().insert('path', "g")
            .attr("class", "link")
            .attr('id', d => d.id)
            .attr('d', d => diagonal(d, d.parent))
            .attr('transform', d => `translate(75)`);
        
    }

    /**
     * Updates the highlighting in the tree based on the selected team.
     * Highlights the appropriate team nodes and labels.
     *
     * @param row a string specifying which team was selected in the table.
     */
    updateTree(row) {
        // ******* TODO: PART VII *******
        let tree = d3.select('#tree');

        if (row.value.type === 'game'){
            let key = row.key.substring(1)
            let opponent = row.value.Opponent;

            tree.selectAll('g text')
                .filter(d => {
                    return (d.data.Team === key && d.data.Opponent === opponent) || 
                           (d.data.Team === opponent && d.data.Opponent === key)
                })
                .classed('selectedLabel', true);

            tree.selectAll('path.link')
                .filter(d => {                    
                    return (d.data.Team === key && d.data.Opponent === opponent) || 
                           (d.data.Team === opponent && d.data.Opponent === key)
                })
                .classed('selected', true);            
        }
        else{
            tree.selectAll('g text')
                .filter(d => {            
                    return d.data.Team === row.key
                })
                .classed('selectedLabel', true);

            tree.selectAll('path.link')
                .filter(d => {
                    return d.data.Team === row.key;
                })
                .classed('selected', true);
        }
    }

    /**
     * Removes all highlighting from the tree.
     */
    clearTree() {
        // ******* TODO: PART VII *******
        d3.select('#tree')
            .selectAll('.selectedLabel')
            .classed('selectedLabel', false);

        d3.select('#tree')
            .selectAll('.selected')
            .classed('selected', false);
        
    }
}
