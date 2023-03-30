// THIS IS NOT USED YET, I need to figure out how to make it work. 
// also I basically need to overhaul every action with nodes to use this instead
function nodeClass(x, y, nodeNum, isItGoal = false) {
    this.nodeNumber = nodeNum;
    this.x = x;
    this.y = y;
    this.NodeConnection = [];
    this.connections = 0;

    // refrence to html
    this.HTMLnodes;

    this.isGoal = isItGoal;
    // has it been visited
    this.visited = false;
    // this is when the algorithem is currently looking at it
    this.isObserved = false;
    // this is for when a loop went over this node
    // if this is true it means that it was added to a list of choices somewhere
    this.wasComputed = false;

    this.heuristic = 99999999999999;



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

    // makes the goal a node
    this.makeNodeGoal = function () {
        this.isGoal = true;
    }

    // this is called when the node is added to any list that is being searched.
    this.setWasComputed = function () {
        this.wasComputed = true;
        document.getElementById((this.nodeNumber).toString()).classList.add("was-computer");
    }

    // To goal or not to goal, that is the goal
    this.isThisGoal = function () {
        return this.isGoal;
    }
    // send in the node object that you want to get the cost, if they are connected
    this.getCost = function (theNodeOfDesire) {
        if (this.NodeConnection.length > 0) {
            var areConnected = this.areTheyConnected(theNodeOfDesire, true);
            if (areConnected[0]) {
                var desiredConnection = this.NodeConnection[areConnected[1]];
                return desiredConnection.cost + desiredConnection.heuristic;
            }
        }
    }


    this.getCords = function () {
        return { x: this.x, y: this.y };
    }

    // Connections are objects that have a refrence to the connected node
    // and the cost to said node. Also adding a connection is 2 way
    // secondarycall is used to prevent infinite recursion.
    this.addConnection = function (neighbors_Node, cost, secondarycall = true) {
        //let a = this.nodeNumber;// delete later, meant for debuging
        let dune;
        var letitrun=true;
        if(neighbors_Node!=dune){
            if (secondarycall == true) {
                letitrun =neighbors_Node.addConnection(this, cost,false);
                if(letitrun[0]){
                    this.connectthem(this, cost,false,letitrun[1]);
                    return true;
                }
            }else if (!(this.areTheyConnected(neighbors_Node))) {
                // this is the first connection attempt, and it worked
                return [true,this.connectthem(this, cost)] ;
            }
        }
        // No connection
        return false;
    }

    // does the actually linkage
    this.connectthem = function(neighbors_Node, cost,second_connect =true,pathObject=null){

        this.connectionPrinter(neighbors_Node, cost);
        this.connections += 1;
        if(second_connect){
            pathObject = new nodeConnectionObject(this, cost);
            this.NodeConnection.push(pathObject);
            return pathObject;
        }else{
            pathObject.set_NodeConnection2(this);
            this.NodeConnection.push(pathObject);
        }


    }

    // hold over function, probably should delete.
    this.NewAngle = function (isthisRepeat = false) {
        for (var i = 0; i < this.NodeConnection.length; i++) {
            let currentNeighbor = this.NodeConnection[i];
            currentNeighbor.current_angle = getAngle(this, currentNeighbor.getTheOther(this));
            if (isthisRepeat) {
                currentNeighbor.getTheOther(this).NewAngle(true);
            }
            if (this.nodeNumber == 0) {
                //document.getElementById("curAngleId").textContent = this.NodeConnection[i].current_angle;
            }
        }
        
    }

    // this adds to curConenctionId the current connection. This shows all the connections at the bottom
    // of the site.
    this.connectionPrinter = function (neighbors_Node, cost) {
        // Get the current content of curConenctionId element
        let curConenctionId = document.getElementById("curConenctionId").textContent;
        if (curConenctionId == "None") {
            curConenctionId = "";
        }
        // Append the new connection details to the existing content
        const newConnection = `[${this.nodeNumber+1}] => [${neighbors_Node.nodeNumber+1}] XX `;
        const updatedConenctionId = `${curConenctionId}${newConnection}`;

        // Set the updated content to curConenctionId element
        document.getElementById("curConenctionId").textContent = updatedConenctionId;
    }

    // checks to see if the given node is connected to this node, returnTheIndex
    // will return an array with both the boolean with true being a connection, and if there is connection it
    // will return the index of the connection in the array, and if there is no connection, it returns -1
    this.areTheyConnected = function (theNodeOfDesire, returnTheIndex = false) {
        for (var i = 0; i < this.NodeConnection.length; i++) {
            if ((this.NodeConnection[i].areTheyConnected_Connection(this,theNodeOfDesire))) {
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

    // returns array of neighbors
    // the array that is returned has objects that are
    // formatted as {node:refrence to node, cost:cost to node}
    this.getNeighbors = function (returnCost = false) {
        if (!(returnCost)) {
            return this.NodeConnection.map(function (item) { return item.getTheOther(this); })
        }
        return this.NodeConnection;
    }

    // if it is already observed, then it will be removed, and set to become a visitor
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
    //sets current node as visitor
    // if you put in true or false, it will instead set it to that.
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

    // this sets the Dijkstra heuristic in both paths of the current conncetion
    this.setDijkstra_heuristic = function (newHeuristicCost,endnode,secondarycall = true) {
        var isItGood = true;
        if(secondarycall){
            isItGood =endnode.setDijkstra_heuristic(newHeuristicCost,this,false);
        }
        var current_end_Node = this.areTheyConnected(endnode,true);
        var curConnection = this.NodeConnection[current_end_Node[1]];
        if((isItGood)&&(current_end_Node[0])&&(curConnection.heuristic < newHeuristicCost)){
            curConnection.heuristic = newHeuristicCost;
            return true;
        }

        return false;
    }
    
    // This returns heruistic connection
    this.getDijkstra_heuristic = function (endnode) {
        return this.NodeConnection[this.areTheyConnected(endnode,true)[1]].heuristic;
    }

    // If I do a comparison, nodeNumber is the most reliable way to know if 2 nodes are the same
    this.valueOf = function () {
        return this.nodeNumber;
    }

    

}


function nodeConnectionObject(node, cost, heuristic=0){
    this.nodeConnection1=node;
    this.nodeConnection2;
    this.cost = cost;
    this.heuristic= heuristic;

    
    
    this.set_NodeConnection2= function(node2){
        this.nodeConnection2=node2;
    }
    
    this.areTheyConnected_Connection = function(node1,node2){
        if(((node1==this.nodeConnection1)&&(node2==this.nodeConnection2))||((node2==this.nodeConnection1)&&(node1==this.nodeConnection2))){
            if(((node1==this.nodeConnection1)&&(node1==this.nodeConnection2))||((node2==this.nodeConnection1)&&(node2==this.nodeConnection2)))
            return true;
        }
        return false;
    }

    // Put in a node that you currently know and you will get the other node.
    this.getTheOther = function(currentNode){
        if(this.nodeConnection1!=currentNode){
            return this.nodeConnection1;
        }else{
            return this.nodeConnection2;
        }
    }
}