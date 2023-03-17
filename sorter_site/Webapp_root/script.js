//import { PriorityQueue } from "./Priority_Queue_nodes.js";
 

var canvas=document.getElementById("canvas");

var current_screen=new current_Finite_Machine();

// this creates canvas
$("#Create-canvas-btn").click(function() {
    document.getElementById("curConenctionId").textContent = "None";
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
        current_screen.end_game();
    }else if(current_screen.algoGetter = "dfs"){
        current_screen.Depthfirstsearch();
    }else if(current_screen.algoGetter = "bfs"){
        current_screen.breadthfirstsearch();
    }
});

// THIS IS NOT USED YET, I need to figure out how to make it work. 
// also I basically need to overhaul every action with nodes to use this instead
function nodeClass(x,y,nodeNum,isItGoal=false){
    this.nodeNumber=nodeNum;
    this.x=x;
    this.y=y;
    this.NodeConnection=[];
    
    this.isGoal = isItGoal;
    // has it been visited
    this.visited = false;
    // this is when the algorithem is currently looking at it
    this.isObserved=false;
    // this is for when a loop went over this node
    // if this is true it means that it was added to a list of choices somewhere
    this.wasComputed =false;

    // makes the goal a node
    this.makeNodeGoal = function(){
        this.isGoal = true;
    }

    this.setWasComputed = function(){
        this.wasComputed =true;
        document.getElementById((this.nodeNumber).toString()).classList.add("was-computer");
    }
    this.isThisGoal = function(){
        return this.isGoal;
    }
    // send in the node object that you want to get the cost, if they are connected
    this.getCost = function(theNodeOfDesire){ 
        if(this.NodeConnection.length>0){
            var areConnected = areTheyConnected(theNodeOfDesire,true); 
            if(areConnected[0]){
                return this.NodeConnection[areConnected[1]].cost;
            }
        }
    }
    
    //sets cords, cords has to be formatted as an object
    // {x:x,y:y}
    this.setCords = function(cords){
        this.x=cords.x;
        this.y=cords.y;
    }
    this.getCords = function(){ 
        return {x:this.x,y:this.y};
    }
    this.setnodeNumber = function(nodeNumber){
        console.log(this.nodeNumber)
        this.nodeNumber=nodeNumber;
        console.log(this.nodeNumber)
    }
    this.getNodeNumber = function(){
        return this.nodeNumber;
    }

    
    
    // Connections are objects that have a refrence to the connected node
    // and the cost to said node. Also adding a connection is 2 way
    // secondarycall is used to prevent infinite recursion.
    this.addConnection= function(neighbors_Node,cost,secondarycall=true){
        let a = this.nodeNumber;// delete later, meant for debuging
        if(secondarycall==true){
            neighbors_Node.addConnection(this,cost,false);
        }
        if(!(this.areTheyConnected(neighbors_Node))){
            this.NodeConnection.push({node:neighbors_Node,cost:cost});
            this.connectionPrinter(neighbors_Node,cost);
            return true;
        }else{
            return false;
        }
    }

    // this adds to curConenctionId the current connection
    this.connectionPrinter=function(neighbors_Node,cost){
        // Get the current content of curConenctionId element
        let curConenctionId = document.getElementById("curConenctionId").textContent;
        if(curConenctionId=="None"){
            curConenctionId = "";
        }
        // Append the new connection details to the existing content
        
        const newConnection = `[${this.nodeNumber}] => [${neighbors_Node.nodeNumber}] XX `;
        const updatedConenctionId = `${curConenctionId}${newConnection}`;

        // Set the updated content to curConenctionId element
        document.getElementById("curConenctionId").textContent = updatedConenctionId;
    }

    // checks to see if the given node is connected to this node, returnTheIndex
    // will return an array with both the boolean with true being a connection, and if there is connection it
    // will return the index of the connection in the array, and if there is no connection, it returns -1
    this.areTheyConnected = function(theNodeOfDesire,returnTheIndex=false){
        for(var i=0;i<this.NodeConnection.length;i++){
            if(this.NodeConnection[i].node.nodeNumber==theNodeOfDesire.nodeNumber){
                if(returnTheIndex){
                    return [true,i];
                    
                }else{
                    return true;
                }
            }
        }
        // there was no connection
        if(returnTheIndex){
            return [false,-1];
        }else{
            return false;
        }
    }

    // returns array of neighbors
    // the array that is returned has objects that are
    // formatted as {node:refrence to node, cost:cost to node}
    this.getNeighbors = function(returnCost = false){
        if(!(returnCost)){
            return this.NodeConnection.map(function(item) { return item["node"]; })
        }
        return this.NodeConnection;
    }

    // if it is already observed, then it will be removed, and set to become a visitor
    this.setObserver = function(setToVisitor=true){
        if(this.isObserved){
            if(setToVisitor){
                this.setVisited();
            }
            document.getElementById((this.nodeNumber).toString()).classList.remove("observed-node");
            this.isObserved = false;
        }else{
            document.getElementById((this.nodeNumber).toString()).classList.add("observed-node");
            this.isObserved = true;
        }
    }
    //sets current node as visitor
    this.setVisited = function(){
        if(this.nodeNumber== 2){
            console.log("hii");
        }
        this.visited = true;
        document.getElementById((this.nodeNumber).toString()).classList.add("visited-node");
    }

    
}



/////////////////////////////////////////////////////////////////
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
        console.log("this nodes startup: ", this.nodes)
        
        connectNodes(this.nodes, totalConnections);

        // Add nodes to the canvas
        for (var i = 0; i < this.nodes.length; i++) {
            var node = this.nodes[i];
            node.nodeNumber = i;
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
                    drawConnections(current_screen.nodes);
                }
            });
        }
        // Draw initial connections on canvas
        startEnd_Node_Selector(totalNodes);
    }


    
    // this is when the user clicks "start/reset" button
    // the startup handles the canvas creation, this handles the start of the
    // search algorithm.
    this.initializer =function(startNode,endNode,aalgorithm){
        
        this.startNode=startNode
        this.endNode=endNode
        this.algorithm=aalgorithm

        // this sets up the start node to be the current observer node
        // while also setting up the endnode to be the goal
        this.new_ObservedNode(this.nodes[this.startNode]);
        this.nodes[this.endNode].makeNodeGoal();
        if (this.observedNode.isThisGoal()){
            this.found_path=true;
        }
        this.frontier = [{newNode:this.observedNode,path: []}];
        console.log("");
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
        console.log("dfs");
        if(this.frontier.length){
            console.log("dead end?")
        }

        
        
        const {newNode, path} = this.frontier.pop();
        console.log("hayy: " , this.nodes[2].visited, " here is number ", this.nodes[2].nodeNumber);
        // see if we hit the goal yet
        if (newNode.isThisGoal()){
            this.found_path=true;
            // sends the path to end game
            console.log("bump");
            this.end_game(path);
        }else if(!(newNode.visited)){
            if(this.first_run){
                this.first_run=false;
            }else{
                this.new_ObservedNode(newNode);
            }
            for (let successor of newNode.getNeighbors()){
                //console.log(successor);
                console.log("hayy: " , this.nodes[2].visited, " here is number ", this.nodes[2].nodeNumber, " heres the nodes: ", this.nodes);
                if(!(successor.visited)){
                    successor.setWasComputed();
                    this.frontier.push({newNode:successor,path:path.concat([successor])})
                }
            }
        }else if(newNode.visited){
            console.log("ALREADY VISITED");
            this.Depthfirstsearch();
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
        if(node==this.endNode){
            return true;
        }
        return false;

    }

    // this function handles making current node green and if there already is one
    // it will first remove that ones  observed-node class and add visited-node class, which makes it red
    this.new_ObservedNode =function(newNode){
        // Sets classes of nodes, by changing background colors of them, to visualize where the search is
        let dune;
        // if observed node is not initilaized, it gets skipped
        if (this.first_run == false){
            this.observedNode.setObserver();
        }
        this.observedNode = newNode;
        this.observedNode.setObserver();
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
    if(nodes>2){
        for (let i = 3; i < nodes+1; i++) {
            let node_counterstart = document.createElement('option');
            node_counterstart.value= i-1;
            node_counterstart.text= ("Node "+parseInt(i));
            let node_counterend = document.createElement('option');
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
    var canvas = $("#canvas");
    var canvasWidth = canvas.width();
    var canvasHeight = canvas.height();
    var nodeObjectList=[];
    for (var i = 0; i < count; i++) {
        var x = Math.floor(Math.random() * canvasWidth);
        var y = Math.floor(Math.random() * canvasHeight);
        nodeObjectList.push(new nodeClass(x,y,i));
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
    console.log("connectNodes ", nodes);
    
    // Ensure that all nodes have at least one connection
    // For each node, connect it to another random node if it isn't already connected
    for (let i = 0; i < nodes.length; i++) {
        const start = i;
        
        // check if end is already connected or equal to start
        let end = findClosestedNeighbor(start, nodes,count);
        
        for (a = 0; a < end.length; a++) {
            const cost = Math.floor(Math.random() * 10) + 1;
            //connections.push(createConnectionObject(start,end[a],cost));
            let didItConnect= nodes[i].addConnection(end[a],cost);
            if(didItConnect){
                drawConnectionLine_middleman(nodes[i],end[a],cost);
            }
        }
    }

    // print a message indicating that the implementation has been changed
    console.log("Reconnected the nodes");
    // return the array of connections
    //return connections;
}


// finds numberOfNeighbors of closest neighbors to the node
// it will be used to connect nodes to each other as of now
// not yet properly connected up the system
function findClosestedNeighbor(node, nodes,numberOfNeighbors) {
    curNumb=0;

    // used a priority queue in hopes of finding closest neighbors
    const neighbors = new PriorityQueue((a, b) => a[1] > b[1])
    for (var i = 0; i < nodes.length; i++) {
        if (node !== i) {
            neighbors.push([nodes[i], manhattanDistance({x:nodes[node].x,y:nodes[node].y},{x:nodes[i].x,y:nodes[i].y})]);
        }
    }
    var returnList = [];
    for (var i = 0; i < numberOfNeighbors; i++) {
        var curneighbor = neighbors.pop()[0];
        returnList.push(curneighbor);
    }
    
    return returnList;
}

// get the x y distance between two nodes, this will update where ever the node is currently
// however, remeber, NODES CAN MOVE! Use this to get a snapshot of the current canvas
// but do not assume that the nodes will stay in the same place
function manhattanDistance(node1,node2){
    return -(Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y));
}

// Draw connections on canvas and puts the path cost on the line
function drawConnections(nodes) {
    current_screen.ctx.clearRect(0, 0, canvas.width, canvas.height);
    current_screen.ctx.font = "20px Arial";
    for (var i = 0; i < nodes.length; i++) {
        var connection = nodes[i].getNeighbors(true);
        var startNode = nodes[i].getCords();
        //console.log("drawConnections: ",connection);
        // This itterates through all the connections of the current node
        for (var a = 0; a < connection.length; a++) {
            var endNode = connection[a].node.getCords();
            var cost = connection[a].cost;
            drawConnectionLine(startNode,endNode,cost);
        }
    }
}


function drawConnectionLine_middleman(startNode,endNode,cost){
    current_screen.ctx.font = "20px Arial";
    drawConnectionLine(startNode,endNode,cost);
}

function drawConnectionLine(startNode,endNode,cost){
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

// this deletes all current nodes from the last layuout
function wipeCanvas(){
    current_screen.ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Get a collection of all elements with the "my-class" class
    var elements = document.querySelectorAll('.node');
    
    // Loop through the collection and remove each element
    for (var i = 0; i < elements.length; i++) {
    elements[i].parentNode.removeChild(elements[i]);
    }
}