const width = 1800;
const height = 1200;
const svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);

const data = {
    name: "root",
    children: [
        {
            name: "child1",
            children: [
                {
                    name: "grandchild1",
                    children: [
                        {
                            name: "greatGrandchild1",
                            children: [
                                { name: "gggChild1" },
                                { name: "gggChild2" }
                            ]
                        },
                        { name: "greatGrandchild2" }
                    ]
                },
                { name: "grandchild2" }
            ]
        },
        {
            name: "child2",
            children: [
                {
                    name: "grandchild3",
                    children: [
                        { name: "greatGrandchild3" },
                        { name: "greatGrandchild4" }
                    ]
                },
                {
                    name: "grandchild4",
                    children: [
                        { name: "greatGrandchild5" },
                        { name: "greatGrandchild6" }
                    ]
                }
            ]
        }
    ]
};

// Aggiungi l'attributo depth durante la creazione della gerarchia
const treeData = d3.hierarchy(data, d => d.children);
treeData.descendants().forEach((d, i) => {
    d.depth = d.depth;  // Assegna la profondità corretta
});

let nodes = [];
let links = [];

const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id).distance(50))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(width / 2, height / 2));

function update() {
    const linkEnter = svg.selectAll(".link")
        .data(links)
        .join("line")
        .attr("class", "link");

    const nodeEnter = svg.selectAll(".node")
        .data(nodes, d => d.id)
        .join("circle")
        .attr("class", "node")
        .attr("r", 10)
        .attr("fill", d => getColor(d.depth)) // Imposta il colore in base alla profondità
        .call(d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded));

    simulation.nodes(nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(links);

    simulation.alpha(1).restart();

    function ticked() {
        linkEnter
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        nodeEnter
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    }

    function dragStarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragEnded(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

function addNode(node, parent = null) {
    const newNode = { id: node.data.name, depth: node.depth, x: width / 2, y: height / 2 };
    nodes.push(newNode);

    if (parent) {
        links.push({ source: parent, target: newNode });
    }

    if (node.children) {
        node.children.forEach(child => addNode(child, newNode));
    }
}

function getColor(depth) {
    // Imposta un colore diverso per ciascuna profondità
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    return colorScale(depth);
}

function initializeTree() {
    addNode(treeData);
    update();
}

initializeTree();