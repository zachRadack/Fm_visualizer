/**  It takes in a list of nodes and the desired number of connections.
 *  It returns an array of connections in the form of [startNode, endNode, cost].
 *
 * todo: Make costs be based on distance
 * todo: fix count
 * 
 * @param {[nodeClass]} nodes - The nodes that are being checked
 * @param {number} count - The number of connections to make (not yet implemented/broken) 
 * @param {bool} distanceCost defaults to false, if true, then scores are distance and are constantly updated
 * @param {number} screen_width 
 * @param {number} screen_height 
 */
function connectNodes(nodes, count,distanceCost=false,screen_width=1,screen_height=1) {
    console.log("connectNodes ", nodes);
    var edges = new PriorityQueue_graphmaker((a, b) => a[1] < b[1]);
    
    for (let start = 0; start < nodes.length; start++) {
        
        
        findClosestedNeighbor(edges,nodes[start], nodes, nodes.length-1);
        
    }
    
    if((distanceCost)){
        var screenscore=manhattanDistance({x:screen_width,y:screen_height},{x:0,y:0})/50;
    }
    let uf = new UnionFind(nodes.length);
    const edgeSize=edges.size()
    for (let i = 0; i < edgeSize; i++) {
        let {element,priority} = edges.pop();
        if((element[0]==0||element[1]==0)||(element[0]==2||element[1]==2)){
            console.log("T");
        }
        if (!uf.connected(element[0].nodeNumber, element[1].nodeNumber)) {

            // todo move cost finders fully into node class or anywhere else.
            if(distanceCost){
                //var cost = element[0].get_distance_Cost(priority);
                var cost = Math.round((Math.abs(priority/screenscore)));
            }else{
                var cost = Math.floor(Math.random() * 10) + 1;
            }
            if(element[0].addConnection(element[1], cost)){
                uf.union(element[0].nodeNumber, element[1].nodeNumber);
                
                
                drawConnectionLine_middleman(element[0], element[1]);
            }
        }
    }
    
    const uniqueVars = new Set(uf.parent);
    


    

    //var disconnectedNodes = minibreadthFirstSearch(nodes,mostCommonNumber(uf.parent));
    console.log(uniqueVars.size); 
    console.log("Reconnected the nodes");
}


/**
 * Finds all disconnected nodes, starts at the most linked up node
 * ! depercated, keeping this update so it can be recored just in case i need it later
 * @param {nodeClass} nodes 
 * @return {object} a list of all disconnected nodes
 */
function minibreadthFirstSearch(nodes,mostConnectedNode){
    visited= [nodes[mostConnectedNode]]
    observed = 0;
    firstrun = true
    frontier=[new pathClass(nodes[mostConnectedNode], [{ startnode: nodes[mostConnectedNode], endnode: nodes[mostConnectedNode] }])];


    while((frontier.length>0)){
        console.log("frontier: ",frontier);
        const {newNode, path} = frontier.pop();
        if (!(visited.includes(newNode))||(firstrun)) {
            if(firstrun){
                firstrun=false;
            }else{
                visited.push(newNode);
            }
            for (let successor of newNode.getNeighbors()) {
                if (!(visited.includes(successor))) {
                    var newPath = new pathClass(successor, path.concat([{ startnode: newNode, endnode: successor }]));
                    
                    frontier.unshift(newPath)
                }
            }
        }
    }
    var disconnectedNodes = nodes.filter((num) => !visited.includes(num));
    if(visited.length<nodes.length){
        console.log("missing links: ",disconnectedNodes);
    }
    return disconnectedNodes;
    
}

/**
 * Find the most common number in the array
 *  ! depercated, keeping this update so it can be recored just in case i need it later
 * @param {[number]} arr 
 * @returns {number}
 */
function mostCommonNumber(arr){

    const freq = {};
    arr.forEach((num) => {freq[num] = freq[num] ? freq[num] + 1 : 1;});

    return Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b);
}

/**
 * This itterates through all but the most common value in array
 *  ! depercated, keeping this update so it can be recored just in case i need it later
 * @param {[number]} arr 
 */
function iterateWithoutMostCommonNumber(arr) {
    let mostFrequentNum;

    mostFrequentNum = mostCommonNumber(arr);
  
    // Iterate through every index that does not have the most common number
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== mostFrequentNum) {
        console.log(`Processing index ${i} with value ${arr[i]}`);
        // Do something with the index here
      }
    }
  }
  


/**
 * This assists Kruskal's algorithm by properly linking up nodes
 * It is an information blackhole, it takes in a node, and a list of nodes
 * 
 * @param {number} size  - the number of nodes
 */
function UnionFind(size) {
    this.parent = new Array(size);
    this.rank = new Array(size);
    for (let i = 0; i < size; i++) {
        this.parent[i] = i;
        this.rank[i] = 0;
    }
    /**
     * Helps find the highest parent you can go to
     * 
     * @param {*} x - Node nodeNumber of what you are looking for
     * @returns  The nodeNumber of highest parent you can go to
     */
    this.find = function (x) {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]);
        }
        return this.parent[x];
    }

    /**
     * Helps union two nodes together
     * 
     * @param {number} x - Node nodeNumber of what you are looking for
     * @param {number} y - Node nodeNumber that you want to connect.
     */
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





/** finds numberOfNeighbors of closest neighbors to the node
 *  it will be used to connect nodes to each other as of now
 * not yet properly connected up the system
 * @param {PriorityQueue_graphmaker} edges - the Priority Queue graphmaker
 * @param {nodeClass} node - the node to find the closest neighbors to
 * @param {[nodeClass]} nodes - the list of all nodes from current Screen
 * @param {number} numberOfNeighbors - the number of neighbors to find (not yet implemented)
 * 
 * Returns nothings, but it will add the closest neighbors to the edges array
 */
function findClosestedNeighbor(edges,node, nodes, numberOfNeighbors) {
    curNumb = 0;

    for (var i = 0; i < nodes.length-1; i++) {
        if (node !== nodes[i]) {

            if(nodes[i]==1){
                console.log("te");
            }
            edges.push([node,nodes[i]],manhattanDistance(node, nodes[i]));
        }
    }

}





/** get the x y distance between two nodes, this will update where ever the node is currently
 *  however, remeber, NODES CAN MOVE! Use this to get a snapshot of the current canvas
 *  but do not assume that the nodes will stay in the same place
 * @param {nodeClass} node1 - the first node
 * @param {nodeClass} node2 - the second node
 */
function manhattanDistance(node1, node2) {
    return -(Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y));
}
