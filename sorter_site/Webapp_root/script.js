//import { PriorityQueue } from "./Priority_Queue_nodes.js";
 

var canvas=document.getElementById("canvas");

var current_screen=new current_Finite_Machine();

// this creates canvas
$("#Create-canvas-btn").click(function() {
    current_screen=new current_Finite_Machine();
    wipeCanvas();
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

// handles the starting of the algorithm, and sets everything in
$("#start-btn").click(function() {
        
    var startNode = parseInt($("#start").val());
    //colorNode(startNode,"red");
    var endNode = parseInt($("#end").val());
    var algorithm = $("#algorithm").val();
    console.log("Start node: " + startNode);
    console.log("End node: " + endNode);
    console.log("Algorithm: " + algorithm);

    current_screen.initializer(startNode,endNode,algorithm);

    if(algorithm = "dfs"){
        current_screen.Depthfirstsearch();
    }else if(algorithm = "bfs"){
        current_screen.breadthfirstsearch();
    }
});

// this pushes the algorithm through a single step.
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

// THIS IS NOT USED YET, I need to figure out how to make it work. 
// also I basically need to overhaul every action with nodes to use this instead
function nodeClass(x,y){
    this.nodeNumber;
    this.x=x;
    this.y=y;
    this.NodeConnection=[];


    // send in the node object that you want to get the cost, if they are connected
    this.getCost = function(theNodeOfDesire){ 
        if(this.NodeConnection.length>0){
            var areConnected = areTheyConnected(theNodeOfDesire,true); 
            if(areConnected[0]){
                return this.NodeConnection[areConnected[1]].cost;
            }
        }
    }
    this.setCords = function(cords){
        this.cords=cords;
    }
    this.getCords = function(){ 
        return this.cords;
    }
    this.setnodeNumber = function(nodeNumber){
        this.nodeNumber=nodeNumber;
    }
    this.getNodeNumber = function(){
        return this.nodeNumber;
    }

    
    
    
    this.addConnection= function(neighbors_Node){
        this.NodeConnection.push(neighbors_Node);
    }

    this.areTheyConnected = function(theNodeOfDesire,returnTheIndex=false){
        for(var i=0;i<this.NodeConnection.length;i++){
            if(this.NodeConnection[i].nodeObject==theNodeOfDesire){
                if(returnTheIndex){
                    return [true,i];
                }else{
                    return true;
                }
            }
        }
        if(returnTheIndex){
            return [false,-1];
        }else{
            return true;
        }
    }


}
// This is the current instance of the finite machine.
// this is where all the machine happens, and the way to reset this is by
// setting current_screen to a new instance of this class.
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


    this.nodeClassObjects= [];

    // setups the canvas and stuff. Handles the creation of the nodes and connections.
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
        startEnd_Node_Selector(totalNodes);
    }

    // this is when the user clicks "start/reset" button
    // the startup handles the canvas creation, this handles the start of the
    // search algorithm.
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


    
    // handles when the search algos find the goal node
    this.end_game =function(path){
        // this will set the goal to be "end-game-path" meaning it will become the goal 
        // node color (as of time of writing this, it is pink.)
        // then it goes through with the current path and makes it set to the observed node color
        // which is green.
        document.getElementById((this.observedNode).toString()).classList.remove("observed-node");

        path.forEach(function (aNode, i) {

            document.getElementById((aNode).toString()).classList.add("end-game-path");
            
        });
        document.getElementById((this.startNode).toString()).classList.add("start-node");
        document.getElementById((this.endNode).toString()).classList.add("the-goal");
    }




    
    // this is the depth first search algorithm
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

    // this is the breadth first search algorithm
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


    // this function checks to see if the current node is 
    // the goal node. If it is, then it returns true, else
    // it returns false.
    this.isGoalState =function(node){
        console.log(node)
        console.log(this.endNode)
        if(node==this.endNode){
            return true;
        }
        return false;

    }

    // get all the neighbors of a node, but only connection neighbors
    // not physical neighbors on the canvas.
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

    // this function handles making current node green and if there already is one
    // it will first remove that ones  observed-node class and add visited-node class, which makes it red
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
    // This function is what makes the nodes become light blue.
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

// handles creating more node options under the start end drop down menus
// if the user wants 20 nodes this shows 20 options in both start and end drop downs.
function startEnd_Node_Selector(nodes){
    //<option value="0">Node 1</option>
    console.log(nodes);
    if(nodes>2){
        for (var i = 3; i < nodes+1; i++) {
            var node_counterstart = document.createElement('option');
            node_counterstart.value= i-1;
            node_counterstart.text= ("Node "+parseInt(i));
            var node_counterend = document.createElement('option');
            node_counterend.value= i-1;
            node_counterend.text= ("Node "+parseInt(i));
            document.querySelector('#start').appendChild(node_counterstart);
            document.querySelector('#end').appendChild(node_counterend);
        }
    }
}

// creates the actual nodes by putting them into the html and puts them
// where ever the coordinates are setup to.
function generateNodes(count) {
    var nodes = [];
    var canvas = $("#canvas");
    var canvasWidth = canvas.width();
    var canvasHeight = canvas.height();
    var nodeObjectList=[];
    for (var i = 0; i < count; i++) {
        var x = Math.floor(Math.random() * canvasWidth);
        var y = Math.floor(Math.random() * canvasHeight);
        nodeObjectList.push(new nodeClass(x,y));
        //nodes.push({
        //    x: x,
        //    y: y
        //});
    }
    return nodeObjectList;
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
        end = findClosestedNeighbor(start, nodes,2);
        
        for (a = 0; a < end.length; a++) {
            const cost = Math.floor(Math.random() * 10) + 1;
            connections.push(createConnectionObject(start,end[a],cost));
            connectedNodes.add(start);
            connectedNodes.add(end[a]);
        }
    }


    // print a message indicating that the implementation has been changed
    console.log("Reconnected the nodes");
    // return the array of connections
    return connections;
}

// this creates a connection object, which is used to figure out 
// what nodes are connected to what, along with the cost of the connection
function createConnectionObject(start,end,cost){
    return [{
        start,
        end,
        cost
    }, {
        start: end,
        end: start,
        cost
    }]
}

// finds numberOfNeighbors of closest neighbors to the node
// it will be used to connect nodes to each other as of now
// not yet properly connected up the system
function findClosestedNeighbor(node, nodes,numberOfNeighbors) {
    console.log(node);
    console.log(nodes);
    curNumb=0;
    const neighbors = new PriorityQueue((a, b) => a[1] > b[1])
    for (var i = 0; i < nodes.length; i++) {
        if (node !== i) {
            neighbors.push([i, manhattanDistance(nodes[node],nodes[i])]);
        }
    }
    var returnList = [];
    for (var i = 0; i < numberOfNeighbors; i++) {
        var curneighbor = neighbors.pop()[0];

        console.log(curneighbor);
        console.log(nodes[curneighbor]);
        console.log(nodes[node]);
        returnList.push(curneighbor);
    
    }
    
    console.log(returnList);
    return returnList;
}

// get the x y distance between two nodes, this will update where ever the node is currently
// however, remeber, NODES CAN MOVE! Use this to get a snapshot of the current canvas
// but do not assume that the nodes will stay in the same place
function manhattanDistance(node1,node2){
    return -(Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y));
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


// Draw connections on canvas and puts the path cost on the line
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


// this deletes all current nodes from the last layuout
function wipeCanvas(){
    // Get a collection of all elements with the "my-class" class
    var elements = document.querySelectorAll('.node');

    // Loop through the collection and remove each element
    for (var i = 0; i < elements.length; i++) {
    elements[i].parentNode.removeChild(elements[i]);
    }
}