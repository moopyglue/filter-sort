
# sjhw/filter-sort

This code is intended to be used for filtering a table of data

The data is loaded from the file **data.js** in the format...
```
var data = [
     ["cols","name","mpg","cylinders","displacement","horsepower","weight","acceleration","modelyear","origin"  ],
     ["data","chevrolet chevelle malibu","18","8","307","130","3504","12","70","1"  ],
     ["data","buick skylark 320","15","8","350","165","3693","11.5","70","1"  ],
     ["data","plymouth satellite","18","8","318","150","3436","11","70","1"  ],
]
```

table is written with **dataToTable()** and is then filtered with **filterTable()**

All operands are assumed to be seach terms, so a single value of **hello** would search for rows which contain the word **hello**

All unquoted terms asume cass insensitive, while wuoted terms are case sensitive. So seaching for **"Hello"** is case sensitive while **Hello** is not

Operators supported are
```
( )        left and right parenthesis
! not      NOT operator
|| or      OR operator
&& and     AND operator
```

If 2 operands are adjacent then the **AND** between them is assumed, this means that if you for search for **here there** it is expanded to **here and there** and a filter is executed which looks for rows which contain **here** and **there** but not do not have to be in that order. to search fo ran exact matach you woudl use **"here there"** in quotes.

When seaching for things which contain spaces or quotes or keywords or you want them to be case sensitive then you quote the search terms with either single or doble quotes e.g. **"hello"** or **'hello'**
