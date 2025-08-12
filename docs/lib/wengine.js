export { Wengine }

import { Base } from './base.js'

class Wengine extends Base {

    static _advStatusList = ['hpR', 'atkR', 'defR', 'cHit', 'cDmg', 'pen', 'aPrf', 'aBldR', 'impR', 'eRegR']
    static getAdvStatusList() {
        return this._advStatusList.filter(e => !this.checkExclude(e))
    }

    id
    atk
    adv = {type: 'atkR', value: 30}
    buffs = []

    constructor(wEngineId) {
        super()
        this.id = wEngineId
        this.atk = 684
        //this.setAdvSt('atkR', 30)
    }

    setAdvSt(label, val) {
        this.adv = { type: label, value: val}
    }
}