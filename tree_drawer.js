const margin = { top: 20, right: 40, bottom: 20, left: 40 }; // Ridotti i margini
const width = window.innerWidth;
const height = window.innerHeight;
const svgWidth = width - margin.right - margin.left + 200; // Aumentate le dimensioni dell'SVG
const svgHeight = height - margin.top - margin.bottom + 200;

const svg = d3.select("svg")
    .attr("width", svgWidth + margin.left + margin.right)
    .attr("height", svgHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Funzione per generare un albero casuale con profondità massima e numero massimo di figli per nodo
function generateRandomTree(depth, maxChildren) {
    const name = `node_${depth}_${Math.random().toString(36).substring(2, 7)}`;
    const children = [];
    
    const numChildren = getRandomInt(1, maxChildren);
    for (let i = 0; i < numChildren; i++) {
        if (depth < 3) {  // Limito la profondità per l'esempio
            children.push(generateRandomTree(depth + 1, maxChildren));
        }
    }
    
    return { name, children };
}

// Funzione ausiliaria per ottenere un intero casuale in un intervallo specificato
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Genero un albero casuale con profondità 0 (radice) e massimo 5 figli per nodo
const data = generateRandomTree(0, 6);

// Convert tree structure to nodes and links
const root = d3.hierarchy(data);

let nodes = [];
let links = [];

const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(30)) // Aumentata la distanza
    .force("charge", d3.forceManyBody().strength(-100)) // Ridotta la forza di carica
    .force("center", d3.forceCenter(svgWidth / 2, svgHeight / 2))
    .on("tick", ticked);

function ticked() {
    const link = svg.selectAll(".link")
        .data(links, d => d.target.id);

    link.enter().append("line")
        .attr("class", "link")
        .merge(link)
        .attr("stroke-width", 1) // Ridotto lo spessore della linea
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    link.exit().remove();

    const node = svg.selectAll(".node")
        .data(nodes, d => d.id);

    const nodeEnter = node.enter().append("circle")
        .attr("class", "node")
        .attr("r", 5) // Ridotto il raggio del nodo
        .attr("fill", d => getColor(d.depth))
        .call(d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded));

    nodeEnter.append("title").text(d => d.data.name);

    nodeEnter.merge(node)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    node.exit().remove();
}

function addNodesRecursively(node, delay = 2000) {
    const newNode = {
        id: node.data.name,
        data: node.data,
        depth: node.depth
    };
    nodes.push(newNode);

    if (node.parent) {
        const newLink = {
            source: nodes.find(n => n.id === node.parent.data.name),
            target: newNode
        };
        links.push(newLink);
    }

    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();

    if (node.children) {
        setTimeout(() => {
            node.children.forEach((child) => {
                addNodesRecursively(child, delay);
            });
        }, delay);
    }
}

function getColor(depth) {
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    return colorScale(depth);
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

// Avvio dell'animazione con il nodo radice generato casualmente
addNodesRecursively(root, 2000);
