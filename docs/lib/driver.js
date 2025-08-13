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

    static getSubLabels() {
        const result = []
        for(const label of Object.keys(this._subStatusValue)) {
            if(this._subStatusValue[label] && !this.checkExclude(label)) result.push(label)
        }
        return result
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

    static discNum = 6
    static maxSubStackPerDisc = 6
    static _maxCountPerSubStatus = this.maxSubStackPerDisc * this.discNum
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
    subEffect = {}
    stackTotal
    buffs = []

    constructor(ids = [1, 15, 15]) {
        super()
        for(const label of Driver.getSubLabels()) {
            const target = this.subEffect[label] = {
                _stack: 0,
            }
            Object.defineProperty(target, 'stack', {
                get: () => target._stack,
                set: (val) => {
                    if(val < target.min) {
                        target._stack = target.min
                    } else if(val > target.max) {
                        target._stack = target.max
                    } else {
                        target._stack = val
                    }
                    if(this.getStackTotal() > Driver.getStackLimit()) target._stack = val - (this.getStackTotal() - Driver.getStackLimit())
                }
            })
            Object.defineProperty(target, 'min', {
                get: () => {
                    if(target.stack < 0) target.stack = 0
                    return 0
                }
            })
            Object.defineProperty(target, 'max', {
                get: () => {
                    const result = 6 * (6 - this.mainStatus.reduce((a,c) => (c === label) ? a + 1 : a, 0))
                    if(target.stack > result) target.stack = result
                    return result
                },
            })
            Object.defineProperty(target, 'value', {
                get: () => Driver.calcSub(label, target.stack),
            })
        }
        this.combination = ids.slice(0, 3)
        for(const id of this.combination) {
            if(typeof id !== 'number') throw new Error('Inviled arguments: number型を列挙したArray型が必要です。')
        }
        console.log('Driver', this)
    }

    getEffectValue(label) {
        let total = 0
        const setEffect = this.getSetEffect(label)
        if(setEffect) total += setEffect
        const mainValue = this.getMainValue(label)
        if(mainValue) total += mainValue
        if(this.subEffect[label]) total += Driver.calcSub(label, this.subEffect[label].stack)
        return total
    }

    getAllEffects() {
        const result = { setEffect: {}, mainEffect: {}, subEffect: this.subEffect }
        for(const label of Driver.getStatusList()) {
            const setEffect = this.getSetEffect(label)
            if(setEffect) result.setEffect[label] = setEffect
            const mainValue = this.getMainValue(label)
            if(mainValue) result.mainEffect[label] = mainValue
        }
        return result
    }

    getSubEffectStack(label) {
        return { stack: this.subEffect[label].stack, max: this.subEffect[label].max }
    }

    getSubEffectAll() {
        const result = {}
        for(const label in this.subEffect) {
            const subStack = this.getSubEffectStack(label)
            result[label] = {
                value: Driver.calcSub(label, subStack.stack),
                stack: subStack,
            }
        }
        return result
    }

    getStackTotal() {
        let count = 0
        for(const label in this.subEffect) {
            count += Number(this.subEffect[label].stack)
        }
        return count
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