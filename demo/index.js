const { makeAutoObservable, autorun, computed } = mobx

class SquareStore {
    squares = []
    computedLatency = 1000

    constructor() {
        makeAutoObservable(this, {
            totalSquaresComputed: computed,
            // Don't make computedLatency observable
            computedLatency: false
        })
    }

    addSquare() {
        const squareSize = 50
        const margin = 10
        const totalMargin = margin * this.squares.length

        const x = (squareSize + margin) * this.squares.length
        const y =
            window["mobxFork"] == null
                ? window.innerHeight / 2 - squareSize / 2
                : window.innerHeight / 2 - squareSize / 2 + 100

        // Check if the new square fits in the window width
        if (x + squareSize + totalMargin <= window.innerWidth) {
            this.squares.push({ x, y })
        } else {
            alert("No more space to add another square in the row!")
        }
    }

    setComputedLatency(latency) {
        this.computedLatency = latency
    }

    get totalSquaresComputed() {
        const latency = this.computedLatency
        const start = new Date().getTime()
        while (new Date().getTime() < start + latency) {
            // Simulate delay
        }
        return this.squares.length * 2
    }
}

const store = new SquareStore()

// Event Listeners
if (window["mobxFork"] == null) {
    const getIframeFork = () => document.getElementById("iframe-container-fork").contentWindow
    const getIframeNotFork = () =>
        document.getElementById("iframe-container-not-fork").contentWindow

    document.getElementById("add-square").addEventListener("click", () => {
        getIframeFork().postMessage({ type: "add-square" }, "*")
        getIframeNotFork().postMessage({ type: "add-square" }, "*")
    })
    document.getElementById("computed-latency").addEventListener("input", e => {
        const latency = Number.parseInt(e.target.value, 10)
        getIframeFork().postMessage({ type: "set-computed-latency", latency }, "*")
        getIframeNotFork().postMessage({ type: "set-computed-latency", latency }, "*")
    })
    document.getElementById("clear").addEventListener("click", () => {
        getIframeFork().postMessage({ type: "clear" }, "*")
        getIframeNotFork().postMessage({ type: "clear" }, "*")
    })
} else {
    // Listen to events...
    window.addEventListener("message", e => {
        const { type, latency } = e.data
        console.log(type)
        if (type === "add-square") {
            store.addSquare()
        } else if (type === "set-computed-latency") {
            store.squares.length = 0
            document.getElementById("square-container").innerHTML = ""
            store.setComputedLatency(latency)
        } else if (type === "clear") {
            store.squares.length = 0
            document.getElementById("square-container").innerHTML = ""
        }
    })

    // Observer to render squares
    mobx.autorun(() => {
        const container = document.getElementById("square-container")
        container.innerHTML = ""
        store.squares.forEach(square => {
            const div = document.createElement("div")
            div.className = "square"
            div.style.left = square.x + "px"
            div.style.top = square.y + "px"
            container.appendChild(div)
        })
    })

    // Delayed autorun to update the computed result button
    autorun(
        () => {
            const btn = document.getElementById("computed-result")
            btn.textContent = "Computed Result: " + store.totalSquaresComputed
        },
        { delay: 100 }
    )
}
