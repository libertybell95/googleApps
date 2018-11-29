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
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z',
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
