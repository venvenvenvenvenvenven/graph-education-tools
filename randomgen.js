function randomgen(nodeCount, seed=null) {
  seededRandom = seed ? Alea(seed) : Alea();
  const nodes = new vis.DataSet([]);
  const edges = new vis.DataSet([]);
  const connectionCount = [];

  for (let i = 0; i < nodeCount; i++) {
    nodes.add({
      id: i,
      label: String(i),
    });

    connectionCount[i] = 0;

    if (i == 1) {
      const from = i;
      const to = 0;
      edges.add({
        from: from,
        to: to,
      });
      connectionCount[from]++;
      connectionCount[to]++;
    } else if (i > 1) {
      const conn = edges.length * 2;
      const rand = Math.floor(seededRandom() * conn);
      let cum = 0;
      let j = 0;
      while (j < connectionCount.length && cum < rand) {
        cum += connectionCount[j];
        j++;
      }

      const from = i;
      const to = j;
      edges.add({
        from: from,
        to: to,
      });
      connectionCount[from]++;
      connectionCount[to]++;
    }
  }

  return { nodes: nodes, edges: edges };
}