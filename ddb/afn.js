async function afn(funcs, opt) {
	// 过滤非函数项
	funcs = funcs.filter(f => typeof f === 'function')
	// 取函数
	let onfinish, onerror
	if (opt) {
		if (typeof opt.onfinish === 'function') {
			onfinish = opt.onfinish
		}
		if (typeof opt.onerror === 'function') {
			onerror = opt.onerror
		}
	}
	// 执行程序
	function exec(v) {
		let func = funcs.shift()// 头部取函数
		if (func) {
			if (typeof func === 'function') {
				let next = function next(err) {
					if (err instanceof Error) {
						if (onerror) {
							onerror(exec, v, err)
						} else {
							exec(v)
						}
					} else {
						exec(err)
					}
				}
				func(next, v)
			}
		}else{
			if(onfinish) onfinish(v)
		}
	}
	exec('start')// 开始
}


// const { log } = console

// let funcList = [

// 	(next, v) => { setTimeout(() => { log('A', v); next('a') }, 300); },

// 	(next, v) => {
// 		setTimeout(() => {
// 			log('B', v);
// 			// next('B正常')
// 			next(new Error('处理B报错前，不得进入C！'))
// 			// throw new Error('异常')
// 		}, 200)
// 	},

// 	(next, v) => {
// 		setTimeout(() => {
// 			log('C', v)
// 			next('c')
// 		}, 100)
// 	},
// ]

// let opt = {
// 	onerror(next, v, err) {
// 		// log(next, v, err)
// 		// log(err.message, v)
// 		log('[onerror]', err.message, v)
// 		next('bbbb')
// 	},
// 	onfinish(...args) {
// 		log('[finish]', ...args)
// 	}
// }

// afn(funcList, opt)
