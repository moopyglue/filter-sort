
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