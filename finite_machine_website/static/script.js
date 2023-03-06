const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

const nodes = [
    { id: 'node1', x: 50, y: 50, neighbors: [['node2', 5], ['node3', 2]] },
    { id: 'node2', x: 200, y: 50, neighbors: [['node1', 1], ['node3', 3], ['node4', 1]] },
    { id: 'node3', x: 50, y: 150, neighbors: [['node1', 2], ['node2', 3], ['node5', 1]] },
    { id: 'node4', x: 120, y: 200, neighbors: [['node1', 2], ['node2', 3], ['node5', 1]] },
    { id: 'node5', x: 250, y: 150, neighbors: [['node2', 1], ['node3', 1], ['node4', 1]] }
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
  
  let path = [];

  function findShortestPath() {
    if (path.length === 0) {
      const dist = {};
      const prev = {};
      const queue = new PriorityQueue((a, b) => dist[a] < dist[b]);
  
      nodes.forEach(node => {
        dist[node.id] = Infinity;
        prev[node.id] = null;
        queue.enqueue(node.id);
      });
  
      dist[startNode] = 0;
  
      while (!queue.isEmpty()) {
        const curr = queue.dequeue();
  
        if (curr === goalNode) {
          break;
        }
  
        nodes.find(node => node.id === curr).neighbors.forEach(([neighborId, weight]) => {
          const neighbor = nodes.find(node => node.id === neighborId);
          const alt = dist[curr] + weight;
          if (alt < dist[neighborId]) {
            dist[neighborId] = alt;
            prev[neighborId] = curr;
            queue.decreaseKey(neighborId);
          }
        });
  
        path = [goalNode];
        while (prev[path[0]] !== null) {
          path.unshift(prev[path[0]]);
        }
      }
    } else {
      if (path.length > 1) {
        const fromNode = nodes.find(node => node.id === path[0]);
        const toNode = nodes.find(node => node.id === path[1]);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 6* devicePixelRatio;
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
        path.shift();
      } else {
        path = [];
      }
    }
  }
  

  document.getElementById('step-button').addEventListener('click', () => {
    const algorithm = document.getElementById('algorithm').value;
    if (algorithm === 'dijkstra') {
      // Dijkstra's algorithm
      if (path.length === 0) {
        const startNode = document.getElementById('start').value;
        const goalNode = document.getElementById('goal').value;
        path = dijkstra(startNode, goalNode);
        if (path === null) {
          alert('No path found!');
        }
      } else {
        const fromNode = nodes.find(node => node.id === path[0]);
        const toNode = nodes.find(node => node.id === path[1]);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 6 * devicePixelRatio;
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
        path.shift();
      }
    } else if (algorithm === 'dfs') {
      // Depth-first search
      if (path.length === 0) {
        const startNode = document.getElementById('start').value;
        const goalNode = document.getElementById('goal').value;
        path = depthFirstSearch(startNode, goalNode);
        if (path === null) {
          alert('No path found!');
        }
      } else {
        const fromNode = nodes.find(node => node.id === path[0]);
        const toNode = nodes.find(node => node.id === path[1]);
        if (fromNode && toNode) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 6 * devicePixelRatio;
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
        }

      }
    } else {
      // Unknown algorithm
      alert('Unknown algorithm!');
    }
  });
  

  
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
  


  function depthFirstSearch(startNode, goalNode) {
  let visited = new Set();
  let stack = [startNode];
  let path = [];

  while (stack.length > 0) {
    let currNode = stack.pop();
    path.push(currNode);

    if (currNode === goalNode) {
      return path;
    }

    visited.add(currNode);
    resetCanvas();
    drawNodes();
    drawTransitions();

    nodes.forEach(node => {
      if (!visited.has(node.id) && node.neighbors.map(n => n[0]).includes(currNode)) {
        stack.push(node.id);
        visited.add(node.id);
      }
    });

    nodes.forEach(node => {
      const fromNode = nodes.find(n => n.id === currNode);
      const toNode = nodes.find(n => n.id === node.id);
      if (fromNode.neighbors.map(n => n[0]).includes(node.id)) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2 * devicePixelRatio;
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
      }
    });

    const currentNode = nodes.find(node => node.id === currNode);
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 4 * devicePixelRatio;
    ctx.beginPath();
    ctx.arc(currentNode.x, currentNode.y, 20, 0, 2 * Math.PI);
    ctx.stroke();
  }
  return null;
}



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

  