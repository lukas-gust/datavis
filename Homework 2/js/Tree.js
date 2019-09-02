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

        // note: in this function you will assign positions and levels by making calls to assignPosition() and assignLevel()
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            if (node.parentNode === null) {
                this.assignLevel(node, 0)
                this.assignPosition(node, 0)
            }            
        }

        console.log(this.nodes);
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
        node.position = position
        let max_pos;
        if (node.parentNode !== null){
            max_pos = node.parentNode.position;
        }
        else {
            max_pos = 0;
        }
        //console.log(position)
        for (let i = 0; i < node.children.length; i++) {
            max_pos = this.assignPosition(node.children[i], max_pos + i);
            if (i > max_pos) {
                max_pos += 1;
            }
        }
        console.log(max_pos)
        return max_pos;
    }

    /**
     * Function that renders the tree
     */
    renderTree() {

    }

}