// Definisci i margini e le dimensioni del contenitore SVG
const margin = { top: 20, right: 40, bottom: 20, left: 40 };
const width = window.innerWidth * 1.7;
const height = window.innerHeight * 3;
const svgWidth = width;
const svgHeight = height;

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
        const name = `node_${depth}_${Math.random().toString(36).substring(2, 7)}`; //crea un nome univoco per il nodo, che include la profondità corrente (depth) e una stringa casuale generata usando Math.random().

        const children = [];

        const numChildren = getRandomInt(1, maxChildren);
        for (let i = 0; i < numChildren; i++) { 
            if (depth < maxDepth) { //se la profondità corrente (depth) è inferiore alla profondità massima (maxDepth), chiama ricorsivamente generateRandomTree per creare il sottoalbero del figlio, incrementando la profondità di 1.
                children.push(generateRandomTree(depth + 1, maxChildren)); //aggiunge il sottoalbero generato all'array children
            }
        }

        return { name, children };
    }

    // Funzione di utilità per generare un numero intero casuale tra min e max
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    //Definisco variabili per specificare l'istante in cui inizia l'aggiunta dei nodi e l'istante in cui si inserisce l'ultimo nodo
    let startTime;
    let lastNodeTime;

    // Genera i dati dell'albero e crea una gerarchia D3
    const data = generateRandomTree(0, maxChildren);
    const root = d3.hierarchy(data); //usata per costruire l'albero in visualizzazione

    let nodes = []; //inizializzo le liste che contengono nodi e archi
    let links = [];

    // Configura la simulazione di forza D3 con nodi e link
    const simulation = d3.forceSimulation(nodes)
       .force("link", d3.forceLink(links).id(d => d.id).distance(20)) //forza che mantiene i collegamenti tra i nodi. distance(20) imposta la distanza preferita tra i nodi collegati
       .force("charge", d3.forceManyBody().strength(-100)) //forza di repulsione tra i nodi, con strength(-100) per tenerli separati
       .force("center", d3.forceCenter(svgWidth / 2, svgHeight / 2)) //f x   orza che centra i nodi all'interno dell'SVG, posizionandoli al centro dell'area
       .on("tick", ticked);

    // Funzione per aggiornare la posizione dei nodi e dei link ad ogni "tick" della simulazione
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

        // Calcola e stampa il tempo di esecuzione totale una volta che tutti i nodi sono stati aggiunti
        if (nodes.length === root.descendants().length) {
            lastNodeTime = performance.now();
            const executionTime = (lastNodeTime - startTime) / 1000;
            console.log(`Tempo totale di esecuzione fino all'ultimo nodo: ${executionTime.toFixed(3)} secondi`);
        }
    }

    // Aggiungi ricorsivamente i nodi e i link alla simulazione con un ritardo specificato
    function addNodesRecursively(node, delay = 3000) {
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

    // Funzione per ottenere un colore in base al livello del nodo
    function getColor(level) {
        // Definisci una scala di colori che corrisponde ai livelli degli internodi
        const colorLevels = [0, 1, 2, 3, 4]; // Aggiungi o rimuovi valori in base alla profondità massima desiderata
        const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"]; // Esempio di colori

        // Restituisci il colore corrispondente al livello del nodo
        return colors[level];
    }

    // Funzioni di gestione del drag per i nodi
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

    // Avvia l'aggiunta ricorsiva dei nodi all'albero
    addNodesRecursively(root, 2000);
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