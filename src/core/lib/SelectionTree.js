export default class SelectionTree {
    constructor(elementsList = []) {
        this.map = new Map();

        if (elementsList.length > 0) {
            this.addNestedElements(elementsList);
        }
    }


    // Helper Functions

    _searchNodeUtil(element, map = this.map, path = []) {
        if (map.size === 0) {
            // reached the bottom
            // this search was all in wain
            return false;
        }
        else if (map.has(element)) {
            path.push(element);
            this.path = path;
            return true;
        }

        for (const entries of map) {
            path.push(entries[0]);
            if (!this._searchNodeUtil(element, entries[1], path)) {
                path.pop();
            }
            else {
                return true;
            }
        }

        return false;
    }

    _getNodeFromPath(path, map = this.map) {
        if (path.length > 0) {
            let tempMap = map;
            for (let idx = 0; idx < path.length - 1; idx++) {
                tempMap = tempMap.get(path[idx]);
            }
            return tempMap;
        }
        return new Map();
    }

    _getElementsAtLevel(level = 0, map = this.map) {
        let elements = [];
        if (level === 0) {
            for (const entry of map) {
                elements.push(entry[0]);
            }
        }
        else {
            for (const entry of map) {
                elements = elements.concat(this._getElementsAtLevel(level - 1, entry[1]));
            }
        }
        return elements;
    }

    _getHeight(map = this.map) {
        if (map.size === 0) {
            return 0;
        }

        const childHeights = [];
        for (const entry of map) {
            childHeights.push(this._getHeight(entry[1]));
        }
        const maxHeight = Math.max(...childHeights);
        return maxHeight + 1;
    }


    // Tree Manipulation

    addNestedElements(elementsList) {
        // initializing empty so that empty map can be returned when elementsList is empty
        let lastMap = new Map();
        // adding the last element key with {} as value
        lastMap = lastMap.set(
            elementsList[elementsList.length - 1],
            new Map(),
        );

        // iteratively making a recursive map
        for (let idx = elementsList.length - 2; idx >= 0; idx--) {
            lastMap = new Map([[
                elementsList[idx],
                lastMap,
            ]]);
        }

        this.map = lastMap;
    }

    searchNode(element, map = this.map) {
        if (this._searchNodeUtil(element, map, [])) {
            const path = this.path;
            delete this.path;
            return path;
        }

        return [];
    }

    deleteNode(element) {
        const path = this.searchNode(element);

        if (path.length > 0) {
            // remove the inner most thing
            let innerMap = this._getNodeFromPath(path);
            innerMap.delete(element);

            // now iteratively checking for childless parents
            for (let idx = path.length - 2; idx >= 0; idx--) {
                innerMap = this._getNodeFromPath(path.slice(0, idx + 1));

                if (innerMap.get(path[idx]).size === 0) {
                    // that is it is an empty map now
                    innerMap.set(path[idx], {});
                }
                else {
                    // it is not empty and it's parent won't be empty either
                    break;
                }
            }
        }

        // else the element was not there so don't care
    }

    mergeMap(newSelectionTree) {
        // add the new selection tree's map to this' map
        // TODO: Doesn't concat properly right now need to look into it

        // for each head of the newSelectionTree
        // search for that element in this.map
        // if found, append it to that element's children
        // else, add it at root

        for (const entries of newSelectionTree.map) {
            const path = this.searchNode(entries[0]);
            const node = this._getNodeFromPath(path);

            let oldEntry;
            if (node.size === 0) {
                oldEntry = new Map();
            }
            else {
                oldEntry = node.get(entries[0]);
            }

            const newEntry = entries[1];

            const mergeEntry = new Map([...oldEntry, ...newEntry]);
            node.set(entries[0], mergeEntry);
        }
    }


    // Object Retrieval

    prettyPrint(map = this.map, tabs = 0) {
        // helper functions to assess the map - can remove this later

        for (const k of map) {
            console.log('\t'.repeat(tabs), k[0].name);
            if (k[1] instanceof Map) {
                this.prettyPrint(k[1], tabs + 1);
            }
        }
        return this.map;
    }

    getSelectionList() {
        // used to get options for selection in list format
        // some Object logic has to come here to decide on the items
        // since right now multiple objects won't be selected so list logic is pretty straightforward
        // it is just un-nest the elements and return in the reverse order

        const selectionList = [];

        const height = this._getHeight();
        for (let idx = height - 1; idx >= 0; idx--) {
            selectionList.push(this._getElementsAtLevel(idx));
        }

        return selectionList;
    }
}
