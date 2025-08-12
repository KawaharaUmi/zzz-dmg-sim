export { Base }

class Base {
    static ready
    static data = []

    static loadData(url) {
        if(typeof url === 'string') {
            this.ready = new Promise((resolve, reject) => {
                fetch(url)
                .then(res => {
                    if(res.ok && res.status == '200') {
                        res.text()
                        .then(res => {
                            const dataList = res.trim().split('\n')
                            .map(l => l.trim().split(',').map(e => Number(e) >= 0 ? Number(e) : e))
                            resolve(dataList)
                        })
                    }
                })
            })
            return this.ready
        }
    }

    static {
    }

    static lang = 'jp'

    static role = [
        { en: 'Attack', jp: '強攻'},
        { en: 'Anomaly', jp: '異常'},
        { en: 'Stun', jp: '撃破'},
        { en: 'Defense', jp: '防護'},
        { en: 'Support', jp: '支援'},
        { en: 'Rupture', jp: '命破'},
    ]
    static getRoleName(key) { return this.role[key][this.lang]}
    static rarity = []
    static element = [
        { en: 'Electric', jp: '電気'},
        { en: 'Ether', jp: 'エーテル'},
        { en: 'Fire', jp: '炎'},
        { en: 'Ice', jp: '氷'},
        { en: 'Physical', jp: '物理'},
        { en: 'Frost', jp: '霜烈'},
        { en: 'Auric Ink', jp: '玄墨'},
    ]
    static getElementName(key) { return this.element[key][this.lang]}
    static faction = []

    static _statusSet = {
        hp: 'HP', atk: '攻撃力', def: '防御力',
        cHit: '会心率', cDmg: '会心ダメ',
        bDmg: 'ボーナス',
        aPrf: '異常マスタリー', aBld: '異常掌握',
        penV: '貫通値', pen: '貫通率',
        imp: '衝撃力',
        eReg: 'EN回復',
        other: 'その他',
    }

    static _unit = {
        V: 'pt', R:'%'
    }

    static getStatusKeys() {
        return Object.keys(this._statusSet)
    }

    static getLabel(key) {
        if(Object.keys(this._statusSet).includes(key)) {
            return this._statusSet[key]
        } else {
            return this._statusSet[key.slice(0,-1)]
        }
    }

    static getUnit(key, filter = undefined) {
        let result
        const lastChar = key.slice(-1)
        if(lastChar === 'V' || lastChar === 'R') {
            result = this._unit[lastChar]
        } else {
            switch(key) {
                case 'bDmg': case 'cHit': case 'cDmg': case 'pen':
                    result = this._unit.R
                    break
                default :
                    result = this._unit.V
                    break
            }
        }
        if(!filter) return result
        if(filter === result) return result
    }

    static _excludeStatus = []

    static setExcludeStatus(list) {
        for(const label of list) {
            const unit = label.slice(-1)
            if(unit === 'V' || unit === 'R') {
                this._excludeStatus.push(label)
            } else {
                this._excludeStatus.push(label)
                this._excludeStatus.push(label + 'V')
                this._excludeStatus.push(label + 'R')
            }
        }
        return this._excludeStatus
    }

    static checkExclude(label) {
        return this._excludeStatus.includes(label)
    }
}