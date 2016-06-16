var Node = require('./node');
var NodeArray = require('./nodeArray');
var Edge = require('./edge');
var EdgeArray = require('./edgeArray');
var Component = require('./component');
var EdgeComponent = require('./edgeComponent');
// var Edge = require('./edge');
// var DirectedEdge = require('./directedEdge');
/**
 * represents a Graph
 * @exports Graph
 * @constructor
 * @memberOf! module:graphTheory
 */
class Graph {
    constructor() {
        /**
         * the graph's nodes
         * @type {Node[]}
         */
        this.nodes = new NodeArray();
        /**
         * the graph's edges
         * @type {Edge[]}
         */
        this.edges = new EdgeArray();
        this.components = [];
    }
    /**
     * adds a node to the nodes array, if not already contained
     * @param {Node} node the new node
     */
    addNode(node) {
        this.nodes.push(node);
    }
    /**
     * creates a new edge given two nodes
     * @param {Node} sNode source node
     * @param {Node} dNode destination node
     * @param {Number} weight weight of new edge
     */
    addEdge(sNode, dNode, weight) {
        var tempEdge = new Edge(sNode, dNode, weight);
        this.edges.push(tempEdge);
    }
    /**
     * @param  {Node} node source node
     * @return {Edge[]} the edges connected to source
     */
    getEdges(nodeArg) {
        return this.edges.filter(tempEdge => tempEdge.containsNode(nodeArg) === true);
    }
    /**
     *
     * @param  {Node} sNode the source node
     * @return {Node[]} the neighboring nodes
     */
    getNeighbors(nodeArg) {
        return this.getEdges(nodeArg).map(tempEdge => tempEdge.getNeighbor(nodeArg));
    }
    /**
     * adds each node connected to an edge to a (depth) path
     * @param  {Edge} edge  the source edge
     * @param  {Object} dPath a key value store of node's and distances
     */
    visitComponent(pathArg, compArg) {
        var nodeArg = [...pathArg.keys()].pop();
        var nextEdges = this.getUnvisitedEdges(nodeArg, compArg);
        if (nextEdges.length === 0) {
            return pathArg;
        } else {
            let predWeight = pathArg.get(nodeArg).pathWeight;
            let predCount = pathArg.get(nodeArg).edgeCount;
            nextEdges.forEach(currEdge => {
                var nabe = currEdge.getNeighbor(nodeArg);
                compArg.addEdge(currEdge);
                pathArg.set(nabe, {
                    pred: nodeArg,
                    edgeCount: predCount + 1,
                    pathWeight: predWeight + currEdge.weight
                });
                this.visitComponent(pathArg, compArg);
            });
        }
    }
    /**
     * depth first search, adds all connected nodes to node (depth) path
     * @param  {Node} initNode inital node
     * @return {Object} a key-value store of nodes and edge distances
     */
    depthTraverse(initNode) {
        var currComponent = new EdgeComponent();
        var path = new Map();
        path.set(initNode, {
            pred: null,
            edgeCount: 0,
            pathWeight: 0
        });
        this.visitComponent(path, currComponent);
        this.addComponent(currComponent);
        return path;
    }
    addComponent(compArg) {
        this.hasIntersectingComponent(compArg) ? this.intergrateComponent(compArg) : this.components.push(compArg);
    }
    findIntersectingComponent(compArg) {
        return this.components.find(currComp => currComp.intersects(compArg) === true);
    }
    mergeComponents(origComp, newComp) {
        origComp.unionize(newComp);
    }
    intergrateComponent(compArg) {
        var oComp = this.findIntersectingComponent(compArg);
        this.mergeComponents(oComp, compArg);
    }
    hasIntersectingComponent(compArg) {
        return this.components.some(currComp => currComp.intersects(compArg));
    }

    getUnvisitedEdges(nodeArg, compArg) {
        return this.getEdges(nodeArg).filter(currEdge => {
            var nNode = currEdge.getNeighbor(nodeArg)
            return !compArg.containsNode(nNode);
        });
    }
    getUnvisitedNeighbors(nodeArg, compArg) {
        return this.getNeighbors(nodeArg).filter(currNodeEntry => !(compArg.containsNode(currNodeEntry)));
    }
    /**
     * breadth first search, adds all connected nodes to node (breadth) path
     * @param  {Node} initNode inital node
     * @return {Object} a key-value store of nodes and edge distances
     */

    bfs(initNode) {
        var bComp = new EdgeComponent();
        var bPath = new Map();
        bPath.set(initNode, {
            pred: null,
            pathWeight: 0,
            edgeCount: 0
        });
        var level = 1;
        var bQueue = new NodeArray();
        bQueue.push(initNode);
        while (bQueue.length > 0) {
            var currN = bQueue.shift();
            var currEdges = this.getUnvisitedEdges(currN, bComp);
            var frontier = new NodeArray();
            let predWeight = bPath.get(currN).pathWeight;
            let predCount = bPath.get(currN).edgeCount;
            currEdges.forEach((nEdge) => {
                // let pWeight = 
                let nNode = nEdge.getNeighbor(currN);
                bPath.set(nNode, {
                    pred: currN,
                    edgeCount: level,
                    pathWeight: predWeight + nEdge.weight
                });
                bComp.addEdge(nEdge);
                frontier.push(nNode);
            });
            bQueue = frontier;
            level++;
        }
        this.addComponent(bComp);
        return bPath;
    }
    /**
     * check if a path exists between two nodes
     * @param  {Node}  initNode the initial node
     * @param  {Node}  termNode the terminal node
     * @return {Boolean} a path exists between the two nodes
     */
    hasPath(initNode, termNode) {
        var bPath = this.bfs(initNode);
        return bPath.has(termNode);
    }
    /**
     * performs dijkstras algorithm for shortest paths between two nodes
     * @param  {Node}  initNode the initial node
     * @param  {Node}  termNode the terminal node
     * @return {Object} a shortest path between nodes
     */
    dijkstra(initNode) {
        var reachables = this.bfs(initNode);
        var inspectionQueue = new NodeArray(initNode);
        var solutionSet = new Map();
        solutionSet.set(initNode, {
            pred: null,
            edgeCount: 0,
            pathWeight: 0
        });
        while (inspectionQueue.length > 0) {
            var currN = inspectionQueue.shift();
            var currEdges = this.getEdges(currN);

            currEdges.forEach((tempEdge) => {
                let nNode = tempEdge.getNeighbor(currN);
                var rNodeEntry = reachables.get(nNode);
                var currWeight = rNodeEntry.pathWeight;
                var sPred = solutionSet.get(currN);
                var dijkstraWeight = sPred.pathWeight + tempEdge.weight;
                var dMap = {
                    pred: currN,
                    edgeCount: sPred.edgeCount + 1,
                    pathWeight: dijkstraWeight
                };
                var sMap = (dijkstraWeight < currWeight) ? dMap : rNodeEntry;
                if (!solutionSet.has(nNode)) {
                    inspectionQueue.push(nNode);
                    solutionSet.set(nNode, sMap);
                }
            });
        }
        return solutionSet;
    }
    shortestPath(initNode, termNode) {
        var dijkMap = this.dijkstra(initNode);
        return dijkMap.has(termNode) ? dijkMap.get(termNode) : null;
    }
};
module.exports = Graph;
/**
 * [A Graph]{@link module:graphTheory.Graph}
 * @typedef {module:graphTheory.Graph} Graph
 */