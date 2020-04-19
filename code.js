
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
    var str = "<tr>"
    for( j=0 ; j<collist.length ; j++ ) {
        str += "<th>"+data[1][collist[j]]+"</th>";
    }
    str += "</tr>\n"

    // build hidden column names (for reference)
    str += "<tr style='display:none;'>";
    for( j=0 ; j< collist.length ; j++ ) {
        str += "<td>"+data[0][collist[j]]+"</td>";
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
}

function filterTable(tableID,searchID,headerRows=1) {

    var td, txtValue, hid;

    var filter = document.getElementById(searchID).value.toUpperCase();
    var tr = document.getElementById(tableID).getElementsByTagName("tr");
    console.log(tableID,filter,headerRows);
    
    // loop through each table row
    for (i = headerRows; i < tr.length; i++) {

        td = tr[i].getElementsByTagName("td");
        if (td.length == 0) continue; 
        
        // display only rows where a field matches the search
        hid = "none"
        for (j = 0 ; j < td.length ; j++ ) {
            txtValue = td[j].textContent || td[j].innerText;
            if (txtValue.toUpperCase().indexOf(filter) >= 0) {
                hid = "";
            }
        }
        tr[i].style.display = hid;
    }
}


function press(e,keycode,f) {
    var evt = e || window.event;
    if (evt.keyCode==keycode ) {
        f();
        return false;
    }
}

// This generates a tokenized array out of search string to enable
// features liek AND, OR, NOT and BRACKETS for complex queries
//
function tokenize(str) {

    var tokens = []
    str = str.trim() 
    var s = ''
    var index = 0

    // define regular expressions used here
    var re_wspace = new RegExp(/ /)
    var re_quote = new RegExp(/["']/)
    var re_push_token = new RegExp(/[()]/)
    var re_token_end = new RegExp(/[ ()]/)
    var re_and_or_not = new RegExp(/^(?:and|or|not)$/i)

    // loop through each character of the provided string
    while ( index < str.length ) {
        
        var c = str[index];
        index++;

        // skip white space (when not in quotes)
        if ( c.match(re_wspace) ) continue;
        
        // capture charecters which are on their own are avalid token e.g. brackets
        if ( c.match(re_push_token) ) {
            tokens.push( { type:c } )
            continue
        }

        // Deal with quoted strings (single or double quotes)
        if ( c.match(/["']/) ) {
            while ( index < str.length && str[index] != c ) {
                s += str[index++]
            }
            if ( str[index] == c ) {
                index++
                tokens.push( { type:"token", value:s, inquotes:"yes" })
                s=""
                if ( index < str.length && ! str[index].match(re_token_end)  ) {
                    console.log("quotes in the middle of a token : index="+str[index])
                    console.log(tokens)
                    return []        
                }
                continue
            } else {
                console.log("unmatched quote "+c)
                console.log(tokens)
                return []    
            }
        }

        // Deal with normal tokens
        s += c
        while ( index < str.length ) {
            c = str[index]
            if ( c.match(re_quote) ) {
                console.log("quotes in the middle of a token : index="+c)
                console.log(tokens)
                return []                  
            }           
            if ( c.match(re_token_end) )  break;
            s += c
            index++
        }
        if( s.match(re_and_or_not) ) {
            // identify keyword types and make lower case types
            tokens.push( { type:s.toLowerCase() } )
        } else {
            // add as a standard value token
            tokens.push( { type:"token", value:s })
        }
        s=""

    }

    // Add in implied AND statements where no operator
    var expand_tokens = []
    while ( tokens.length >= 2 ) {
        if ( 
                ( tokens[0]["type"]=="token" && tokens[1]["type"]=="token" ) || 
                ( tokens[0]["type"]== ")"    && tokens[1]["type"]=="token" ) || 
                ( tokens[0]["type"]=="token" && tokens[1]["type"]=="(" ) 
        ) {
                expand_tokens.push( tokens.shift() )
                expand_tokens.push( { type:"and"} )
        } else {
            expand_tokens.push( tokens.shift() )
        }
    }
    expand_tokens.push( tokens.shift() )

    return expand_tokens
}