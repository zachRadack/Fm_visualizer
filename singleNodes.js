/**
 * This controls individual nodes in an instance.
 * It manages most things related to individual nodes from setting adding conenctions
 * to holding their current coordinates
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {number} nodeNum 
 * @param {bool} isItGoal 
 */
function nodeClass(x, y, nodeNum, NodeCanvasSizeMultipler, isDistanceScore = true) {
    this.nodeNumber = nodeNum;
    this.x = x;
    this.y = y;
    this.NodeConnection = [];
    this.connections = 0;

    // refrence to html
    this.HTMLnodes;

    this.isGoal = false;
    // has it been visited
    this.visited = false;
    // this is when the algorithem is currently looking at it
    this.isObserved = false;
    // this is for when a loop went over this node
    // if this is true it means that it was added to a list of choices somewhere
    this.wasComputed = false;


    // * part of uniform distance cost
    this.goalNode;
    this.Astar_isItObserved = false;
    this.Astar_isItVisited = false;
    this.NodeCanvasSizeMultipler = NodeCanvasSizeMultipler;
    this.FinalDistanceToGoalScore = 0;

    // controls if various factors influence the scoring system of a node
    this.scorefactors = { isDistanceFactor: false, isHueristicFactor: false, distanceOnly: false, isDistanceUsedToMakeScore: false }
    // Todo, implment check to signify that score is distnace
    this.isDistanceScore = isDistanceScore;
    // this signifies if run has started
    // !If this is true, connection costs will not change
    this.hasRunStarted = false;


    // * internal Physics system
    // internal velocity
    this.vx = 0;
    this.vy = 0;

    // how hard it moves
    this.mass = 200;

    // an attempt to make node zero hard to move
    if (this.nodeNumber == 0) {
        this.mass = 300;
    }

    // This will be min distance between nodes
    this.radius = 60;

    // if a node is being dragged, it turns off the simulation physics for it
    this.beingDragged = false;

    // * begining of functions

    /**
     * makes the node a goal
     */
    this.makeNodeGoal = function () {
        this.isGoal = true;
    }

    /**
     * This is called when the node is added to any list that is being searched.
     */
    this.setWasComputed = function () {
        this.wasComputed = true;
        document.getElementById((this.nodeNumber).toString()).classList.add("was-computer");
    }
    
    this.getWasComputed = function () {
        return this.wasComputed;
    }
    /**
     * To goal or not to goal, that is the goal
     * @returns {bool} if given node is a goal
     */
    this.isThisGoal = function () {
        return this.isGoal;
    }
    /**
     * send in the node object that you want to get the cost, if they are connected.
     * returns -1 if the 2 nodes are not connected
     * 
     * {isDistanceFactor:false,isHueristicFactor:false,distanceOnly:false}
     * @param {nodeClass} theNodeOfDesire 
     * @returns {number} total cost (with hueristic) between the 2 nodes connection
     */
    this.getCost = function (theNodeOfDesire) {
        if ((theNodeOfDesire!=this)||(this.nodeConnectionLength() > 0)) {
            var areConnected = this.areTheyConnected(theNodeOfDesire, true);
            if (this.scorefactors.isHueristicFactor) {
                
                if (areConnected[0]) {
                    
                    var desiredConnection = this.NodeConnection[areConnected[1]];
                    console.log(this.nodeNumber, "=>", theNodeOfDesire.nodeNumber, " - ", desiredConnection.cost + desiredConnection.heuristic)
                    if(this.nodeNumber==9 && theNodeOfDesire.nodeNumber==1){
                        console.log("break")
                    }
                    return desiredConnection.cost + desiredConnection.heuristic;
                } else {
                    //console.log("getCost- failed to find connection - ", this, " => ", theNodeOfDesire)
                }

            } else if (this.scorefactors.isDistanceFactor) {

                if (areConnected[0]) {
                    return this.NodeConnection[areConnected[1]].cost + this.NodeConnection[areConnected[1]].distanceHeuristic;
                } else {
                    //console.log("getCost- failed to find connection - ", this, " => ", theNodeOfDesire)
                }

            }
        }
        //console.log("getCost- failed no reason - ", this, "=>", theNodeOfDesire)
        return -1
    }

    

    /**
     * This returns the nodes coords.
     * @returns {object} x y formatted object of the nodes coords
     */
    this.getCords = function () {
        return { x: this.x, y: this.y };
    }

    /**
     * Connections are objects that have a refrence to the connected node
     * and the cost to said node. Also adding a connection is 2 way
     * secondarycall is used to prevent infinite recursion.
     * @param {nodeClass} neighbors_Node 
     * @param {number} cost 
     * @param {bool} secondarycall Do not use, its for internal use
     * @returns {bool} If connection worked
     */
    this.addConnection = function (neighbors_Node, cost, secondarycall = true) {
        //let a = this.nodeNumber;// delete later, meant for debuging
        let dune;
        var letitrun = true;
        if (neighbors_Node != dune) {
            if (secondarycall == true) {
                letitrun = neighbors_Node.addConnection(this, cost, false);
                if (letitrun) {
                    this.connectthem(neighbors_Node, cost, secondarycall);
                    return true;
                } else {
                    // full none connect
                    return false;
                }
            } else if (!(this.areTheyConnected(neighbors_Node))) {
                // this is the first connection attempt, and it worked
                this.connectthem(neighbors_Node, cost, secondarycall);
                return true;
            } else {
                // first connection attempt failed
                return false;
            }
        } else {
            // none valid neighbors_Node given
            return false;
        }
    }

    /**
     * does the actually linkage
     * @param {nodeClass} neighbors_Node 
     * @param {number} cost  
     */
    this.connectthem = function (neighbors_Node, cost, secondarycall) {
        this.NodeConnection.push({ node: neighbors_Node, cost: cost, heuristic: null, distanceHeuristic: 0 });

        this.connections += 1;
    }


    /**
     * checks to see if the given node is connected to this node, returnTheIndex
     * will return an array with both the boolean with true being a connection, and if there is connection it
     * will return the index of the connection in the array, and if there is no connection, it returns -1
     * @param {nodeClass} theNodeOfDesire 
     * @param {bool} returnTheIndex If true, returns the index of the connection in NodeConnection
     * @returns {bool} If they are connected
     */
    this.areTheyConnected = function (theNodeOfDesire, returnTheIndex = false) {
        for (var i = 0; i < this.nodeConnectionLength(); i++) {
            if (this.NodeConnection[i].node.nodeNumber == theNodeOfDesire.nodeNumber) {
                if (returnTheIndex) {
                    return [true, i];

                } else {
                    return true;
                }
            }
        }
        // there was no connection
        if (returnTheIndex) {
            return [false, -1];
        } else {
            return false;
        }
    }

    /**
     * returns array of neighbors
     * the array that is returned has objects that are
     * formatted as {node:refrence to node, cost:cost to node}
     * @param {bool} returnCost If true, it returns NodeConnection but as an array of the nodeclasses
     * @returns {[object]} either returns as array of nodeconnection or 
     */
    this.getNeighbors = function (returnCost = false) {
        if (!(returnCost)) {
            return this.NodeConnection.map(function (item) { return item["node"]; })
        }
        return this.NodeConnection;
    }

    /**
     * if it is already observed, then it will be removed, and set to become a visitor
     * @param {bool} setToVisitor Defaults to true, if you want it to be visitor
     */
    this.setObserver = function (setToVisitor = true) {
        if (this.isObserved) {
            if (setToVisitor) {
                this.setVisited();
            }
            document.getElementById((this.nodeNumber).toString()).classList.remove("observed-node");
            this.isObserved = false;
        } else {
            document.getElementById((this.nodeNumber).toString()).classList.add("observed-node");
            this.isObserved = true;
        }
    }
    /**
     * Toggles current node as visitor
     * @param {bool} newState Optinal, does not toggle visitor and will set or unset visitor
     */
    this.setVisited = function (newState = null) {
        let dune;
        if (newState == dune) {
            if (this.visited) {
                this.visited = false;
            } else {
                this.visited = true;
            }
        } else {
            this.visited = newState;
        }

        // if it is now visited, this adds the visited node
        // otherwise it removes it. The negative werid and 
        if (this.visited) {
            document.getElementById((this.nodeNumber).toString()).classList.add("visited-node");

            // was traversed is for when visited is removed, due to certain algorithems, traversed means it has been there atleast
            document.getElementById((this.nodeNumber).toString()).classList.add("was_travesered");
        } else {
            document.getElementById((this.nodeNumber).toString()).classList.remove("visited-node");
        }
    }

    this.setHeruticOn = function () {
        this.scorefactors.isHueristicFactor = true;
    }

    /**
     * This functions checks the heuristic cost with new one,
     * if it is less than the old one, then it replaces it.
     * 
     * @param {number} newHeuristicCost 
     * @param {nodeClass} endnode 
     * @param {bool} secondarycall Do not use, its for internal use
     * @returns {bool} If herusitic was changed
     */
    this.setDijkstra_heuristic = function (newHeuristicCost, endnode, secondarycall = true) {
        // isItGood says if the function call worked
        var isItGood = true;
        if (secondarycall) {
            isItGood = endnode.setDijkstra_heuristic(newHeuristicCost, this, false);
        }
        var current_end_Node = this.areTheyConnected(endnode, true);
        var curConnection = this.NodeConnection[current_end_Node[1]];
        if ((curConnection.heuristic==null)|((isItGood) && (current_end_Node[0]) && (curConnection.heuristic > newHeuristicCost))) {
            curConnection.heuristic = newHeuristicCost;
            this.scorefactors.isHueristicFactor = true;
            curConnection.heuristic
            return true;
        }

        return false;
    }

    /**
     * This returns heruistic connection
     * @param {nodeClass} endnode 
     * @returns {number} Paths Heuristic
     */
    this.getDijkstra_heuristic = function (endnode) {
        var connection = this.NodeConnection[this.areTheyConnected(endnode, true)[1]];
        var dune;
        if(connection!=dune){
        if(connection.heuristic==null){
            return 0;
        }else{
            return connection.heuristic;
        }}
        
    }

    // * PHYSICAL DISTANCE COST
    /**
     * Sets node class
     * @param {nodeClass} goalNode 
     */
    this.Astar_setGoalNode = function (goalNode) {
        this.goalNode = goalNode;
        this.scorefactors.isDistanceFactor = true;
    }
    this.Astar_GetGoalNode = function () {
        return this.goalNode;
    }
    this.Astar_setIsObserved = function (isItObserved) {
        this.Astar_isItObserved = isItObserved;
    }
    this.Astar_getIsObserved = function () {
        return this.Astar_isItObserved;
    }
    this.Astar_setisItVisited = function (Astar_isItVisited) {
        this.Astar_isItVisited = Astar_isItVisited;
    }
    this.Astar_getisItVisited = function () {
        return this.Astar_isItVisited;
    }
    /**
     * This updates all connections costs, based on distance
     * This does not get triggered if 
     */
    this.Astar_setAllDistanceCosts = function () {
        if (!this.hasRunStarted) {
            for (var i = 0; i < this.nodeConnectionLength(); i++) {
                this.Astar_setDistanceCostToNeighbor_Goal(this.NodeConnection[i].node);
            }
        }
    }

    /**
     * This will set the cost between a node's connections
     * 
     * @param {nodeClass} theNodeOfDesire distance between this node and the other node
     * @param {bool} secondarycall do not use, for internal use
     */
    this.Astar_setDistanceCostToNeighbor_Goal = function (theNodeOfDesire, secondarycall = true, currentDistance = 0) {
        var connection = this.areTheyConnected(theNodeOfDesire, true);


        if (secondarycall) {
            currentDist = this.getConnectionDistanceCost(manhattanDistance(this, this.goalNode));
            if (currentDistance < this.NodeConnection[connection[1]].distanceHeuristic) {
                currentDistance = this.NodeConnection[connection[1]].distanceHeuristic;
            }
            var returnedDistance = theNodeOfDesire.Astar_setDistanceCostToNeighbor_Goal(this, false, currentDist);
            if (returnedDistance > currentDistance) {
                this.NodeConnection[connection[1]].distanceHeuristic = returnedDistance
            } else {
                this.NodeConnection[connection[1]].distanceHeuristic = currentDistance
            }
            return [this.NodeConnection[connection[1]].cost, this.NodeConnection[connection[1]].distanceHeuristic];
        } else {
            // this is the secondary loop
            var returnedDistance = this.getConnectionDistanceCost(manhattanDistance(this, this.goalNode));
            if (returnedDistance < this.NodeConnection[connection[1]].distanceHeuristic) {
                returnedDistance = this.NodeConnection[connection[1]].distanceHeuristic;
            }
            if (returnedDistance > currentDistance) {
                this.NodeConnection[connection[1]].distanceHeuristic = returnedDistance
            } else {
                this.NodeConnection[connection[1]].distanceHeuristic = currentDistance
            }
            return this.NodeConnection[connection[1]].distanceHeuristic;
        }

    }

    /**
     * This will get the cost between the node and goal, if run has started, then it is already locked in
     * 
     * @param {nodeClass} theNodeOfDesire distance between this node and the other node
     * @param {bool} secondarycall do not use, for internal use
     */
    this.Astar_getAstar_Huerisitic = function (theNodeOfDesire) {
        var connection = this.areTheyConnected(theNodeOfDesire, true);
        if (connection[0]) {
            return this.NodeConnection[connection[1]].distanceHeuristic + this.NodeConnection[connection[1]].cost;
        } else {
            console.log("Astar- failed to find connection", this, "=>", theNodeOfDesire)
            return this.getConnectionDistanceCost(manhattanDistance(this, this.goalNode));
        }
        //
    }








    // * THIS HANDLES CONNECTIONS 

    /**
     * This updates all connections costs, based on distance
     * This does not get triggered if hasRunStarted is true
     */
    this.setAllConnectionDistanceCosts = function () {
        if (!this.hasRunStarted) {
            for (var i = 0; i < this.nodeConnectionLength(); i++) {
                this.setConnectionDistanceCostToNeighbor(this.NodeConnection[i].node);
            }
        }
    }

    /**
     * This will set the cost between a node's connections
     * 
     * @param {number} distance distance between this node and the other node
     */
    this.setConnectionDistanceCostToNeighbor = function (theNodeOfDesire, secondarycall = true) {
        var connection = this.areTheyConnected(theNodeOfDesire, true);
        var distance = manhattanDistance(this.getCords(), theNodeOfDesire.getCords())
        this.NodeConnection[connection[1]].cost = this.getConnectionDistanceCost(distance);
        if (secondarycall) {
            theNodeOfDesire.setConnectionDistanceCostToNeighbor(this, false);
        }

    }

    /**
     * This will enable the cost of nodes to be determined by distance from the current node
     * 
     * 
     * @param {number} distance distance between this node and the other node
     */
    this.getConnectionDistanceCost = function (distance) {
        return Math.round((Math.abs(distance / this.NodeCanvasSizeMultipler)));
    }


    this.returnScoreFactors = function () {
        return this.scorefactors;
    }



    /**
     * Returns number of connections
     * @returns {Number} Number of connections
     */
    this.nodeConnectionLength = function () {
        return this.NodeConnection.length;
    }


    /**
     * This function is used to signify to stop changing all connection costs
     */
    this.runHasStarted = function () {
        this.hasRunStarted = true;
    }



    /**
     * If I do a comparison, nodeNumber is the most reliable way to know if 2 nodes are the same
     * 
     * (Node number is the number assosiated with the current node, it is 1 less than what the users see)
     * 
     * @returns {number} the node number of the current node
     */
    this.valueOf = function () {
        return this.nodeNumber;
    }



}