/**
 * This uses currently pasted json text in NodeBuilderTextBox, and will print it out into the canvas.
 * 
 */
function import_graph(){
    let graph = JSON.parse(document.getElementById("NodeBuilderTextBox").value);
    console.log(graph);
    current_screen.import_graph(graph);
}


/**
 * @param 
 */
function print_out_json_node(node){

}

/**
 * This adds a new node and connection to the graph
 * @param {nodeClass} node1 - The first node
 * @param {nodeClass} node2 - The second node
 * @param {number} cost - The cost of the connection
 */
function print_out_json_connection(node1,node2,cost){
    if(document.getElementById("NodeBuilderTextBox").value.slice(-1)=="}"){
        document.getElementById("NodeBuilderTextBox").value +=",";
    }
    document.getElementById("NodeBuilderTextBox").value +=(`{node1:${node1.nodeNumber+1},node2:${node2.nodeNumber+1},cost:${cost}}`)
}


function produce_Nodes(graph){
    let nodes = [];
    for (let i = 0; i < graph.length; i++) {
        nodes.push(new nodeClass(graph[i].x,graph[i].y,graph[i].nodeNumber,graph[i].color));
    }
    return nodes;
}