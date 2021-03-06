const fs = require("fs");

let network;
let inc = 0;

let container = $("#tree-simple")[0];

let options = {
  autoResize: true,
  manipulation: {
    enabled: true,
    initiallyActive: true,
    addNode: function(nodeData, callback) {
      if (network.body.nodes === {}) {
        inc = 1;
      } else {
        inc++;
      }
      nodeData.root = false;
      nodeData.label = inc;
      nodeData.color = "#009688";
      nodeData.font = {
        color: "#fff"
      };
      nodeData.visited = false;
      nodeData.adjacencyList = [];
      nodeData.predecessor = null;
      callback(nodeData);
    },
    editNode: function(nodeData, callback) {
      editNodeCustom(network, nodeData, callback);
    },
    addEdge: function(edgeData, callback) {
      let fromNode = network.body.data.nodes.get().filter(function(x) {
        return x.id === edgeData.from;
      });
      let toNode = network.body.data.nodes.get().filter(function(x) {
        return x.id === edgeData.to;
      });
      fromNode[0].adjacencyList.push(toNode[0]);
      if ($("#directed-chechbox").prop("checked")) {
        edgeData.arrows = {};
        edgeData.arrows.to = true;
      }
      if (edgeData.from === edgeData.to) {
        let r = confirm("Do you want to connect the node to itself?");
        if (r === true) {
          callback(edgeData);
        }
      } else {
        callback(edgeData);
      }
    },
    editEdge: {
      editWithoutDrag: function(data, callback) {
        editEdgeCustom(data, callback);
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

$(document).ready(function() {
  $("#submit-btn").click(function() {
    if (network.body.data.nodes.get().length === 0) {
      createAlert("You have not added any nodes to the graph.");
      return;
    }
    if (network.body.data.edges.get().length === 0) {
      createAlert("You have not added any edges to the graph.");
      return;
    }
    let rootNode = findRootNode(network.body.data.nodes.get());
    if (!rootNode) {
      rootNode = network.body.data.nodes.get()[0];
      rootNode.root = true;
      $("#algo-panel").prepend(alertUserThatNoRoot());
    }
    let obj = getBFSPath(rootNode);
    obj.path = markAllNodesAsUnvisited(obj.path);
    bfsRootAnimation(obj.path);
    rootCodeLineAnimation();
    setTimeout(
      function() {
        bfsNodesAnimation(obj.path, obj.iter);
      },
      3000
    );
    setTimeout(
      function() {
        obj.path[obj.path.length - 1].color = "#3f51b5";
        network = rebuildNetwork(network, container, options, obj.path);
        unHighlightAllCodeLines();
      },
      3050 + 12000 * obj.iter
    );
  });

  $("#random-btn").click(function() {
    let numberOfNodes = Math.floor(Math.random() * 10 + 5);
    if (network !== null) {
      network.destroy();
    }
    let data = getScaleFreeNetwork(numberOfNodes);
    network = new Vis.Network(container, data, options);
  });
});

network = new Vis.Network(container, [], options);

function bfsRootAnimation(path) {
  let root = findRootNode(path);
  for (let index = 1; index < 3; index++) {
    (function(ind) {
      setTimeout(
        function() {
          if (ind === 1) {
            root.visited = true;
            root.color = "#3f51b5";
            network = rebuildNetwork(network, container, options, path);
          } else {
            appendToQueue(root.label);
          }
        },
        1000 * ind
      );
    })(index);
  }
}

function bfsNodesAnimation(path, iter) {
  let queue = [path[0]];
  let prev = null;
  highlightCodeLine(3);
  for (let index = 0; index < iter; index++) {
    (function(ind) {
      setTimeout(
        function() {
          if (prev) {
            if (prev.adjacencyList && prev.adjacencyList.length > 0) {
              prev.adjacencyList[
                prev.adjacencyList.length - 1
              ].color = "#3f51b5";
            }
            if (prev.visited) {
              prev.color = "#3f51b5";
            }
            network = rebuildNetwork(network, container, options, path);
          }
          let u = queue.shift();
          u.color = "red";
          network = rebuildNetwork(network, container, options, path);
          prev = u;
          unHighlightAllCodeLines();
          highlightCodeLine(4);
          highlightCodeLine(3);
          removeFromQueue();
          if (u && u.adjacencyList && u.adjacencyList.length > 0) {
            let adjacencyList = u.adjacencyList;
            for (let index1 = 0; index1 < adjacencyList.length; index1++) {
              (function(ind1) {
                setTimeout(
                  function() {
                    if (ind1 > 0) {
                      adjacencyList[ind1 - 1].color = "#3f51b5";
                    }
                    adjacencyList[ind1].color = "red";
                    network = rebuildNetwork(network, container, options, path);
                    unHighlightCodeLine(4);
                    unHighlightCodeLine(9);
                    highlightCodeLine(5);
                    if (!adjacencyList[ind1].visited) {
                      highlightCodeLine(6);
                      let index2;
                      for (index2 = 0; index2 < 3; index2++) {
                        (function(ind2) {
                          setTimeout(
                            function() {
                              if (ind2 === 0) {
                                adjacencyList[ind1].predecessor = u;
                                adjacencyList[ind1].visited = true;
                                network = rebuildNetwork(
                                  network,
                                  container,
                                  options,
                                  path
                                );
                                highlightCodeLine(7);
                              } else if (ind2 === 1) {
                                unHighlightCodeLine(7);
                                highlightCodeLine(8);
                              } else if (ind2 === 2) {
                                queue.push(adjacencyList[ind1]);
                                appendToQueue(adjacencyList[ind1].label);
                                unHighlightCodeLine(8);
                                highlightCodeLine(9);
                              }
                            },
                            ind2 *
                              (parseFloat(11600) / adjacencyList.length / 3)
                          );
                        })(index2);
                      }
                    }
                  },
                  ind1 * (parseFloat(11800) / adjacencyList.length)
                );
              })(index1);
            }
          }
        },
        12000 * ind
      );
    })(index);
  }
}

function rootCodeLineAnimation() {
  for (let index1 = 0; index1 < 3; index1++) {
    (function(ind1) {
      setTimeout(
        function() {
          unHighlightCodeLine(ind1 - 1);
          highlightCodeLine(ind1);
        },
        1000 * ind1
      );
    })(index1);
  }
}

function appendToQueue(text) {
  const th = "<th>" + text + "</th>";
  $("#queue-row").append(th);
}

function removeFromQueue() {
  $("#queue-row").find("th:first").remove();
}

function getBFSPath(root) {
  let queue = [root];
  let numberOfQueueIterations = 0;
  let path = [root];
  while (queue.length > 0) {
    let u = queue.shift();
    let adjacencyList = u.adjacencyList;
    for (let i = 0; i < adjacencyList.length; i++) {
      if (!adjacencyList[i].visited) {
        adjacencyList[i].visited = true;
        adjacencyList[i].predecessor = u;
        queue.push(adjacencyList[i]);
        path.push(adjacencyList[i]);
      }
    }
    numberOfQueueIterations++;
  }
  return { path: path, iter: numberOfQueueIterations };
}
