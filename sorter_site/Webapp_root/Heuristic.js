class theHeuristic{

    constructor(width, height, nodes,startnode,endnode,isSimulated=false){
        this.width = width;
        this.height = height;
        

        // If true, it means this thing will update with node movement.
        this.isSimulated = isSimulated;

        setNodeHeuristic(nodes,endnode);
        
    }


    setNodeHeuristic(nodes,endnode){
        for (const node of nodes) {
            
            node.getHeuristicDistance(endnode);
        }

    }
    setNodeScore(){


    }



}