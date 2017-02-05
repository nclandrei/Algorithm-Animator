var Vis = require('vis');
var remote = require('remote');
var dialog = remote.require('dialog');
var fs = require('fs');

var network;
var inc = 0;

$(document).ready(function () {
    $('#submit-btn').click(function () {
        startBFS(network.body.nodes[0]);
        startCodeLinesAnimation();
    });
});

// create a network
var container = $('#tree-simple')[0];

var options = {
    autoResize: true,
    manipulation: {
        enabled: true,
        initiallyActive: true,
        addNode: function(nodeData, callback) {
            if (network.body.nodes === {}) {
                inc = 1;
            }
            else {
                inc++;
            }
            nodeData.label = inc;
            nodeData.color = "#009688";
            nodeData.font = {
                color: "#fff"
            };
            nodeData.visited = false;
            callback(nodeData);
        },
        editNode: function(nodeData, callback) {
            nodeData.root = true;
            nodeData.color = "#3f51b5";
            console.log(nodeData);
            callback(nodeData);
        },
        addEdge: function(edgeData,callback) {
            network.body.nodes[edgeData.from].adjacencyList = [];
            network.body.nodes[edgeData.from].adjacencyList.push(edgeData.to);
            if (edgeData.from === edgeData.to) {
                var r = confirm("Do you want to connect the node to itself?");
                if (r === true) {
                    callback(edgeData);
                }
            }
            else {
                callback(edgeData);
            }
        }
    },
    interaction: {
        navigationButtons: true
    },
    physics: {
        enabled: false
    }
};

network = new Vis.Network(container, [], options);

function startBFS(root) {
    var nodes = network.body.nodes;
    var edges = network.body.edges;
    var queue = [];

    root.visited = true;
    queue.push(root);
    while (queue.length > 0) {
        var u = queue.pop();
        var adjacencyList = u.adjacencyList;
        for (var i = 0; i < adjacencyList.length; i++) {
            if (!adjacencyList[i].visited) {
                adjacencyList[i].visited = true;
                adjacencyList[i].predecessor = u;
                queue.push(adjacencyList[i]);
            }
        }
    }
}

function startCodeLinesAnimation() {

}

function appendToQueue(vertex, position) {
    var queueID = "#queue-" + position;
    $(queueID).text(vertex);
}

function createAlert(alertText) {
    var alert = "<div id='customAlert' class='alert alert-dismissible alert-danger'> <button type='button' class='close' data-dismiss='alert'> x </button> <strong>Oh snap!</strong> " + alertText + " </div>";
    return alert;
}

