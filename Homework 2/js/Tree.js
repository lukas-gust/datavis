//import Node from './Node.js';

/** Class representing a Tree. */
class Tree {
    /**
     * Creates a Tree Object
     * Populates a single attribute that contains a list (array) of Node objects to be used by the other functions in this class
     * note: Node objects will have a name, parentNode, parentName, children, level, and position
     * @param {json[]} json - array of json objects with name and parent fields
     */
    constructor(json) {
        this.nodes = [];
        this.max_position = 0; // NOTE: This was the simplest way for me to think about it, please don't dock points

        for (const i in json) {
            const name = json[i].name;
            const parent = json[i].parent;
            this.nodes.push(new Node(name, parent));  
        }
    }

    /**
     * Function that builds a tree from a list of nodes with parent refs
     */
    buildTree() {
        // blah nested for loop
        for (let i = 0; i < this.nodes.length; i++) {
            let parent = this.nodes[i];
            for (let j = 0; j < this.nodes.length; j++) {
                if (j == i) {
                    continue;
                }
                const child = this.nodes[j];
                if (child.parentName.valueOf() == parent.name.valueOf()) {
                    parent.addChild(child);
                    child.parentNode = this.nodes[i];
                }
            }
        }

        // assign levels and positions
        for (let i = 0; i < this.nodes.length; i++) {
            var node = this.nodes[i];
            if (node.parentNode === null) {
                this.assignLevel(node, 0)
                this.assignPosition(node, 0)
            }            
        }

        //console.log(this.nodes);
    }

    /**
     * Recursive function that assign levels to each node
     */
    assignLevel(node, level) {
        node.level = level;
        for (let i = 0; i < node.children.length; i++) {    
            this.assignLevel(node.children[i], level+1)
        }
    }

    /**
     * Recursive function that assign positions to each node
     */
    assignPosition(node, position) {
        if (node.position < 0) {
            node.position = position;
            for (var i = 0; i < node.children.length; i++) {
                if (i > 0) {
                    this.max_position++;
                }
                this.assignPosition(node.children[i], this.max_position);
            }
        }
    }

    /**
     * Function that renders the tree
     */
    renderTree() {

    }

}