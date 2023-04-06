/**
 * This uses currently pasted json text in NodeBuilderTextBox, and will return the nodes and connections
 * jsons.
 * @return {array} - The nodes object and connections object
 */
function import_graph(){
    console.log(document.getElementById("NodeBuilderTextBox").value);
    let nodes_Str = document.getElementById("NodeBuilderTextBox").value.split("|");
    console.log(nodes_Str);
    var nodes_list = nodes_Str[0].split(";");
    var nodes_json = jsonConverter(nodes_list);
    
    var connections_list = nodes_Str[1].split(";");
    var connections_json = jsonConverter(connections_list);

    return {nodes_json:nodes_json,connections_json:connections_json};
}

/**
 * This converts a list of json strings to a list of json objects.
 * @param {[strr]} json_str_array - The array of json strings
 * @return {[json]} - The array of json objects
 */
function jsonConverter(json_str_array){
    let returnJSON = [];
    for (let i = 0; i < json_str_array.length; i++) {
        returnJSON.push(JSON.parse(json_str_array[i]));
    }
    return returnJSON;
}

    // let nodes = [];
    // for (let i = 0; i < json_str.length; i++) {
    //     nodes.push(new nodeClass(json_str[i].x,json_str[i].y,json_str[i].nodeNumber,json_str[i].color));
    // }
    // return nodes;
/**
 * This adds a json node to the NodeBuilderTextBox
 * @param {nodeClass} node - The node to print
 */
function print_out_json_node(node){
    var TextArea=document.getElementById("NodeBuilderTextBox");
    console.log(TextArea.value.slice(-1));
    if(TextArea.value.charAt(TextArea.value.length - 1)=="|"){
        TextArea.value =TextArea.value.substring(0, TextArea.value.length-1)+";";
    }
    TextArea.value +=(`{"x":${node.x},"y":${node.y},"nodeNumber":${node.nodeNumber+1}}|`)
}

/**
 * This adds a json connection to the NodeBuilderTextBox
 * @param {nodeClass} node1 - The first node
 * @param {nodeClass} node2 - The second node
 * @param {number} cost - The cost of the connection
 */
function print_out_json_connection(node1,node2,cost){
    if(document.getElementById("NodeBuilderTextBox").value.slice(-1)=="}"){
        document.getElementById("NodeBuilderTextBox").value +=";";
    }
    document.getElementById("NodeBuilderTextBox").value +=(`{"node1":${node1.nodeNumber+1},"node2":${node2.nodeNumber+1},"cost":${cost}}`)
}


function produce_Nodes(graph){
    let nodes = [];
    for (let i = 0; i < graph.length; i++) {
        nodes.push(new nodeClass(graph[i].x,graph[i].y,graph[i].nodeNumber,graph[i].color));
    }
    return nodes;
}