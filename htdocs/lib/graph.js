export { Graph }

class Graph {

    ctx
    width
    height
    margin
    field
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

    scaleH = 100
    scaleV = 100
    hAxisMode = 'cHit'
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
        console.log('vMin :', this.vMin, '/ vMax :', this._vMax)
        console.log('scaleV :', this.scaleV)
    }
    get vMax() {
        return this._vMax
    }

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
    
    constructor (ctx, margin = {top: 0, right: 0, bottom: 0, left: 0}) {
        this.ctx = ctx
        this.width = ctx.canvas.width
        this.height = ctx.canvas.height
        this.margin = margin
        this.field = {
            width: this.width - this.margin.right - this.margin.left,
            height: this.height - this.margin.top - this.margin.bottom
        }
        this.origin = {
            x: this.margin.left,
            y: this.height - this.margin.bottom
        }
    }

    drawGraph(data) {
        for(const key in data) {
            this.drawLine(this.graphStyle[key].color, 1, data[key])
        }
    }

    refreshField (data = this.dummyData) {
        const steps = [...data.reduce((a,c) => a.concat(c), []).map(e => e.x)]
        this.hMin = Math.min(...steps)
        this.hMax = Math.max(...steps)
        this.grid.h = this.hMax - this.hMin
        const values = [...data.reduce((a,c) => a.concat(c), []).map(e => e.y)]
        this.vMin = Math.min(...values)
        this.vMax = Math.max(...values)
        
        this.clearField()
        this.drawGrid()
        this.drawGraph(data)
        this.drawField()
    }

    clearField () {
        this.ctx.clearRect(0,0, this.width, this.height)
    }
    
    drawGrid() {
        for(let i = 0; i < this.grid.v; i++) {
            const vGridLine = [
                {
                    x: 0,
                    y: this.field.height / 1.1 / this.grid.v * (i + 1)
                },
                {
                    x: this.field.width,
                    y: this.field.height / 1.1 / this.grid.v * (i + 1)
                }
            ]
            this.drawLine(this.lineStyle.hGrid.color, this.lineStyle.hGrid.width, vGridLine, undefined, false)
        }
        for(let i = 0; i < this.grid.h; i++) {
            const hGridLine = [
                {
                    x: this.field.width / 1.1 / this.grid.h * (i + 1),
                    y: 0
                },
                {
                    x: this.field.width / 1.1 / this.grid.h * (i + 1),
                    y: this.field.height
                }
            ]
            this.drawLine(this.lineStyle.vGrid.color, this.lineStyle.vGrid.width, hGridLine, undefined, false)
        }
    }

    drawField() {
        const vBaseLine = [
            {x: 0, y: 0},
            {x: this.field.width, y: 0}
        ]
        this.drawLine(this.lineStyle.base.color, this.lineStyle.base.width, vBaseLine, undefined, false)
        const hBaseLine = [
            {x: 0, y: 0},
            {x: 0, y: this.field.height}
        ]
        this.drawLine(this.lineStyle.base.color, this.lineStyle.base.width, hBaseLine, undefined, false)

        this.drawText('ダメージ出力', this.textColor, {x: 0, y: this.field.height + 5})
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
        }
        //console.log(text)
        this.drawText(text, this.textColor, {x: this.field.width, y: -15})
        for(let i = 0; i <= this.grid.v; i++) {
            const pos = {x: -3, y: 0 + this.field.height / 1.1 / this.grid.v * i}
            this.drawText(this.vMin + (this.vMax - this.vMin) / this.grid.v * i, this.textColor, pos, 'right')
        }
        for(let i = 0; i <= (this.hMax - this.hMin); i++) {
            const pos = {x: this.field.width / 1.1 / (this.hMax - this.hMin) * i, y: -15}
            this.drawText(this.hMin + i, this.textColor, pos)
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

    drawText (text, color, pos = {x: 0, y: 0}, align = 'center') {
        this.ctx.fillStyle = color
        this.ctx.textAlign = align
        this.ctx.fillText(text, this.origin.x + pos.x, this.origin.y - pos.y)

    }

}
