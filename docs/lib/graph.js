export { Graph }

class Graph {

    static createElement(name) {
        const ns = 'http://www.w3.org/2000/svg'
        return document.createElementNS(ns, name)
    }

    field
    width
    height
    margin
    stage = { x: 0, y: 0, width: 0, height: 0 }
    origin = { x: 0, y: 0}
    lineStyle = {
        base: {color: '#333', width: 2},
        vGrid: {color: '#333', width: 1},
        hGrid: {color: '#333', width: 1}
    }
    graphStyle = [
        {color: "#f00", width: 1},
        {color: "#ff0", width: 1},
        {color: "#0f0", width: 1},
        {color: "#0ff", width: 1},
        {color: "#99f", width: 1},
    ]
    
    textColor = '#ccc'

    grid = {
        h: 4,
        v: 2,
    }

    get scaleH() {
        return this.stage.width / 1.1 / (this.hMax - this.hMin)
    }
    get scaleV() {
        return this.stage.height / 1.1 / (this.vMax - this.vMin)
    }
    hAxisMode = ''
    vAxisMode = 'output'
    hMin = 0
    hMax = 36
    vMin = 0
    vMax = 100

    layer = {
        background: {},
        grid: {},
        main: {},
        baseline: {},
        text: {},
    }
    objects = []

    data = []

    dummyData = [
        [
            {x: -1, y: 8723},
            {x: 0, y: 8827},
            {x: 1, y: 8930},
            {x: 2, y: 10000}
        ],
        [
            {x: 0, y: 8723},
            {x: 1, y: 8884},
            {x: 2, y: 9045},
            {x: 3, y: 9045},
            {x: 4, y: 9045},
            {x: 5, y: 9045}
        ],
    ]
    
    constructor (field, margin = {top: 0, right: 0, bottom: 0, left: 0}, data) {
        this.field = field
        this.width = this.field.parentNode.clientWidth
        this.height = Number(this.field.getAttribute('height'))
        this.margin = margin
        this.stage = {
            x: this.margin.left,
            y: this.margin.top,
            width: this.width - this.margin.right - this.margin.left,
            height: this.height - this.margin.top - this.margin.bottom
        }
        this.origin = {
            x: this.margin.left,
            y: this.height - this.margin.bottom
        }
    }

    refreshData (data = this.dummyData) {
        console.log(data)
        const steps = [...data.reduce((a,c) => a.concat(c), []).map(e => e.x)]
        this.hMin = Math.min(...steps)
        this.hMax = Math.max(...steps)
        this.grid.h = this.hMax - this.hMin
        const values = [...data.reduce((a,c) => a.concat(c), []).map(e => e.y)]
        this.vMin = Math.min(...values)
        this.vMax = Math.max(...values)

        console.log(
            'hMin:',this.hMin, 'hMax:',this.hMax, 'scaleH:', this.scaleH,
            'vMin:',this.vMin, 'vMax:',this.vMax, 'scaleV:', this.scaleV,
        )
    }

    sc(x, y, sx = false, sy = false) {
        return {
            x: this.sx(x, sx),
            y: this.sy(y, sy),
        }
    }

    sx(x, s = false) {
        let r = this.origin.x
        let xs = 1
        if(s) x -= this.hMin
        if(s) xs = this.scaleH
        r += (x * xs)
        return r
    }

    sy(y, s = false) {
        let r = this.origin.y
        let ys = 1
        if(s) y -= this.vMin
        if(s) ys = this.scaleV
        r -= (y * ys)
        return r
    }

    drawGraph(data) {
        const coord = []
        for(const obj of data) {
            let p = this.sc(obj.x, obj.y, true, true)
            coord.push(...Object.values(p))
        }
        return coord.join(' ')
    }
    
    baseLine() {
        const d = [
            [0, this.stage.height],
            [0, 0],
            [this.stage.width, 0],
        ]
        const r = []
        for(let i of d) {
            r.push(...Object.values(this.sc(i[0],i[1])))
        }
        return r.join(' ')
    }

    gridData() {
    }

    hGridCoord() {
        const r = []
        for(let i = 0; i <= this.grid.h; i++) {
            const d = {
                text: this.hMin + i,
                start: this.sc(this.stage.width / 1.1 / this.grid.h * i, 0),
                end: this.sc(this.stage.width / 1.1 / this.grid.h * i, this.stage.height),
                style: 'dashed',
            }
            if((this.hMin + i) % 5 === 0) d.style = 'solid'
            r.push(d)
        }
        return r
    }

    vGridCoord() {
        const r = []
        for(let i = 0; i <= (this.vMax - this.vMin) / 500; i++) {
            const v = Math.floor(this.vMin / 500) * 500 + 500 * i
            const d = {
                text: v,
                start: this.sc(0, v, false, true),
                end: this.sc(this.stage.width, v, false, true),
                style: 'solid',
            }
            if(v % 1000 === 0) d.style = 'solid'
            r.push(d)
        }
        return r
    }

    hGridValue() {}

    vGridValue() {}
}
