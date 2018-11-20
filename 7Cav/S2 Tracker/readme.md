# S2 Tracker

All functions contained in this directory are for use in a Google Spreadsheet utilized by the S2 Department for checking for VAC Bans on Steam users. 

## findTitle()

The find title function is used to fetch the cell location of a keyword on a Google Sheet. For use in other function that perform an operation on a specific row or column of values

### Input

|  Variable Name [Index]  |                             Type                             |                         Description                          |
| :---------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: |
|        sheet [0]        | [Class Sheet](https://developers.google.com/apps-script/reference/spreadsheet/sheet) |             Sheet that function will execute on.             |
|       keyword [1]       |                            String                            | Term to search for. (*CASE SENSITIVE, MUST BE EXACT TEXT IN CELL*) |
| rowLimit [2] (Optional) |                           Integer                            |                  Number of rows to search.                   |

If rowLimit is not defined. The function will assign 5 as it's default value.

### Output

The following returns an object literal bound to the function with the following information

|  Key   |  Type   |  Description  |
| :----: | :-----: | :-----------: |
|  row   | Integer |  Row Number   |
| column | Integer | Column Number |

The was this function is designed it will search each row (left to right) on the sheet beginning with the first row.

## steamCheck()

TODO
