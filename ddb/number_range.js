// const { debug: log, time, timeEnd } = console

function numberRange(...n) {
	n = Array.from(new Set(n))// 既然是范围，那就只要唯一值
	n.sort((a, b) => a - b)// 按升序排序一下

	let { length: len } = n  // 参数个数
	let end = len - 1,       // 最后一个索引
		rs = [],             // 最终结果返回数组
		isStart = false,     // 范围是否已开始
		isContinue = false,  // 范围是否继续中
		isEnd = false,       // 范围是否已结束
		start,               // 范围开始数值
		prev,                // 上一次数值
		e,                   // 当前数值
		collect,             // 收集函数
		f = n[end]           // 读取最后一个项

	// 最后一个项是否为函数
	if (typeof f === 'function') {
		// 适应长度变化
		n.length = end
		len = end
		--end
		// 定义收集函数
		collect = function () {
			rs.push(f(start, prev))
		}
	} else {
		collect = function () {
			if (start === prev) {
				rs.push(start)
			} else {
				rs.push([start, prev])
			}
		}
	}

	// 遍历数值组，进行收集
	for (let i = 0; i < len; i++) {
		e = n[i]// 当前数值
		isStart = typeof start === 'number'// 是否开始
		isEnd = i === end// 是否结束
		if (isStart) {
			isContinue = prev + 1 === e// 是否持续中
			if (isContinue) {
				prev = e
			} else {
				collect()
				start = e
				prev = e
			}
		} else {
			start = e
			prev = e
		}
		if (isEnd) {
			collect()
		}
		// log({ e, isStart, isContinue, isEnd, start, prev, rs })
	}
	return rs
}

function numberRangeToRegExpSource(...n) {
	n.push(function (start, end) {
		if (start === end) {
			// 数值转为\u0000形式
			return `\\u${start.toString(16).padStart(4, 0)}`
		} else {
			return `\\u${start.toString(16).padStart(4, 0)}-\\u${end.toString(16).padStart(4, 0)}`
		}
	})
	return `[${numberRange(...n).join('')}]`
}

function stringToRegExpSource(s) {
	let n = []
	if('string' !== typeof s) return n;
	let len = s.length
	for(let i=0; i<len; i++) {
		n.push(s.charCodeAt(i))
	}
	return numberRangeToRegExpSource(...n)
}


function stringToRegExp(source, flags) {
	return new RegExp(stringToRegExpSource(source), flags)
}



// 废弃，因不方便传递gimsuy等正则表达式参数
// function numberRangeToRegExp(...n) {
// 	return new RegExp(numberRangeToRegExpSource(...n))
// }


// 测试
// log(numberRange())// 空参数
// log(numberRange(1))// 1个参数
// log(numberRange(1, 3))// 2个参数
// log(numberRange(1, 3, 9, 10, 4, 5, 8, 12, 1, 3, 4, (a, b) => {
// 	if (a === b) {
// 		return String(a)
// 	} else {
// 		return `${a}~${b}`
// 	}
// }))// 多个参数和收集函数


// let numbers = [1, 3, 4, 5, 6, 9, 11]
// let str = '\u0001'
// let regExpSource = numberRangeToRegExpSource(...numbers)
// let regExp = new RegExp(regExpSource, 'gu')
// regExp.global = true
// regExp.unicode = true
// let test = regExp.test(str)

// log(regExp)
// log(test)


// 功能测试
// let textSource = '^\\/[-](|)*+?!{}.$';// 
// let textRegExpSource = stringToRegExpSource(textSource)
// let textRegExp = new RegExp(textRegExpSource, 'g')
// let text = '^nihao-wohao[dajia\\hao|好$'

// let replace = textSource.replace(textRegExp, '*')
// log(replace, replace.length, textSource.length)
// log(text.replace(textRegExp, '*'))


// 实现替换原文中所有“ni|hao”，则需要特殊处理“|”符号。该函数可解决这个问题。
function formatRegExpSource(str) {
	let { sourceRegExp, targetString } = formatRegExpSource
	return str.replace(sourceRegExp, targetString)
}
formatRegExpSource.sourceRegExp = stringToRegExp('^\\/[-](|)*+?!{}.$', 'g')
formatRegExpSource.targetString = '\\$&'



// 实现替换原文中所有“ni$1hao”，则需要特殊处理“$”符号。该函数可解决这个问题。
function formatRegExpTarget(str) {
	let { sourceRegExp, targetString } = formatRegExpSource
	return str.replace(sourceRegExp, targetString)
}
formatRegExpTarget.sourceRegExp = /\$/g
formatRegExpTarget.targetString = '$$$$'



function replaceStringAll(str, source, target) {
	let regExp = new RegExp(formatRegExpSource(source),'g')
	target = formatRegExpTarget(target)
	return str.replace(regExp, target)
}


// log(replaceStringAll('XX^haoXXX^haoXXXX', '^hao','*'))

