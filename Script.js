/* ==========================================
   MINDSKETCH
   Idea + Critical Thinking Canvas
========================================== */


/* ==========================================
   GLOBAL STATE
========================================== */

let nodes = [];

let connections = [];

let selectedNode = null;

let connectMode = false;

let drawMode = false;

let nodeCounter = 0;

let questionCounter = 0;


/* ==========================================
   ELEMENTS
========================================== */

const canvas = document.getElementById("canvas");

const nodesContainer = document.getElementById("nodes");

const svg = document.getElementById("connections");

const drawingCanvas = document.getElementById("drawingCanvas");

const ctx = drawingCanvas.getContext("2d");

const status = document.getElementById("status");


/* ==========================================
   RESIZE DRAWING CANVAS
========================================== */

function resizeDrawingCanvas() {

    drawingCanvas.width = canvas.clientWidth;

    drawingCanvas.height = canvas.clientHeight;
}

window.addEventListener(
    "resize",
    resizeDrawingCanvas
);

resizeDrawingCanvas();


/* ==========================================
   STATUS
========================================== */

function setStatus(message) {

    status.textContent = message;

    setTimeout(() => {

        status.textContent = "Ready";

    }, 2000);
}


/* ==========================================
   IDEA MODAL
========================================== */

const ideaModal =
    document.getElementById("ideaModal");

document
    .getElementById("addIdeaBtn")
    .addEventListener("click", () => {

        ideaModal.classList.add("active");

        document
            .getElementById("ideaTitle")
            .focus();
    });


document
    .getElementById("closeIdea")
    .addEventListener("click", () => {

        ideaModal.classList.remove("active");

    });


/* ==========================================
   CREATE IDEA
========================================== */

document
    .getElementById("createIdea")
    .addEventListener("click", () => {

        const title =
            document
                .getElementById("ideaTitle")
                .value
                .trim();

        const description =
            document
                .getElementById("ideaDescription")
                .value
                .trim();

        if (!title) {

            alert("Please enter an idea title.");

            return;
        }

        createNode(
            title,
            description,
            "idea"
        );

        document
            .getElementById("ideaTitle")
            .value = "";

        document
            .getElementById("ideaDescription")
            .value = "";

        ideaModal.classList.remove("active");

        setStatus("Idea added");
    });


/* ==========================================
   CREATE NODE
========================================== */

function createNode(
    title,
    description,
    type = "idea"
) {

    nodeCounter++;

    const node = {

        id: "node-" + nodeCounter,

        title: title,

        description: description,

        type: type,

        x: 100 + Math.random() * 300,

        y: 80 + Math.random() * 250

    };

    nodes.push(node);

    renderNode(node);
}


/* ==========================================
   RENDER NODE
========================================== */

function renderNode(node) {

    const element =
        document.createElement("div");

    element.className = "node";

    if (node.type === "question") {

        element.classList.add("question");
    }

    element.dataset.id = node.id;

    element.style.left =
        node.x + "px";

    element.style.top =
        node.y + "px";


    element.innerHTML = `

        <button class="delete-node">
            ×
        </button>

        <h3>
            ${escapeHTML(node.title)}
        </h3>

        <p>
            ${escapeHTML(node.description)}
        </p>

    `;


    nodesContainer.appendChild(element);


    /* DELETE */

    element
        .querySelector(".delete-node")
        .addEventListener("click", (event) => {

            event.stopPropagation();

            deleteNode(node.id);

        });


    /* CLICK */

    element.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            if (connectMode) {

                handleConnection(node);

            }

        }
    );


    /* DRAG */

    makeDraggable(
        element,
        node
    );
}


/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHTML(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ==========================================
   DRAG NODES
========================================== */

function makeDraggable(
    element,
    node
) {

    let dragging = false;

    let offsetX = 0;

    let offsetY = 0;


    element.addEventListener(
        "pointerdown",
        (event) => {

            if (connectMode) return;

            dragging = true;

            offsetX =
                event.clientX -
                element.offsetLeft;

            offsetY =
                event.clientY -
                element.offsetTop;

            element.setPointerCapture(
                event.pointerId
            );

        }
    );


    element.addEventListener(
        "pointermove",
        (event) => {

            if (!dragging) return;

            let x =
                event.clientX -
                offsetX;

            let y =
                event.clientY -
                canvas.getBoundingClientRect().top;


            x = Math.max(
                0,
                Math.min(
                    x,
                    canvas.clientWidth -
                    element.offsetWidth
                )
            );


            y = Math.max(
                0,
                Math.min(
                    y,
                    canvas.clientHeight -
                    element.offsetHeight
                )
            );


            element.style.left =
                x + "px";

            element.style.top =
                y + "px";


            node.x = x;

            node.y = y;

            drawConnections();

        }
    );


    element.addEventListener(
        "pointerup",
        () => {

            dragging = false;

        }
    );
}


/* ==========================================
   DELETE NODE
========================================== */

function deleteNode(id) {

    nodes =
        nodes.filter(
            node => node.id !== id
        );


    connections =
        connections.filter(
            connection =>
                connection.from !== id &&
                connection.to !== id
        );


    const element =
        document.querySelector(
            `[data-id="${id}"]`
        );


    if (element) {

        element.remove();

    }


    drawConnections();

    setStatus("Idea deleted");
}


/* ==========================================
   CONNECTION MODE
========================================== */

document
    .getElementById("connectBtn")
    .addEventListener("click", () => {

        connectMode = !connectMode;

        selectedNode = null;

        if (connectMode) {

            setStatus(
                "Click two ideas to connect them"
            );

        } else {

            setStatus(
                "Connection mode off"
            );

        }

    });


/* ==========================================
   HANDLE CONNECTION
========================================== */

function handleConnection(node) {

    if (!selectedNode) {

        selectedNode = node;

        setStatus(
            "Now click another idea"
        );

        return;
    }


    if (
        selectedNode.id === node.id
    ) {

        selectedNode = null;

        return;
    }


    const exists =
        connections.some(
            connection =>
                connection.from === selectedNode.id &&
                connection.to === node.id
        );


    if (!exists) {

        connections.push({

            from: selectedNode.id,

            to: node.id

        });

    }


    selectedNode = null;

    drawConnections();

    setStatus("Ideas connected");
}


/* ==========================================
   DRAW CONNECTIONS
========================================== */

function drawConnections() {

    svg.innerHTML = "";


    connections.forEach(
        connection => {

            const from =
                nodes.find(
                    node =>
                        node.id === connection.from
                );

            const to =
                nodes.find(
                    node =>
                        node.id === connection.to
                );


            if (!from || !to) return;


            const fromElement =
                document.querySelector(
                    `[data-id="${from.id}"]`
                );

            const toElement =
                document.querySelector(
                    `[data-id="${to.id}"]`
                );


            if (!fromElement || !toElement)
                return;


            const x1 =
                from.x +
                fromElement.offsetWidth / 2;

            const y1 =
                from.y +
                fromElement.offsetHeight / 2;


            const x2 =
                to.x +
                toElement.offsetWidth / 2;

            const y2 =
                to.y +
                toElement.offsetHeight / 2;


            const line =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "line"
                );


            line.setAttribute(
                "x1",
                x1
            );

            line.setAttribute(
                "y1",
                y1
            );

            line.setAttribute(
                "x2",
                x2
            );

            line.setAttribute(
                "y2",
                y2
            );


            line.classList.add(
                "connection"
            );


            svg.appendChild(line);

        }
    );
}


/* ==========================================
   DRAW MODE
========================================== */

document
    .getElementById("drawBtn")
    .addEventListener("click", () => {

        drawMode = !drawMode;


        if (drawMode) {

            drawingCanvas.style.pointerEvents =
                "auto";

            setStatus(
                "Drawing mode — sketch freely"
            );

        } else {

            drawingCanvas.style.pointerEvents =
                "none";

            setStatus(
                "Drawing mode off"
            );

        }

    });


/* ==========================================
   FREEHAND DRAWING
========================================== */

let drawing = false;


drawingCanvas.addEventListener(
    "pointerdown",
    event => {

        if (!drawMode) return;

        drawing = true;

        ctx.beginPath();

        ctx.moveTo(
            event.offsetX,
            event.offsetY
        );

    }
);


drawingCanvas.addEventListener(
    "pointermove",
    event => {

        if (!drawing || !drawMode)
            return;


        ctx.lineTo(
            event.offsetX,
            event.offsetY
        );


        ctx.strokeStyle = "#111827";

        ctx.lineWidth = 3;

        ctx.lineCap = "round";

        ctx.stroke();

    }
);


drawingCanvas.addEventListener(
    "pointerup",
    () => {

        drawing = false;

    }
);


drawingCanvas.addEventListener(
    "pointerleave",
    () => {

        drawing = false;

    }
);


/* ==========================================
   CLEAR DRAWING
========================================== */

document
    .getElementById("clearDrawBtn")
    .addEventListener("click", () => {

        ctx.clearRect(
            0,
            0,
            drawingCanvas.width,
            drawingCanvas.height
        );

        setStatus(
            "Sketch cleared"
        );

    });


/* ==========================================
   QUESTION MODAL
========================================== */

const questionModal =
    document.getElementById(
        "questionModal"
    );


document
    .getElementById("questionBtn")
    .addEventListener("click", () => {

        questionModal.classList.add(
            "active"
        );

    });


document
    .getElementById("closeQuestion")
    .addEventListener("click", () => {

        questionModal.classList.remove(
            "active"
        );

    });


/* ==========================================
   CREATE QUESTION
========================================== */

document
    .getElementById("createQuestion")
    .addEventListener("click", () => {

        const type =
            document
                .getElementById(
                    "questionType"
                )
                .value;


        const text =
            document
                .getElementById(
                    "questionText"
                )
                .value
                .trim();


        if (!text) {

            alert(
                "Write a question first."
            );

            return;
        }


        questionCounter++;


        createNode(
            type,
            text,
            "question"
        );


        document
            .getElementById(
                "questionText"
            )
            .value = "";


        questionModal.classList.remove(
            "active"
        );


        setStatus(
            "Thinking question added"
        );

    });


/* ==========================================
   SAVE
========================================== */

document
    .getElementById("saveBtn")
    .addEventListener("click", () => {

        const thinkingData = {

            mainIdea:
                document.getElementById(
                    "mainIdea"
                ).value,

            assumptions:
                document.getElementById(
                    "assumptions"
                ).value,

            evidence:
                document.getElementById(
                    "evidence"
                ).value,

            counterargument:
                document.getElementById(
                    "counterargument"
                ).value,

            perspective:
                document.getElementById(
                    "perspective"
                ).value

        };


        const data = {

            nodes: nodes,

            connections:
                connections,

            thinking:
                thinkingData

        };


        localStorage.setItem(
            "mindSketchData",
            JSON.stringify(data)
        );


        setStatus(
            "Workspace saved"
        );

    });


/* ==========================================
   LOAD
========================================== */

function loadWorkspace() {

    const saved =
        localStorage.getItem(
            "mindSketchData"
        );


    if (!saved) return;


    try {

        const data =
            JSON.parse(saved);


        nodes =
            data.nodes || [];


        connections =
            data.connections || [];


        nodesContainer.innerHTML = "";


        nodes.forEach(
            node =>
                renderNode(node)
        );


        const thinking =
            data.thinking || {};


        document.getElementById(
            "mainIdea"
        ).value =
            thinking.mainIdea || "";


        document.getElementById(
            "assumptions"
        ).value =
            thinking.assumptions || "";


        document.getElementById(
            "evidence"
        ).value =
            thinking.evidence || "";


        document.getElementById(
            "counterargument"
        ).value =
            thinking.counterargument || "";


        document.getElementById(
            "perspective"
        ).value =
            thinking.perspective || "";


        drawConnections();


    } catch (error) {

        console.error(
            "Could not load workspace",
            error
        );

    }

}


loadWorkspace();


/* ==========================================
   EXPORT
========================================== */

document
    .getElementById("exportBtn")
    .addEventListener("click", () => {

        const data = {

            nodes: nodes,

            connections:
                connections,

            thinking: {

                mainIdea:
                    document.getElementById(
                        "mainIdea"
                    ).value,

                assumptions:
                    document.getElementById(
                        "assumptions"
                    ).value,

                evidence:
                    document.getElementById(
                        "evidence"
                    ).value,

                counterargument:
                    document.getElementById(
                        "counterargument"
                    ).value,

                perspective:
                    document.getElementById(
                        "perspective"
                    ).value

            }

        };


        const blob =
            new Blob(
                [
                    JSON.stringify(
                        data,
                        null,
                        2
                    )
                ],
                {
                    type:
                        "application/json"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href = url;

        link.download =
            "mindsketch-workspace.json";


        link.click();


        URL.revokeObjectURL(url);


        setStatus(
            "Workspace exported"
        );

    });


/* ==========================================
   CLEAR EVERYTHING
========================================== */

document
    .getElementById("clearBtn")
    .addEventListener("click", () => {

        const confirmed =
            confirm(
                "Delete all ideas, connections and thinking notes?"
            );


        if (!confirmed) return;


        nodes = [];

        connections = [];


        nodesContainer.innerHTML = "";

        svg.innerHTML = "";


        ctx.clearRect(
            0,
            0,
            drawingCanvas.width,
            drawingCanvas.height
        );


        localStorage.removeItem(
            "mindSketchData"
        );


        document.querySelectorAll(
            ".thinking-card textarea"
        ).forEach(
            textarea =>
                textarea.value = ""
        );


        setStatus(
            "Workspace cleared"
        );

    });
