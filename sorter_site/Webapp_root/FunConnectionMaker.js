
function defunct_connectNodes(nodes, count) {
    console.log("connectNodes ", nodes);

    // Ensure that all nodes have at least one connection
    // For each node, connect it to another random node if it isn't already connected
    for (let i = 0; i < nodes.length; i++) {
        const start = i;

        // check if end is already connected or equal to start
        let end = defunct_findClosestedNeighbor(start, nodes, count);

        for (a = 0; a < end.length; a++) {
            const cost = Math.floor(Math.random() * 10) + 1;
            let didItConnect = nodes[i].addConnection(end[a], cost);
            if (didItConnect) {
                drawConnectionLine_middleman(nodes[i], end[a]);
            }
        }
    }

    console.log("Reconnected the nodes");
}

function defunct_findClosestedNeighbor(node, nodes, numberOfNeighbors) {
    curNumb = 0;

    // used a priority queue in hopes of finding closest neighbors
    const neighbors = new PriorityQueue((a, b) => a[1] > b[1])
    for (var i = 0; i < nodes.length; i++) {
        if (node !== i) {
            neighbors.push([nodes[i], manhattanDistance(nodes[node], nodes[i])]);
        }
    }
    var returnList = [];
    for (var i = 0; i < numberOfNeighbors; i++) {
        var curneighbor = neighbors.pop()[0];
        returnList.push(curneighbor);
    }

    return returnList;
}