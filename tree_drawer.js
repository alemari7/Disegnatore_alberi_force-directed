// Definisci i margini e le dimensioni del contenitore SVG
const margin = { top: 20, right: 40, bottom: 20, left: 40 };
const svgWidth = window.innerWidth * 1.7;;
const svgHeight = window.innerHeight * 3;;

const delay = 2000;         // valore del ritardo per l'aggiunta incrementale dei nodi
const randomBool = true;    // variabile booleana per costruzione del grafo randomico o completo

// Seleziona l'elemento SVG e imposta la sua larghezza e altezza, includendo i margini
const svg = d3.select("svg")
    .attr("width", svgWidth + margin.left + margin.right)
    .attr("height", svgHeight + margin.top + margin.bottom);

// Aggiungi un gruppo <g> all'interno dell'SVG per contenere tutti gli elementi grafici
const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Configura lo zoom con D3, specificando i limiti di scala e l'evento di zoom
const zoom = d3.zoom()
    .scaleExtent([0.25, 3])
    .on("zoom", (event) => {
        g.attr("transform", event.transform);
    });

// Applica la funzionalità di zoom al contenitore SVG
svg.call(zoom);

// Prevenire lo scroll del mouse per abilitare solo lo zoom
document.getElementById('scrollableDiv').addEventListener('wheel', function(event) {
    event.preventDefault();
}, { passive: false });

function simulationRun() {
    // Ottieni i valori di profondità massima e numero massimo di figli dagli input HTML
    const maxDepth = parseInt(document.getElementById('depth').value);
    const maxChildren = parseInt(document.getElementById('maxChildren').value); 

    // Genera un albero casuale con la profondità e il numero di figli specificati
    function generateRandomTree(depth, maxChildren) {
        const name = `node_${depth}_${Math.random().toString(36).substring(2, 7)}`; // Genera un nome univoco per il nodo con una sottostringa di esempio

        const children = []; 
        var numChildren;

        if (randomBool) { // Costruzione del grafo randomico
            numChildren = getRandomInt(1, maxChildren);
        }
        else {
            numChildren = maxChildren;
        }

        for (let i = 0; i < numChildren; i++) { // Genera un numero casuale di figli per il nodo
            if (depth < maxDepth) {
                children.push(generateRandomTree(depth + 1, maxChildren));
            }
        }

        return { name, children };
    }

    // Funzione di utilità per generare un numero intero casuale tra min e max
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Funzione per ottenere un piccolo offset randomico per la posizione dei nodi vicino al centro
    function getRandomOffset() {
        const maxOffset = 45; // Valore massimo dell'offset
        return (Math.random() - 0.5) * maxOffset; // Offset randomico tra -maxOffset/2 e +maxOffset/2
    }

    //Definisco variabili per specificare l'istante in cui inizia l'aggiunta dei nodi e l'istante in cui si inserisce l'ultimo nodo
    let startTime;
    let lastNodeTime; //quando inserisco i nodi dell'ultimo livello fino a che non si raggiunge un equilibrio delle forze

    // Genera i dati dell'albero e crea una gerarchia D3
    const data = generateRandomTree(0, maxChildren);
    const root = d3.hierarchy(data);

    let nodes = [];
    let links = [];

    // Configura la simulazione di forza D3 con nodi e link
    const simulation = d3.forceSimulation(nodes) // Crea una simulazione con i nodi
        .force("link", d3.forceLink(links).id(d => d.id).distance(20)) // Aggiungi una forza di collegamento tra i nodi
        .force("charge", d3.forceManyBody().strength(-100)) // Aggiungi una forza di carica per evitare sovrapposizioni
        .force("center", d3.forceCenter(svgWidth / 2, svgHeight / 2)) // Aggiungi una forza centrale per mantenere i nodi al centro
        .on("tick", ticked);

    // Funzione per aggiornare la posizione dei nodi e dei link ad ogni "tick" della simulazione
    function ticked() { 
        const link = g.selectAll(".link") // Seleziona tutti gli elementi con classe "link"
            .data(links, d => d.target.id);

        link.enter().append("line") // Aggiungi un elemento "line" per ogni link
            .attr("class", "link")
            .merge(link)
            .attr("stroke-width", 1) // Imposta lo spessore del bordo del link
            .attr("x1", d => d.source.x) 
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        link.exit().remove();

        const node = g.selectAll(".node") // Seleziona tutti gli elementi con classe "node"
            .data(nodes, d => d.id);

        const nodeEnter = node.enter().append("circle")
            .attr("class", "node") 
            .attr("r", 7)
            .attr("fill", d => d.color) 
            .call(d3.drag() // Aggiungi la funzionalità di trascinamento ai nodi
                .on("start", dragStarted)
                .on("drag", dragged)
                .on("end", dragEnded));

        nodeEnter.append("title").text(d => d.data.name);

        nodeEnter.merge(node) // Unisci i nodi esistenti con i nuovi nodi
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        node.exit().remove();

        if (nodes.length === root.descendants().length) { 
            lastNodeTime = performance.now(); // Memorizza l'istante in cui si inserisce l'ultimo nodo
            const executionTime = (lastNodeTime - startTime) / 1000;
            console.log(`Tempo totale di esecuzione fino all'ultimo nodo: ${executionTime.toFixed(3)} secondi`);
        }
    }

    // Aggiungi ricorsivamente i nodi e i link alla simulazione con un ritardo specificato
    function addNodesRecursively(node, delay) {
        if (!startTime) { 
            startTime = performance.now();
        }

        const newNode = {
            id: node.data.name,
            data: node.data,
            depth: node.depth,
            color: getColor(node.depth),
            x: node.parent ? node.parent.data.x + getRandomOffset() : svgWidth / 2, // Posiziona il nodo vicino al centro e verifica la condizione con operatore ?
            y: node.parent ? node.parent.data.y + getRandomOffset() : svgHeight / 2
        };
        nodes.push(newNode);

        if (node.parent) { // Se il nodo ha un genitore, aggiungi un link tra il nodo e il genitore
            const newLink = {
                source: nodes.find(n => n.id === node.parent.data.name),
                target: newNode
            };
            links.push(newLink);
        }

        simulation.nodes(nodes); // Aggiorna i nodi della simulazione
        simulation.force("link").links(links);
        simulation.alpha(1).restart(); // Riavvia la simulazione con una nuova forza

        node.data.x = newNode.x;
        node.data.y = newNode.y;

        if (node.children) { // Se il nodo ha figli, aggiungi i figli con un ritardo
            setTimeout(() => {
                node.children.forEach((child) => {
                    addNodesRecursively(child, delay);
                });
            }, delay);
        }
    }

    // Funzione per ottenere un colore in base al livello del nodo
    function getColor(level) {
        const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"];

        return colors[level];
    }

    // Funzioni di gestione del drag per i nodi
    function dragStarted(event, d) { // Funzione per iniziare il trascinamento di un nodo
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x; // Imposta la posizione fissa del nodo
        d.fy = d.y;
    }

    function dragged(event, d) { // Funzione per trascinare un nodo
        d.fx = event.x; // Imposta la posizione fissa del nodo in base alla posizione del mouse
        d.fy = event.y;
    }

    function dragEnded(event, d) { // Funzione per terminare il trascinamento di un nodo
        if (!event.active) simulation.alphaTarget(0); 
        d.fx = null; // Imposta la posizione fissa del nodo su null
        d.fy = null;
    }

    // Avvia l'aggiunta ricorsiva dei nodi all'albero
    addNodesRecursively(root, delay);
}

// Funzione per eseguire la simulazione al click di un pulsante
function onClick() {
    this.simulationRun();
}

// Centrare la scrollbar nel div scrollabile
var scrollableDiv = document.getElementById('scrollableDiv');
var halfContentWidth = scrollableDiv.scrollWidth / 4.25;
scrollableDiv.scrollLeft = halfContentWidth;
var halfContentHeight = scrollableDiv.scrollHeight / 2.75;
scrollableDiv.scrollTop = halfContentHeight;
