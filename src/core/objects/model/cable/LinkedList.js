class Node {
    constructor(element, object = null) {
        this.element = element;
        this.object = object;
        this.next = null;
        this.count = 0;
    }
}

export default class LinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }

    add(element, object = null) {
        const node = new Node(element, object);
        let current;
 
        if (this.head == null) {
            this.head = node;
        }
        else {
            current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = node;
        }
        this.size++;
        node.count = this.size;
    }

    // eslint-disable-next-line consistent-return
    insertAt(element, index) {
        if (index < 0 || index > this.size) {
            return console.log('Please enter a valid index.');
        }

        const node = new Node(element);
        let curr;
        let prev;

        curr = this.head;

        if (index === 0) {
            node.next = this.head;
            this.head = node;
        }
        else {
            curr = this.head;
            let it = 0;

            while (it < index) {
                it++;
                prev = curr;
                curr = curr.next;
            }
            node.next = curr;
            prev.next = node;
        }
        this.size++;
    }

    removeAt(index) {
        if (index < 0 || index >= this.size) {
            return console.log('Please Enter a valid index');
        }

        let curr;
        let prev;
        let it = 0;
        curr = this.head;
        prev = curr;

        // deleting first element
        if (index === 0) {
            this.head = curr.next;
        }
        else {
            while (it < index) {
                it++;
                prev = curr;
                curr = curr.next;
            }
            prev.next = curr.next;
        }
        this.size--;

        return curr.element;
    }

    removeElement(element) {
        let current = this.head;
        let prev = null;

        while (current != null) {
            if (current.element === element) {
                if (prev == null) {
                    this.head = current.next;
                }
                else {
                    prev.next = current.next;
                }
                this.size--;
                // current.count = this.size;
                this.updateCount(current);
                return current.element;
            }
            prev = current;
            current = current.next;
        }
        return -1;
    }

    updateCount(curr) {
        while (curr) {
            curr.count -= 1;
            curr = curr.next;
        }
    }

    indexOf(element) {
        let count = 0;
        let current = this.head;

        while (current != null) {
            if (current.element === element) {
                return count;
            }
            count++;
            current = current.next;
        }
        return -1;
    }

    isEmpty() {
        return this.size === 0;
    }

    sizeOfList() {
        return this.size;
    }

    printList() {
        let curr = this.head;
        let str = '';
        while (curr) {
            str += `${curr.element} `;
            curr = curr.next;
        }
        console.log(str);
    }

    getObject(count) {
        let curr = this.head;
        while (curr) {
            if (curr.count === count) {
                return {
                    obj: curr.object.id,
                    size: this.size,
                    count: curr.count,
                };
            }
            curr = curr.next;
        }
        return null;
    }
}
