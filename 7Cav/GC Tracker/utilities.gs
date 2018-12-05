function findID(name) {
  /**
   * Author: Joshua Bell (joshuakbell@gmail.com)
   * Description: Finds the milpacID of a given name. If ID is not found for name, will throw error.
   *
   * Input:
   *   name {string} - Name of a trooper, without rank. (Ex: Jacob C Smith)
   * 
   * Output:
   *   this {number} - Milpac ID of the trooper
   */

  if (typeof name != 'string') {throw new Error('findID(): Not a valid string')}
  const sheetMilpacRef = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('milpacRef');
  const COL_FIRSTNAME = 'A';
  const COL_MILPACID = 'C';
  
  var rawNames = sheetMilpacRef.getRange(1, colInfo(COL_FIRSTNAME).number, sheetMilpacRef.getLastRow()).getValues();
  var names = [];
  for (var n in rawNames) { // Converts rawNames 2 dimensional array into a 1 dimensional array for indexOf()
    if (rawNames[n][0] == '') {continue;}
    names.push(rawNames[n][0])
  }
  
  var milpacRow = names.indexOf(name) + 1;
  if (milpacRow == 0) {throw new Error('findID(): Name not found. '+name)} // Throw error if name not found
  
  var returnID = sheetMilpacRef.getRange(milpacRow, colInfo(COL_MILPACID).number).getValue();
  returnID = parseInt(returnID, 10);
  return returnID;  
}


function dateMath(startDate, var2) {
  /**
   * Author: Joshua Bell (joshuakbell@gmail.com) 
   * Description: Calculates either difference in days between 2 dates. 
   *   Or calculates the date for the amount of days after a given date
   * 
   * If var2 is a NUMBER, dateMath() will return the date that is +- the
   * startDate. For example: if startDate is 1 January 2018 and var2 is 
   * 3, then the function will return 4 January 2018 as a Date object.
   * 
   * If var2 is a DATE OBJECT, dateMath() will return the difference
   * between var2 and startDate in days. For Example: if startDate is
   * 01 January 2018 and var2 is 04 January 2018, then the function will
   * return the the number 3.
   * 
   * If a second arguent is entered that is undefined then then function
   * will return an error.
   */
  
  startDate = new Date(startDate);
  if (typeof var2 == 'object' || typeof var2 == 'string') { // Calculated difference if var2 is a date (object or string)
    var date2 = new Date(var2);
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
    return diffDays;
  } else if (typeof var2 == 'number') {
    var result = startDate;
    startDate.setDate(startDate.getDate() + var2);
    return result;
  } else {
    return 'Invalid second argument entered. Try again :)';
  }
}

function colInfo(colLetter, numAfter) {
  /**
   * Author: Joshua Bell (joshuakbell@gmail.com)
   * Description: Gets column info, for use in getRange() in a Google Sheet
   *
   * Input:
   *   colLetter {string} - Column letter to reference, ensure colLetter IS IN CAPITAL LETTERS
   *   numAfter {number} - (optional) Amount of columns you want to adde colLetter. See NUMAFTER
   *     comment block for further info.
   * 
   * Output:
   *   this {object}
   *     number {number} - Column number.
   *     colBefore {string} - Column letter that is before colLetter.
   *     colAfter {string} - Column letter that is after colLetter.
   *     colMath {number} - See NUMAFTER comment block. Will only return if numAfter input has a
   *       value that is correct to its requriements.
   */
  
  if (typeof colLetter != 'string') {throw new Error('ColNumber(): Invalid column letter. >> '+colLetter);} // Throws error is colLetter is not a string
  var cols = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ',
    'BA', 'BB', 'BC', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BK', 'BL', 'BM', 'BN', 'BO', 'BP', 'BQ', 'BR', 'BS', 'BT', 'BU', 'BV', 'BW', 'BX', 'BY', 'BZ',
    'CA', 'CB', 'CC', 'CD', 'CE', 'CF', 'CG', 'CH', 'CI', 'CJ', 'CK', 'CL', 'CM', 'CN', 'CO', 'CP', 'CQ', 'CR', 'CS', 'CT', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ',
    'DA', 'DB', 'DC', 'DD', 'DE', 'DF', 'DG', 'DH', 'DI', 'DJ', 'DK', 'DL', 'DM', 'DN', 'DO', 'DP', 'DQ', 'DR', 'DS', 'DT', 'DU', 'DV', 'DW', 'DX', 'DY', 'DZ' 
  ];
  var colIndex = cols.indexOf(colLetter);
  var colInfo = {
    number: colIndex + 1, // Column number of colLetter
    colBefore: cols[colIndex - 1], // Column letter of column that is to the direct left of ColLetter (Ex: A is to the left of B)
    colAfter: cols[colIndex + 1] // Column letter of column that is to the direct right of ColLetter (Ex: C is to the right of B)
  };
  if (typeof numAfter == 'number' && numAfter != 0) {
    /*
     * NUMAFTER
     * 
     * if numAfter is a given and it is a number that is not 0.
     * then the function will get the column letter that is
     * +/- from colLetter. For example: If colLetter is A and
     * numAfter is 5 then it would assign 'F' to .colMath as a
     * return property of colInfo().
     */
    colInfo.colMath = cols[colIndex + numAfter];
  } 
  return colInfo;
}
