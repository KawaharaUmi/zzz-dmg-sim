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

    _correctionModel = {
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
        return this.pattern.push({
            wengine: new Wengine(this.wengine.id),
            driver: {
                combo: [...this.driver.combination],
                main: [...this.driver.mainStatus],
                sub: {
                    hpV: 0, hpR: 0,
                    atkV: 0, atkR: 0,
                    defV: 0, defR: 0,
                    cHit: 0, cDmg: 0,
                    aPrf: 0, aBld: 0,
                    penV: 0,
                }
            }
        })
    }

    calcStartingStatus(round = false) {
        const result = {}
        const baseStatus = this.agent.getAllStatus()
        const driverEffects = this.driver.getAllEffects()
        console.log('driverEffect:', driverEffects)
        for(const label in baseStatus) {
            let base = baseStatus[label]
            let mp = 100
            let add = 0
            // Apply W-Engine effects
            if(label === 'atk') base += this.wengine.atk
            if(this.wengine.adv.type === label) base += this.wengine.adv.value
            if(this.wengine.adv.type === label+'R') mp += this.wengine.adv.value
            if(this.wengine.adv.type === label+'V') add += this.wengine.adv.value
            // Apply Driver effects
            if(this.driver[label] >= 0) base += this.driver[label]
            if(this.driver[label+'R'] >= 0) mp += this.driver[label+'R']
            if(this.driver[label+'V'] >= 0) add += this.driver[label+'V']
            let total = (base * (mp * 100)) / 10000 + add
            if((label === 'cHit' || label === 'pen') && total > 100) total = 100
            if(round) {
                const unit = Base.getUnit(label)
                if(unit === '%') total = Math.floor(total * 100) / 100
                if(unit === 'pt') total = Math.floor(total)
            }
            result[label] = total
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