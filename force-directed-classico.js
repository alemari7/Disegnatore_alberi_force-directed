const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("#svg")
    .attr("width", width)
    .attr("height", height);

let nodes = d3.range(50).map(() => ({ index: Math.random(), x: Math.random() * width, y: Math.random() * height }));

const links = generateRandomLinks(nodes);

const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.index).distance(30))
    .force("charge", d3.forceManyBody().strength(-100))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", ticked);

const link = svg.selectAll(".link")
    .data(links)
    .enter().append("line")
    .attr("class", "link");

const node = svg.selectAll(".node")
    .data(nodes)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", 5)
    .call(drag(simulation));

let startTime;
let endTime;

function ticked() {
    link.attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node.attr("cx", d => d.x)
        .attr("cy", d => d.y);

    // Verifica se la simulazione ha raggiunto la stabilità
    if (simulation.alpha() < 0.001 && !endTime) {
        endTime = performance.now();
        const executionTime = (endTime - startTime) / 1000; // Tempo in secondi
        console.log(`Tempo totale di esecuzione: ${executionTime.toFixed(3)} secondi`);
    }
}

function generateRandomLinks(nodes) {
    const links = [];
    for (let i = 1; i < nodes.length; ++i) {
        links.push({ source: i, target: Math.floor(Math.random() * i) });
    }
    return links;
}

function drag(simulation) {

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

startTime = performance.now(); // Registra il tempo di inizio della simulazione
