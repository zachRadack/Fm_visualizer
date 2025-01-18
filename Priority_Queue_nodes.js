const topp = 0;
const parent = i => ((i + 1) >>> 1) - 1;
const left = i => (i << 1) + 1;
const right = i => (i + 1) << 1;

class PriorityQueue {
    constructor(comparator = (a, b) => a > b) {
        this.heap = [];
        this._comparator = comparator;
    }

    printEntireTreePriority() {
        for (let i = 0; i < this.heap.length; i++) {
            document.getElementById("currentChoices").value += this.heap[i].priority;
        }
    }
    size() {
        return this.heap.length;
    }
    isEmpty() {
        return this.size() == 0;
    }
    peek() {
        return this.heap[topp];
    }
    push(...values) {
        values.forEach(value => {
            this.heap.push(value);
            this._siftUp();
        });
        return this.size();
    }
    pop() {
        const poppedValue = this.peek();
        const bottom = this.size() - 1;
        if (bottom > topp) {
            this._swap(topp, bottom);
        }
        this.heap.pop();
        this._siftDown();
        return poppedValue;
    }
    replace(value) {
        const replacedValue = this.peek();
        this.heap[topp] = value;
        this._siftDown();
        return replacedValue;
    }
    _greater(i, j) {
        return this._comparator(this.heap[i], this.heap[j]);
    }
    _swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
    _siftUp() {
        let node = this.size() - 1;
        while (node > topp && this._greater(node, parent(node))) {
            this._swap(node, parent(node));
            node = parent(node);
        }
    }
    _siftDown() {
        let node = topp;
        while (
            (left(node) < this.size() && this._greater(left(node), node)) ||
            (right(node) < this.size() && this._greater(right(node), node))
        ) {
            let maxChild = (right(node) < this.size() && this._greater(right(node), left(node))) ? right(node) : left(node);
            this._swap(node, maxChild);
            node = maxChild;
        }
    }
    setComparator(comparator) {
        this._comparator = comparator;
        this._rebuildHeap();
    }

    _rebuildHeap() {
        const oldHeap = this.heap;
        this.heap = [];
        oldHeap.forEach(value => {
            this.push(value);
        });
    }

    print() {
        console.log(this.heap);
    }

    
}



class PriorityQueue_graphmaker {
    constructor() {
        this.items = [];
    }

    push(element, priority) {
        let dune;
        //if()
        let queueElement = { element, priority };

        let added = false;
        for (let i = 0; i < this.items.length; i++) {
            if (Math.abs(queueElement.priority) < Math.abs(this.items[i].priority)) {
                this.items.splice(i, 0, queueElement);
                added = true;
                break;
            }
        }

        if (!added) {
            this.items.push(queueElement);
        }


    }


    pop() {
        return this.items.shift();
    }

    front() {
        return this.items[0];
    }

    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }

    print() {
        console.log(this.items);
    }
}