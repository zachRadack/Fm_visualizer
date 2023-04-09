const topp = 0;
const parent = i => ((i + 1) >>> 1) - 1;
const left = i => (i << 1) + 1;
const right = i => (i + 1) << 1;

class PriorityQueue {
    constructor(comparator = (a, b) => a > b) {
        this._heap = [];
        this._comparator = comparator;
    }
    printEntireTreePriority() {
        for (let i = 0; i < this._heap.length; i++) {
            document.getElementById("currentChoices").value += this._heap[i].priority;
            ;
        }
    }
    size() {
        return this._heap.length;
    }
    isEmpty() {
        return this.size() == 0;
    }
    peek() {
        return this._heap[topp];
    }
    push(...values) {
        values.forEach(value => {
            this._heap.push(value);
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
        this._heap.pop();
        this._siftDown();
        return poppedValue;
    }
    replace(value) {
        const replacedValue = this.peek();
        this._heap[topp] = value;
        this._siftDown();
        return replacedValue;
    }
    _greater(i, j) {
        return this._comparator(this._heap[i], this._heap[j]);
    }
    _swap(i, j) {
        [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
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
        const oldHeap = this._heap;
        this._heap = [];
        oldHeap.forEach(value => {
            this.push(value);
        });
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
    printEntireTreePriority() {
        for (let i = 0; i < this._heap.length; i++) {
            document.getElementById("currentChoices").value += this._heap[i].priority;
            ;
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