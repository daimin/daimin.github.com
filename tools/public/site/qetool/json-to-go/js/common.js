const sqlTypesChkCacheKey = "sql2go_chk_types_cache_key";

$(function()
{

	const emptyInputMsg = "JSON粘贴在这里";
	const emptyInputMsg2 = "SQL粘贴在这里";
	const jsonCacheKey = "json2go_cache_key";
	const sqlCacheKey = "sql2go_cache_key";
	const emptyOutputMsg = "";
	const formattedEmptyInputMsg = '<span style="color: #777;">'+emptyInputMsg+'</span>';
	const formattedEmptyInputMsg2 = '<span style="color: #777;">'+emptyInputMsg2+'</span>';
	const formattedEmptyOutputMsg = '<span style="color: #777;">'+emptyOutputMsg+'</span>';

	let cache_val = localStorage.getItem(jsonCacheKey)
	if(cache_val && typeof cache_val !== 'undefined'){
		$("#input").html(cache_val);
	}
	let cache_val2 = localStorage.getItem(sqlCacheKey)
	if(cache_val2 && typeof cache_val2 !== 'undefined'){
		$("#inputsql").html(cache_val2);
	}

	let cache_sql_chk_types = JSON.parse(localStorage.getItem(sqlTypesChkCacheKey))
	if(cache_sql_chk_types && typeof cache_sql_chk_types !== 'undefined'){

		let sql_go_types = $("input[name='sql_go_type']")
		$(sql_go_types).each(function(i, o){
			let is_match = false
			$(cache_sql_chk_types).each(function(ii, oo){
				if(o.value == oo){
					is_match = true
				}
			})
			if(is_match){
				$(o).attr("checked",true)
			}else{
				$(o).attr("checked",false)
			}
		})
	}

	function doConversion(inputStr)
	{
		let input = ''
		if(inputStr){
			input = inputStr
		}else{
			input = $('#input').text().trim();
		}
		if (!input || input == emptyInputMsg)
		{
			$('#output').html(formattedEmptyOutputMsg);
			return;
		}
		let output = '';
		let verType = $("input[name='data_type']:checked").val()
		if(verType == 'json'){
			let childFlattern = $("input[name='child-flatten']:checked")
			localStorage.setItem(jsonCacheKey, $('#input').html().replaceAll("<div>", "\n").replaceAll("</div>", "\n"))
			output = jsonToGo(input, "", childFlattern.val() === 'true', true);
		}else if (verType == 'sql') {
			let sqlGoType = {useGorm:false, useJson:false, useSqlx:false, useForm:false}
			let sqltypes = $("input[name='sql_go_type']:checked")
			$.each(sqltypes, function (i, v) {
				if($(v).val() === 'json'){
					sqlGoType.useJson = true
				}
				if($(v).val() === 'sqlx'){
					sqlGoType.useSqlx = true
				}
				if($(v).val() === 'gorm'){
					sqlGoType.useGorm = true
				}
				if($(v).val() === 'form'){
					sqlGoType.useForm = true
				}
			})
			localStorage.setItem(sqlCacheKey, $('#inputsql').html().replaceAll("<div>", "\n").replaceAll("</div>", "\n"))
			output = get_go_struct(input, sqlGoType);
		}

		if (output.error)
		{
			$('#output').html('<span class="clr-red">'+output.error+'</span>');
			console.log("ERROR:", output, output.error);
			var parsedError = output.error.match(/Unexpected token .+ in JSON at position (\d+)/);
			if (parsedError) {
				try {
					var faultyIndex = parsedError.length == 2 && parsedError[1] && parseInt(parsedError[1]);
					faultyIndex && $('#output').html(constructJSONErrorHTML(output.error, faultyIndex, input));
				} catch(e) {}
			}
		}
		else
		{
			var finalOutput = output.go;
			if (typeof gofmt === 'function')
				finalOutput = gofmt(output.go);
			var coloredOutput = hljs.highlight("go", finalOutput);
			$('#output').html(coloredOutput.value);
		}
	}

	// Hides placeholder text
	$('#input').on('focus', function()
	{
		var val = $(this).text();
		if (!val)
		{
			$(this).html(formattedEmptyInputMsg);
			$('#output').html(formattedEmptyOutputMsg);
		}
		else if (val == emptyInputMsg)
			$(this).html("");
	});

	// Shows placeholder text
	$('#input').on('blur', function()
	{
		var val = $(this).text();
		if (!val)
		{
			$(this).html(formattedEmptyInputMsg);
			$('#output').html(formattedEmptyOutputMsg);
		}
	}).blur();

	// Hides placeholder text
	$('#inputsql').on('focus', function()
	{
		var val = $(this).text();
		if (!val)
		{
			$(this).html(formattedEmptyInputMsg2);
			$('#output').html(formattedEmptyOutputMsg);
		}
		else if (val == emptyInputMsg2)
			$(this).html("");
	});

	// Shows placeholder text
	$('#inputsql').on('blur', function()
	{
		var val = $(this).text();
		if (!val)
		{
			$(this).html(formattedEmptyInputMsg2);
			$('#output').html(formattedEmptyOutputMsg);
		}
	}).blur();

	$('#inputsql').on('paste', function(e)
	{
		if (e.originalEvent.clipboardData) {
			// 阻止默认行为
			e.preventDefault();
			var clipboardData = e.originalEvent.clipboardData;
			// 获取剪贴板的文本
			var text = clipboardData.getData('text');
			if (window.getSelection && text !== '' && text !== null) {
				// 创建文本节点
				let format_sql = sqlFormatter.format(text);
				var textNode = document.createTextNode(format_sql);
				// 在当前的光标处插入文本节点
				var range = window.getSelection().getRangeAt(0);
				// 删除选中文本
				range.deleteContents();
				// 插入文本
				range.insertNode(textNode);
				window.getSelection().removeAllRanges();
			}
		}
	});

	function formatJson(txt, compress) {
		var indentChar = '    ';
		if (/^\s*$/.test(txt)) {
			console.log('数据为空,无法格式化! ');
			return;
		}
		try {
			var data = eval('(' + txt + ')');
		} catch (e) {
			throw e;
		}
		var draw = [],
			last = false,
			This = this,
			line = compress ? '' : '\n',
			nodeCount = 0,
			maxDepth = 0;

		var notify = function (name, value, isLast, indent, formObj) {
			nodeCount++; /*节点计数*/
			for (var i = 0, tab = ''; i < indent; i++)
				tab += indentChar; /* 缩进HTML */
			tab = compress ? '' : tab; /*压缩模式忽略缩进*/
			maxDepth = ++indent; /*缩进递增并记录*/
			if (value && value.constructor == Array) {
				/*处理数组*/
				draw.push(
					tab + (formObj ? '"' + name + '":' : '') + '[' + line
				); /*缩进'[' 然后换行*/
				for (var i = 0; i < value.length; i++)
					notify(i, value[i], i == value.length - 1, indent, false);
				draw.push(
					tab + ']' + (isLast ? line : ',' + line)
				); /*缩进']'换行,若非尾元素则添加逗号*/
			} else if (value && typeof value == 'object') {
				/*处理对象*/
				draw.push(
					tab + (formObj ? '"' + name + '":' : '') + '{' + line
				); /*缩进'{' 然后换行*/
				var len = 0,
					i = 0;
				for (var key in value)
					len++;
				for (var key in value)
					notify(key, value[key], ++i == len, indent, true);
				draw.push(
					tab + '}' + (isLast ? line : ',' + line)
				); /*缩进'}'换行,若非尾元素则添加逗号*/
			} else {
				if (typeof value == 'string'){
					if(value.indexOf("\"") === -1){
						value = '"' + value + '"';
					}else{
						value = '"' + value.replaceAll("\"", "\\\"") + '"';
					}
				}
				draw.push(
					tab +
					(formObj ? '"' + name + '":' : '') +
					value +
					(isLast ? '' : ',') +
					line
				);
			}
		};
		var isLast = true,
			indent = 0;
		notify('', data, isLast, indent, false);
		return draw.join('');
	}


	$('#input').on('paste', function(e)
	{
		if (e.originalEvent.clipboardData) {
			// 阻止默认行为
			e.preventDefault();
			var clipboardData = e.originalEvent.clipboardData;
			// 获取剪贴板的文本
			var text = clipboardData.getData('text');
			if (window.getSelection && text !== '' && text !== null) {
				// 创建文本节点
				let jtext = text
				try{
					jtext = formatJson(text);
				}catch (e) {
				}
				console.log(jtext)
				var textNode = document.createTextNode(jtext);
				// 在当前的光标处插入文本节点
				var range = window.getSelection().getRangeAt(0);
				// 删除选中文本
				range.deleteContents();
				// 插入文本
				range.insertNode(textNode);
				window.getSelection().removeAllRanges();
			}
		}
	});

	// Highlights the output for the user
	$('#output').click(function()
	{
		if (document.selection)
		{
			var range = document.body.createTextRange();
			range.moveToElementText(this);
			range.select();
		}
		else if (window.getSelection)
		{
			var range = document.createRange();
			range.selectNode(this);
			var sel = window.getSelection();
			sel.removeAllRanges(); // required as of Chrome 60: https://www.chromestatus.com/features/6680566019653632
			sel.addRange(range);
		}
	});


	// Copy contents of the output to clipboard
	$("#copy-btn").click(function() {
		var elm = document.getElementById("output");

		if(document.body.createTextRange) {
			// for ie
			var range = document.body.createTextRange();

			range.moveToElementText(elm);
			range.select();

			document.execCommand("Copy");
		} else if(window.getSelection) {
			// other browsers
			var selection = window.getSelection();
			var range = document.createRange();

			range.selectNodeContents(elm);
			selection.removeAllRanges();
			selection.addRange(range);

			document.execCommand("Copy");
		}
	})

	$("#convert-btn").click(function () {
		let data_type = $("input[name='data_type']:checked").val()
		if(data_type === 'sql'){
			let sqlstr = $("#inputsql").text()
			sqlstr = sqlstr.replace(/create/i, 'CREATE')
			sqlstr = sqlstr.replace(/table/i, 'TABLE')
			sqlstr = sqlstr.replace(/TABLE\s+IF\s+NOT\s+EXISTS\s+/i, 'TABLE ')
			sqlstr = sqlstr.replace(/TABLE\s+(\w+)/, function (_, c) {
				if(c.indexOf('`') === 0){
					return c
				}
				return 'TABLE `'+c+'` '
			})
			let pos1 = sqlstr.indexOf('(')
			let pos2 = sqlstr.lastIndexOf(')')
			let headSqlStr = sqlstr.substring(0, pos1+1)
			let midSqlStr = sqlstr.substring(pos1+1, pos2)
			let tailSqlStr = sqlstr.substring(pos2)
			if(pos2 - pos1 > 1){
				let keys = 'tinyint|smallint|int|mediumint|bigint|float|double|decimal|varchar|char|text|mediumtext|longtext|datetime|time|date|enum|set|blob'
				$.each(keys.split("|"), function (i, v) {
					let reg=new RegExp('(\\w+)\\s+'+v, 'ig');
					midSqlStr = midSqlStr.replace(reg, function (_, c1) {
						if(c1.indexOf('`') === 0){
							return c1
						}
						return '`'+c1+'` ' + v
					})
				})
				sqlstr = headSqlStr + " " + midSqlStr + " " + tailSqlStr
			}else{
				sqlstr = headSqlStr + " " + tailSqlStr
			}
			doConversion(sqlstr);
			return
			// $("#input").text(sqlstr)

		}
		doConversion();
	})
	//$("input[type='radio']:checked").val();
	$("input[name='data_type']").change(function (e) {
		let etarget = $(e.target)
		if(etarget.prop('checked')){
			if(etarget.val() == 'json'){
				$("#sql-go-type-div").hide()
				$("#json-go-type-div").show()
				$("#input").show();
				$("#inputsql").hide();
			}else{
				$("#sql-go-type-div").show();
				$("#json-go-type-div").hide();
				$("#inputsql").show();
				$("#input").hide();

			}
		}
	})

	
});

function constructJSONErrorHTML(rawErrorMessage, errorIndex, json) {
	var errorHeading = '<p><span class="clr-red">'+ rawErrorMessage +'</span><p>';
	var markedPart = '<span class="json-go-faulty-char">' + json[errorIndex] + '</span>';
	var markedJsonString = [json.slice(0, errorIndex), markedPart, json.slice(errorIndex+1)].join('');
	var jsonStringLines = markedJsonString.split(/\n/);
	for(var i = 0; i < jsonStringLines.length; i++) {

		if(jsonStringLines[i].indexOf('<span class="json-go-faulty-char">') > -1)  // faulty line
			var wrappedLine = '<div class="faulty-line">' + jsonStringLines[i] + '</div>';
		else 
			var wrappedLine = '<div>' + jsonStringLines[i] + '</div>';

		jsonStringLines[i] = wrappedLine;
	}
	return (errorHeading + jsonStringLines.join(''));
}

// Stringifies JSON in the preferred manner
function stringify(json)
{
	return JSON.stringify(json, null, "\t");
}

function sql_go_type_chkbox(){
	let go_types = $("input[name='sql_go_type']:checked")
	let chk_go_types = []
	$(go_types).each(function(i, o){
		chk_go_types.push(o.value)
	})
	localStorage.setItem(sqlTypesChkCacheKey, JSON.stringify(chk_go_types))
}