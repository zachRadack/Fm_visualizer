//import { PriorityQueue } from "./Priority_Queue_nodes.js";
 

var canvas=document.getElementById("canvas");

var current_screen=new current_Finite_Machine();

var animationFrame = -1;
// this creates canvas
$("#Create-canvas-btn").click(function() {
    document.getElementById("curConenctionId").textContent = "None";
    document.getElementById("curPathId").textContent = "None";

    current_screen.cancelAnimation();
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
    var isItSimulated = document.querySelector('#isItSimulated').checked;
    console.log(isItSimulated);
    current_screen.startup(totalNodes,totalConnections,isItSimulated);
    
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

    if(algorithm == "dfs"){
        current_screen.shouldItDrawCosts=false;
        current_screen.Depthfirstsearch();
    }else if(algorithm == "bfs"){
        current_screen.shouldItDrawCosts=false;
        current_screen.breadthfirstsearch();
    }else if(current_screen.algorithmGetter() == "Dijkstra"){
        current_screen.Dijkstra();
    }else if(current_screen.algorithmGetter() == "Astar"){
        current_screen.AstarAlgorithm();
    }
});

// this pushes the algorithm through a single step.
$("#next-step-btn").click(function() {
    if(current_screen.foundPathGetter==true){
        current_screen.end_game();
    }else if(current_screen.algorithmGetter() == "dfs"){
        current_screen.Depthfirstsearch();
    }else if(current_screen.algorithmGetter() == "bfs"){
        current_screen.breadthfirstsearch();
    }else if(current_screen.algorithmGetter() == "Dijkstra"){
        current_screen.Dijkstra();
    }else if(current_screen.algorithmGetter() == "Astar"){
        current_screen.AstarAlgorithm();
    }
}); 

// THIS IS NOT USED YET, I need to figure out how to make it work. 
// also I basically need to overhaul every action with nodes to use this instead
function nodeClass(x,y,nodeNum,isItGoal=false){
    this.nodeNumber=nodeNum;
    this.x=x;
    this.y=y;
    this.NodeConnection=[];
    this.connections = 0;
    
    // refrence to html
    this.HTMLnodes;

    this.isGoal = isItGoal;
    // has it been visited
    this.visited = false;
    // this is when the algorithem is currently looking at it
    this.isObserved=false;
    // this is for when a loop went over this node
    // if this is true it means that it was added to a list of choices somewhere
    this.wasComputed =false;

    this.heuristic= null;


    //this
    this.MaxMinsCosts = {maxCost: -10000,minCost: 10000}
    // Force Layout vars
    
    // inital velocity
    this.vx = 0;
    this.vy = 0;
    this.mass = 200;
    if(this.nodeNumber==0){
        this.mass= 300;
    }
    this.radius =60;
    this.beingDragged= false;

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
            var areConnected = this.areTheyConnected(theNodeOfDesire,true); 
            if(areConnected[0]){
                return this.NodeConnection[areConnected[1]].cost;
            }
        }
    }
    

    this.getCords = function(){ 
        return {x:this.x,y:this.y};
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
            this.connections+=1;
            return true;
        }else{
            return false;
        }
    }

    this.NewAngle= function(isthisRepeat=false){
        for(var i=0;i<this.NodeConnection.length;i++){
            let currentNeighbor =this.NodeConnection[i]
            currentNeighbor.current_angle = getAngle(this,currentNeighbor.node);
            if(isthisRepeat){
                currentNeighbor.node.NewAngle(true);
            }
            if(this.nodeNumber==0){
                document.getElementById("curPathId").textContent = this.NodeConnection[i].current_angle;
            }
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

    this.getHeuristicDistance= function(endnode){
        return manhattanDistance(this,endnode);
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
    
    this.startNode = null;
    this.endNode = null;
    
    this.visited = new Set();
    this.found_path = false;
    this.frontier = [];
    this.observedNode = null;
    
    this.theSimulator=false;
    
    // these are initiator values
    this.first_run = true;
    this.connectionsMade = false;

    this.connections= [];

    this.algorithm=null;
    
    // for things such as Astar
    this.currentHeuristic = null;
    this.isItSimulated = false;
    this.shouldItDrawCosts = true;

    // setups the canvas and stuff. Handles the creation of the nodes and connections.
    this.startup =function(totalNodes,totalConnections,isItSimulated){
        this.shouldItDrawCosts=true;
        this.isItSimulated = isItSimulated;
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
            //createConnectionElement(node,i);
            
            $("#canvas").after(nodeEl);
            nodeEl.css({
                left: node.x - 10,
                top: node.y - 10
            }).draggable({
                containment: "parent",
                drag: function(event, ui) {
                    var index = $(this).text() - 1;

                    current_screen.nodes[index].beingDragged=true;
                    current_screen.nodes[index].x = ui.position.left + 10;
                    current_screen.nodes[index].y = ui.position.top + 10;
                    
                    current_screen.nodes[index].NewAngle();
                    
                    drawConnections(current_screen.nodes);
                },
                stop: function(event, ui) {
                    var index = $(this).text() - 1;
                    current_screen.nodes[index].beingDragged=false;
                }
            });
            
        }
        
        // Draw initial connections on canvas
        startEnd_Node_Selector(totalNodes);
        
        // starts the force layout Simulation
        this.theSimulator = new simulation(this.canvas.offsetWidth,this.canvas.offsetHeight,this.nodes,isItSimulated);
    }

    // this makes it so the old animation stops, if this is not trigged, then if
    // you hit "load canvas" a second time, it will be using the nodes from the first canvas
    this.cancelAnimation= function(){
        // upon loading, this.theSimulator before any load canvas is used
        // is always false. Other than that, it should always be linked to a simulation.
        if(this.theSimulator!= false){
            this.theSimulator.stopAnimation();
        }
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
        if((this.algorithm== "dfs")||(this.algorithm== "bfs")){
            this.frontier = [{newNode:this.observedNode,path: []}];
        }else{
            this.frontier=new PriorityQueue((a, b) => a.cost < b.cost);
            this.frontier.push({newNode:this.observedNode,path: [],cost:0});
            console.log(this.frontier);
        }


    }

    // handles when the search algos find the goal node
    this.end_game =function(path){
        // this will set the goal to be "end-game-path" meaning it will become the goal 
        // node color (as of time of writing this, it is pink.)
        // then it goes through with the current path and makes it set to the observed node color
        // which is green.
        this.observedNode.setObserver();

        path.forEach(function (aNode, i) {
            console.log("aNode: ",aNode);
            document.getElementById((aNode.nodeNumber).toString()).classList.add("end-game-path");
            
        });
        // makes it so the goal is a diffrent color and start is too, making it easier to understand where
        // it is going
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
        if((newNode.visited&&(!this.first_run))){
            while((!newNode.visited)){
                // this should help with minor bug prevents "air bubble step" which is caused because 
                // if a node is computed twice, it will cause an air bubble step when it is vistied after
                // already having been visited
                const {newNode, path} = this.frontier.pop();
                
            }
        }
        this.PrintCurrentPath(path);
        //console.log("hayy: " , this.nodes[2].visited, " here is number ", this.nodes[2].nodeNumber);
        // see if we hit the goal yet
        if (newNode.isThisGoal()){
            this.found_path=true;
            // sends the path to end game
            console.log("Goal Found");
            this.end_game(path);
        }else if(!(newNode.visited)){
            if(this.first_run){
                // first run is special, we do not want to push out of first node yet
                this.first_run=false;
            }else{
                this.new_ObservedNode(newNode);
            }
            for (let successor of newNode.getNeighbors()){
                if(successor.isThisGoal()){
                    // if nearby, this will prioritize the goal node
                    this.frontier.push({newNode:successor,path:path.concat([successor])})
                    break;
                }
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
    

    this.breadthfirstsearch =function(){
        console.log("Bfs");
        if(this.frontier.length){
            console.log("dead end?")
        }
        const {newNode, path} = this.frontier.pop();
        if((newNode.visited&&(!this.first_run))){
            while((!newNode.visited)){
                // this should help with minor bug prevents "air bubble step" which is caused because 
                // if a node is computed twice, it will cause an air bubble step when it is vistied after
                // already having been visited
                const {newNode, path} = this.frontier.pop();
                
            }
        }
        this.PrintCurrentPath(path);
        // see if we hit the goal yet
        if (newNode.isThisGoal()){
            this.found_path=true;
            // sends the path to end game
            console.log("Goal Found");
            this.end_game(path);
        }else if(!(newNode.visited)){
            if(this.first_run){
                // first run is special, we do not want to push out of first node yet
                this.first_run=false;
            }else{
                this.new_ObservedNode(newNode);
            }
            for (let successor of newNode.getNeighbors()){
                if(successor.isThisGoal()){
                    // if nearby, this will prioritize the goal node
                    this.frontier.push({newNode:successor,path:path.concat([successor])})
                    break;
                }
                if(!(successor.visited)){
                    successor.setWasComputed();
                    this.frontier.unshift({newNode:successor,path:path.concat([successor])})
                }
            }
        }else if(newNode.visited){
            console.log("ALREADY VISITED");
            this.Depthfirstsearch();
        }
    }

    this.Dijkstra = function(){
        console.log("Dijkstra");
        if(this.frontier.length){
            console.log("dead end?")
        }
        const {newNode, path,cost} = this.frontier.pop();
        if((newNode.visited&&(!this.first_run))){
            while((!newNode.visited)){
                // this should help with minor bug prevents "air bubble step" which is caused because 
                // if a node is computed twice, it will cause an air bubble step when it is vistied after
                // already having been visited
                const {newNode, path} = this.frontier.pop();
                
            }
        }
        this.PrintCurrentPath(path);
        // see if we hit the goal yet
        if (newNode.isThisGoal()){
            this.found_path=true;
            // sends the path to end game
            console.log("Goal Found");
            this.end_game(path);
        }else if(!(newNode.visited)){
            if(this.first_run){
                // first run is special, we do not want to push out of first node yet
                this.first_run=false;
            }else{
                this.new_ObservedNode(newNode);
            }
            for (let successor of newNode.getNeighbors()){
                if(successor.isThisGoal()){
                    // if nearby, this will prioritize the goal node
                    this.end_game(path);
                    break;
                }
                if(!(successor.visited)){
                    successor.setWasComputed();
                    this.frontier.push({newNode:successor,path:path.concat([successor]),cost:cost+newNode.getCost(successor)});
                }
            }
        }else if(newNode.visited){
            console.log("ALREADY VISITED");
            this.Depthfirstsearch();
        }
    }

    this.AstarAlgorithm = function(){
        console.log("test");
    }

    this.PrintCurrentPath=function(Path){
        document.getElementById("curPathId").textContent =Path.map(function(item) { return item["nodeNumber"]+1; });
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
    this.algorithmGetter = function(){
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
    }
    return nodeObjectList;
}


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
            neighbors.push([nodes[i], manhattanDistance(nodes[node],nodes[i])]);
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

function createConnectionElement(node,index){

    for(var a = 0; a < node.NodeConnection.length; a++){
        let CurNode = node;
        var nodeEl = $("<div>", {
            class: "connection_info",
            id: index+"_connector_"+a,
            text: CurNode.NodeConnection[a].cost
        })
        var center_point = find_centerpoint(CurNode,CurNode.NodeConnection[a].node);
        
        $("#canvas").after(nodeEl);
        nodeEl.css({
            left: center_point.x,
            top: center_point.y 
        })
    
    }


}
// Draw connections on canvas and puts the path cost on the line
function drawConnections(nodes) {
    current_screen.ctx.clearRect(0, 0, canvas.width, canvas.height);
    current_screen.ctx.font = "20px Arial";
    for (var i = 0; i < nodes.length; i++) {
        var connection = nodes[i].getNeighbors(true);
        var startNode = nodes[i].getCords();
        // This itterates through all the connections of the current node
        for (var a = 0; a < connection.length; a++) {
            var endNode = connection[a].node.getCords();
            var cost = connection[a].cost;
            drawConnectionLine(startNode,endNode,cost);
        }
    }
    for (var i = 0; i < nodes.length; i++) {
        var connection = nodes[i].getNeighbors(true);
        var startNode = nodes[i].getCords();
        // This itterates through all the connections of the current node
        for (var a = 0; a < connection.length; a++) {
            var endNode = connection[a].node.getCords();
            var cost = connection[a].cost;
            if(current_screen.shouldItDrawCosts){
                draw_cost(startNode,endNode,cost);
            }
        }
    }
}


function drawConnectionLine_middleman(startNode,endNode,cost){
    current_screen.ctx.font = "20px Arial";
    drawConnectionLine(startNode,endNode,cost);
}

function drawConnectionLine(startNode,endNode,cost){


    var b = find_centerpoint(startNode,endNode);


    // Draw line between nodes
    current_screen.ctx.beginPath();
    current_screen.ctx.moveTo(startNode.x, startNode.y);
    current_screen.ctx.lineTo(endNode.x, endNode.y);
    current_screen.ctx.stroke();
}

function draw_cost(startNode,endNode,cost){
    let rect_width = 50;
    let rect_height = 60;

    //Uses slope intercept to get the center of the line.
    var b = find_centerpoint(startNode,endNode);
    var b_1 = {x:(b.x-(rect_width/2)),y:(b.y-(rect_height/2))};
    //current_screen.ctx.fillRect(b_1.x, b_1.y, rect_width, rect_height);
    

    current_screen.ctx.fillStyle = 'rgba(255,255,255, 0.5)';
    current_screen.ctx.fillRect(b_1.x+3, b_1.y, rect_width*.86, rect_height*.86);
    // Add cost label to the middle of the line
    current_screen.ctx.fillStyle = "#000";
    //cost
    current_screen.ctx.fillText(cost, b.x-10, b.y-10);

    if(current_screen.algorithm!="Dijkstra"){
        //heuristic
        current_screen.ctx.fillText(0, b.x-10, b.y+10);
    }
}


function find_centerpoint(node1,node2){
    const middleX = (node1.x + node2.x) / 2;
    const middleY = (node1.y + node2.y) / 2;
    return {x:middleX,y:middleY}
}


function findPointOnLine(node1,node2,distance = 10) {
    // Step 1: Find the middle point of the line segment
    const middleX = (node1.x + node2.x) / 2;
    const middleY = (node1.y + node2.y) / 2;
  
    // Step 2: Find the slope of the line segment
    const slope = (node2.y - node1.y) / (node2.x - node1.x);
  
    // Step 3: Find the perpendicular slope of the line segment
    const perpSlope = -1 / slope;
  
    // Step 4: Use the perpendicular slope and distance to find two points that are 10 units away from the middle point of the line segment
    const xOffset = Math.sqrt(distance ** 2 / (1 + perpSlope ** 2));
    const yOffset = perpSlope * xOffset;
    
    const point1 = { x: middleX + xOffset, y: middleY + yOffset };
    const point2 = { x: middleX - xOffset, y: middleY - yOffset };
  
    // Step 5: Choose one of these points as your final point
    return point1;
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


function getAngle(node1, node2) {
    var dy = node1.y - node2.y;
    var dx = node1.x - node2.y;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    //if (theta < 0) theta = 360 + theta; // range [0, 360)
    return Math.round(theta);
    
}