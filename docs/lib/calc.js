export { Calculator }

import { Base } from './base.js'
import { Agent } from './agent.js'
import { Wengine } from './wengine.js'
import { Driver } from './driver.js'

class Calculator extends Base {

    agent
    wengine
    driver
    buffs = []

    pattern = []

    result = []

    _dataAdjustSetModel = {
        wengine: {},
        driver: {
            combo: [1, 15, 15],
            main: ['hpV', 'atkV', 'defV', 'cHit', 'dBns', 'atkR'],
            sub: {
                hpV: 0, hpR: 0,
                atkV: 0, atkR: 0,
                defV: 0, defR: 0,
                cHit: 0, cDmg: 0,
                aPrf: 0, aBld: 0,
                penV: 0,
            }
        }
    }

    constructor(agentId, wengineId, driverId = [1, 15, 15], patternNum) {
        super()
        this.agent = new Agent(agentId)
        this.wengine = new Wengine(wengineId)
        this.driver = new Driver(driverId)
        for(let i = 0; i < patternNum; i++) {
            this.addPattern()
        }
    }

    resetAdjuster(patternId) {
        if(!this.pattern[patternId]) return false
        const adjuster = this.pattern[patternId]
        adjuster.wengine = new Wengine(this.wengine.id)
        adjuster.driver.combination = [...this.driver.combination]
        adjuster.driver.main = [...this.driver.main]
        for(const obj of adjuster.driver.sub) {
            obj.stack = 0
        }
        return true
    }

    addPattern() {
        const adjuster = {
            enable: true,
            wengine: new Wengine(this.wengine.id),
            driver: {
                original: this.driver,
                combination: [...this.driver.combination],
                main: [...this.driver.main],
                sub: {},
                get stackTotal() {
                    let count = 0
                    for(const label in this.sub) {
                        count += this.original.sub[label].stack + this.sub[label].stack
                    }
                    return count
                },
                get stackRemaining() {
                    return Driver.getStackLimit() - this.stackTotal
                }
            },
            improveTgt: 'cHit',
        }
        for(const label of Driver.getSubLabels()) {
            const original = this.driver.sub[label]
            const target = adjuster.driver.sub[label] = {
                _stack: 0,
            }
            Object.defineProperty(target, 'stack', {
                get: () => target._stack,
                set: (val) => {
                    target._stack = Number(val)
                    if(target._stack < target.min) target._stack = target.min
                    if(target._stack > target.max) target._stack = target.max
                    if(adjuster.driver.stackTotal > Driver.getStackLimit()) target._stack -= (adjuster.driver.stackTotal - Driver.getStackLimit())
                }
            })
            Object.defineProperty(target, 'min', {
                get: () => {
                    const value = original.stack * -1
                    if(target.stack < value) target.stack = value
                    return value
                }
            })
            Object.defineProperty(target, 'max', {
                get: () => {
                    const value = original.max - original.stack
                    if(target.stack > value) target.stack = value
                    return value
                }
            })
            Object.defineProperty(target, 'value', {
                get: () => Driver.calcSub(label,  original.stack + target.stack)
            })
        }
        return this.pattern.push(adjuster)
    }

    getOutputList() {
        this.result = []
        for(const data of this.pattern) {
            const result = []
            let count = 0
            for(
                let i = data.driver.sub[data.improveTgt].stack;
                (i <= data.driver.stackRemaining && i <= data.driver.sub[data.improveTgt].max);
                i++
            ) {
                result.push({
                    x: i,
                    y:this.calcOutput(
                        this.calcStatus(data, count).total
                    ).expect
                })
                count ++
            }
            this.result.push(result)
        }
        return this.result
    }

    calcOutput(status = {}, buffs = [{atkR: 0, atkV: 0, cHit: 0, cDmg: 0, dBns: 0}]) {
        const {hp, atk, def, cHit, cDmg, dBns} = status
        const buffValues = {}
        for(const buff of buffs) {
            for(const [label, value] of Object.entries(buff)) {
                if(buffValues[label] === undefined) buffValues[label] = 0
                buffValues[label] += value
            }
        }
        const sAtk = Math.add(Math.mlp(atk, Math.add(1, buffValues.atkR / 100)), buffValues.atkV)
        const normal = Math.floor(Math.mlp(sAtk, Math.add(1, dBns/100)))
        const critical = Math.floor(Math.mlp(normal, Math.add(1, cDmg/100, buffValues.cDmg/100)))
        const expect = Math.floor(Math.mlp(normal, Math.add(1, Math.mlp(cHit/100, cDmg/100))))
        return {normal: normal, critical: critical, expect: expect}
    }

    calcStatus(adjuster = undefined, improve = 0, round = false) {
        const result = { total: {}, base: {}, add:{}, }
        const baseStatus = this.agent.getAllStatus()
        let wengine = this.wengine
        let dCombo = this.driver.combination
        let dMain = this.driver.main
        if(adjuster) {
            wengine = adjuster.wengine
            dCombo = adjuster.driver.combination
            dMain = adjuster.driver.main
        }
        baseStatus.atk += wengine.atk
        const {setEffect, mainEffect, sub} = this.driver.getAllEffects()
        for(const label in baseStatus) {
            let base = 0
            let mp = 100
            let add = 0
            // Apply W-Engine effects
            if(wengine.adv.type === label) base = Math.add(base, wengine.adv.value)
            if(wengine.adv.type === label+'R') mp = Math.add(mp, wengine.adv.value)
            if(wengine.adv.type === label+'V') add = Math.add(add, wengine.adv.value)
            // Apply Driver set effect
            if(setEffect[label]) base = Math.add(base, setEffect[label])
            if(setEffect[label+'R']) mp = Math.add(mp, setEffect[label+'R'])
            if(setEffect[label+'V']) add = Math.add(add, setEffect[label+'V'])
            // Apply Driver main effect
            if(mainEffect[label]) base = Math.add(base, mainEffect[label])
            if(mainEffect[label+'R']) mp = Math.add(mp, mainEffect[label+'R'])
            if(mainEffect[label+'V']) add = Math.add(add, mainEffect[label+'V'])
            // Apply Driver sub effect
            if(sub[label]) {
                let stack = this.driver.sub[label].stack
                if(adjuster) {
                    stack += adjuster.driver.sub[label].stack
                    if(adjuster.improveTgt === label) stack += improve
                }
                base = Math.add(base, Driver.calcSub(label, stack))
            }
            if(sub[label+'R']) {
                let stack = this.driver.sub[label+'R'].stack
                if(adjuster) {
                    stack += adjuster.driver.sub[label+'R'].stack
                    if(adjuster.improveTgt === label+'R') stack += improve
                }
                mp = Math.add(mp, Driver.calcSub(label+'R', stack))
            }
            if(sub[label+'V']) {
                let stack = this.driver.sub[label+'V'].stack
                if(adjuster) {
                    stack += adjuster.driver.sub[label+'V'].stack
                    if(adjuster.improveTgt === label+'V') stack += improve
                }
                add = Math.add(add, Driver.calcSub(label+'V', stack))
            }

            // Calculate result
            let total = Math.add(Math.mlp(Math.add(baseStatus[label], base), (mp / 100)), add)
            let additional = Math.sub(total, baseStatus[label])
            if((label === 'cHit' || label === 'pen') && total > 100) total = 100
            if(round) {
                const unit = Base.getUnit(label)
                if(unit === '%') {
                    result.base[label] = Math.floor(Math.mlp(baseStatus[label], 10)) / 10
                    result.add[label] = Math.floor(Math.mlp(additional, 10)) / 10
                    result.total[label] = Math.floor(Math.mlp(total, 10)) / 10
                }
                if(unit === 'pt') {
                    result.base[label] = Math.floor(baseStatus[label])
                    result.add[label] = Math.floor(additional)
                    result.total[label] = Math.floor(total)
                }
            } else {
                result.base[label] = baseStatus[label]
                result.add[label] = additional
                result.total[label] = total
            }
        }
        return result
    }

    calcFinalStatus() {
        const result = {}
    }

    outputData() {
        const result = []
        const start = this.driver
    }
}