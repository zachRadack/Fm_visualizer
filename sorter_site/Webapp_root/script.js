
var canvas = document.getElementById("canvas");

var current_screen = new current_Finite_Machine();
var totalnodechange ={totalnodes:0};
var animationFrame = -1;
// this creates canvas
$("#Create-canvas-btn").click(function () {
    document.getElementById("curConenctionId").textContent = "None";
    document.getElementById("curPathId").textContent = "None";

    current_screen.cancelAnimation();
    current_screen = new current_Finite_Machine();
    wipeCanvas();
    var randomSeed = document.getElementById("seedTextBox").value;
    if (randomSeed.length == 0) {
        randomSeed = (Math.random()).toString();
        console.log("The current random seed is: " + randomSeed);
    }

    document.getElementById("currentSeed").textContent = (randomSeed).toString();
    Math.seedrandom(randomSeed);
    var totalNodes = parseInt(document.getElementById("totalNodes").value);
    var totalConnections = parseInt(document.getElementById("totalConnections").value);
    var isItSimulated = document.querySelector('#isItSimulated').checked;
    current_screen.startup(totalNodes, totalConnections, isItSimulated);

});

// handles the starting of the algorithm, and sets everything in
$("#start-btn").click(function () {

    var startNode = parseInt($("#start").val());
    var endNode = parseInt($("#end").val());
    var algorithm = $("#algorithm").val();

    console.log("Start node: " + startNode);
    console.log("End node: " + endNode);
    console.log("Algorithm: " + algorithm);

    current_screen.initializer(startNode, endNode, algorithm);

    if (algorithm == "dfs") {
        current_screen.shouldItDrawCosts = false;
        current_screen.Depthfirstsearch();
    } else if (algorithm == "bfs") {
        current_screen.shouldItDrawCosts = false;
        current_screen.breadthfirstsearch();
    } else if (current_screen.algorithmGetter() == "Dijkstra") {
        current_screen.Dijkstra();
    } else if (current_screen.algorithmGetter() == "Astar") {
        current_screen.AstarAlgorithm();
    }
});

// this pushes the algorithm through a single step.
$("#next-step-btn").click(function () {
    if (current_screen.foundPathGetter == true) {
        current_screen.end_game();
    } else if (current_screen.algorithmGetter() == "dfs") {
        current_screen.Depthfirstsearch();
    } else if (current_screen.algorithmGetter() == "bfs") {
        current_screen.breadthfirstsearch();
    } else if (current_screen.algorithmGetter() == "Dijkstra") {
        current_screen.Dijkstra();
    } else if (current_screen.algorithmGetter() == "Astar") {
        current_screen.AstarAlgorithm();
    }
    current_screen.theSimulator.curPath_setter(current_screen.curPath);
});




// Handles the paths that are inside of frontier.
function pathClass(newNode, path, cost = 0) {
    this.newNode = newNode;
    this.startnode = path.startnode;
    this.path = path;
    this.cost = cost;
    this.Heuristic_cost=0;

    // Handles the werid interaction that happens when non dfs/bfs searchs
    // try to swap over to a diffrent path. This is called every time.
    // not efficent but hopefully the just in time optimizies it.
    this.setAsSeen = function (nodes) {
        for (var i = 0; i < nodes.length; i++) {
            var curNode = nodes[i];
            if (curNode.visited && !(this.path.some(obj => obj.endnode == curNode))) {
                curNode.setVisited();
                
            } else if (!(curNode.visited) && (this.path.some(obj => obj.endnode == curNode))) {
                curNode.setVisited();
            }
        }

        newNode.setVisited(false);
    }

    this.getVisited = function () {
        return this.path
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

    this.theSimulator = false;

    this.curPath = {curentPath:[],curCost:0};

    // these are initiator values
    this.first_run = true;
    this.connectionsMade = false;

    this.connections = [];
    this.algorithm = null;

    // for things such as Astar
    this.currentHeuristic = null;
    this.isItSimulated = false;
    this.shouldItDrawCosts = true;

    // setups the canvas and stuff. Handles the creation of the nodes and connections.
    this.startup = function (totalNodes, totalConnections, isItSimulated) {
        this.shouldItDrawCosts = true;
        this.isItSimulated = isItSimulated;
        this.ctx = this.canvas.getContext("2d");
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
                drag: function (event, ui) {
                    var index = $(this).text() - 1;

                    current_screen.nodes[index].beingDragged = true;
                    current_screen.nodes[index].x = ui.position.left + 10;
                    current_screen.nodes[index].y = ui.position.top + 10;

                    current_screen.nodes[index].NewAngle();

                    drawConnections(current_screen.nodes);
                },
                stop: function (event, ui) {
                    var index = $(this).text() - 1;
                    current_screen.nodes[index].beingDragged = false;
                }
            });

        }

        // Draw initial connections on canvas
        startEnd_Node_Selector(totalNodes);

        // starts the force layout Simulation
        this.theSimulator = new simulation(this.canvas.offsetWidth, this.canvas.offsetHeight, this.nodes, isItSimulated);
    }

    // this makes it so the old animation stops, if this is not trigged, then if
    // you hit "load canvas" a second time, it will be using the nodes from the first canvas
    this.cancelAnimation = function () {
        // upon loading, this.theSimulator before any load canvas is used
        // is always false. Other than that, it should always be linked to a simulation.
        if (this.theSimulator != false) {
            this.theSimulator.stopAnimation();
        }
    }


    // this is when the user clicks "start/reset" button
    // the startup handles the canvas creation, this handles the start of the
    // search algorithm.
    this.initializer = function (startNode, endNode, aalgorithm) {

        this.startNode = startNode
        this.endNode = endNode
        this.algorithm = aalgorithm

        // this sets up the start node to be the current observer node
        // while also setting up the endnode to be the goal
        this.observedNode = new_ObservedNode(this.nodes[this.startNode], this.observedNode, this.first_run);
        this.nodes[this.endNode].makeNodeGoal();
        if (this.observedNode.isThisGoal()) {
            this.found_path = true;
        }
        if ((this.algorithm == "dfs") || (this.algorithm == "bfs")) {
            this.frontier.push(new pathClass(this.observedNode, [{ startnode: this.observedNode, endnode: this.observedNode }]));
        } else {
            this.frontier = new PriorityQueue((a, b) => a.cost < b.cost);
            this.frontier.push(new pathClass(this.observedNode, [{ startnode: this.observedNode, endnode: this.observedNode }]));
        }

        this.curPat = [{ startnode: this.observedNode, endnode: this.observedNode }];

    }

    // handles when the search algos find the goal node
    this.end_game = function (path) {
        // this will set the goal to be "end-game-path" meaning it will become the goal 
        // node color (as of time of writing this, it is pink.)
        // then it goes through with the current path and makes it set to the observed node color
        // which is green.
        this.observedNode.setObserver();
        
        path.forEach(function (aNode, i) {
            console.log("aNode: ", aNode.endnode);
            document.getElementById((aNode.endnode.nodeNumber).toString()).classList.add("end-game-path");

        });
        // makes it so the goal is a diffrent color and start is too, making it easier to understand where
        // it is going
        document.getElementById((this.startNode).toString()).classList.add("start-node");
        document.getElementById((this.endNode).toString()).classList.add("the-goal");
    }

    // this is the depth first search algorithm
    this.Depthfirstsearch = function () {
        console.log("dfs");
        if (this.frontier.length) {
            console.log("dead end?")
        }
        const { newNode, path } = this.frontier.pop();
        this.curPath = path;
        PrintCurrentPath(path);
        //console.log("hayy: " , this.nodes[2].visited, " here is number ", this.nodes[2].nodeNumber);
        // see if we hit the goal yet
        if (newNode.isThisGoal()) {
            this.found_path = true;
            // sends the path to end game
            console.log("Goal Found");
            this.end_game(path);
        } else if ((!(newNode.visited)&&!(newNode.isObserved))||(this.first_run)) {
            if (this.first_run) {
                // first run is special, we do not want to push out of first node yet
                this.first_run = false;
            } else {
                this.observedNode = new_ObservedNode(newNode, this.observedNode, this.first_run);
            }
            for (let successor of newNode.getNeighbors()) {
                this.frontier.push(new pathClass(successor, path.concat([{ startnode: newNode, endnode: successor }])));
                if (successor.isThisGoal()) {
                    // if nearby, this will prioritize the goal node
                    break;
                }
                if (!(successor.visited)) {
                    successor.setWasComputed();
                }
            }
        } else if ((newNode.visited)||(newNode.isObserved)) {
            console.log("ALREADY VISITED");
            this.Depthfirstsearch();
        }
    }


    this.breadthfirstsearch = function () {
        console.log("Bfs");
        const { newNode, path } = this.frontier.pop();
        this.curPath = path;
        
        PrintCurrentPath(path);
        // see if we hit the goal yet
        if (newNode.isThisGoal()) {
            this.found_path = true;
            // sends the path to end game
            console.log("Goal Found");
            this.end_game(path);
        } else if ((!(newNode.visited)&&!(newNode.isObserved))||(this.first_run)) {
            if (this.first_run) {
                // first run is special, we do not want to push out of first node yet
                this.first_run = false;
            } else {
                this.observedNode = new_ObservedNode(newNode, this.observedNode, this.first_run);
            }
            for (let successor of newNode.getNeighbors()) {
                var newPath = new pathClass(successor, path.concat([{ startnode: newNode, endnode: successor }]));
                if (successor.isThisGoal()) {
                    // if nearby, this will prioritize the goal node
                    this.frontier.push(newPath)
                    break;
                }
                if (!(successor.visited)) {
                    successor.setWasComputed();
                    this.frontier.unshift(newPath)
                }
            }
        } else if ((newNode.visited)||(newNode.isObserved)) {
            console.log("ALREADY VISITED");
            this.breadthfirstsearch();
        }
    }

    this.Dijkstra = function () {
        console.log("Dijkstra");
        if (this.frontier.length) {
            console.log("dead end?")
        }
        console.log("peeking: ", this.frontier);
        const poppedNode = this.frontier.pop();
        const { newNode, path, cost } = poppedNode;
        this.curPath = {curentPath:poppedNode,curCost:cost};
        PrintCurrentPath(path);
        //console.log("peeked: ",this.frontier);
        // see if we hit the goal yet
        if (newNode.isThisGoal()) {
            this.found_path = true;
            // sends the path to end game
            console.log("Goal Found");
            this.end_game(path);
        } else if ((!(newNode.visited)&&!(newNode.isObserved))||(this.first_run)){

            if (this.first_run) {
                // first run is special, we do not want to push out of first node yet
                this.first_run = false;
            } else {
                this.observedNode = new_ObservedNode(newNode, this.observedNode, this.first_run, poppedNode, this.nodes);
            }
            for (let successor of newNode.getNeighbors()) {
                if (!(successor.visited)) {
                    //console.log("push: ",this.frontier);
                    successor.setWasComputed();
                    var newcost = cost + newNode.getCost(successor);
                    this.frontier.push(new pathClass(successor, path.concat([{ startnode: newNode, endnode: successor }]), newcost));
                }
            }
        } else if ((newNode.visited)||(newNode.isObserved)) {
            //console.log("ALREADY VISITED");
            this.Dijkstra();
        }
        console.log("final: ", this.frontier);
    }



    this.AstarAlgorithm = function () {
        console.log("test");
    }

    this.foundPathGetter = function () {
        return this.found_path;
    }
    this.algorithmGetter = function () {
        return this.algorithm;
    }
}

// prints current path to an html element
function PrintCurrentPath(Path) {
    document.getElementById("curPathId").textContent = "";

    Path.forEach(function (item, key) {
        document.getElementById("curPathId").textContent = document.getElementById("curPathId").textContent + String(item.endnode.nodeNumber + 1) + "==>";
    });
}

// this function handles making current node green and if there already is one
// it will first remove that ones  observed-node class and add visited-node class, which makes it red
function new_ObservedNode(newNode, observedNode, first_run, path = null, nodes = null) {
    // Sets classes of nodes, by changing background colors of them, to visualize where the search is
    let dune;
    // if observed node is not initilaized, it gets skipped
    if (first_run == false) {
        observedNode.setObserver();

        if (path != dune) {
            path.setAsSeen(nodes);
        }
    }


    observedNode = newNode;
    observedNode.setObserver();
    return observedNode;
}

// handles creating more node options under the start end drop down menus
// if the user wants 20 nodes this shows 20 options in both start and end drop downs.
function startEnd_Node_Selector(nodes) {
    //<option value="0">Node 1</option>
    if (nodes > 2) {
        for (let i = 3; i < nodes + 1; i++) {
            let node_counterstart = document.createElement('option');
            node_counterstart.value = i - 1;
            node_counterstart.text = ("Node " + parseInt(i));
            let node_counterend = document.createElement('option');
            node_counterend.value = i - 1;
            node_counterend.text = ("Node " + parseInt(i));
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
    var nodeObjectList = [];
    for (var i = 0; i < count; i++) {
        var x = Math.floor(Math.random() * canvasWidth);
        var y = Math.floor(Math.random() * canvasHeight);
        nodeObjectList.push(new nodeClass(x, y, i));
    }
    return nodeObjectList;
}

// get the x y distance between two nodes, this will update where ever the node is currently
// however, remeber, NODES CAN MOVE! Use this to get a snapshot of the current canvas
// but do not assume that the nodes will stay in the same place
function manhattanDistance(node1, node2) {
    return -(Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y));
}


// Draw connections on canvas and puts the path cost on the line
function drawConnections(nodes, curPath = current_screen.curentPath) {
    var dune;
    current_screen.ctx.clearRect(0, 0, canvas.width, canvas.height);
    current_screen.ctx.font = "20px Arial";
    for (var i = 0; i < nodes.length; i++) {
        var connection = nodes[i].getNeighbors(true);
        var startNode = nodes[i];
        // This itterates through all the connections of the current node
        for (var a = 0; a < connection.length; a++) {
            var endNode = connection[a].node;
                if(curPath.path!=dune){
                    if (!(isItPathed(curPath.path, startNode, endNode))) {
                        drawConnectionLine(startNode, endNode, "rgba(0,0,0)");
                    } else {
                        drawConnectionLine(startNode, endNode, "rgba(255,0,0)");
                    }
                }else{
                    drawConnectionLine(startNode, endNode, "rgba(0,0,0)");
                }
        }
    }

    if (current_screen.shouldItDrawCosts) {
        for (var i = 0; i < nodes.length; i++) {
            var connection = nodes[i].getNeighbors(true);
            var startNode = nodes[i].getCords();
            // This itterates through all the connections of the current node
            for (var a = 0; a < connection.length; a++) {
                var endNode = connection[a].node.getCords();
                var cost = connection[a].cost;
                if(connection[a].node.wasComputed){
                    draw_cost(startNode, endNode, cost,curPath,true);
                }else{
                    draw_cost(startNode, endNode, cost,curPath);
                }
            }
        }
    }
}


// This checks to see if the current node is connected to a path
// used by non dfs and bfs
function isItPathed(curPath, startnode, endnode) {
    for (var i = 0; i < curPath.length; i++) {
        var curStep = curPath[i];
        if ((curStep.endnode != current_screen.startNode)) {
            if ((areTheyEqual_AsymFlipped(curStep, {startnode:startnode, endnode:endnode}))) {
                return true
            }
        }
    }
    return false;
}

// this compares two coords to see if they are the same.
function areTheyEqual_AsymFlipped(singlenode, Node2) {
    if ((singlenode.startnode == Node2.startnode)) {
        if ((singlenode.endnode == Node2.endnode)) {
            return true;
        }
    } else if ((singlenode.endnode == Node2.startnode)) {
        if ((singlenode.startnode == Node2.endnode)) {
            return true;
        }
    }
    return false;
}


function drawConnectionLine_middleman(startNode, endNode) {
    current_screen.ctx.font = "20px Arial";
    drawConnectionLine(startNode, endNode);
}

function drawConnectionLine(startNode, endNode, color = 'rgba(0,0,0)') {

    current_screen.ctx.strokeStyle = color;
    // Draw line between nodes
    current_screen.ctx.beginPath();
    current_screen.ctx.moveTo(startNode.x, startNode.y);
    current_screen.ctx.lineTo(endNode.x, endNode.y);
    current_screen.ctx.stroke();
}




function draw_cost(startNode, endNode, cost,heuristic,drawHuerisitc=false) {
    let rect_width = 50;
    let rect_height = 60;

    //Uses slope intercept to get the center of the line.
    var b = find_centerpoint(startNode, endNode);
    var b_1 = { x: (b.x - (rect_width / 2)), y: (b.y - (rect_height / 2)) };
    //current_screen.ctx.fillRect(b_1.x, b_1.y, rect_width, rect_height);


    current_screen.ctx.fillStyle = 'rgba(255,255,255, 0.5)';
    current_screen.ctx.fillRect(b_1.x + 3, b_1.y, rect_width * .86, rect_height * .86);
    // Add cost label to the middle of the line
    current_screen.ctx.fillStyle = "#000";
    //cost
    current_screen.ctx.fillText(cost, b.x - 10, b.y - 10);
    if((drawHuerisitc)&&(heuristic.curentPath.length!=0)){

        //heuristic :[],curCost:
        current_screen.ctx.fillText(heuristic.curCost, b.x - 10, b.y + 10);
    }
}




function find_centerpoint(node1, node2) {
    const middleX = (node1.x + node2.x) / 2;
    const middleY = (node1.y + node2.y) / 2;
    return { x: middleX, y: middleY }
}


// this deletes all current nodes from the last layuout
function wipeCanvas() {
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

