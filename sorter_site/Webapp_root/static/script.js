const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
let path = [];
const nodes = [
    { id: 'node1', x: 50, y: 50, neighbors: [['node2', 5], ['node3', 2]] },
    { id: 'node2', x: 200, y: 50, neighbors: [['node1', 1], ['node3', 3], ['node4', 3], ['node5', 1]] },
    { id: 'node3', x: 50, y: 150, neighbors: [['node1', 2], ['node2', 3], ['node5', 1]] },
    { id: 'node4', x: 120, y: 200, neighbors: [['node1', 2], ['node2', 3], ['node5', 1]] },
    { id: 'node5', x: 250, y: 150, neighbors: [['node2', 1], ['node3', 1], ['node4', 1]] },
    { id: 'node6', x: 300, y: 150, neighbors: [['node5', 1]] }
    // add more nodes as needed
  ];
   

let startNode = 'node1';
let goalNode = 'node4';


// draws the nodes
function drawNodes() {
  nodes.forEach(node => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.fillText(node.id, node.x - 10, node.y - 30);

  });
}


// draw the lines between the nodes
function drawTransitions() {
  nodes.forEach(node => {
        node.neighbors.forEach(([neighborId, weight]) => {
        const neighbor = nodes.find(n => n.id === neighborId);
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(neighbor.x, neighbor.y);

        const x = (node.x + neighbor.x) / 2;
        const y = (node.y + neighbor.y) / 2 - 10;
        ctx.strokeStyle = 'white';
        ctx.stroke();
        ctx.fillStyle = 'white';
        ctx.fillText(weight, x, y);

    });
  });
}

  
  
function drawPath(path) {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 6* devicePixelRatio;
    for (let i = 0; i < path.length - 1; i++) {
      const fromNode = nodes.find(node => node.id === path[i]);
      const toNode = nodes.find(node => node.id === path[i + 1]);
      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.stroke();
    }
  }
  
  function resetCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNodes();
    drawTransitions();
  }
  


  let currentPathIndex=0;

  document.getElementById('step-button').addEventListener('click', () => {
    const algorithm = document.getElementById('algorithm').value;
    //console.log(path.length);
    if (currentPathIndex === 0) {
      // Algorithm has not been run yet
      if (algorithm === 'dfs') {
        path = dfs(startNode, goalNode);
      } else if (algorithm === 'bfs') {
        path = bfs(startNode, goalNode);
      } else {
        // Unknown algorithm
        alert('Unknown algorithm!');
      }
      
      if (path) {
        resetCanvas();
        drawPath(path);
        const firstNode = nodes.find(n => n.id === path[0]);
        const firstTransition = nodes.find(n => n.neighbors.some(([neighborId]) => neighborId === path[1]));
        highlightNode(firstNode, firstTransition);
      }
    } else if (currentPathIndex < path.length - 1) {
      // Algorithm has been run and there are more nodes to highlight
      console.log(path);
      const nextNode = nodes.find(n => n.id === path[currentPathIndex + 1]);
      const currentTransition = nodes.find(n => n.neighbors.some(([neighborId]) => neighborId === path[currentPathIndex]));
      const nextTransition = nodes.find(n => n.neighbors.some(([neighborId]) => neighborId === path[currentPathIndex + 2]));
      highlightNode(nextNode, nextTransition, currentTransition);
      currentPathIndex++;
    }else{
      currentPathIndex=0;
    }
  });
  
  
  function dfs(start, goal) {
    const visited = new Set();
    const stack = [{ node: start, path: [] }];
    
    while (stack.length > 0) {
      const { node, path } = stack.pop();
      
      if (visited.has(node)) {
        continue;
      }
      
      path.push(node);
      visited.add(node);
      
      if (node === goal) {
        return path;
      }
      
      const neighbors = nodes.find(n => n.id === node).neighbors;
      neighbors.forEach(([neighborId]) => {
        if (!visited.has(neighborId)) {
          stack.push({ node: neighborId, path: [...path] });
        }
      });
    }
    
    return null;
  }
  
  function bfs(start, goal) {
    const visited = new Set();
    const queue = [{ node: start, path: [] }];
    
    while (queue.length > 0) {
      const { node, path } = queue.shift();
      
      if (visited.has(node)) {
        continue;
      }
      
      path.push(node);
      visited.add(node);
      
      if (node === goal) {
        return path;
      }
      
      const neighbors = nodes.find(n => n.id === node).neighbors;
      neighbors.forEach(([neighborId]) => {
        if (!visited.has(neighborId)) {
          queue.push({ node: neighborId, path: [...path] });
        }
      });
    }
    
    return null;
  }
  
  
  function highlightNode(node, transition, prevTransition) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = 'green';
    ctx.fill();
    
    if (transition) {
        ctx.beginPath();
        ctx.moveTo(transition.x, transition.y);
        ctx.lineTo(node.x, node.y);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 6 * window.devicePixelRatio;
        ctx.stroke();
    }
    if (prevTransition) {
        ctx.beginPath();
        ctx.moveTo(prevTransition.x, prevTransition.y);
        ctx.lineTo(node.x, node.y);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 6 * window.devicePixelRatio;
        ctx.stroke();
    }
}

  
  canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    nodes.forEach(node => {
      const dist = Math.sqrt((node.x - mouseX) ** 2 + (node.y - mouseY) ** 2);
      if (dist < 20) {
        canvas.addEventListener('mousemove', moveNode);
        canvas.addEventListener('mouseup', stopMovingNode);
        node.isDragging = true;
      }
    });
  });
  
  function moveNode(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    nodes.filter(node => node.isDragging).forEach(node => {
      node.x = mouseX;
      node.y = mouseY;
    });
    resetCanvas();
  }
  
  function stopMovingNode(e) {
    canvas.removeEventListener('mousemove', moveNode);
    canvas.removeEventListener('mouseup', stopMovingNode);
    nodes.forEach(node => node.isDragging = false);
  }
  
  document.getElementById('start').addEventListener('change', e => {
    startNode = e.target.value;
  });
  
  document.getElementById('goal').addEventListener('change', e => {
    goalNode = e.target.value;
  });
  
  
  drawNodes();
  drawTransitions();
  


  


  class PriorityQueue {
    constructor(comparator = (a, b) => a < b) {
      this._heap = [];
      this._comparator = comparator;
    }
  
    enqueue(value) {
      this._heap.push(value);
      this._siftUp();
    }
  
    dequeue() {
      const value = this._heap[0];
      const lastValue = this._heap.pop();
      if (this._heap.length > 0) {
        this._heap[0] = lastValue;
        this._siftDown();
      }
      return value;
    }
  
    decreaseKey(value) {
      const index = this._heap.indexOf(value);
      this._siftUp(index);
    }
  
    isEmpty() {
      return this._heap.length === 0;
    }
  
    _getParentIndex(childIndex) {
      return Math.floor((childIndex - 1) / 2);
    }
  
    _getLeftChildIndex(parentIndex) {
      return parentIndex * 2 + 1;
    }
  
    _getRightChildIndex(parentIndex) {
      return parentIndex * 2 + 2;
    }
  
    _siftUp(index = this._heap.length - 1) {
      const value = this._heap[index];
      while (index > 0) {
        const parentIndex = this._getParentIndex(index);
        const parentValue = this._heap[parentIndex];
        if (this._comparator(value, parentValue)) {
          this._heap[parentIndex] = value;
          this._heap[index] = parentValue;
          index = parentIndex;
        } else {
          break;
        }
      }
    }
  
    _siftDown(index = 0) {
      const value = this._heap[index];
      while (true) {
        const leftChildIndex = this._getLeftChildIndex(index);
        const rightChildIndex = this._getRightChildIndex(index);
        let smallestChildIndex = index;
        if (leftChildIndex < this._heap.length && this._comparator(this._heap[leftChildIndex], this._heap[smallestChildIndex])) {
          smallestChildIndex = leftChildIndex;
        }
        if (rightChildIndex < this._heap.length && this._comparator(this._heap[rightChildIndex], this._heap[smallestChildIndex])) {
          smallestChildIndex = rightChildIndex;
        }
        if (smallestChildIndex !== index) {
          this._heap[index] = this._heap[smallestChildIndex];
          this._heap[smallestChildIndex] = value;
          index = smallestChildIndex;
        } else {
          break;
        }
      }
    }
  }

  