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

// Start the animation with the root node
addNodesRecursively(root, 1000);
