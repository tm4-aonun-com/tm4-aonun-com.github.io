void function (undefined) {
	function utc(timestamp) {
		return {
			date: timestamp ? new Date(timestamp) : new Date(),
			get Y() { return this.date.getUTCFullYear().toString().padStart(4, '0') },
			get m() { return (this.date.getUTCMonth() + 1).toString().padStart(2, '0') },
			get d() { return this.date.getUTCDate().toString().padStart(2, '0') },
			get H() { return this.date.getUTCHours().toString().padStart(2, '0') },
			get i() { return this.date.getUTCMinutes().toString().padStart(2, '0') },
			get s() { return this.date.getUTCSeconds().toString().padStart(2, '0') },
			get ms() { return this.date.getUTCMilliseconds().toString().padStart(3, '0') },
			set Y(v) { this.date.setUTCFullYear(v) },
			set m(v) { this.date.setUTCMonth(v - 1) },
			set d(v) { this.date.setUTCDate(v) },
			set H(v) { this.date.setUTCHours(v) },
			set i(v) { this.date.setUTCMinutes(v) },
			set s(v) { this.date.setUTCSeconds(v) },
			set ms(v) { this.date.setUTCMilliseconds(v) },
			toString(a = '.', b = ':') {
				let { Y, m, d, H, i, s } = this
				return `${Y}${a}${m}${a}${d} ${H}${b}${i}${b}${s}`
			},
			format(s) {
				return s
					.replace(/ms/g, this.ms)
					.replace(/s/g, this.s)
					.replace(/i/g, this.i)
					.replace(/H/g, this.H)
					.replace(/d/g, this.d)
					.replace(/m/g, this.m)
					.replace(/Y/g, this.Y)
			}
		}
	}

	function now(timestamp) {
		return {
			date: timestamp ? new Date(timestamp) : new Date(),
			get Y() { return this.date.getFullYear().toString().padStart(4, '0') },
			get m() { return (this.date.getMonth() + 1).toString().padStart(2, '0') },
			get d() { return this.date.getDate().toString().padStart(2, '0') },
			get H() { return this.date.getHours().toString().padStart(2, '0') },
			get i() { return this.date.getMinutes().toString().padStart(2, '0') },
			get s() { return this.date.getSeconds().toString().padStart(2, '0') },
			get ms() { return this.date.getMilliseconds().toString().padStart(3, '0') },
			set Y(v) { this.date.setFullYear(v) },
			set m(v) { this.date.setMonth(v - 1) },
			set d(v) { this.date.setDate(v) },
			set H(v) { this.date.setHours(v) },
			set i(v) { this.date.setMinutes(v) },
			set s(v) { this.date.setSeconds(v) },
			set ms(v) { this.date.setMilliseconds(v) },
			toString(a = '.', b = ':') {
				let { Y, m, d, H, i, s } = this
				return `${Y}${a}${m}${a}${d} ${H}${b}${i}${b}${s}`
			},
			format(s) {
				return s
					.replace(/ms/g, this.ms)
					.replace(/s/g, this.s)
					.replace(/i/g, this.i)
					.replace(/H/g, this.H)
					.replace(/d/g, this.d)
					.replace(/m/g, this.m)
					.replace(/Y/g, this.Y)
			}
		}
	}


	// exports
	let dateUtil = Object.freeze({ utc, now })
	if (typeof module === 'object') {
		module.exports = dateUtil
	} else {
		this.dateUtil = dateUtil
	}


}()


// const { log, time, timeEnd } = console
// let u = now()
// // u.H = 1
// // u.i = 1
// // u.s = 1

// time('toString')
// log(u.toString('.', ':'))
// timeEnd('toString')

// time('format')
// log(u.format('Y_m_d|H_i_s '))
// timeEnd('format')

