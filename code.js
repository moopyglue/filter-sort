
function dataToTable(data,tabID,fields="") {

    var flist, h,i,j,k,l ;

    // make a list of columns to display in flist + collist
    if( fields=="" ) fields = data[0].join(",");
    flist=fields.split(",");
    collist=[]
    for( h=0 ; h<flist.length ; h++ ) {
        for( i=1 ; i< data[0].length ; i++ ) {
            if( data[0][i] == flist[h] ) {
                collist.push(i);
                continue;
            }
        }
    }

    // build header
    var str = '<tr>'
    for( j=0 ; j<collist.length ; j++ ) {
        str += "<th>"+data[0][collist[j]]+"</th>";
    }
    str += "</tr>\n"
    
    // build body
    for ( k=2 ; k<data.length ; k++ ) {
        str += "<tr>"
        for( l=0 ; l< collist.length ; l++ ) {   
            str += "<td>"+data[k][collist[l]]+"</td>";
        }
        str += "</tr>\n"
    }

    document.getElementById(tabID).innerHTML = str;
    document.getElementById(tabID).setAttribute("data-fields",fields);
}

function filterTable(tableID,searchID) {

    var td, txtValue, hid;

    var filter = parse(document.getElementById(searchID).value);
    var tr = document.getElementById(tableID).getElementsByTagName("tr");
    var fields = document.getElementById(tableID).getAttribute("data-fields").split(",")
    console.log(tableID,filter);
    
    if( filter == null ) {
        // display all rows
        for (i = 1; i < tr.length; i++) {
            tr[i].style.display = ""
        } 
    } else {
    
        // loop through each table row
        for (i = 1; i < tr.length; i++) {

            td = tr[i].getElementsByTagName("td");
            if (td.length == 0) continue; 
            
            // display only rows where a field matches the search
            var line = {}
            for (j = 0 ; j < td.length ; j++ ) {
                line[fields[j]] = td[j].textContent || td[j].innerText;
            }
            if( evaluate(line,filter) ) {
                tr[i].style.display = ""
            } else {
                tr[i].style.display = "none"
            }
        }
    }
}

function press(e,keycode,f) {
    var evt = e || window.event;
    if (evt.keyCode==keycode ) {
        f();
        return false;
    }
}


// operandize()
// This generates a operandized array out of search string to enable
// features liek AND, OR, NOT and BRACKETS for complex queries
//
function tokenize(str) {

    var operands = []
    str = str.trim() 
    var s = ''
    var index = 0

    // define regular expressions used here
    var re_wspace = new RegExp(/ /)
    var re_quote = new RegExp(/["'\/]/)
    var re_push_operand = new RegExp(/[()]/)
    var re_operand_end = new RegExp(/[ ()]/)
    var re_and_or_not = new RegExp(/^(?:and|or|not)$/i)

    // loop through each character of the provided string
    while ( index < str.length ) {
        
        var c = str[index];
        index++;

        // skip white space (when not in quotes)
        if ( c.match(re_wspace) ) continue;
        
        // capture charecters which are on their own are avalid operand e.g. brackets
        if ( c.match(re_push_operand) ) {
            operands.push( { type:"operand", style:c } )
            continue
        }

        // Deal with quoted strings (single or double quotes)
        if ( c.match(re_quote) ) {
            var style = "quotes"
            if ( c == "/" ) style="match"
            while ( index < str.length && str[index] != c ) {
                s += str[index++]
            }
            if ( str[index] == c ) {
                index++
                operands.push( { type:"operand", value:s, style:style })
                s=""
                if ( index < str.length && ! str[index].match(re_operand_end)  ) {
                    console.log("quotes in the middle of a operand : index="+str[index])
                    console.log(operands)
                    return []        
                }
                continue
            } else {
                console.log("unmatched quote "+c)
                console.log(operands)
                return []    
            }
        }

        // Deal with normal operands
        s += c
        while ( index < str.length ) {
            c = str[index]
            if ( c.match(re_quote) ) {
                console.log("quotes in the middle of a operand : index="+c)
                console.log(operands)
                return []                  
            }           
            if ( c.match(re_operand_end) )  break;
            s += c
            index++
        }
        if( s.match(re_and_or_not) ) {
            // identify keyword types and make lower case types
            operands.push( { type:"operator", style:s.toLowerCase() } )
        } else {
            // add as a standard value operand
            operands.push( { type:"operand", value:s, style:"normal" })
        }
        s=""

    }

    // Add in implied AND statements where no operator
    var expand_operands = []
    while ( operands.length >= 2 ) {
        if ( 
            ( operands[0]["type"]=="operand" && operands[1]["type"]=="operand" ) || 
            ( operands[0]["type"]== ")"    && operands[1]["type"]=="operand" ) || 
            ( operands[0]["type"]=="operand" && operands[1]["type"]=="(" ) 
        ) {
            expand_operands.push( operands.shift() )
            expand_operands.push( { type:"operator", style:"and"} )
        } else {
            expand_operands.push( operands.shift() )
        }
    }
    expand_operands.push( operands.shift() )

    return expand_operands
}

// create quick lookup contants for speed

const _OPERAND_NORMAL_  = 1
const _OPERAND_QUOTE_   = 2
const _OPERAND_MATCH_   = 3
const _OPERATOR_AND_    = 4
const _OPERATOR_OR_     = 5
const _OPERATOR_NOT_    = 6

var ops_lookup = {
    "operand:normal":_OPERAND_NORMAL_,
    "operand:quote" :_OPERAND_QUOTE_,
    "operand:match" :_OPERAND_MATCH_,
    "operator:and"  :_OPERATOR_AND_,  
    "operator:or"   :_OPERATOR_OR_,  
    "operator:not"  :_OPERATOR_NOT_,  
}

// parse()
// operandize a seach string and then 'reverse polish' it into fast
// search structure
function parse(str) {
    var tokenized = tokenize(str)
    if( typeof tokenized[0] == "undefined" ) return null;
    for( n in tokenized ) {
        tokenized[n]["code"] = ops_lookup[tokenized[n]["type"]+":"+tokenized[n]["style"]]
    }
    console.log("parse()",tokenized)
    return tokenized[0]
}

// evaluate()
// compares a dictionary list with a search string in "parse()" format
function evaluate(line,filter) {

    // evaluate operator/operands/expressions

    switch( filter["code"] ) {

        //
        //   Handle "OPERANDS" ie. values to be used for matching
        // 

        case _OPERAND_NORMAL_ :
            // default match is CASE IN-SENSITIVE
            for( var n in line ){
                if( line[n].toUpperCase().indexOf(filter["value"].toUpperCase()) >= 0 ) return true
            }
            return false

        case _OPERAND_QUOTE_ :
            // quoted strings allow whiet space and is CASE SENSITIVE
            for( var n in line ){
                if( line[n].indexOf(filter["value"]) >= 0 ) return true
            }
            return false

        case _OPERAND_MATCH_ :
            // strings specified using /'s are treated like pattern matches
            for( var n in line ){
                if( line[n].indexOf(filter["value"]) >= 0 ) return true
            }
            return false
        
        //
        //   Handle "OPERATORS" e.g. and, or, not
        // 

        case _OPERATOR_AND_:
            for( var n in filter["expressions"] ){
                if( evaluate( filter["expressions"][n]) ) continue
                return false
            }
            return true

        case _OPERATOR_OR_:
            for( var n in filter["expressions"] ){
                if( evaluate( filter["expressions"][n]) ) return true
            }
            return false

        case _OPERATOR_NOT_:
            return ! evaluate( filter["expression"] )

        default:
            console.log("evaluate() unhandled operand/operator type")
            return false
    }

    return false
}