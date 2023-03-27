// It takes in a list of nodes and the desired number of connections.
// It returns an array of connections in the form of [startNode, endNode, cost].
function connectNodes(nodes, count) {
    console.log("connectNodes ", nodes);
    var edges = new PriorityQueue_graphmaker((a, b) => a[3] < b[3]);
    // Ensure that all nodes have at least one connection
    // For each node, connect it to another random node if it isn't already connected
    for (let start = 0; start < nodes.length; start++) {

        const cost = Math.floor(Math.random() * 10) + 1;
        findClosestedNeighbor(edges,nodes[start], nodes, nodes.length-1,cost);
        
    }

    // Kruskal's algorithm
    let uf = new UnionFind(nodes.length);
    for (let i = 0; i < edges.size(); i++) {
        let {element,priority} = edges.pop();

        if (!uf.connected(element[0].nodeNumber, element[1].nodeNumber)) {
            if(element[0].addConnection(element[1], element[2],true)){
                uf.union(element[0].nodeNumber, element[1].nodeNumber);
                
                
                drawConnectionLine_middleman(element[0], element[1]);
            }
        }
    }

    console.log("Reconnected the nodes");
}

function UnionFind(size) {
    this.parent = new Array(size);
    this.rank = new Array(size);
    for (let i = 0; i < size; i++) {
        this.parent[i] = i;
        this.rank[i] = 0;
    }
    this.find = function (x) {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]);
        }
        return this.parent[x];
    }
    this.union = function (x, y) {
        let rootX = this.find(x);
        let rootY = this.find(y);
        if (rootX === rootY) return;
        if (this.rank[rootX] > this.rank[rootY]) {
            this.parent[rootY] = rootX;
        } else if (this.rank[rootX] < this.rank[rootY]) {
            this.parent[rootX] = rootY;
        } else {
            this.parent[rootY] = rootX;
            this.rank[rootX]++;
        }
    }
    this.connected = function (x, y) {
        return this.find(x) === this.find(y);
    }
}





// finds numberOfNeighbors of closest neighbors to the node
// it will be used to connect nodes to each other as of now
// not yet properly connected up the system
function findClosestedNeighbor(edges,node, nodes, numberOfNeighbors,cost) {
    curNumb = 0;

    // used a priority queue in hopes of finding closest neighbors
    const neighbors = new PriorityQueue()
    for (var i = 0; i < nodes.length-1; i++) {
        if (node !== nodes[i]) {
            edges.push([node,nodes[i], cost],manhattanDistance(node, nodes[i]));
        }
    }

}



// get the x y distance between two nodes, this will update where ever the node is currently
// however, remeber, NODES CAN MOVE! Use this to get a snapshot of the current canvas
// but do not assume that the nodes will stay in the same place
function manhattanDistance(node1, node2) {
    return -(Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y));
}
