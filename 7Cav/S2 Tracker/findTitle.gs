function findTitle(sheet, keyword, rowLimit) { 
  /*
  Name: findTitle
  Author: Joshua Bell (joshuakbell@gmail.com)
  Description: Looks for the location of a title on a spreasheet to provide a reference for further functions
  
  Input:
    0: Sheet object to search
    1: Keyword to search for, CASE SENSITIVE
    2: Number of rows to search, will max out at 5 if limit not defined (optional)
  Output:
    row : Row Number
    column : Column Number
  */
  
  try {sheet.getRange(1,1);} catch(error) {throw new Error("findTitle: sheet undefined")} //Checks if sheet object is defined and correct
  if (typeof keyword == null) {throw new Error("findTitle: keyword undefined");} //Checks if keyword is defined
  
  var lastCol = sheet.getLastColumn(); //Last column (number) on SpreadSheet
  if (typeof rowLimit == null) {rowLimit = 5;}
  
  for (var rowIndex = 1; rowIndex < rowLimit; rowIndex++) { //Loops through defined number of rows sequentially
    for (var colIndex = 1; colIndex < lastCol; colIndex++) { //Finds value in a single row
      var row = sheet.getRange(rowIndex, 1, 1, lastCol).getValues()[0];
      var searchRow = row.indexOf(keyword);
      if (searchRow >= 0) {
        var outputCol = searchRow + 1;
        break;
      }
    }
    if (outputCol >= 0) {break;} 
  } 
  if (rowIndex == rowLimit) {throw new Error("findTitle: Title not found, search is case sensitive")};
  
  var output = {
    row : rowIndex,
    column : outputCol
  };
  
  return(output);
}
