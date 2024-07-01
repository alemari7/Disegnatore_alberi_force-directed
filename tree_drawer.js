const margin = { top: 20, right: 40, bottom: 20, left: 40 };
const width = window.innerWidth * 1.7;
const height = window.innerHeight * 3;
const svgWidth = width;
const svgHeight = height;

const svg = d3.select("svg")
    .attr("width", svgWidth + margin.left + margin.right)
    .attr("height", svgHeight + margin.top + margin.bottom);

// Aggiungi la funzionalità di zoom
const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Configurazione dello zoom
const zoom = d3.zoom()
    .scaleExtent([0.25, 3])
    .on("zoom", (event) => {
        g.attr("transform", event.transform);
    });

// Applica lo zoom al contenitore SVG
svg.call(zoom);

// Prevenire lo scroll del mouse per abilitare solo lo zoom
document.getElementById('scrollableDiv').addEventListener('wheel', function(event) {
    event.preventDefault();
}, { passive: false });

function simulationRun() {
    const maxDepth = parseInt(document.getElementById('depth').value);
    const maxChildren = parseInt(document.getElementById('maxChildren').value);

    function generateRandomTree(depth, maxChildren) {
        const name = `node_${depth}_${Math.random().toString(36).substring(2, 7)}`;
        const children = [];

        const numChildren = getRandomInt(1, maxChildren);
        for (let i = 0; i < numChildren; i++) {
            if (depth < maxDepth) {
                children.push(generateRandomTree(depth + 1, maxChildren));
            }
        }

        return { name, children };
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    let startTime;
    let lastNodeTime;

    const data = generateRandomTree(0, maxChildren);

    const root = d3.hierarchy(data);

    let nodes = [];
    let links = [];

    const simulation = d3.forceSimulation(nodes)
       .force("link", d3.forceLink(links).id(d => d.id).distance(20))
       .force("charge", d3.forceManyBody().strength(-100))
       .force("center", d3.forceCenter(svgWidth / 2, svgHeight / 2))
       .on("tick", ticked);

    function ticked() {
        const link = g.selectAll(".link")
           .data(links, d => d.target.id);

        link.enter().append("line")
           .attr("class", "link")
           .merge(link)
           .attr("stroke-width", 1)
           .attr("x1", d => d.source.x)
           .attr("y1", d => d.source.y)
           .attr("x2", d => d.target.x)
           .attr("y2", d => d.target.y);

        link.exit().remove();

        const node = g.selectAll(".node")
           .data(nodes, d => d.id);

        const nodeEnter = node.enter().append("circle")
           .attr("class", "node")
           .attr("r", 7)
           .attr("fill", d => d.color) // Utilizza il colore definito per ciascun nodo
           .call(d3.drag()
               .on("start", dragStarted)
               .on("drag", dragged)
               .on("end", dragEnded));

        nodeEnter.append("title").text(d => d.data.name);

        nodeEnter.merge(node)
           .attr("cx", d => d.x)
           .attr("cy", d => d.y);

        node.exit().remove();

        if (nodes.length === root.descendants().length) {
            lastNodeTime = performance.now();
            const executionTime = (lastNodeTime - startTime) / 1000;
            console.log(`Tempo totale di esecuzione fino all'ultimo nodo: ${executionTime.toFixed(3)} secondi`);
        }
    }

    function addNodesRecursively(node, delay = 2000) {
        if (!startTime) {
            startTime = performance.now();
        }

        const newNode = {
            id: node.data.name,
            data: node.data,
            depth: node.depth,
            color: getColor(node.depth) // Passa il livello del nodo qui
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

    function getColor(level) {
        // Definisci una scala di colori che corrisponde ai livelli degli internodi
        const colorLevels = [0, 1, 2, 3, 4]; // Aggiungi o rimuovi valori in base alla profondità massima desiderata
        const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"]; // Esempio di colori

        // Restituisci il colore corrispondente al livello del nodo
        return colors[level];
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

    addNodesRecursively(root, 2000);
}

function onClick() {
    this.simulationRun();
}

// Centrare la scrollbar
var scrollableDiv = document.getElementById('scrollableDiv');
var halfContentWidth = scrollableDiv.scrollWidth / 4.25;
scrollableDiv.scrollLeft = halfContentWidth;
var halfContentHeight = scrollableDiv.scrollHeight / 2.75;
scrollableDiv.scrollTop = halfContentHeight;
