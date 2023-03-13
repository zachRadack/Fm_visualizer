//good dfs seed: 0.8906472348391477



var canvas=document.getElementById("canvas");

var current_screen=new current_Finite_Machine();

// Handle button click
$("#start-btn").click(function() {
        
    var startNode = parseInt($("#start").val());
    //colorNode(startNode,"red");
    var endNode = parseInt($("#end").val());
    var algorithm = $("#algorithm").val();
    console.log("Start node: " + startNode);
    console.log("End node: " + endNode);
    console.log("Algorithm: " + algorithm);

    // algorithm logic below here


    current_screen.initializer(startNode,endNode,algorithm);

    if(algorithm = "dfs"){
        current_screen.Depthfirstsearch();
    }else if(algorithm = "bfs"){
        current_screen.breadthfirstsearch();
    }
});

$("#Create-canvas-btn").click(function() {
    current_screen=new current_Finite_Machine();
    current_screen.wipeCanvas();
    var randomSeed = document.getElementById("seedTextBox").value;
    if (randomSeed.length == 0) {
        randomSeed = (Math.random()).toString();
        console.log("The current random seed is: "+randomSeed);
    }
    
    document.getElementById("currentSeed").textContent = (randomSeed).toString(); 
    Math.seedrandom(randomSeed);
    var totalNodes = parseInt(document.getElementById("totalNodes").value);
    var totalConnections = parseInt(document.getElementById("totalConnections").value);
    current_screen.startup(totalNodes,totalConnections);
});

$("#next-step-btn").click(function() {
    if(current_screen.foundPathGetter==true){
        console.log("1")
        current_screen.end_game();
    }else if(current_screen.algoGetter = "dfs"){
        current_screen.Depthfirstsearch();
    }else if(current_screen.algoGetter = "bfs"){
        current_screen.breadthfirstsearch();
    }
    
});

function current_Finite_Machine() {

    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.nodes = [];
    this.connections = [];
    this.startNode = null;
    this.endNode = null;
    this.algorithm = null;
    this.visited = new Set();
    this.found_path = false;
    this.frontier = [];
    this.observedNode = null;
    this.first_run = true;

    this.startup =function(totalNodes,totalConnections){
        this.ctx  = this.canvas.getContext("2d");
        this.nodes = generateNodes(totalNodes);
        console.log(this.nodes);
        this.connections = connectNodes(this.nodes, totalConnections);

        // Add nodes to the canvas
        for (var i = 0; i < this.nodes.length; i++) {
            var node = this.nodes[i];
            var nodeEl = $("<div>", {
                class: "node",
                id: i,
                text: i + 1
            })
            $("#canvas").after(nodeEl);
            nodeEl.css({
                left: node.x - 10,
                top: node.y - 10
            }).draggable({
                containment: "parent",
                drag: function(event, ui) {
                    var index = $(this).text() - 1;
                    current_screen.nodes[index].x = ui.position.left + 10;
                    current_screen.nodes[index].y = ui.position.top + 10;
                    drawConnections();
                }
                

            });
        }
        // Draw initial connections on canvas
        drawConnections();
    }

    this.wipeCanvas =function(){
        // Get the 2D context of the canvas
        var context = canvas.getContext("2d");

        // Set the fill color to white
        context.fillStyle = "#808080";

        // Clear the entire canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        nodes=[]
        // Get a collection of all elements with the "my-class" class
        var elements = document.querySelectorAll('.node');

        // Loop through the collection and remove each element
        for (var i = 0; i < elements.length; i++) {
        elements[i].parentNode.removeChild(elements[i]);
        }
    }
    

    this.end_game =function(path){
        
        document.getElementById((this.observedNode).toString()).classList.remove("observed-node");

        path.forEach(function (aNode, i) {

            document.getElementById((aNode).toString()).classList.add("end-game-path");
            
        });
        document.getElementById((this.startNode).toString()).classList.add("start-node");
        document.getElementById((this.endNode).toString()).classList.add("the-goal");
    }



    this.initializer =function(sstartNode,eendNode,aalgorithm){
        
        this.visited = new Set();
        this.startNode=sstartNode
        this.endNode=eendNode
        this.algorithm=aalgorithm
        this.new_ObservedNode(this.startNode);
        if (this.isGoalState(this.observedNode)){
            this.found_path=true;
        }

        this.frontier = [{ node: this.observedNode, path: [], costs: [] }];
        
    }
    this.Depthfirstsearch =function(){
        var successor;
        var newCost;
        console.log("dfs");
        if(this.frontier.length){
            console.log("dead end?")
        }
        console.log(this.frontier)
        const { node, path, costs } = this.frontier.pop();
        
        // see if we hit the goal yet
        if (this.isGoalState(node)){
            this.found_path=true;
            // sends the path to end game
            
            this.end_game(path);
        }else if(!(this.visited.has(node))){
            if(this.first_run){
                this.first_run=false;
            }else{
                this.new_ObservedNode(node);
            }
            this.visited.add(node);
            for (let [successor, newCost] of this.getNeighbors(node)){
                if(!(this.visited.has(successor))){
                    this.wasComputer(successor);
                    this.frontier.push({node:successor,path:path.concat([node]),costs: costs.concat([newCost])})
                }
            }
        }

    }
    this.breadthfirstsearch =function(){
        console.log("bfs");


        if(this.frontier.length){
            console.log("dead end?")
        }
        const { node, path, costs } = this.frontier.pop();

        // see if we hit the goal yet
        if (this.isGoalState(node)){
            this.found_path=true;
            // sends the path to end game
            console.log("3")
            this.end_game(path);
        }else if(!(this.visited.has(node))){
            if(this.first_run){
                this.first_run=false;
            }else{
                this.new_ObservedNode(node);
            }
            this.visited.add(node);
            for (let [successor, newCost] of this.getNeighbors(node)){
                if(!(visited.has(successor))){
                    this.wasComputer(successor);
                    this.frontier.unshift({node:successor,path:path.concat([node]),costs: costs.concat([newCost])})
                }
            }
        }
    }


    this.isGoalState =function(node){
        console.log(node)
        console.log(this.endNode)
        if(node==this.endNode){
            return true;
        }
        return false;

    }

    this.getNeighbors =function(theNode){
        var neighbors=[];

        for (var i = 0; i < this.connections.length; i++) {
            // Check only the first connection object in each pair
            var connection = this.connections[i][0];
            if (((connection.start === theNode)) || (connection.end === theNode)) {
                if(connection.start === theNode){
                    neighbors.push([connection.end,connection.cost]);
                }else{
                    neighbors.push([connection.start,connection.cost]);
                }
            }
        }
        return neighbors;

    }

    this.new_ObservedNode =function(newNode){
        // Sets classes of nodes, by changing background colors of them, to visualize where the search is
        var dune;
        // if observed node is not initilaized, it gets skipped
        if (this.observedNode !=dune){
            document.getElementById((newNode).toString()).classList.remove("observed-node");
            document.getElementById((this.observedNode).toString()).classList.add("visited-node");
        }
            this.observedNode = newNode;
            document.getElementById((newNode).toString()).classList.add("observed-node");
    }

    // this is like this.new_ObservedNode, but instead shows what the thing added in to neighbors
    this.wasComputer =function(theNode){
        document.getElementById((theNode).toString()).classList.add("was-computer");
    }

    this.foundPathGetter = function(){
        return this.found_path;
    }
    this.algoGetter = function(){
        return this.algorithm;
    }
}

// Generate random nodes
function generateNodes(count) {
    var nodes = [];
    var canvas = $("#canvas");
    var canvasWidth = canvas.width();
    var canvasHeight = canvas.height();
    for (var i = 0; i < count; i++) {
        var x = Math.floor(Math.random() * canvasWidth);
        var y = Math.floor(Math.random() * canvasHeight);
        nodes.push({
            x: x,
            y: y
        });
    }
    return nodes;
}


// This function connects nodes in a graph by creating connections between them.
// It takes in a list of nodes and the desired number of connections.
// It returns an array of connections in the form of [startNode, endNode, cost].
function connectNodes(nodes, count) {
    const connections = [];
    // a set to hold nodes that are already connected
    const connectedNodes = new Set();
    // Ensure that all nodes have at least one connection
    // For each node, connect it to another random node if it isn't already connected
    for (let i = 0; i < nodes.length; i++) {
        const start = i;
        let end = i;
        // check if end is already connected or equal to start
        while ((end === i || isConnected(connections,start, end))&&checkIntersection(converterPoint(start,end,nodes),connections,nodes)) {
            end = Math.floor(Math.random() * nodes.length);
        }
        const cost = Math.floor(Math.random() * 10) + 1;
        connections.push([{
            start,
            end,
            cost
        }, {
            start: end,
            end: start,
            cost
        }]);
        connectedNodes.add(start);
        connectedNodes.add(end);
    }

    // Connect nodes to a maximum of three neighbors
    // For each unconnected node, connect it to up to three random neighbors
    for (let i = 0; i < count - nodes.length; i++) {
        // check if all nodes are already connected
        if (connectedNodes.size === nodes.length) {
            break;
        }
        // pick an unconnected node to start from
        let start;
        do {
            start = Math.floor(Math.random() * nodes.length);
        } while (connectedNodes.has(start));
        let attempts = 0;
        // repeat until we have enough connections or 100 attempts have been made
        while (connections.length < count && attempts < 100) {
            attempts++;
            const neighbors = nodes.map((node, index) => ({
                    node,
                    index
                })).filter(({
                    index
                }) => index !== start && !isConnected(connections,start, index) && !isConnected(connections,index, end)) // get all unconnected neighbors
                .map(({
                    index
                }) => index);
            // if there are less than three neighbors, connect the current node to a random unconnected node
            if (neighbors.length < 3) {
                let end = Math.floor(Math.random() * nodes.length);
                // keep picking new nodes until an unconnected one is found
                while (isConnected(connections,start, end)&& checkIntersection(converterPoint(start,end,nodes),connections,nodes)) {
                    end = Math.floor(Math.random() * nodes.length);
                }
                // randomly assign a cost to the connection, adds it to both connect and connectednodes
                const cost = Math.floor(Math.random() * 10) + 1;
                connections.push([{
                    start,
                    end,
                    cost
                }, {
                    start: end,
                    end: start,
                    cost
                }]);
                connectedNodes.add(end);
            } else {
                // if there are already three neighbors, we're done
                break;
            }
        }
    }
    // print a message indicating that the implementation has been changed
    console.log("Reconnected the nodes");
    // return the array of connections
    return connections;
}

function converterPoint(start,end,nodes){
    //console.log("start",start);
    //console.log("end",end);
    //console.log("nodes",nodes);
    startNode = {x:nodes[start].x, y:nodes[start].y};
    endNode = {x:nodes[end].x, y:nodes[end].y};
    //console.log("nodes[start]",nodes[start]);

    return [startNode,endNode];
}


function checkIntersection(newConn, existingConns,nodes) {
    console.log("newConn",newConn);
    console.log("existingConns",existingConns);

    for (let i = 0; i < existingConns.length - 1; i++) {
        const conn1 = nodes[existingConns[i][0].start];
        const conn2 = nodes[existingConns[i][0].end];

        
        const line1 = [newConn[0].x, newConn[0].y, newConn[1].x, newConn[1].y];
        const line2 = [conn1.x, conn1.y, conn2.x, conn2.y];
        console.log("lines 1",line1);
        console.log("lines 2",line2);
        const slope1 = (line1[1] - line1[3]) / (line1[0] - line1[2]);
        const yIntercept1 = line1[1] - slope1 * line1[0];

        const slope2 = (line2[1] - line2[3]) / (line2[0] - line2[2]);
        const yIntercept2 = line2[1] - slope2 * line2[0];
        
        if (slope1 === slope2) {
        // lines are parallel, no intersection
        continue;
        }

        const x = (yIntercept2 - yIntercept1) / (slope1 - slope2);
        const y = slope1 * x + yIntercept1;

        const y1 = slope1 * line1[0] + yIntercept1;
        const y2 = slope1 * line1[2] + yIntercept1;
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);

        if (y >= minY && y <= maxY) {
        // lines intersect, don't draw the new connection
        console.log("lines intersect, don't draw the new connection");
        return false;
        }

    }
    console.log("no intersections found, draw the new connection");
    // no intersections found, draw the new connection
    return true;
}



// Helper function to check if two nodes are already connected
function isConnected(connections,start, end) {
    for (var i = 0; i < connections.length; i++) {
        // Check only the first connection object in each pair
        var connection = connections[i][0];
        if ((connection.start === start && connection.end === end) || (connection.start === end && connection.end === start)) {
            return true;
        }
    }
    return false;
}


// Draw connections on canvas
function drawConnections() {
    
    current_screen.ctx.clearRect(0, 0, canvas.width, canvas.height);
    current_screen.ctx.font = "20px Arial";
    for (var i = 0; i < current_screen.connections.length; i++) {
        var connection = current_screen.connections[i][0];
        var startNode = current_screen.nodes[connection.start];
        var endNode = current_screen.nodes[connection.end];
        var cost = connection.cost;
        // Calculate midpoint of line for label placement
        var midX = (startNode.x + endNode.x) / 2;
        var midY = (startNode.y + endNode.y) / 2;
        // Draw line between nodes
        current_screen.ctx.beginPath();
        current_screen.ctx.moveTo(startNode.x, startNode.y);
        current_screen.ctx.lineTo(endNode.x, endNode.y);
        current_screen.ctx.stroke();
        // Add cost label to the middle of the line
        current_screen.ctx.fillStyle = "#000";
        current_screen.ctx.fillText(cost, midX, midY);
    }
}
