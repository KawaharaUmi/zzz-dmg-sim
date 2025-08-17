Math._a = 10000

Math.add = (...v) => {
    let r = v[0] * Math._a
    for(let i = 1; i < v.length; i++) {
        r += v[i] * Math._a
    }
    return r / Math._a
}

Math.sub = (...v) => {
    let r = v[0] * Math._a
    for(let i = 1; i < v.length; i++) {
        r -= (v[i] * Math._a)
    }
    return r / Math._a
}

Math.mlp = (...v) => {
    let r = v[0] * Math._a
    for(let i = 1; i < v.length; i++) {
        r *= v[i] * Math._a
        r /= Math._a
    }
    return r / Math._a
}

Math.div = (...v) => {
    let r = v[0] * Math._a
    for(let i = 1; i < v.length; i++) {
        r /= v[i] * Math._a
    }
    return r
}