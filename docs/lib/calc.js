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

    _dataAdjustSetModel = {
        wengine: {},
        driver: {
            combo: [1, 15, 15],
            main: ['hpV', 'atkV', 'defV', 'cHit', 'bDmg', 'atkR'],
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

    validationTarget = 'cHit'

    constructor(agentId, wengineId, driverId = [1, 15, 15]) {
        super()
        this.agent = new Agent(agentId)
        this.wengine = new Wengine(wengineId)
        this.driver = new Driver(driverId)

        this.addPattern()
        console.log(this.pattern)
    }

    addPattern() {
        const adjustData = {
            wengine: new Wengine(this.wengine.id),
            driver: {
                original: this.driver,
                combination: [...this.driver.combination],
                mainStatus: [...this.driver.mainStatus],
                adjustData: {},
                getStackTotal: () => {

                },
                resetAdjustData: () => {
                }
            }
        }
        for(const label of Driver.getSubLabels()) {
            const original = this.driver.subEffect[label]
            const target = adjustData.driver.adjustData[label] = {
                adjust: 0,
            }
            Object.defineProperty(target, 'min', {
                get: () => {
                    const value = original.stack * -1
                    if(target.adjust < value) target.adjust = value
                    return value
                }
            })
            Object.defineProperty(target, 'max', {
                get: () => {
                    const value = original.max - original.stack
                    if(target.adjust > value) target.adjust = value
                    return value
                }
            })
            Object.defineProperty(target, 'value', {
                get: () => Driver.calcSub(label,  original.stack + target.adjust)
            })
        }
        return this.pattern.push(adjustData)
    }

    calcStartingStatus(round = false) {
        const result = { starting: {}, add:{}, base: {} }
        const baseStatus = this.agent.getAllStatus()
        baseStatus.atk += this.wengine.atk
        const {setEffect, mainEffect, subEffect} = this.driver.getAllEffects()
        console.log(baseStatus)
        console.log('driverEffect:', setEffect, mainEffect, subEffect)
        for(const label in baseStatus) {
            let base = 0
            let mp = 100
            let add = 0
            // Apply W-Engine effects
            if(this.wengine.adv.type === label) base += this.wengine.adv.value
            if(this.wengine.adv.type === label+'R') mp += this.wengine.adv.value
            if(this.wengine.adv.type === label+'V') add += this.wengine.adv.value
            // Apply Driver set effect
            if(setEffect[label]) base += setEffect[label]
            if(setEffect[label+'R']) mp += setEffect[label+'R']
            if(setEffect[label+'V']) add += setEffect[label+'V']
            // Apply Driver main effect
            if(mainEffect[label]) base += mainEffect[label]
            if(mainEffect[label+'R']) mp += mainEffect[label+'R']
            if(mainEffect[label+'V']) add += mainEffect[label+'V']
            // Apply Driver sub effect
            if(subEffect[label]) base += subEffect[label].value
            if(subEffect[label+'R']) mp += subEffect[label+'R'].value
            if(subEffect[label+'V']) add += subEffect[label+'V'].value

            // Calculate result
            let total = ((baseStatus[label] + base) * (mp * 100)) / 10000 + add
            let additional = total - baseStatus[label]
            if((label === 'cHit' || label === 'pen') && total > 100) total = 100
            if(round) {
                const unit = Base.getUnit(label)
                if(unit === '%') {
                    result.base[label] = Math.floor(baseStatus[label] * 100) / 100
                    result.add[label] = Math.floor(additional * 100) / 100
                    result.starting[label] = Math.floor(total * 100) / 100
                }
                if(unit === 'pt') {
                    result.base[label] = Math.floor(baseStatus[label])
                    result.add[label] = Math.floor(additional)
                    result.starting[label] = Math.floor(total)
                }
            } else {
                result.base[label] = baseStatus[label]
                result.add[label] = addtional
                result.starting[label] = total
            }
        }
        console.log('Starting status :', result)
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