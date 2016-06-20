var Node = require('./node');
var NodeArray = require('./nodeArray');
var Edge = require('./edge');
var DirectedEdge = require('./directedEdge');
/**
 * represents a set of Edges
 * @exports EdgeArray
 * @constructor
 * @memberOf! module:graphTheory
 */
class EdgeArray extends Array {
    /**
     * checks for presence of edge in this set
     * @param  {Edge} argEdge [description]
     * @return {Boolean}
     */
    contains(argEdge) {
        return this.some(el => (el.isEquivalent(argEdge) === true));
    }
    /**
     * checks type of argument for Edge status
     * @param  {Edge} argEdge
     * @return {Boolean}
     */
    isEdge(argEdge) {
        return argEdge instanceof Edge;
    }
    /**
     * adds a edge to this set
     * @param  {Edge} argEdge
     * @return {Boolean}
     */
    push(argEdge) {
        return (this.isEdge(argEdge) && !(this.contains(argEdge))) ? super.push(argEdge) : false;
    }
    /**
     * assembles each edges nodes into one large array
     * @return {NodeArray}
     */
    getNodes() {
        return this.reduce((nArray, e) => {
            nArray.unionize(e.nodes);
            return nArray;
        }, new NodeArray());
    }
    /**
     * returns an array shared edges between two sets
     * @param  {EdgeArray} altArray the array to check
     * @return {EdgeArray} the shared edges
     */

    intersection(altArray) {
        return this.filter(currEdge => altArray.contains(currEdge) === true);
    }
    /**
     * checks for presence of shared edges between two sets
     * @param  {EdgeArray} altArray the array to check
     * @return {Boolean}
     */

    intersects(altArray) {
        return this.some(currEdge => altArray.contains(currEdge) === true);
    }
    /**
     * returns an array edges in this array not included in the alternate array
     * @param  {EdgeArray} altArray the array to check
     * @return {EdgeArray} the unshared edges
     */
    difference(altArray) {
        let diffArray = new EdgeArray();

        this.reduce((dArray, currEdge) => {
            if (!altArray.contains(currEdge)) dArray.push(currEdge);
            return dArray;
        }, diffArray);
        altArray.reduce((dArray, altEdge) => {
            if (!this.contains(altEdge)) dArray.push(altEdge);
            return dArray;
        }, diffArray);
        return diffArray;

    }
    /**
     * checks for presence of unshared edges between two sets
     * @param  {EdgeArray} altArray the array to check
     * @return {Boolean}
     */
    hasDistinctEdges(altArray) {
        return altArray.some(altEdge => !this.contains(altEdge));
    }
    /**
     * returns a combined array of edges belonging to this and the alternate arrays
     * @param  {EdgeArray} altArray the array to combine
     * @return {EdgeArray} the edges
     */
    union(altArray) {
        let uArray = new EdgeArray();
        this.forEach(currEdge => uArray.push(currEdge));
        altArray.forEach(altEdge => uArray.push(altEdge));
        return uArray;
    }

    /**
     * combines all the edges into this edgeArray
     * @param  {EdgeArray} altArray the array to check
     */
    unionize(altArray) {
        this.difference(altArray).forEach(dEdge => this.push(dEdge));
    }

}
module.exports = EdgeArray;
/**
 * [An EdgeArray]{@link module:graphTheory.EdgeArray}
 * @typedef {module:graphTheory.EdgeArray} EdgeArray
 */