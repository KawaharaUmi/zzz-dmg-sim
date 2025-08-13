export {Agent}

import { Base } from './base.js'

class Agent extends Base {
    static url = './data/agent.csv'
    static ready
    static data = []

    static coreEffectList = {
        hp: 140, atk: 25, def: null,
        cHit: 4.8, cDmg: 9.6,
        aPrf: null, aBld: 12,
        pen: 4.8,
        imp: 6,
        eReg: 0.12,
    }

    static getCoreEffectList() {
        const result = []
        for(const key in this.coreEffectList) {
            if(this.coreEffectList[key] && !this.checkExclude(key)) result.push(key)
        }
        return result
    }

    static getAgentList(type, lang, filter = {role: Infinity, rarity: Infinity, element: Infinity, faction: Infinity}) {
        const dataList = this.data.filter(e => 
                (filter.role === Infinity || e.role === filter.role) &&
                (filter.rarity === Infinity || e.rarity === filter.rarity) &&
                (filter.element === Infinity || e.element === filter.element) &&
                (filter.faction === Infinity || e.faction === filter.faction)
            )
        return dataList.map(l => {
            return {id: l.id, name: l.name[type][lang]}
        })
    }

    static {
        this.loadData(this.url).then(val => {
            val.forEach(l => {
                this.data.push({
                    id: l[0],
                    role: l[1], rarity: l[2], element: l[3], faction: l[4],
                    name: { full: { en: l[5], jp: l[6] }, short: { en: l[7], jp: l[8] }},
                    status: {
                        hp: l[9], atk: l[10], def: l[11], imp: l[12],
                        cHit: l[13], cDmg: l[14], aBld: l[15], aPrf: l[16],
                        pen: l[17], eReg: l[18],
                    },
                    core: {
                        odd: { type: l[19], val: l[20] },
                        even: { type: l[21], val: l[22] },
                    },
                    wEngine: l[23]
                })
            })
        })
    }

    _id
    get id() {
        return this._id
    }
    set id(val) {
        this._id = val
        this.initAgent()
    }
    role = 0
    rarity = 0
    element = 0
    faction = 0
    name = {}
    agentLvl = 60
    _coreLvl = 6
    get coreLvl() { return this._coreLvl }
    set coreLvl(val) {
        this._coreLvl = val
        this.coreEffect = this.calcCoreEffect()
    }
    coreSkill = { odd:{type: 'cHit', val: 0}, even: {type: 'atk', val: 0}}

    get hp() { return this.calcStat('hp') }
    get atk() { return this.calcStat('atk') }
    get def() { return this.calcStat('def') }
    get cHit() { return this.calcStat('cHit') }
    get cDmg() { return this.calcStat('cDmg') }
    get aPrf() { return this.calcStat('aPrf') }
    get aBld() { return this.calcStat('aBld') }
    get imp() { return this.calcStat('imp') }
    get pen() { return this.calcStat('pen') }
    get penV() { return this.calcStat('penV') }
    get bDmg() { return this.calcStat('bDmg') }
    get eReg() { return this.calcStat('eReg') }

    baseStatus = {
        hp: 7673,
        atk: 813,
        def: 612,
        cHit: 5,
        cDmg: 50,
        aPrf: 94,
        aBld: 93,
        imp: 93,
        pen: 0,
        penV: 0,
        bDmg: 0,
        eReg: 1.2,
    }
    coreEffect = {}
    buffs = []
    finalStatus = {}

    constructor(charId) {
        super()
        this.id = charId
    }

    initAgent() {
        const data = Agent.data[this.id]
        this.name = data.name
        this.role = data.role
        this.rarity = data.rarity
        this.element = data.element
        this.faction = data.faction
        Object.assign(this.baseStatus, data.status)
        this.coreSkill = data.core
        this.coreLvl = this.coreLvl
    }

    calcStat(label) {
        let result = this.baseStatus[label]
        if(this.coreEffect[label]) result += this.coreEffect[label]
        return result
    }

    getAllStatus() {
        const result = {}
        for(const label of this.getStatusList()) {
            result[label] = this[label]
        }
        return result
    }

    getStatusList() {
        const result = []
        for(const label of Object.keys(this.baseStatus)) {
            if(!Agent.checkExclude(label)) result.push(label)
        }
        return result
    }

    calcCoreEffect() {
        const result = {}
        const lvl = this.coreLvl
        const odd = this.coreSkill.odd.type
        const even = this.coreSkill.even.type
        result[odd] = Agent.coreEffectList[odd] * 100 * Math.ceil(lvl / 2) / 100
        result[even] = Agent.coreEffectList[even] * Math.floor(lvl / 2)
        return result
    }
}