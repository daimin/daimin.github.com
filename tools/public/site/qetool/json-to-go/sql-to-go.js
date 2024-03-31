


var sql2go = {
    useGorm: true,
    useSqlx: true,
    useJson: true,
    useForm: true,
    structContent: "",
    sqlstr : "",
    result: {
      go: "",
      error:""
    },
    typeMap: getTypeMap(),
    init:function (sql) {
        this.sqlstr = sql;
    },
    to_gostruct:function () {
        this.result.error = ""
        this.result.go = ""
        if (!this.sqlstr) {
            return
        }
        let val = this.sqlstr
        val = val.replace(/\((\d+)\s*\)/g, '($1)')
        let res = val.match(/\`[\w_]+\`\s*[\w_\(\)]+.*(\s+|\,)/ig)
        if (!res) {
            this.result.error = '无效sql'
            return
        }
        let gcommet = val.match(/\n\s*\)\s*.*comment[\s=]+'(.*)'/i)
        let types = this.typeMap
        let tbName = ""
        let dbTbName = ""
        let structResult = 'type '
        for (var i = 0, len = res.length; i < len; i++) {
            var fieldReg = /\`(.+)\`\s*(tinyint|smallint|int|mediumint|bigint|float|double|decimal|varchar|char|text|mediumtext|longtext|datetime|time|date|enum|set|blob|json)?/
            var field = res[i].toLowerCase().match(fieldReg)
            if (i == 0) {   // 第一个字段为数据表名称
                if (field && field[1] != undefined && field[2] == undefined) {
                    dbTbName = field[1]
                    tbName = titleCase(field[1])
                    structResult += tbName + ' struct {'
                    continue
                } else {
                    return
                }
            } else {  // 数据表字段
                if (field && field[1] != undefined && field[2] != undefined) {
                    if (types[field[2]] != undefined) {
                        let commentReg = /\s*comment\s+'(.*)'/
                        let comments = res[i].toLowerCase().match(commentReg)
                        let fieldName = titleCase(field[1])
                        let fieldType = types[field[2]]
                        let fieldJsonName = field[1].toLowerCase()
                        if (fieldName.toLowerCase() == 'id') {
                            fieldName = 'ID'
                        }
                        structResult += '\n\t' + fieldName + ' ' + fieldType + ' '
                        let structArr = []
                        if (this.useGorm) {
                            structArr.push('gorm:"column:'+ fieldJsonName +'"')
                        }
                        if (this.useSqlx) {
                            structArr.push('db:"'+ fieldJsonName +'"')
                        }
                        if (this.useJson) {
                            structArr.push('json:"' + fieldJsonName + '"')
                        }
                        if (this.useForm) {
                            structArr.push('form:"' + fieldJsonName + '"')
                        }
                        if (structArr.length > 0) {
                            structResult += '`'+structArr.join(' ')+'`'
                            if(comments && comments.length > 1) {
                                structResult += "  //  " + comments[1]
                            }
                        }
                    } else {
                        continue
                    }
                } else {
                    continue
                }
            }
        }
        structResult += '\n}'
        if(gcommet && gcommet.length > 1) {
            structResult = "// " +tbName+"  " + gcommet[1] + "\n" + structResult
        }
        if (this.useGorm) {
            structResult += "\n\nfunc ("+tbName+") TableName() string {\n    return \""+dbTbName+"\"\n}";
        }
        this.result.go = structResult
    }

}

function get_go_struct(sqlstr, sqlGoType) {
    function sql_2_go() {
        this.init.apply(this, arguments);
    }
    sql_2_go.prototype = sql2go
    let k = new sql_2_go(sqlstr);
    k.useGorm = sqlGoType.useGorm
    k.useJson = sqlGoType.useJson
    k.useSqlx = sqlGoType.useSqlx
    k.useForm = sqlGoType.useForm
    k.to_gostruct()
    return k.result
}

function titleCase(str) {

    var array = str.toLowerCase().split("_");
    for (var i = 0; i < array.length; i++){
        if(array[i] == ""){
            array[i] = "_";
        }
        array[i] = array[i][0].toUpperCase() + array[i].substring(1, array[i].length);
    }
    var string = array.join("");

    return string;
}

// 类型映射
function getTypeMap() {
    return {
        'tinyint': 'int64',
        'smallint': 'int64',
        'int': 'int64',
        'mediumint': 'int64',
        'bigint': 'int64',
        'float': 'float64',
        'double': 'float64',
        'decimal': 'float64',
        'char': 'string',
        'varchar': 'string',
        'text': 'string',
        'mediumtext': 'string',
        'longtext': 'string',
        'time': 'time.Time',
        'date': 'time.Time',
        'datetime': 'time.Time',
        'timestramp': 'int64',
        'enum': 'string',
        'set': 'string',
        'blob': 'string',
        'json': 'string',
    }
}