
var canvas = document.getElementById("canvas");

var current_screen = new current_Finite_Machine();
var totalnodechange = { totalnodes: 0 };
var animationFrame = -1;

$(document).ready(function () {
    /**
     * Creates/wipes the canvas. Then loads up a new current_screen object.
     * This handles full wiping of everything.
     * 
     */
    $("#Create-canvas-btn").click(function () {
        document.getElementById("curPathId").textContent = "None";
        document.getElementById("NodeBuilderTextBox").value = "";
        current_screen.cancelAnimation();
        wipeCanvas();

        current_screen = new current_Finite_Machine();

        var randomSeed = document.getElementById("seedTextBox").value;
        if (randomSeed.length == 0) {
            randomSeed = (Math.random()).toString();
            console.log("The current random seed is: " + randomSeed);
        }

        document.getElementById("currentSeed").textContent = (randomSeed).toString();
        Math.seedrandom(randomSeed);
        var totalNodes = parseInt(document.getElementById("totalNodes").value);
        var totalConnections = parseFloat(document.getElementById("totalConnections").value);
        var isItSimulated = document.querySelector('#isItSimulated').checked;
        current_screen.startup(totalNodes, totalConnections, isItSimulated, true, false);

    });

    /**
     * Handles the starting of the algorithm, and sets everything in motion.
     */
    $("#start-btn").click(function () {

        var startNode = parseInt($("#start").val());
        var endNode = parseInt($("#end").val());
        var algorithm = $("#algorithm").val();
        document.getElementById("currentChoices").value = "";
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
        } else if (current_screen.algorithmGetter() == "UniformCostSearch") {
            current_screen.UniformCostSearch();
        } else if (current_screen.algorithmGetter() == "Astar") {
            current_screen.AstarAlgorithm();
        }
        for (var i = 0; i < current_screen.nodes.length; i++) {
            current_screen.nodes[i].runHasStarted();
        }
    });

    /** 
     * This pushes the algorithm through a single step.
     */
    $("#next-step-btn").click(function () {
        document.getElementById("currentChoices").value = "";
        if ((current_screen.gameOverGetter())) {
            if (current_screen.algorithmGetter() == "dfs") {
                current_screen.Depthfirstsearch();
            } else if (current_screen.algorithmGetter() == "bfs") {
                current_screen.breadthfirstsearch();
            } else if (current_screen.algorithmGetter() == "Dijkstra") {
                current_screen.Dijkstra();
            } else if (current_screen.algorithmGetter() == "UniformCostSearch") {
                current_screen.UniformCostSearch();
            } else if (current_screen.algorithmGetter() == "Astar") {
                current_screen.AstarAlgorithm();
            }
            current_screen.theSimulator.curPath_setter(current_screen.curPath, current_screen.hasAlgoDistanceVisualizerFinished)
        };
        current_screen.printFrontier();
    });

    /** 
     * This imports a graph.
     */
    $("#Import-Graph-btn").click(function () {
        document.getElementById("curPathId").textContent = "None";

        current_screen.cancelAnimation();
        wipeCanvas();
        current_screen = new current_Finite_Machine();

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
        current_screen.startup(totalNodes, totalConnections, isItSimulated, true, true);


    });

});


/** 
 * Handles the paths that are inside of frontier.
 * 
 * @param {nodeClass} newNode - The node that is being added to the frontier.
 * @param {pathClass} path - The path that is being added to the frontier.
 * @param {number} cost - The cost of the path.
 */
function pathClass(newNode, path, cost = 0, distanceHeuristic = 0) {
    this.newNode = newNode;
    this.startnode = path.startnode;
    this.path = path;
    this.cost = cost;
    this.distanceHeuristic = distanceHeuristic;
    this.Heuristic_cost = 0;

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

    this.setheuristic_Dijkstra = function (setCost) {
        this.Heuristic_cost = setCost;
    }

    this.setDistanceHeruistic = function (distCost) {
        this.DistCost = distCost;
    }

    this.readData = function () {
        return { newNode: this.newNode, startnode: this.startnode, path: this.path, cost: this.cost, distanceHeuristic: this.distanceHeuristic, Heuristic_cost: this.Heuristic_cost };
    }

}

/////////////////////////////////////////////////////////////////
/**  
 * This is the current instance of the finite machine.
 *  This is where all the machine happens, and the way to reset this is by setting current_screen to a new instance of this class.
*/
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

    this.curPath = { curentPath: [], curCost: 0 };

    // these are initiator values
    this.first_run = true;
    this.connectionsMade = false;

    this.connections = [];
    this.algorithm = null;

    // for things such as uniform first cost
    this.currentHeuristic = null;
    this.isItSimulated = false;
    this.shouldItDrawCosts = true;

    this.isGameOver = false;
    this.isDistanceScore;
    this.NodeCanvasSizeMultipler = manhattanDistance({ x: this.canvas.offsetWidth, y: this.canvas.offsetHeight }, { x: 0, y: 0 }) / 50;
    // used in astar to represent if ready to start actual search algorithem
    this.hasAlgoDistanceVisualizerFinished = { isRangeFindingDone: true };


    /** 
     * Setups the canvas and stuff. Handles the creation of the nodes and connections.
     * 
     * This creates all things for the actual canvas, and the nodes. It is triggered by "Load canvas" button.
     * 
     * Also starts up the physics simulation, which is always on, however the repel/ attract forces are off by default.
     * 
     * todo: Implement isDistanceScore button.
     * 
     * @param {number} totalNodes - The total number of nodes that will be created.
     * @param {number} totalConnections - The total number of connections that will be created. (Not implmented yet/broken)
     * @param {boolean} isItSimulated - If the canvas is being simulated or not. Off by default.
     * @param {boolean} isDistanceScore - If the distance score is being used or not. On by default. 
     * @param {bool} isimportGraph - If the graph is being imported or not. Off by default.
     */
    this.startup = function (totalNodes, totalConnections, isItSimulated, isDistanceScore = true, isimportGraph = false) {
        
        this.shouldItDrawCosts = true;
        this.isDistanceScore = isDistanceScore;
        this.isItSimulated = isItSimulated;
        this.ctx = this.canvas.getContext("2d");

        if (isimportGraph) {
            isimportGraph = import_graph();
        }
        document.getElementById("NodeBuilderTextBox").value = "";
        this.nodes = generateNodes(totalNodes, this.NodeCanvasSizeMultipler, isimportGraph);
        if (!isimportGraph) {
            //defunct_connectNodes(this.nodes,totalConnections);
            connectNodes_nonImport(this.nodes, totalConnections, this.isDistanceScore, this.canvas.offsetWidth, this.canvas.offsetHeight);
        } else {
            connectNodes_JSON(this.nodes, isimportGraph.connections_json)
        }

        console.log("this nodes startup: ", this.nodes)


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
                    var curNode = current_screen.nodes[index];
                    curNode.beingDragged = true;
                    curNode.x = ui.position.left + 10;
                    curNode.y = ui.position.top + 10;

                },
                stop: function (event, ui) {
                    var index = $(this).text() - 1;
                    current_screen.nodes[index].beingDragged = false;
                }
            });

        }

        // Draw initial connections on canvas
        startEnd_Node_Selector(totalNodes);
        document.getElementById("currentChoices").value = "";

        // starts the force layout Simulation
        this.theSimulator = new simulation(this.canvas.offsetWidth, this.canvas.offsetHeight, this.nodes, isItSimulated);
    }

    /** 
     * This cancels the current simulation. It does not restart it however.
     */
    this.cancelAnimation = function () {
        // upon loading, this.theSimulator before any load canvas is used
        // is always false. Other than that, it should always be linked to a simulation.
        if (this.theSimulator != false) {
            this.theSimulator.stopAnimation();
        }
    }


    /** 
     * this is when the user clicks "start/reset" button.
     * the startup handles the canvas creation, this handles the start of the search algorithm.
     * 
     * @param {number} startNode - The node that the search will start from.
     * @param {number} endNode - The node that the search will end at.
     * @param {string} aalgorithm - The algorithm that will be used to search.
     */
    this.initializer = function (startNode, endNode, aalgorithm) {

        this.startNode = startNode
        this.endNode = endNode
        this.algorithm = aalgorithm

        // this sets up the start node to be the current observer node
        // while also setting up the endnode to be the goal
        this.observedNode = new_ObservedNode(this.nodes[this.startNode], this.observedNode, this.first_run);
        this.observedNode.setWasComputed();
        this.nodes[this.endNode].makeNodeGoal();
        if (this.observedNode.isThisGoal()) {
            this.found_path = true;
        }

        // weither or not the selected search is a uninformed search algorithm
        if ((this.algorithm == "dfs") || (this.algorithm == "bfs")) {
            this.frontier.push(new pathClass(this.observedNode, [{ startnode: this.observedNode, endnode: this.observedNode }]));
        } else if (this.algorithm == "Dijkstra") {

            for (const node in this.nodes) {
                this.nodes[node].setHeruticOn();
            }
            this.frontier = new PriorityQueue((a, b) => (a.cost) < (b.cost));
            this.frontier.push(new pathClass(this.observedNode, [{ startnode: this.observedNode, endnode: this.observedNode }]));
        } else if (this.algorithm == "UniformCostSearch") {
            this.frontier = new PriorityQueue((a, b) => (a.cost + a.distanceHeuristic) < (b.cost + b.distanceHeuristic));
            this.frontier.push(new pathClass(this.observedNode, [{ startnode: this.observedNode, endnode: this.observedNode }]));
        } else if (this.algorithm == "Astar") {
            this.frontier = new PriorityQueue((a, b) => (a.cost + a.distanceHeuristic) < (b.cost + b.distanceHeuristic));
            this.frontier.push(new pathClass(this.observedNode, [{ startnode: this.observedNode, endnode: this.observedNode }]));
        }



        // If the algorithem uses physical distance in calculation, then add it here
        if (this.algorithm == "Astar") {
            this.hasAlgoDistanceVisualizerFinished = new minibreadthFirstSearch(this.nodes, this.nodes[this.startNode], this.nodes[this.endNode], this.NodeCanvasSizeMultipler, false);
            for (const node in this.nodes) {
                this.nodes[node].Astar_setGoalNode(this.nodes[this.endNode]);
            }
        } else {
            // this is deactivated due to last variable which is set to true at the end
            this.hasAlgoDistanceVisualizerFinished = new minibreadthFirstSearch(this.nodes, this.nodes[this.startNode], this.nodes[this.endNode], this.NodeCanvasSizeMultipler, true);
            this.curPat = [{ startnode: this.observedNode, endnode: this.observedNode }];
        }
        document.getElementById((this.endNode).toString()).classList.add("the-goal");

        this.theSimulator.curPath_setter(this.curPath, this.hasAlgoDistanceVisualizerFinished);

    }

    // handles when the search algos find the goal node
    this.end_game = function (path) {
        // this will set the goal to be "end-game-path" meaning it will become the goal 
        // node color (as of time of writing this, it is pink.)
        // then it goes through with the current path and makes it set to the observed node color
        // which is green.
        this.isGameOver = true;
        console.log("Goal Found");
        this.observedNode.setObserver();

        path.forEach(function (aNode, i) {
            document.getElementById((aNode.endnode.nodeNumber).toString()).classList.add("end-game-path");

        });
        // makes it so the goal is a diffrent color and start is too, making it easier to understand where
        // it is going
        document.getElementById((this.startNode).toString()).classList.add("start-node");
        document.getElementById((this.endNode).toString()).classList.add("the-goal");
    }

    this.gameOverGetter= function (){
        return this.isGameOver;
    }

    /** 
     * this does a single step of depthfirst search
    */
    this.Depthfirstsearch = function () {
        const { newNode, path, cost, poppedNode } = this.setNewCurrentPath();
        PrintCurrentPath(path);
        //console.log("hayy: " , this.nodes[2].visited, " here is number ", this.nodes[2].nodeNumber);
        // see if we hit the goal yet
        if (newNode.isThisGoal()) {
            this.found_path = true;
            // sends the path to end game

            this.end_game(path);
        } else if ((!(newNode.visited) && !(newNode.isObserved)) || (this.first_run)) {
            this.isGameOver(newNode, poppedNode);
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
        } else if ((newNode.visited) || (newNode.isObserved)) {
            console.log("ALREADY VISITED");
            this.Depthfirstsearch();
        }
    }

    /** 
     * this does a single step of breadthfirst search
    */
    this.breadthfirstsearch = function () {
        console.log("Bfs");
        const { newNode, path, cost, poppedNode } = this.setNewCurrentPath();
        PrintCurrentPath(path);
        // see if we hit the goal yet
        if (newNode.isThisGoal()) {
            this.found_path = true;
            // sends the path to end game
            this.end_game(path);
        } else if ((!(newNode.visited) && !(newNode.isObserved)) || (this.first_run)) {
            this.isGameOver(newNode, poppedNode);
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
        } else if ((newNode.visited) || (newNode.isObserved)) {
            console.log("ALREADY VISITED");
            this.breadthfirstsearch();
        }
    }

    /** 
     * this does a single step of Dijkstra
    */
    this.Dijkstra = function () {
        console.log("Dijkstra");

        const { newNode, path, cost, poppedNode } = this.setNewCurrentPath();
        PrintCurrentPath(path);

        // see if we hit the goal yet
        if (newNode.isThisGoal()) {
            this.found_path = true;
            // sends the path to end game

            this.end_game(path);
        } else if ((!(newNode.visited) && !(newNode.isObserved)) || (this.first_run)) {

            this.isGameOver(newNode, poppedNode);
            for (let successor of newNode.getNeighbors()) {
                if (!(successor.visited)) {
                    //console.log("push: ",this.frontier);
                    successor.setWasComputed();
                    var newcost = cost + newNode.getCost(successor);
                    newNode.setDijkstra_heuristic(newcost, successor);
                    //console.log("peek frontier: ", this.frontier.peek());
                    this.frontier.push(new pathClass(successor, path.concat([{ startnode: newNode, endnode: successor}]), newcost));
                    //console.log("peek frontier2: ", this.frontier.peek());
                }
            }
        } else if ((newNode.visited) || (newNode.isObserved)) {
            //console.log("ALREADY VISITED");
            this.Dijkstra();
        }
        console.log("final: ", this.frontier);
    }

    this.AstarAlgorithm = function () {
        console.log("AstarAlgorithm");
        if (this.hasAlgoDistanceVisualizerFinished.isRangeFindingDone == false) {
            //visualizer step
            this.hasAlgoDistanceVisualizerFinished.bfsStep();
        } else {
            console.log("logged: ", (this.frontier.peek()));
            var { newNode, path, cost, poppedNode } = this.setNewCurrentPath();
            PrintCurrentPath(path);
            console.log(" now logged: ", (this.frontier.peek()));
            console.log(cost);
            // see if we hit the goal yet
            if (newNode.isThisGoal()) {
                this.found_path = true;
                // sends the path to end game

                this.end_game(path);
            } else if ((!(newNode.visited) && !(newNode.isObserved)) || (this.first_run)) {

                this.isGameOver(newNode, poppedNode);
                for (let successor of newNode.getNeighbors()) {
                    if (!(successor.visited)) {
                        //console.log("push: ",this.frontier);
                        successor.setWasComputed();
                        var distCost = newNode.Astar_setDistanceCostToNeighbor_Goal(successor);
                        var newPath = new pathClass(successor, path.concat([{ startnode: newNode, endnode: successor }]), distCost[0], distCost[1]);
                        this.frontier.push(newPath);
                    }
                }
            } else if ((newNode.visited) || (newNode.isObserved)) {
                //console.log("ALREADY VISITED");
                this.AstarAlgorithm();
            }
            console.log("final: ", this.frontier);
        }
    }






    /**
     * todo implment uniformcostsearch
     */
    this.UniformCostSearch = function () {


    }
    /**
     * Checks to see if gameover, and if not, then sets new observer node
     * 
     * @param {nodeClass} newNode 
     * @param {nodeClass} poppedNode 
     */
    this.isGameOver = function (newNode, poppedNode) {
        if (this.first_run) {
            // first run is special, we do not want to push out of first node yet
            this.first_run = false;
            for (var i = 0; i < this.nodes.length; i++) {
                this.nodes[i].runHasStarted();
            }
        } else {
            this.observedNode = new_ObservedNode(newNode, this.observedNode, this.first_run, poppedNode, this.nodes);
        }
    }

    /**
     * This functions pops next this.frontier and returns popped variables, along with
     * the actual reference to the pathClass itself
     * @returns {nodeClass, pathClass, int, nodeClass}
     */
    this.setNewCurrentPath = function () {
        var poppedNode = this.frontier.pop();
        const { newNode, path, cost } = poppedNode.readData();
        // sets current path that is chosen
        this.curPath = { curentPath: poppedNode, curCost: cost };
        return { newNode, path, cost, poppedNode };
    }



    this.algorithmGetter = function () {
        return this.algorithm;
    }

    this.isDistanceScoreGetter = function () {
        return this.isDistanceScore;
    }

    this.printFrontier = function () {
        console.log(typeof this.frontier);
        this.frontier.printEntireTreePriority();
    }
}




/**
 * Runs through entire tree, from the goal node, meant for uniform cost search. 
 * 
 * It is used by Uniform cost search and Astar
 * 
 * @param {[nodeClass]} nodes 
 * @param {nodeClass} startingNode 
 * @param {nodeClass} goalNode 
 * @param {number} NodeCanvasSizeMultipler This is the multipler that essentially makes all costs consistent and based on actual distance
 * @param {bool} isRangeFindingDone if false, it means this tree will be called if passed over.
 */
this.minibreadthFirstSearch = function (nodes, startingNode, goalNode, NodeCanvasSizeMultipler, isRangeFindingDone = false) {
    this.isRangeFindingDone = isRangeFindingDone;
    this.goalNode = goalNode;
    this.firstRun = true;
    this.visited = [this.goalNode];
    this.thisobserved = startingNode;
    this.frontier = [new pathClass(startingNode, [{ startnode: startingNode, endnode: startingNode }])];
    this.nodes = nodes;
    this.NodeCanvasSizeMultipler = NodeCanvasSizeMultipler;
    this.curPath = [];



    /**
     * 
     * @return {bool} did it end
     */
    this.bfsStep = function () {
        if (this.frontier.length > 0) {
            console.log("frontier: ", this.frontier);

            const { newNode, path, cost, poppedNode } = this.setNewCurrentPath();

            if ((!(newNode.Astar_getisItVisited())) || (this.firstrun)) {
                if (this.firstrun) {
                    this.firstrun = false;
                } else {
                    this.visited.push(newNode);
                }
                this.thisobserved.Astar_setisItVisited(true);
                this.thisobserved.Astar_setIsObserved(false);
                newNode.Astar_setIsObserved(true);
                this.thisobserved = newNode;
                //var node_distance_cost = newNode.getConnectionDistanceCost(manhattanDistance(newNode,this.goalNode));
                for (let successor of newNode.getNeighbors()) {
                    if (!(successor.Astar_getisItVisited()) && (successor != this.goalNode)) {
                        var distCost = newNode.Astar_setDistanceCostToNeighbor_Goal(successor);
                        var newPath = new pathClass(successor, path.concat([{ startnode: newNode, endnode: successor }]));
                        newPath.setDistanceHeruistic(distCost)
                        this.frontier.unshift(newPath)
                    }
                }
            }
            return false;
        } else {
            this.isRangeFindingDone = true;
            console.log("derps");
            return true;
        }
    }

    /**
     * This functions pops next this.frontier and returns popped variables, along with
     * the actual reference to the pathClass itself
     * 
     * This ones cost is 
     * @returns {nodeClass, pathClass, int, nodeClass}
     */
    this.setNewCurrentPath = function () {
        const poppedNode = this.frontier.pop();
        const { newNode, path, cost } = poppedNode;
        // sets current path that is chosen
        this.curPath = { curentPath: poppedNode, curCost: cost };
        return { newNode, path, cost, poppedNode };
    }
}








// * FREE FLOATING FUNCTIONS
/**
 * prints current path to an html element
 * @param {Object} Path - This is the current path that is currently in mind by the algorithem. 
 * @param {[Object]} curPath
 * @param {nodeClass} Path.curPath.startnode 
 * @param {nodeClass} Path.curPath.startnode
 */
function PrintCurrentPath(Path) {
    document.getElementById("curPathId").textContent = "";
    var currentpath = "";
    Path.forEach(function (item, key) {
        currentpath += String(item.endnode.nodeNumber + 1) + "==>";
    });
    document.getElementById("curPathId").textContent = currentpath.substring(0, currentpath.length - 3);;
}
/**
 * this function handles making current node green and if there already is one
 * it will first remove that ones  observed-node class and add visited-node class, which makes it red
 * @param {nodeClass} newNode - This is the New observed node
 * @param {nodeClass} observedNode - Old observered Node
 * @param {bool} first_run - true means it is first
 * @param {pathClass} path - Current selected path, for algorithems
 * @param {[nodeClass]} nodes - All current Nodes
 * @returns {nodeClass} The new observed 
 */
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

/**
 * Handles creating more node options under the start end drop down menus
 * if the user wants 20 nodes this shows 20 options in both start and end drop downs.
 * 
 * Todo: Add check so it does not keep adding more every time load canvas is pressed.
 * 
 * @param {[newNodes]} - all current nodes
 *  */
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

/**
 * creates the actual nodes by putting them into the html and puts them
 *  where ever the coordinates are setup to.
 * @param {number} count 
 * @param {number} distanceMultipler - this is the used to calculate costs to keep cost numbers sane.
 * @param {Object} isItImported - Optional, if it is imported it will use the imported nodes coordinates
 * @param {[Object]} isItImported.nodes_json - this contains all nodes along with coords for said nodes
 * @param {[Object]} isItImported.connections_json - this contains all the connections between nodes and their costs
 * @param {Number} isItImported.nodes_json.x
 * @param {Number} isItImported.nodes_json.y
 * @param {Number} isItImported.nodes_json.nodeNumber
 * @param {Number} isItImported.connections_json.node1 - order should not matter
 * @param {Number} isItImported.connections_json.node2 - order should not matter
 * @param {Number} isItImported.connections_json.cost
 * @returns {[nodeClass]} array of all nodeclass refrences 
 */
function generateNodes(count, distanceMultipler, isItImported = null) {
    var dune;
    var canvas = $("#canvas");
    var canvasWidth = canvas.width();
    var canvasHeight = canvas.height();
    var nodeObjectList = [];
    if (isItImported == false) {
        for (var i = 0; i < count; i++) {
            var x = Math.floor(Math.random() * canvasWidth);
            var y = Math.floor(Math.random() * canvasHeight);
            var NewNode = new nodeClass(x, y, i, distanceMultipler);
            print_out_json_node(NewNode);
            nodeObjectList.push(NewNode);
        }
    } else {
        for (var i = 0; i < isItImported.nodes_json.length; i++) {
            var x = isItImported.nodes_json[i].x;
            var y = isItImported.nodes_json[i].y;
            var NewNode = new nodeClass(x, y, i, distanceMultipler);
            print_out_json_node(NewNode)
            nodeObjectList.push(NewNode);
        }
    }
    return nodeObjectList;
}

/**
 * get the x y distance between two nodes, this will update where ever the node is currently
 *  however, remeber, NODES CAN MOVE! Use this to get a snapshot of the current canvas
 *  but do not assume that the nodes will stay in the same place
 * @param {nodeClass} node1 
 * @param {nodeClass} node2 
 * @returns {float} Distance between the two nodes
 */
function manhattanDistance(node1, node2) {
    return -(Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y));
}


/**
 * Draw connections on canvas and puts the path cost on the line
 * 
 * This is my personal hell. Welcome on in.
 * 
 * @param {[nodeClass]} nodes: List all all current nodes
 * @param {Object} curPath The current chosen path and assosiated cost
 * @param {pathClass} curPath.currentpath this is the current path
 * @param {number} curPath.cost given paths cost
 * @param {bool} drawConnections_Astar Are we visualizing Uniform Cost Search costs phase.
 */
function drawConnections(nodes, curPath = current_screen.curPath, drawConnections_Astar = { isRangeFindingDone: true }) {
    var dune;
    //console.log(current_screen.ctx);
    current_screen.ctx.clearRect(0, 0, canvas.width, canvas.height);
    current_screen.ctx.font = "20px Arial";

    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].isGoal) {
            // this highlights the current goal node
            goalGradient(nodes[i]);
            break;
        }
    }
    for (var i = 0; i < nodes.length; i++) {
        var connection = nodes[i].getNeighbors(true);
        var startNode = nodes[i];
        
        // This itterates through all the connections of the current node
        for (var a = 0; a < connection.length; a++) {
            var endNode = connection[a].node;
            if (curPath.length != 0) {

                if ((isItPathed(curPath, startNode, endNode))) {
                    drawConnectionLine(startNode, endNode, "rgba(255,0,0)",true);
                } else {
                    drawConnectionLine(startNode, endNode, "rgba(0,0,0)");
                }
            } else {
                drawConnectionLine(startNode, endNode, "rgba(0,0,0)");
            }
        }

    }
    if ((drawConnections_Astar.isRangeFindingDone != true)) {
        drawConnectionLine(drawConnections_Astar.thisobserved, startNode.Astar_GetGoalNode(), "rgb(255, 238, 0)");
        draw_cost(drawConnections_Astar.thisobserved, startNode.Astar_GetGoalNode(), 0, { distanceOnly: true }, drawConnections_Astar);

    }



    if (current_screen.shouldItDrawCosts) {
        for (var i = 0; i < nodes.length; i++) {
            var connection = nodes[i].getNeighbors(true);
            var startNode = nodes[i];
            // This itterates through all the connections of the current node
            for (var a = 0; a < connection.length; a++) {
                var endNode = connection[a].node;
                var cost = connection[a].cost;

                // This if statement seems useless, but its actually to assist in showing the fun jsons because its fun to watch the lines go crazy
                if (!(document.querySelector('#displayCosts').checked)) {
                    if (connection[a].node.wasComputed) {
                        draw_cost(startNode, endNode, cost, startNode.returnScoreFactors(), drawConnections_Astar);
                    } else if (drawConnections_Astar.goalNode != connection[a].node) {
                        // this draws the stuff at the start upon loading
                        draw_cost(startNode, endNode, cost, startNode.returnScoreFactors(), drawConnections_Astar);
                    } else {
                        draw_cost(startNode, endNode, cost, startNode.returnScoreFactors(), drawConnections_Astar);
                        console.log("nope");
                    }
                }
            }
        }
    }


}


/**
 * This checks to see if the current node is connected to a path
 * used by non dfs and bfs
 * @param {Object} curPath The current chosen path and assosiated cost
 * @param {pathClass} curPath.currentpath this is the current path
 * @param {number} curPath.cost given paths cost
 * @param {nodeClass} startnode Where
 * @param {nodeClass} endnode 
 * @returns 
 */
function isItPathed(curPath, startnode, endnode) {
    if (curPath.curentPath.length != 0) {
        for (var i = 0; i < curPath.curentPath.path.length; i++) {
            var curStep = curPath.curentPath.path[i];
            if ((curStep.endnode != current_screen.startNode)) {
                if ((areTheyEqual_AsymFlipped(curStep, { startnode: startnode, endnode: endnode }))) {
                    return true
                }
            }
        }
    }
    return false;
}

/**
 * this compares two connections between nodes to see if they are the same.
 * 
 * Todo: make this entire function make sense. This functions formatting is a crime
 * 
 * @param {Object} singlenode connection 1
 * @param {nodeClass} singlenode.startnode this is the start current connection
 * @param {nodeClass} singlenode.endnode this is the end connection
 * @param {Object} Node2 seconed connection
 * @param {nodeClass} Node2.startnode this is the start current connection
 * @param {nodeClass} Node2.endnode this is the end connection
 * @returns {bool} If the 2 paths are the same
 */
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

/**
 * This is a werid holdover function, that is utilized by the graph makers
 * 
 * This requires alot less stress than its bigger brother drawConnectionLine. 
 * Also makes debugging easier for graphmakers cause you can see their step by step
 * 
 * Only triggers when a Create-canvas-btn is pressed.
 * 
 * @param {nodeClass} startNode 
 * @param {nodeClass} endNode 
 */
function drawConnectionLine_middleman(startNode, endNode) {
    current_screen.ctx.font = "20px Arial";
    drawConnectionLine(startNode, endNode);
}

/**
 * Draws the lines between nodes
 * 
 * @param {nodeClass} startNode 
 * @param {nodeClass} endNode 
 * @param {string} color -strokeStyle color style, defaults to black (i.e. "rgba(0,0,0)")
 * @param {bool} isItPathed - if true, it will double up the line as to make it easier to see it
 */
function drawConnectionLine(startNode, endNode, color = 'rgba(0,0,0)', isItPathed = false) {
    const screen_ctx = current_screen.ctx;
    screen_ctx.strokeStyle = color;
    // Draw line between nodes
    screen_ctx.beginPath();
    screen_ctx.moveTo(startNode.x, startNode.y);
    screen_ctx.lineTo(endNode.x, endNode.y);
    
    if (isItPathed) {
        drawParrel_line(startNode, endNode, screen_ctx, 10);
    }
    screen_ctx.stroke();


}

function drawParrel_line(node1, node2, screen_ctx, offset) {
    const dx = node2.x - node1.x;
    const dy = node2.y - node1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ox = (dy / len) * offset;
    const oy = (-dx / len) * offset;
    screen_ctx.lineTo(node2.x + ox, node2.y + oy);
    screen_ctx.lineTo(node1.x + ox, node1.y + oy);
    if (screen_ctx.isContextLost()) {
        console.log("Context is lost");
    }

}

/**
 * This makes a gradient around the desired node
 * 
 * @param {nodeClass} node 
 */
function goalGradient(node) {
    var canvas = $("#canvas");
    var canvasWidth = canvas.width();
    var canvasHeight = canvas.height();
    const screen_ctx = current_screen.ctx;
    
    const gradient = screen_ctx.createRadialGradient(node.x, node.y, 20, node.x, node.y, 90);

    // Add three color stops
    gradient.addColorStop(0, "white");
    gradient.addColorStop(0.2, "lightgrey");
    gradient.addColorStop(1, "#5f5f5f");

    // Set the fill style and draw a rectangle
    screen_ctx.fillStyle = gradient;

    screen_ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    screen_ctx.stroke();
}

/**
 * Draws the little nice cost box between nodes
 * 
 * @param {nodeClass} startNode this is an X Y coords for one node
 * @param {nodeClass} endNode this is an X Y coords for one node
 * @param {number} cost - cost
 * @param {object} drawHuerisitc defaults false, determines if heuristic cost is drawn
 * @param {bool} drawHuerisitc.heuristic if we should print out heuristic cost
 * @param {bool} drawHuerisitc.distanceOnly this is for the yellow line that goes from observed node to goal. 
 * @param {minibreadthFirstSearch} drawdistance_heuristic
 */
function draw_cost(startNode, endNode, cost, drawHuerisitc = { isHueristicFactor: false, isDistanceFactor: false, distanceOnly: false }, drawdistance_heuristic = { isRangeFindingDone: true }) {
    let rect_width = 50;
    let rect_height = 60;

    if (drawdistance_heuristic != false) {
        rect_height = 90;
    }


    //Uses slope intercept to get the center of the line.
    var b = find_centerpoint(startNode.getCords(), endNode.getCords());
    var b_1 = { x: (b.x - (rect_width / 2)), y: (b.y - (rect_height / 2)) };




    // this top if statement only triggers if there is an inital distance show phase
    if (!(drawdistance_heuristic.isRangeFindingDone) && (drawHuerisitc.distanceOnly)) {
        // todo add function getting distance heuristic
        current_screen.ctx.fillStyle = 'rgba(255,255,255, 0.5)';
        current_screen.ctx.fillRect(b_1.x + 3, b_1.y, rect_width * .86, rect_height * .86);
        // Add cost label to the middle of the line
        current_screen.ctx.fillStyle = "#000";
        drawDistanceCost(startNode, endNode, b.x - 10, b.y - 10);

        //console.log("costts: ",cost);
    } else {

        current_screen.ctx.fillStyle = 'rgba(255,255,255, 0.5)';
        current_screen.ctx.fillRect(b_1.x + 3, b_1.y, rect_width * .86, rect_height * .86);
        // Add cost label to the middle of the line
        current_screen.ctx.fillStyle = "#000";

        //cost
        drawSingleCost(cost, b.x - 10, b.y - 10)

        // this is the hueristic according to the nodes
        if (((drawHuerisitc.isHueristicFactor) && (!(drawHuerisitc.isDistanceFactor))) && (startNode.wasComputed) && (startNode.getDijkstra_heuristic(endNode) != 0)) {
            drawHeuristic(startNode, endNode, b.x - 10, b.y + 10);
        }
        if ((((drawHuerisitc.isDistanceFactor))) && (startNode.wasComputed)) {
            drawDistanceCost(startNode, endNode, b.x - 10, b.y + 20);
        }
    }


}


/**
 * Prints out the cost, the coordiantes are in relation to the center of where the box is
 * @param {number} cost 
 * @param {number} Coordx 
 * @param {number} Coordy 
 */
function drawSingleCost(cost, Coordx, Coordy) {
    current_screen.ctx.fillText(cost, Coordx, Coordy);
}

/**
 * Prints out the heuristic, the coordiantes are in relation to the center of where the box is
 * @param {nodeClass} startNode
 * @param {nodeClass} endNode 
 * @param {number} Coordx 
 * @param {number} Coordy 
 */
function drawHeuristic(startNode, endNode, Coordx, Coordy) {
    current_screen.ctx.fillText(startNode.getDijkstra_heuristic(endNode), Coordx, Coordy);
}


function drawDistanceCost(startnode, endNode, Coordx, Coordy) {
    current_screen.ctx.fillText(startnode.Astar_getAstar_Huerisitic(endNode), Coordx, Coordy);
}



/**
 * finds the ceneter point, this is used for draw_cost function.
 * 
 * @param {object} node1 this is an X Y coords for one node
 * @param {number} node1.x 
 * @param {number} node1.y 
 * @param {object} node2 this is an X Y coords for one node
 * @param {number} node2.x 
 * @param {number} node2.y 
 * 
 * @returns {{x:int, y:int}}  this is an X Y coords in an object
 */
function find_centerpoint(node1, node2) {
    const middleX = (node1.x + node2.x) / 2;
    const middleY = (node1.y + node2.y) / 2;
    return { x: middleX, y: middleY }
}


/**
 * this deletes all current nodes from the last layuout
 */
function wipeCanvas() {
    current_screen.ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Get a collection of all elements with the "my-class" class
    var elements = document.querySelectorAll('.node');

    // Loop through the collection and remove each element
    for (var i = 0; i < elements.length; i++) {
        elements[i].parentNode.removeChild(elements[i]);
    }
}

