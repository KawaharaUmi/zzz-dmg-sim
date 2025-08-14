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
    origin
    lineStyle = {
        base: {color: '#333', width: 2},
        vGrid: {color: '#333', width: 1},
        hGrid: {color: '#333', width: 1}
    }
    graphStyle = [
        {color: "#f00", width: 1},
        {color: "#0f0", width: 1},
        {color: "#66f", width: 1},
    ]
    
    textColor = '#ccc'

    grid = {
        h: 4,
        v: 2,
    }

    scaleH = 1
    scaleV = 1
    hAxisMode = ''
    vAxisMode = 'output'
    hMin = 0
    _hMax = 36
    set hMax(val) {
        this._hMax = val
        this.scaleH = this.field.width / 1.1 / (val - this.hMin)
        console.log('hMin :', this.hMin, '/ hMax :', this._hMax)
        console.log('scaleH :', this.scaleH)
    }
    get hMax() {
        return this._hMax
    }
    vMin = 0
    _vMax = 100
    set vMax(val) {
        this._vMax = val
        this.scaleV = this.field.height / 1.1 / (val - this.vMin)
    }
    get vMax() {
        return this._vMax
    }

    layer = {
        background: {},
        grid: {},
        main: {},
        baseline: {},
        text: {},
    }
    objects = []

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
    
    constructor (field, margin = {top: 0, right: 0, bottom: 0, left: 0}) {
        this.field = field
        for(const key of Object.keys(this.layer)) {
            this.layer[key] = this.field.querySelector('#layer-' + key)
        }
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

        this.refreshField()
    }

    refreshField (data = this.dummyData) {
        const steps = [...data.reduce((a,c) => a.concat(c), []).map(e => e.x)]
        this.hMin = Math.min(...steps)
        this.hMax = Math.max(...steps)
        this.grid.h = this.hMax - this.hMin
        const values = [...data.reduce((a,c) => a.concat(c), []).map(e => e.y)]
        this.vMin = Math.min(...values)
        this.vMax = Math.max(...values)
        
        this.drawField()
        this.drawGrid()
        for(const key in data) {
            this.drawGraph(key, data[key])
        }
    }

    clearField(target = [this.layer.main]) {
        for(const layer of target) {
            for(const obj of layer.childNodes) {
                obj.remove()
            }
        }
    }

    drawGraph(id, data) {
        const coord = []
        for(const key in data) {
            coord.push({
                x: this.stage.width / 1.1 / (this.hMax - this.hMin) * (data[key].x - this.hMin),
                y: this.stage.height / 1.1 / (this.vMax - this.vMin) * (data[key].y - this.vMin),
            })
        }
        this.createPolyline(this.layer.main, 'graph-'+id, coord, this.graphStyle[id].color, this.graphStyle[id].width)
    }
    
    drawGrid() {
        this.clearField([this.layer.grid])
        for(let i = 0; i < this.grid.v; i++) {
            const start = {
                x: 0,
                y: this.stage.height / 1.1 / this.grid.v * (i + 1)
            }
            const end = {
                x: this.stage.width,
                y: this.stage.height / 1.1 / this.grid.v * (i + 1)
            }
            this.createLine(this.layer.grid, 'grid-v-'+i, start, end, this.lineStyle.hGrid.color, this.lineStyle.hGrid.width, false)
        }
        for(let i = 0; i < this.grid.h; i++) {
            const start = {
                x: this.stage.width / 1.1 / this.grid.h * (i + 1),
                y: 0
            }
            const end = {
                x: this.stage.width / 1.1 / this.grid.h * (i + 1),
                y: this.stage.height
            }
            this.createLine(this.layer.grid, 'grid-v-'+i, start, end, this.lineStyle.hGrid.color, this.lineStyle.hGrid.width, false)
        }
    }

    drawField() {
        this.clearField([this.layer.baseline, this.layer.text])
        this.createPolyline(this.layer.baseline, 'baseline', [{x:0,y:this.stage.height},{x:0,y:0},{x:this.stage.width,y:0}], this.lineStyle.base.color, this.lineStyle.base.width, false)

        this.createText(this.layer.text, 'v-value-label', {x:0, y: this.stage.height + 5}, 'ダメージ出力', 'middle', this.textColor)
        for(let i = 0; i <= this.grid.v; i++) {
            const pos = {x: -3, y: 0 + this.stage.height / 1.1 / this.grid.v * i}
            const text = Math.floor(this.vMin + (this.vMax - this.vMin) / this.grid.v * i)
            this.createText(this.layer.text, 'v-value-'+i, pos, text, 'end', this.textColor)
        }
        
        let text
        switch(this.hAxisMode) {
            case 'cHit':
                text = '会心率(@2.4%)'
                break
            case 'cDmg':
                text = '会心ダメ(@4.8%)'
                break
            case 'atk':
                text = '攻撃力(@3.0%)'
                break
            default:
                text = 'スタック数'
                break
        }
        this.createText(this.layer.text, 'h-value-label', {x:this.width - this.margin.left - 15, y: -30}, text, 'end', this.textColor)
        for(let i = 0; i <= (this.hMax - this.hMin); i++) {
            const pos = {x: this.stage.width / 1.1 / (this.hMax - this.hMin) * i, y: -15}
            let text = this.hMin + i
            if(text > 0) text = '+' + text
            this.createText(this.layer.text, 'h-value-'+i, pos, text, 'middle', this.textColor)
        }
    }

    drawLine (color, width, params = [], close = false, scaling = true) {
        let xScale = 1, yScale = 1, xOffset = 0, yOffset = 0
        if(scaling) {
            xScale = this.scaleH
            yScale = this.scaleV
            xOffset = this.hMin
            yOffset = this.vMin
        }
        this.ctx.strokeStyle = color
        this.ctx.lineWidth = width

        const path = new Path2D()
        path.moveTo(
            this.origin.x + (params[0].x - xOffset) * xScale,
            this.origin.y - (params[0].y - yOffset) * yScale
        )
        let key = 1
        while(params[key] != undefined) {
            path.lineTo(
                this.origin.x + (params[key].x - xOffset) * xScale,
                this.origin.y - (params[key].y - yOffset) * yScale
            )
            key++
        }
        if(close) path.closePath()

        this.ctx.stroke(path)
        return path
    }
    

    createLine(layer, id, start = {x: 0, y: 0}, end = {x: 0, y: 0}, color = '#ffff', width = '1pt', scaling = true) {
        const ele = Graph.createElement('line')
        ele.setAttribute('id', id)
        ele.setAttribute('x1', this.origin.x + start.x)
        ele.setAttribute('y1', this.origin.y - start.y)
        ele.setAttribute('x2', this.origin.x + end.x)
        ele.setAttribute('y2', this.origin.y - end.y)
        ele.setAttribute('stroke', color)
        ele.setAttribute('stroke-width', width)
        layer.appendChild(ele)
        return ele
    }

    createPolyline(layer, id, points = [{x: 0, y: 0}, {x: 0, y: 0}], color = '#ffff', width = '1pt', scaling = true) {
        const data = points.map(e => (this.origin.x + e.x) + ' ' + (this.origin.y - e.y)).join(' ')
        const ele = Graph.createElement('polyline')
        ele.setAttribute('id', id)
        ele.setAttribute('points', data)
        ele.setAttribute('stroke', color)
        ele.setAttribute('stroke-width', width)
        ele.setAttribute('fill', 'transparent')
        layer.appendChild(ele)
        return ele
    }

    createText(layer, id, coord = {x: 0, y: 0}, text = '?', align = 'start', color = '#ffff', scaling = true) {
        const ele = Graph.createElement('text')
        ele.setAttribute('id', id)
        ele.setAttribute('x', this.origin.x + coord.x)
        ele.setAttribute('y', this.origin.y - coord.y)
        ele.setAttribute('fill', color)
        ele.setAttribute('text-anchor', align)
        ele.append(text)
        layer.appendChild(ele)
        return ele
    }
}
