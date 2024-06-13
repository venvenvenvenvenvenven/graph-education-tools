var nodes = null;
var edges = null;
var network1 = null;
var data = randomgen(6);
var lastNodeId = 5
let cliques1 = [];
let cliques2 = [];
let clique = [];

// создание дополнения
function compGraph(data){
  let nodes = data.nodes.get();
  let ogEdges = data.edges.get()
  let edges = [];
  let edgesId = 0;
  for(let i = 0; i < nodes.length; i++){
      for(let k = 0; k < nodes.length; k++){
          if(k == i){
              continue;
          }else{
              exists = false;
              for(let e = 0; e < ogEdges.length; e++){ // проверяем, что ребра нет в исходном графе
                  if((ogEdges[e].from == nodes[i].id & ogEdges[e].to == nodes[k].id) || (ogEdges[e].to == nodes[i].id & ogEdges[e].from == nodes[k].id)){
                      exists = true;
                  }
              }
              for(let e = 0; e < edges.length; e++){  // проверяем, что ребро не дублируется
                  if((edges[e].from == nodes[i].id & edges[e].to == nodes[k].id) || (edges[e].from == nodes[k].id & edges[e].to == nodes[i].id)){
                      exists = true;
                  }                  
              }
              if(exists){
                  continue;
              }else{
                  edges.push({from: nodes[i].id, to: nodes[k].id, id: edgesId++})
              }
          }
      }
  }
  return { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
  }
var data2 = compGraph(data);


function pretty(arr){
  return "[" + arr + "]"
}

function nodeIds(network){
  ids = [];
  network.body.data.nodes.get().forEach((i) => ids.push(i.id));
  return ids;
}
function BK(N, R, P, X, C=[], outputbox=undefined, prepend=0){ // алгоритм Брона-Кербоша
  if(outputbox){
    document.getElementById(outputbox).value += (("    ".repeat(prepend) + "BK(R = " + pretty(R) + ", P = " + pretty(P) + ", X = " + pretty(X) + ")\n"))
  }
  if(P.length == 0 && X.length == 0){
    if(C){
    C.push(R);
    }
    if(outputbox){
      document.getElementById(outputbox).value += ("    ".repeat(prepend) + "Клика: " + pretty(R) + "\n")
    }
  }
  for(let v of P){
    NB = N.getConnectedNodes(v)
    prepend = prepend+1
    BK(N, _.union(R, [v]), _.intersection(P, NB), _.intersection(X, NB), C, outputbox, prepend);
    P = _.without(P, v);
    X = _.union(X, [v]);
  }
}
function partOfClique(id, cliques){
  partOfCliques = cliques.filter((clique) => clique.includes(id));
  partOfCliques = _.sortBy(partOfCliques, "length")
  return partOfCliques[partOfCliques.length-1]
}
function getCliqueEdges(N, clique){
  connectedEdges = [];
  for(let v of clique){
    connectedEdges.push(N.getConnectedEdges(v))
  };
  nodeEdges = N.body.data.edges.get();
  cliqueEdges = nodeEdges.filter((edge) => ((connectedEdges.flat().includes(edge.id)) && (clique.includes(edge.from)) && (clique.includes(edge.to))))
  return _.pluck(cliqueEdges, "id")
}
function partOfVertexCover(id, ids, compCliques){
  covers = [];
  for(clique of compCliques){
    covers.push(_.difference(ids, clique));
  }
  partOfCovers = covers.filter((cover) => cover.includes(id));
  partOfCovers = _.sortBy(partOfCovers, "length");
  return partOfCovers[0]
}

function checkMode(cat){
  let radios = document.querySelectorAll('input[name=' + cat + "]");
  for (let radio of radios) {
    if (radio.checked) {
      return radio.value;
    }
  }
}

function destroy() {
  if (network1 !== null) {
    network1.destroy();
    network1 = null;
  }
}

function draw() {
  destroy();
  console.log(data)

  var options1 = {
    locales:
    custom_locale = {
      "en":
      {edit: 'Редактировать',
      del: 'Удалить выбранное',
      back: 'Назад',
      addNode: 'Добавить вершину',
      addEdge: 'Добавить ребро',
      editNode: 'Редактировать вершину',
      editEdge: 'Редактировать ребро',
      addDescription: 'Кликните в свободное место, чтобы добавить новую вершину.',
      edgeDescription: 'Кликните на вершину и протяните ребро к другой вершине, чтобы соединить их.',
      editEdgeDescription: 'Кликните на контрольные точки и протяните их к вершине, чтобы присоединить к ней ребро.', // кластеры не используются
      createEdgeError: 'Cannot link edges to a cluster.',
      deleteClusterError: 'Clusters cannot be deleted.',
      editClusterError: 'Clusters cannot be edited.'}
    },
    nodes: {color: {background: "#97c2fc", border: "#2b7ce9", highlight: {background: "#ffdcad", border: "#c99e64"}}},
    edges: {color: {color: "#2b7ce9", highlight: "#c99e64"}},
    locale: "en",
    manipulation: {
      addNode: function (nodeData,callback) {
        lastNodeId++;
        nodeData.id = lastNodeId;
        nodeData.label = String(lastNodeId);
        callback(nodeData);
        network2.setData(compGraph(network1.body.data));
        cliques1 = [];
        cliques2 = [];
        BK(network1, [], nodeIds(network1), [], cliques1);
        BK(network2, [], nodeIds(network2), [], cliques2)
      },
      addEdge: function (data, callback) {
        if (data.from == data.to) { // петли делать нельзя
            callback(null);
        } else{
              callback(data);
              network2.setData(compGraph(network1.body.data));
              cliques1 = [];
              cliques2 = [];
              BK(network1, [], nodeIds(network1), [], cliques1);
              BK(network2, [], nodeIds(network2), [], cliques2)
            }
          },
      deleteEdge: function (data, callback){
        callback(data);
        network2.setData(compGraph(network1.body.data));
        cliques1 = [];
        cliques2 = [];
        BK(network1, [], nodeIds(network1), [], cliques1);
        BK(network2, [], nodeIds(network2), [], cliques2)
      },
      deleteNode: function (data, callback){
        callback(data);
        network2.setData(compGraph(network1.body.data));
        BK(network1, [], nodeIds(network1), [], cliques1);
        BK(network2, [], nodeIds(network2), [], cliques2)
      },
    }
  };
  var options2 = {
    locale: "ru",
    interaction: { keyboard: true },
    manipulation: { enabled: false }, 
    nodes: { color: {background: "#d0ffad", border: "#8fc964", highlight: {background: "#ffb3ad", border: "#c96c64"}}},
    edges: {color: {color: "#8fc964", highlight: "#c96c64"}},
  };
  network1 = new vis.Network(document.getElementById("mynetwork1"), data, options1);
  network2 = new vis.Network(document.getElementById("mynetwork2"), data2, options2);
  console.log(network1)
}

function init() {
  draw();
  network1.on("selectNode", function (params){
    switch(checkMode("selmode1")){
      case "cli1":
        clique = partOfClique(params.nodes[0], cliques1);
        network1.setSelection({nodes: clique, edges: getCliqueEdges(network1, clique)}, {unselectAll: true, highlightEdges: false});
        break;
      case "ind1":
        set = partOfClique(params.nodes[0], cliques2);
        network1.selectNodes(set, false);
        break;
      case "ver1":
        network1.selectNodes(partOfVertexCover(params.nodes[0], nodeIds(network1), cliques2));
        break;
  };
  switch(checkMode("selmode2")){
    case "cli2":
      clique = partOfClique(params.nodes[0], cliques2);
      network2.setSelection({nodes: clique, edges: getCliqueEdges(network2, clique)}, {unselectAll: true, highlightEdges: false});
      break;
    case "ind2":
      set = partOfClique(params.nodes[0], cliques1);
      network2.selectNodes(set, false);
      break;
    case "ver2":
      network2.selectNodes(partOfVertexCover(params.nodes[0], nodeIds(network2), cliques1));
      break;
}
  });
  network1.on("deselectNode", function (params){
      network2.unselectAll();
  });
  network2.on("selectNode", function(params){
    switch(checkMode("selmode2")){
      case "cli2":
        clique = partOfClique(params.nodes[0], cliques2);
        network2.setSelection({nodes: clique, edges: getCliqueEdges(network2, clique)}, {unselectAll: true, highlightEdges: false});
        break;
      case "ind2":
        set = partOfClique(params.nodes[0], cliques1);
        network2.selectNodes(set, false);
        break;
      case "ver2":
        network2.selectNodes(partOfVertexCover(params.nodes[0], nodeIds(network2), cliques1));
        break;
  };
    switch(checkMode("selmode1")){
      case "cli1":
        clique = partOfClique(params.nodes[0], cliques1);
        network1.setSelection({nodes: clique, edges: getCliqueEdges(network1, clique)}, {unselectAll: true, highlightEdges: false});
        //network2.selectNodes(clique, false);
        break;
      case "ind1":
        set = partOfClique(params.nodes[0], cliques2);
        //network2.setSelection({nodes: set, edges: getCliqueEdges(network2, clique)}, {unselectAll: true, highlightEdges: false});
        network1.selectNodes(set, false);
        break;
      case "ver1":
        cover = _.difference(nodeIds(network1), partOfClique(params.nodes[0], cliques2));
        network1.selectNodes(cover);
        break;
  };
  });
  network2.on("deselectNode", function (params){
    network2.unselectAll();
  });
  BK(network1, [], nodeIds(network1), [], cliques1);
  BK(network2, [], nodeIds(network2), [], cliques2);
}
function exportNetwork(){
  nodes = network1.body.data.nodes.get();
  edges = network1.body.data.edges.get();
  data = {nodes: nodes, edges: edges};
  document.getElementById("input_output").value = JSON.stringify(data);
}
function importNetwork(){
  data = JSON.parse(document.getElementById("input_output").value);
  network1.setData(data);
  network2.setData(compGraph(network1.body.data))
}
