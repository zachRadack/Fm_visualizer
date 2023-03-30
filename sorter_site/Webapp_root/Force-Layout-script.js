//This is an attempt at creating my own custom force layout
class simulation {
    /**
     * 
     * @param {int} width - The width of the canvas
     * @param {int} height - The height of the canvas
     * @param {[nodeClass]} nodes - The nodes that are being checked
     * @param {boolean} isSimulated - If the simulation is being run, off by default
     */
    constructor(width, height, nodes,isSimulated=false) {
        this.width = width;
        this.height = height;
        
        this.isSimulated = isSimulated;
        this.vx_list=new Array();
        this.vy_list=new Array();
        this.vx_list_neg=new Array();
        this.vy_list_neg=new Array();
        this.simulationLoop(nodes);
        this.animationId;

        this.globalcurPath=[];
        
    }

    /**
     * Sets the globalcurPath, it represents current algorithems path
     * 
     * @param {Object} curPath - Object that is the current path of the algorithm
     * @param {[pathClass]} curPath.curentPath - The current path of the algorithm
     * @param {int} curPath.curCost - The current cost of the algorithm
     * 
     */
    curPath_setter(curPath){
        this.globalcurPath=curPath;
    }

    /** 
     * Define the simulation loop
     * 
     * @param {[nodeClass]} nodes - The nodes that are being checked
     */
    simulationLoop(nodes) {
        if(this.isSimulated){
            this.simulateForces(nodes);
        }
        
        this.checkCollisions(nodes);

        this.updatePositions(nodes);
        
        this.vx_list=new Array();
        this.vy_list=new Array();
        this.vx_list_neg=new Array();
        this.vy_list_neg=new Array();

        // Schedule the next loop iteration
        this.animationId = requestAnimationFrame(() => {
            this.simulationLoop(nodes);
            drawConnections(nodes,this.globalcurPath);
        });
    };

    stopAnimation() {
        cancelAnimationFrame(this.animationId);
    }
    

    /** Define the boundary force, which is canvas not perfect
     *  if they go fast enough, more meant as a light push back into reality.
     * Does what centering force does, but even stronger
     * 
     * @param {nodeClass} node - The node that is being checked
     * */
    boundaryForce(node) {
        const padding = 100;
        const x = node.x;
        const y = node.y;
        const radius = node.radius;

        let fx = 0;
        let fy = 0;

        if (x - radius < padding) {
            fx += (padding - (x - radius))** 2;
        } else if (x + radius > this.width - padding) {
            fx -= (x + radius - this.width + padding)** 2;
        }

        if (y - radius < padding) {
            fy += (padding - (y - radius))** 2;
        } else if (y + radius > this.height - padding) {
            fy -= (y + radius - this.height + padding)** 2;
        }
        
        node.vx += fx;
        node.vy += fy;
        
    }

    /**
     * This updates nodes vx and xy based on their masss and distance from each other
     * and pulls them away from each other
     * @param {nodeClass} node1 
     * @param {nodeClass} node2 
     */
    attractionForce(node1, node2) {
        const dx = node2.x - node1.x;
        const dy = node2.y - node1.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        const force = distance === 0 ? 0 : (distance ** 2) / node1.mass;
        const fx = force * dx / distance;
        const fy = force * dy / distance;
        node1.vx = fx;
        node1.vy = fy;
        node2.vx = -fx;
        node2.vy = -fy;

    };

    /**
     * This updates nodes vx and xy based on their masss and distance from each other
     * and pushes them away from each other
     * @param {nodeClass} node1 
     * @param {nodeClass} node2 
     */
    repulsionForce(node1, node2) {
        const dx = node2.x - node1.x;
        const dy = node2.y - node1.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        const force = distance === 0 ? 0 : node1.mass * node2.mass / (distance ** 30);

        const fx = force * dx / distance;
        const fy = force * dy / distance;
        node1.vx -= fx;
        node1.vy -= fy;
        node2.vx += fx;
        node2.vy += fy;

    };


    /**
     * This tries to attract nodes to the center of the canvas
     * Comparatively weak force, though it is also exponential after a certain point.
     * 
     * @param {nodeClass} node the node to center
     */
    centeringForce(node) {

        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const dx = centerX - node.x;
        const dy = centerY - node.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        const force = 6* distance;
        node.vx += force * dx / distance;
        node.vy += force * dy / distance;
    };

    /** 
     * this does all the attract, repulse, boundry and then centering
     * 
     * 
     * @param {[nodeClass]} nodes - The nodes that are being checked
     * 
     */
    simulateForces(nodes) {
        for (const node of nodes) {
            if ((node.beingDragged == false)) {
                let neighbors = node.getNeighbors();
                
                for (const link of neighbors) {
                    
                    this.attractionForce(node, link);
                }
                for (const otherNode of nodes.filter((n) => n.nodeNumber !== node.nodeNumber)) {
                    if ((otherNode.beingDragged == false)) {
                        this.repulsionForce(node, otherNode);
                    }
                }
                
                
            }
        }
        for (const node of nodes) {
            if ((node.beingDragged == false)) {
                this.boundaryForce(node); // Add the boundary force
                this.centeringForce(node);
                // Normalize the velocity if it exceeds a certain threshold
                const speedThreshold = 10;
                const speed = Math.sqrt(node.vx ** 2 + node.vy ** 2);
                if (speed > speedThreshold) {
                    node.vx = (node.vx / speed) * speedThreshold;
                    node.vy = (node.vy / speed) * speedThreshold;
                }

                if (node.vx > 0) {
                    this.vx_list.push(node.vx);
                    this.vy_list.push(node.vy);
                } else {
                    this.vx_list_neg.push(node.vx);
                    this.vy_list_neg.push(node.vy);
                }

            }
        }
    }
    


    // Check if two nodes are overlapping
    checkNodeCollision(node1, node2) {
        const dx = node2.x - node1.x;
        const dy = node2.y - node1.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        // Check if the two nodes are overlapping
        return distance < node1.radius + node2.radius;
    };

    // Check for collisions between all pairs of nodes
    checkCollisions(nodes) {
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (this.checkNodeCollision(nodes[i], nodes[j])) {
                    // Resolve the collision by bouncing the nodes apart
                    const dx = nodes[j].x - nodes[i].x;
                    const dy = nodes[j].y - nodes[i].y;
                    const distance = Math.sqrt(dx ** 2 + dy ** 2);
                    const overlap = (nodes[i].radius + nodes[j].radius) - distance;
                    const angle = Math.atan2(dy, dx);
                    const node1Bounce = nodes[i].mass / (nodes[i].mass + nodes[j].mass);
                    const node2Bounce = nodes[j].mass / (nodes[i].mass + nodes[j].mass);
                    nodes[i].x -= overlap * node2Bounce * Math.cos(angle);
                    nodes[i].y -= overlap * node2Bounce * Math.sin(angle);
                    nodes[j].x += overlap * node1Bounce * Math.cos(angle);
                    nodes[j].y += overlap * node1Bounce * Math.sin(angle);
                    this.updateCSSmovement(nodes[i]);
                    this.updateCSSmovement(nodes[j]);
                }
            }
        }
    };


    // this function normalizes all the speeds in hopes of
    // preventing them from going suborbital
    // take half of what ever normalizeVal is and that is the pos and neg
    // speed limit they will go
    // this is the speed limit <============================================
    speedNormalizer(nodes){
        var normalizeVal = 6;
        const min_vx = Math.min(...this.vx_list);
        const max_vx = Math.max(...this.vx_list);
        const min_vy = Math.min(...this.vy_list);
        const max_vy = Math.max(...this.vy_list);
        for (const node of nodes){
            node.vx = (node.vx - min_vx) / (max_vx - min_vx) * normalizeVal - (normalizeVal/2);
            node.vy = (node.vy - min_vy) / (max_vy - min_vy) * normalizeVal - (normalizeVal/2);
        }
        //return NormalizedSpeds
    }

    

    // Update the positions of the nodes based on the forces
    updatePositions(nodes) {
        if(this.isSimulated){
            //this.speedNormalizer(nodes);
        }
        for (const node of nodes) {
            if ((node.beingDragged == false)) {
            //dampen the velocity to avoid infinite oscillation
            // do not put after or they nodes will party
            // also kills off lots of speed.
            node.vx *= 0.1;   
            node.vy *= 0.1; 

            // transfer velocities into speeds
            node.x += node.vx;
            node.y += node.vy;

            this.updateCSSmovement(node);
            }
        }
    };

    
      




    updateCSSmovement(node) {
        // Get the element with ID "myElement"
        let myElement = document.getElementById(node.nodeNumber);
        console.log()
        // Set the "left" and "top" CSS properties
        myElement.style.left = node.x - 10 + "px";
        myElement.style.top = node.y - 10 + "px";
    }




}