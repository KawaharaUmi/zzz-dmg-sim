export { Driver }

import { Base } from './base.js'

class Driver extends Base {

    static _mainStatusValue = {
        hpV: 550, hpR: 7.5,
        atkV: 79, atkR: 7.5,
        defV: 46, defR: 12,
        cHit: 6, cDmg: 12,
        bDmg: 7.5,
        aPrf: 23, aBldR: 7.5,
        pen: 6, penV: null,
        impV: null, impR: 4.5,
        eRegV: null, eRegR: 15,
    }

    static getMainAll(lvl) {
        const result = {}
        for(const key of Object.keys(this._mainStatusValue)) {
            if(this._mainStatusValue[key] && !this.checkExclude(key)) result[key] = this.calcMain(key, lvl)
        }
        return result
    }

    static calcMain(type, lvl) {
        const growthValue = (this._mainStatusValue[type] * 100) * 0.2
        return this._mainStatusValue[type] + (growthValue * lvl) / 100
    }

    static getMainStatusList() {
        const commons = ['hpR', 'atkR', 'defR',].filter(e => !this.checkExclude(e))
        return [
            ['hpV'].filter(e => !this.checkExclude(e)),
            ['atkV'].filter(e => !this.checkExclude(e)),
            ['defV'].filter(e => !this.checkExclude(e)),
            [...commons, 'cHit', 'cDmg', 'aPrf'].filter(e => !this.checkExclude(e)),
            [...commons, 'bDmg', 'pen'].filter(e => !this.checkExclude(e)),
            [...commons, 'aBldR', 'impR', 'eRegR'].filter(e => !this.checkExclude(e))
        ]
    }

    static _subStatusValue = {
        hpV: 112, hpR: 3,
        atkV: 19, atkR: 3,
        defV: 15, defR: 4.8,
        cHit: 2.4, cDmg: 4.8,
        bDmg: null,
        aPrf: 9, aBldR: null,
        penV: 9, pen: null,
        impV: null, impR: null,
        eRegV: null, eRegR: null,
    }

    static getSubAll() {
        const result = {}
        for(const key of Object.keys(this._subStatusValue)) {
            if(this._subStatusValue[key] && !this.checkExclude(key)) result[key] = this._subStatusValue[key]
        }
        return result
    }

    static calcSub(type, amount) {
        const result = (this._subStatusValue[type] * 100) * amount / 100
        return result
    }

    static getStatusList() {
        const main = []
        for(const [key,val] of Object.entries(this._mainStatusValue)) {
            if(val && !this.checkExclude(key)) main.push(key)
        }
        const sub = []
        for(const [key,val] of Object.entries(this._subStatusValue)) {
            if(val && !this.checkExclude(key)) sub.push(key)
        }
        return new Set([...main, ...sub])
    }

    static _discDataList = {
        0: { name: 'スイング・ジャズ', p: { type: 'eRegR', value: 20 }, s: {} },
        1: { name: 'ウッドペッカー・エレクトロ', p: { type: 'cHit', value: 8 }, s: {} },
        2: { name: 'パファー・エレクトロ', p: { type: 'pen', value: 8 }, s: {} },
        3: { name: 'ショックスター・ディスコ', p: { type: 'impR', value: 6 }, s: {} },
        4: { name: 'フリーダム・ブルース', p: { type: 'aPrf', value: 30 }, s: {} },
        5: { name: 'ホルモン・パンク', p: { type: 'atkR', value: 10 }, s: {} },
        6: { name: 'ソウル・ロック', p: { type: 'defR', value: 16 }, s: {} },
        7: { name: '炎獄のヘヴィメタル', p: { type: 'bDmg', value: 10 }, s: {} },
        8: { name: '混沌のヘヴィメタル', p: { type: 'bDmg', value: 10 }, s: {} },
        9: { name: '霹靂のヘヴィメタル', p: { type: 'bDmg', value: 10 }, s: {} },
        10: { name: '極地のヘヴィメタル', p: { type: 'bDmg', value: 10 }, s: {} },
        11: { name: '獣牙のヘヴィメタル', p: { type: 'bDmg', value: 10 }, s: {} },
        12: { name: 'プロト・パンク', p: { type: 'sldR', value: 15 }, s: {} },
        13: { name: 'ケイオス・ジャズ', p: { type: 'aPrf', value: 30 }, s: {} },
        14: { name: '静寂のアストラ', p: { type: 'atkR', value: 10 }, s: {} },
        15: { name: '折枝の刀歌', p: { type: 'cDmg', value: 16 }, s: {} },
        16: { name: '「パエトーン」の歌', p: { type: 'aBldR', value: 8 }, s: {} },
        17: { name: 'シャドウハーモニー', p: { type: 'bDmg', value: 15 }, s: {} },
        18: { name: '雲嶽は我に似たり', p: { type: 'hpR', value: 10 }, s: {} },
        19: { name: '大山を統べる者', p: { type: 'brkR', value: 6 }, s: {} },
    }

    static getDiscList(exeption = []) {
        const result = []
        for(const key in this._discDataList) {
            if(!exeption.includes(key)) result.push(this._discDataList[key].name)
        }
        return result
    }

    static getDriverData(id) {
        return this._discDataList[id]
    }

    static _maxCountPerDisc = 9
    static _maxCountPerSubStatus = 6 * 6
    static _subTotalLimit = this._maxCountPerDisc * 6

    static getStackLimit() {
        return this._subTotalLimit
    }

    static {
        for(const key of Object.keys(this)) {
            if(key.slice(0,1) == '_') Object.freeze(this[key])
        }
    }


    combination = []
    mainStatus = ["hpV", "atkV", "defV", "cHit", "bDmg", "atkR"]
    subStacks = {}
    stackTotal
    buffs = []

    constructor(ids = [1, 15, 15]) {
        super()
        this.resetFactors()
        for(const [key,val] of Object.entries(Driver._subStatusValue)) {
            if(val) {
                this.subStacks[key] = { max: Driver._maxCountPerSubStatus, current: 0 }
            }
        }
        this.combination = ids.slice(0, 3)
        for(const id of this.combination) {
            if(typeof id !== 'number') throw new Error('Inviled arguments: number型を列挙したArray型が必要です。')
            const data = Driver.getDriverData(id)
            
        }
        this.updateData()
        console.log('Driver', this)
    }

    getEffectValue(label) {
        let total = 0
        const setEffect = this.getSetEffect(label)
        if(setEffect) total += setEffect
        const mainValue = this.getMainValue(label)
        if(mainValue) total += mainValue
        if(this.subStacks[label]) total += Driver.calcSub(label, this.subStacks[label].current)
        return total
    }

    getAllEffects() {
        const result = { setEffect: {}, mainEffect: {}, subEffect: this.getSubEffectAll() }
        for(const label of Driver.getStatusList()) {
            const setEffect = this.getSetEffect(label)
            if(setEffect) result.setEffect[label] = setEffect
            const mainValue = this.getMainValue(label)
            if(mainValue) result.mainEffect[label] = mainValue
        }
        return result
    }

    getSubEffectStack(label) {
        return { current: this.subStacks[label].current, max: this.subStacks[label].max }
    }

    getSubEffectAll() {
        const result = {}
        for(const label in this.subStacks) {
            const subStack = this.getSubEffectStack(label)
            result[label] = {
                value: Driver.calcSub(label, subStack.current),
                stack: subStack,
            }
        }
        return result
    }

    getStackTotal() {
        let count = 0
        for(const key in this.subStacks) {
            count += Number(this.subStacks[key].current)
        }
        return count
    }

    subLimitCheck(label) {
        const total = this.getStackTotal()
        if(total > Driver._subTotalLimit) this.subStacks[label].current -= (total - Driver._subTotalLimit)
    }
    
    updateData() {
        for(const key in this.subStacks) {
            const count = this.mainStatus.reduce((a,c) => (c === key) ? a + 1 : a , 0)
            const target = this.subStacks[key]
            target.max = 36 - 6 * count
            if(target.current > target.max) target.current = target.max
        }
        this.resetFactors()
        for(const key of Driver.getStatusList()) {
            this[key] += this.getSetEffect(key)
        }
        for(const key of this.mainStatus) {
            this[key] += Driver.calcMain(key, 15)
        }
        for(const key in this.subStacks) {
            this[key] += Driver.calcSub(key, this.subStacks[key].current)
        }
    }

    resetFactors() {
        for(const key of new Set([...Object.keys(Driver._mainStatusValue), ...Object.keys(Driver._subStatusValue)])) {
            this[key] = 0
        }
    }

    getSetEffect(type) {
        const idSet = new Set(this.combination)
        let result = 0
        for(const id of idSet) {
            if(Driver._discDataList[id].p.type == type) result += Driver._discDataList[id].p.value
        }
        return result
    }

    getMainValue(label) {
        return Driver.calcMain(label, 15) * this.mainStatus.reduce((a,c) => c === label ? a + 1: a, 0)
    }
}