{
	let { log } = console
	let version = '1.11'
	// 缓存读取记录
	// MemoQ.rows
	// MemoQ.nonLockedRows


	/* 
		代码
		[WebTrans.Doc.docInstanceId, WebTrans.Core.numberOfRows, WebTrans.Core.docJobGuid, MQ.getQueryString('prj'), MQ.getQueryString('doc'), MQ.getAppRootUrl()]
		
		三次刷新页面的各运行结果
		["c2326a14-9be8-477a-8588-02a6ff884849", 17, "9e2b9722-ecd4-4a74-bb5b-5212263a63b7", "2106244a-ef8a-e811-a958-000d3a50af3d", "5e75af3c-1c2f-4238-ba99-344fde0482d1", "/gamedex-l10n/"]
		["8a353a6b-cc83-4b6e-a141-7b1bf39640a6", 17, "26ea1ecb-d16f-44e2-9802-46fca46585d5", "2106244a-ef8a-e811-a958-000d3a50af3d", "5e75af3c-1c2f-4238-ba99-344fde0482d1", "/gamedex-l10n/"]
		["0a8d25df-4a8d-4eb2-acfc-9fc4668abbcf", 17, "6ae26705-0289-4c12-ae71-0fb4d3227ed2", "2106244a-ef8a-e811-a958-000d3a50af3d", "5e75af3c-1c2f-4238-ba99-344fde0482d1", "/gamedex-l10n/"]

		结论
		[变动,固定,变动,固定,固定,固定]
	*/

	const INFO = {
		get docInstanceId() { return WebTrans.Doc.docInstanceId; },//文档实例ID(当页面刷新时,重新授予新ID)
		get docJobGuid() { return WebTrans.Core.docJobGuid; },//文档工作ID(当页面刷新时,重新授予新ID)
		get numberOfRows() { return WebTrans.Core.numberOfRows; },//文档行数(固定)
		get prjId() { return MQ.getQueryString('prj'); },//项目ID(固定)
		get docId() { return MQ.getQueryString('doc'); },//文档ID(固定)
		get rootUrl() { return MQ.getAppRootUrl(); },//地址(固定)
		get xXsrfToken() { return MQ.getCookieValue('X-XSRF-TOKEN'); },//地址(固定)
	}

	function createPromise() {
		let s = new Map();
		let p = new Promise(function (a, b) { s.set('a', a); s.set('b', b); });
		p.resolve = s.get('a');
		p.reject = s.get('b');
		return p;
	}

	function post(url, data, callback) {
		let p = createPromise();

		url = INFO.rootUrl + url;
		let req = new XMLHttpRequest();
		req.open('POST', url, true);//异步
		req.setRequestHeader('accept', '*/*');
		req.setRequestHeader('content-type', 'application/json; charset=UTF-8');
		req.setRequestHeader('x-xsrf-token', INFO.xXsrfToken);
		//req.setRequestHeader('x-xsrf-token', document.cookie.match(/X-XSRF-TOKEN=(.+);?/)[1]);
		req.responseType = 'json';
		req.send(JSON.stringify(data));
		req.onloadend = function (ev) {
			let { target } = ev;
			let data = target.response;
			console.log(data);
			p.resolve(data);
		};

		req.onabort = req.onerror = p.reject;

		return p;
	}

	function createArrayRange(start = 0, end) {
		if (arguments.length < 1) {
			end = start;
		}
		let res = [];
		while (start <= end) {
			res.push(start++);
		}
		return res;
	};



	function getRows(start, end, callback) {// 获取记录 [ {id,source,target,locked} ,...]
		start = start || 0;
		end = end || INFO.numberOfRows;

		let url = 'api/TranslationService/GetWebContent';
		let data = {
			DocInstanceId: WebTrans.Doc.docInstanceId,
			RowIndicies: createArrayRange(start, end)
		};

		let readError = false
		let p = post(url, data);

		//p.then((data)=>{})
		//data的主要内容为{ Success:true,    Value:{ Rows:[] }, }
		//Rows的主要内容为{ Row:{ Guid, Id, Info:{Locked}, OriginalSourceSegment, SourceSegment, TargetSegment }, Index:0 }
		//SourceSegment的主要内容为{ EditorString, ITaglist:[ {NumID, Type, Name, AttrInfo } ] }



		return p.then(function (data) {
			if (data.Success && data.Value && data.Value.Rows) {
				let readError = false;
				let result = [];

				let { Rows } = data.Value;
				let rows = Rows.map(e => e.Row);
				//let nonLockedRows = Rows.filter(e => !e.Info.Locked);

				for (let row of rows) {
					let rowId = row.Id;
					let locked = row.Info.Locked;
					let taglist = row.SourceSegment.ITaglist.filter(e => {
						if (e.Name === 'rpr' && (e.Type === 0 || e.Type === 1)) return false;// 不要rpr
						return true;
					}).map(e => {
						//e: { NumID:1, Type:2, Name:'mq:ch', AttrInfo: 'val="", TextPosition:9 }
						//e: { NumID:1, Type:2, Name:'mq:rxt', AttrInfo: 'displaytext="<color=#2ccb9b>" val="<color=#2ccb9b>", TextPosition:15 }
						let {
							NumID,
							Type,
							Name,
							AttrInfo,
							TextPosition
						} = e;

						if (Type === 2) {
							let k = '<' + NumID + '>';
							let v = AttrInfo;

							if (/^val="/i.test(v)) {
								v = v.slice(5, -1);
							} else if (/^displaytext="[\s\S]+" val="/i.test(v)) {
								if (v.match(/" val="/g).length === 1) {
									v = v.slice(v.lastIndexOf('" val="') + 7, -1);
								} else {
									v = '\\*\\*\\*\\*\\*ReadError1\\*\\*\\*\\*\\*'
									console.error('ReadError1')
									readError = true
								}
							} else {
								v = '\\*\\*\\*\\*\\*ReadError2\\*\\*\\*\\*\\*'
								console.error('ReadError2')
								readError = true
							}

							// v === '\r\n'
							let b = /(\r?)\n/g.test(v);// 1.8
							//console.warn('发现换行符', e);

							v = v.replace(/(\r?)\n/g, '\\n').replace(/\t/g, '\\t');

							return { NumID, Type, Name, AttrInfo, TextPosition, k, v, b };
						}
						return e;//[{NumID,Type,TextPosition,Name,AttrInfo}]
					});


					// 保留原文对策
					let {
						OriginalSourceSegment,
						SourceSegment,
						TargetSegment,
					} = row;

					let sourceOriginal = SourceSegment.EditorString;
					let targetOriginal = TargetSegment.EditorString;

					let source = sourceOriginal;
					let target = targetOriginal;


					if (taglist.length) {
						taglist.forEach((e) => {
							if (e.k) {
								source = source.replace(e.k, e.v);
								target = target.replace(e.k, e.v);
							}
						});
						//console.warn('由于行内存在tag，或许会需要删除原文译文中的部分括号。', { source, target });// v7
					} else {
						source = clearAngleBrackets(source);
						target = clearAngleBrackets(target);
					}

					source = clearBracketLeft(clearRPR2(source));
					target = clearBracketLeft(clearRPR2(target));

					console.group(rowId);
					{
						//console.log(taglist);
						console.log(`source:${source === sourceOriginal}, target:${target === targetOriginal}`);
						console.log('[原生]', sourceOriginal);
						console.log('[处理]', source);
						console.log('[原生]', targetOriginal);
						console.log('[处理]', target);
					}
					console.groupEnd(rowId);

					if (!row.Info.Locked) {
						let row = {
							locked,
							id: rowId,
							OriginalSourceSegment,
							SourceSegment,
							TargetSegment,
							taglist,
							source,
							sourceOriginal,
							target,
							targetOriginal,
						};

						result.push(row);
					}
				}
				if (readError) alert('Have ReadError!');
			}
			else {
				alert('통신 장애로 데이터에 실패하였습니다. 로그인 상태를 체크해 주십시오.');
			}
		});
	}

	function setRows(rows, translationState=2) {// 设置记录
		let alertArray = new Set();
		let DocInstanceId = INFO.docInstanceId;
		rows = rows.map((e, i) => {
			let { taglist, target, isHasTag, id } = e;
			let data = {
				DocInstanceId,
				id,
				comments: [],
				locked: false,
				rangeForCorrectedLQA: null,
				// originSourceSegmentHtml: e.originSourceSegmentEditorString,
				// originSourceSegmentChanges: [],
				sourceSegmentHtml: e.SourceSegment.EditorString,
				sourceSegmentChanges: [],
				targetSegmentHtml: target,
				targetSegmentChanges: [],
				translationState,// 2编辑,3提交
				warnings: [],
				webLQAErrors: []
			};

			if (taglist.length) {
				// 有标签时，对括号们进行处理。多加一个。addBracketLeft
				data.targetSegmentHtml = data.targetSegmentHtml.replace(/[\<\{]/g, '$&$&');
				taglist.forEach(row => {
					let [k, v, b] = row;
					if (b) {
						data.targetSegmentHtml = data.targetSegmentHtml.replace(v, k);
						alertArray.add(Number(data.id) + 1);
					}
				});
			}
			return data;
		});
		let url = 'api/TranslationService/SaveWebRows';
		let data = { DocInstanceId, WebRows: rows };

		console.error(alertArray);

		return post(url, data);
	};



	function stringifyTips(tips) {
		tips = tips || MemoQ.tips;
		return MemoQ.tips.filter(e => e.type < 2).map(e => `${e.source}\t${e.target}`).join('\n')
	}

	function clearAngleBrackets(t) {
		return t.replace(/<</gimu, '<');
	}

	function addAngleBrackets(t) {
		return t.replace(/</gimu, '<<');
	}

	function clearBracketLeft(t) {
		return t.replace(/\[\[([^\]]*?)\](?!\])/gimu, '[$1]');
	}
	function addBracketLeft(t) {
		// return t.replace(/\[(?!(\/?)(b|i|u|-|[0-9A-Za-z]{4}|[0-9A-Za-z]{6})\])/gimu, '[[');
		// [b]..[/b]
		// [u]..[/u]
		// [i]..[/i]
		return t.replace(/\[(?!(\/?)(b|i|u)\])/gimu, '[[');
	}
	function clearRPR(t) {
		return t.replace(/\{(\d+)>([^<]+?)<\1\}/gimu, '$2');
	}
	// 读取target时，删除{{abc}中的{{
	function clearRPR2(t) {
		let nt = t.replace(/\{\{(?!\d+>)/gimu, '{')
		//if(t!==nt) console.warn(t, nt)
		return nt;
	}
	function addRPR(t) {
		return t.replace(/\{\{(?!\d+>)/gimu, '{{')
	}
	// let s = '[b]Bold[/b] [ff00ff]color[-] [你好]  {1>rpr1<1} {haha}'
	// s = addRPR(s)
	// console.log(s)


	//--------------------------------------------------------------------------------------------------------

	{
		let text = `<a>
		
		<div class="row">
			<div class="checkbox"></div>
			<div class="no"></div>
			<div class="source"></div>
			<div class="target"></div>
			<div class="taglist"></div>
			<div class="locked"></div>
		</div>

		<div id="cihot-panel"></div>
		
		</a>`.trim().replace(/t+/,'\t');
		let xml = new DOMParser().parseFromString(text, 'application/xml');
		console.log(xml.documentElement);

		const Template = {
			_row: xml.documentElement.querySelector('.row'),
			_panel: xml.documentElement.querySelector('#cihot-panel'),
			_css: xml.documentElement.querySelector('#cihot-css'),
			get row(){ return this._row.cloneNode(true); },
			get panel() { return this._panel.cloneNode(true); },
			get css() { return this._css.cloneNode(true); },
		};


		//console.clear();
		console.log('q.io')

		//#cihot-style tag
		let cihotStyleTag = document.querySelector('#cihot-style');
		if(cihotStyleTag) cihotStyleTag.remove();
		cihotStyleTag = document.createElement('style');
		cihotStyleTag.id='cihot-style';
		cihotStyleTag.textContent = `#cihot-panel {
			white-space: break-spaces!important;
			word-break: break-all!important;
			text-align: left!important;
			line-height: 1.5!important;
			position: fixed!important;
			width: 100vw!important;
			height: 100vh!important;
			overflow: overlay!important;
			background:#fffe!important;
			display:grid!important;
			z-index:99999!important;
			left:0;
			top:0;
			display: grid;
			grid-template-rows: 3em 1fr;
			grid-template-columns: 1fr;
		}
		#cihot-controls {
			background-color: #fff;
		}
		#cihot-rows {
		}
		#cihot-rows .row {
			display: grid!important;
			grid-template-columns: 3em 1fr 1fr 1fr 3em!important;
		}`.trim().replace(/\t+/g,'');


		//#cihot-panel
		let cihotPanelTag = document.querySelector('#cihot-panel');
		if(cihotPanelTag) cihotPanelTag.remove();
		cihotPanelTag = document.createElement('div');
		cihotPanelTag.id = 'cihot-panel';
		//#controls
		let controlsTag = document.createElement('div');
		controlsTag.id = 'cihot-controls'
		let rowsTag = document.createElement('div');
		rowsTag.id = 'cihot-rows';
		cihotPanelTag.append(controlsTag, rowsTag);


		//#row
		function createRowTag(){
			let checkboxTag = document.createElement('input');
			checkboxTag.type='checkbox';
			checkboxTag.checked = true;
			checkboxTag.className = 'checkbox';
			let noTag = document.createElement('div');
			noTag.className = 'no';
			let sourceTag = document.createElement('div');
			sourceTag.className = 'source';
			let targetTag = document.createElement('div');
			targetTag.className = 'target';
			let taglistTag = document.createElement('div');
			taglistTag.className = 'taglist';
			return [checkboxTag, noTag, sourceTag, targetTag, taglistTag ];
		}


		
		document.body.append(cihotStyleTag, cihotPanelTag);

		//getRows()
	}

}

javascript:void function(src){let el=document.createElement("script");el.src=src;document.body.appendChild(el);el.remove();}('https://cihot.com/tm4/q.io.11.js')