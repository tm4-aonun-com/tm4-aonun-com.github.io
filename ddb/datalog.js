function DataLog(filename) {
	this.filename = filename
	this.init()
}
DataLog.prototype.init = function () {
	if (Array.isArray(this.datas)) {
		this.datas = datas
		this.id = 0
		this.datas.forEach((e)=>{
			this.id = e.id = i+1
		})
	} else{
		this.datas = []
		this.id = 0
	}
	return this
}
DataLog.prototype.filter = function (time, equal = true) {
	if (!Number.isNaN(time)) {
		return new DataLog(this.datas.filter(e => equal ? (e.time >= time) : e.time > time))
	}
	return this
}
DataLog.prototype.sort = function () {
	this.datas.sort((a, b) => a.id-b.id)
	return this
}
DataLog.prototype.add = function (...o) {
	let time = Date.now()
	let data = o.reduce((r, e) => {
		let type = typeof e
		if (type === 'string') {
			delete r[e]
			return r
		}
		if (type === 'object' && e !== null) {
			return Object.assign(r, e)
		}
		return r
	}, {})
	let id = this.id = this.id + 1
	this.datas.push({ id, data, time }) 
	return this
}
DataLog.prototype.clear = function () {
	this.datas.length = 0
	return this
}
DataLog.prototype.compress = function (reset = false) {
	let time = -1
	let o = this.datas.reduce((r, e) => {
		if (e.time < time) {
			console.log(e.time, time)
			return this.sort().compress(reset)
		}
		time = e.time
		return Object.assign(r, e.data)
	}, {})
	o.nomalize_()
	if (reset) {
		this.datas = [{ data: Object.assign({}, o), time }]
	}
	return new DataLog([{ data: o, time }])
}


if(typeof 'module'!==undefined) module.exports = DataLog



// test
// const {log}=console
// let dl = new DataLog()
// dl.add({val: 1, exp:1000}, {usr:'ddb'}, 'exp')
// dl.add({val: 2, exp:100})
// log(dl.datas)
