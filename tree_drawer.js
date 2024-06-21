const width = window.innerWidth;
const height = window.innerHeight;
const margin = { top: 20, right: 120, bottom: 20, left: 120 };
const svgWidth = width - margin.right - margin.left;
const svgHeight = height - margin.top - margin.bottom;

const svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Funzione per generare un albero casuale con profondità massima e numero massimo di figli per nodo
function generateRandomTree(depth, maxChildren) {
    const name = `node_${depth}`;
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
const data = generateRandomTree(0, 5);

const treeLayout = d3.tree().size([svgHeight, svgWidth]);
const root = d3.hierarchy(data);
treeLayout(root);

let nodes = [];
let links = [];

function update() {
    const link = svg.selectAll(".link")
        .data(links, d => d.target.id);

    const linkEnter = link.enter().append("path")
        .attr("class", "link")
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));

    const node = svg.selectAll(".node")
        .data(nodes, d => d.id);

    const nodeEnter = node.enter().append("circle")
        .attr("class", "node")
        .attr("r", 10)
        .attr("fill", d => getColor(d.depth))
        .attr("transform", d => `translate(${d.y},${d.x})`);

    nodeEnter.append("title").text(d => d.data.name);
}

function addNodesRecursively(node, delay = 1000) {
    const newNode = {
        id: node.data.name,
        data: node.data,
        depth: node.depth,
        x: node.x,
        y: node.y
    };
    nodes.push(newNode);

    if (node.parent) {
        const newLink = {
            source: {
                id: node.parent.data.name,
                x: node.parent.x,
                y: node.parent.y
            },
            target: newNode
        };
        links.push(newLink);
    }

    update();

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

// Avvio dell'animazione con il nodo radice generato casualmente
addNodesRecursively(root, 1000);
