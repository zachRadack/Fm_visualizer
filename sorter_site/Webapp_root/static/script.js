//import seedrandom from 'seedrandom';
// Initialize canvas



var canvas;
var ctx;
var nodes;
var connections;
// Generate nodes and connections
function startup(totalNodes,totalConnections){
    canvas = document.getElementById("canvas");
    ctx  = canvas.getContext("2d");
    nodes = generateNodes(totalNodes);
    console.log(nodes);
    connections = connectNodes(nodes, totalConnections);

    // Add nodes to the canvas
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
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
                nodes[index].x = ui.position.left + 10;
                nodes[index].y = ui.position.top + 10;
                drawConnections();
            }
            
    
        });
    }
    // Draw initial connections on canvas
    drawConnections();
}

var algorithm;
var startNode;
var endNode;
var visited =new Set();
var frontier;

var first_run =true;
var found_path =false;


var observedNode;
var neighbors = [];

// Handle button click
$("#start-btn").click(function() {
    
    startNode = parseInt($("#start").val());
    //colorNode(startNode,"red");
    endNode = parseInt($("#end").val());
    algorithm = $("#algorithm").val();
    console.log("Start node: " + startNode);
    console.log("End node: " + endNode);
    console.log("Algorithm: " + algorithm);

    // algorithm logic below here

    // handles the start
    initializer();

    if(algorithm = "dfs"){
        Depthfirstsearch();
    }else if(algorithm = "bfs"){
        breadthfirstsearch();
    }
});

$("#Create-canvas-btn").click(function() {
    var randomSeed = document.getElementById("seedTextBox").value;
    if (randomSeed.length == 0) {
        randomSeed = (Math.random()).toString();
        console.log("The current random seed is: "+randomSeed);
    }

    document.getElementById("currentSeed").textContent = (randomSeed).toString(); 
    Math.seedrandom(randomSeed);
    var totalNodes = parseInt(document.getElementById("totalNodes").value);
    var totalConnections = parseInt(document.getElementById("totalConnections").value);
    startup(totalNodes,totalConnections);
});

$("#next-step-btn").click(function() {
    if(found_path==true){
        end_game();
    }else if(algorithm = "dfs"){
        Depthfirstsearch();
    }else if(algorithm = "bfs"){
        breadthfirstsearch();
    }
    
});

function end_game(path){
    
    //document.getElementById((observedNode).toString()).classList.remove("observed-node");

    path.forEach(function (aNode, i) {

        document.getElementById((aNode).toString()).classList.add("end-game-path");
        
      });
      document.getElementById((startNode).toString()).classList.add("start-node");
      document.getElementById((endNode).toString()).classList.add("the-goal");
}



function initializer(){
    
    visited = new Set();
    new_ObservedNode(startNode);
    if (isGoalState(observedNode)){
        found_path=true;
    }

    frontier = [{ node: observedNode, path: [], costs: [] }];
    
}
function Depthfirstsearch(){
    var successor;
    var newCost;
    console.log("dfs");
    if(frontier.length){
        console.log("dead end?")
    }
    const { node, path, costs } = frontier.pop();
    
    // see if we hit the goal yet
    if (isGoalState(node)){
        found_path=true;
        // sends the path to end game
        end_game(path);
    }else if(!(visited.has(node))){
        if(first_run){
            first_run=false;
        }else{
            new_ObservedNode(node);
        }
        visited.add(node);
        for (let [successor, newCost] of getNeighbors(node)){
            if(!(visited.has(successor))){
                wasComputer(successor);
                frontier.push({node:successor,path:path.concat([node]),costs: costs.concat([newCost])})
            }
        }
    }

}
function breadthfirstsearch(){
    console.log("bfs");
    var successor;
    var newCost;
    console.log("dfs");
    if(frontier.length){
        console.log("dead end?")
    }
    const { node, path, costs } = frontier.pop();

     // see if we hit the goal yet
     if (isGoalState(node)){
        found_path=true;
        // sends the path to end game
        end_game(path);
    }else if(!(visited.has(node))){
        if(first_run){
            first_run=false;
        }else{
            new_ObservedNode(node);
        }
        visited.add(node);
        for (let [successor, newCost] of getNeighbors(node)){
            if(!(visited.has(successor))){
                wasComputer(successor);
                frontier.unshift({node:successor,path:path.concat([node]),costs: costs.concat([newCost])})
            }
        }
    }
}


function isGoalState(node){
    if(node==endNode){
        return true;
    }
    return false;

}

function getNeighbors(theNode){
    var neighbors=[];

    for (var i = 0; i < connections.length; i++) {
        // Check only the first connection object in each pair
        var connection = connections[i][0];
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

function new_ObservedNode(newNode){
    // Sets classes of nodes, by changing background colors of them, to visualize where the search is
    var dune;
    // if observed node is not initilaized, it gets skipped
    if (observedNode !=dune){newNode
        document.getElementById((newNode).toString()).classList.remove("observed-node");
        document.getElementById((observedNode).toString()).classList.add("visited-node");
    }
        observedNode = newNode;
        document.getElementById((newNode).toString()).classList.add("observed-node");
}

// this is like new_ObservedNode, but instead shows what the thing added in to neighbors
function wasComputer(theNode){
    document.getElementById((theNode).toString()).classList.add("was-computer");
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
        while (end === i || isConnected(connections,start, end)) {
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
                while (isConnected(connections,start, end)) {
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "20px Arial";
    for (var i = 0; i < connections.length; i++) {
        var connection = connections[i][0];
        var startNode = nodes[connection.start];
        var endNode = nodes[connection.end];
        var cost = connection.cost;
        // Calculate midpoint of line for label placement
        var midX = (startNode.x + endNode.x) / 2;
        var midY = (startNode.y + endNode.y) / 2;
        // Draw line between nodes
        ctx.beginPath();
        ctx.moveTo(startNode.x, startNode.y);
        ctx.lineTo(endNode.x, endNode.y);
        ctx.stroke();
        // Add cost label to the middle of the line
        ctx.fillStyle = "#000";
        ctx.fillText(cost, midX, midY);
    }
}
