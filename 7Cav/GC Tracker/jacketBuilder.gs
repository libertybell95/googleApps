// Functions for building trooper jacket
/*
 * TODO:
 *   -Look into moving reDate depending on rank from just PFC block
 *   -Make item that executes publishJacket on a row in Master sheet.
 *     -Ensure that publishJacket() const variables are correct
 *
 */

function publishJacket(ID, ROW) {
  ID = 446; // DEBUGGING VARIABLE
  ROW = 2; // DEBUGGING VARIABLE
  
  /*
   * publishJacket() is where all the data compiled in bulidJacket()
   * is put onto a specified row in the Master sheet. The only variable
   * that you will need to inspect if changing the layout of the Master
   * sheet is the variables that are in the ~10 lines following this
   * comment block.
   */
  
  const COL_BOOTGRAD = 'D'; // Column of boot camp graduation date
  const COL_PROMOSTART = 'E'; // Column of first promotion (Usually PFC).
  const COL_GCSTART = 'H'; // Column of first GC medal (Usually the initial).
  const COL_SPECSTATUS = 'C'; // Column of Special Status
  const COLOR_HAS = '#00B050'; // Color to indicate they have the item
  const COLOR_NCOA = '#FF9900'; // Color to indicate NCOA completion
  const COLOR_EMPTY = '#FFFFFF'; // Color for empty (white)
  var sheetJacketBuilder = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Jacket Builder');
  
  var jacket = buildJacket(ID);
  //Logger.log('\n'+JSON.stringify(jacket));
  sheetJacketBuilder.getRange(ROW, colInfo(COL_BOOTGRAD).number).setValue(jacket.bootGrad); // Set boot grad date
  
  // START - Publish ranks
  var rankFormulas = [];
  var rankBGs = [];
  for (var r = 0; r < jacket.ranks.length; r++) { // Set ranks
    var currentRank = jacket.ranks[r];
    if (currentRank.has == true) { // If they have the current rank
      rankBGs[r] = COLOR_HAS;
    } else if (currentRank.NCOA == true) { // If they dont have than rank AND they have taken NCOA
      rankBGs[r] = COLOR_NCOA;
    } else {
      rankBGs[r] = COLOR_EMPTY;
    }
    if (r == 0) { // If first value in ranks
      var lastCol = COL_BOOTGRAD; // If first, set lastCol to boot grad
      var curentCol = COL_PROMOSTART; // Current column of rank
      if (jacket.reDate != 'undefined') { // If trooper has a reenlistment
        var refCell = 'DATEVALUE("'+jacket.reDate.toDateString()+'")';
      } else { // If trooper is not a reenlistment
        var refCell = lastCol+ROW;      
      }
    } else { // If NOT first value in ranks
      var lastCol = colInfo(colInfo(COL_PROMOSTART, r).colMath).colBefore; // If not first, set lastCol to column letter just prior to current column
      var currentCol = colInfo(COL_PROMOSTART, r).colMath; // Current of rank
      var refCell = lastCol+ROW;
    }
    var add = '';
    for (var rDTA in currentRank.daysToAdd) {
      add += '+'+currentRank.daysToAdd;
    }
    rankFormulas.push('='+refCell+'+'+jacket.rankReqs[currentRank.rank]+add);
  }
  sheetJacketBuilder.getRange(ROW, colInfo(COL_PROMOSTART).number, 1, rankFormulas.length).setValues([rankFormulas]); // Set rank forumlas
  sheetJacketBuilder.getRange(ROW, colInfo(COL_PROMOSTART).number, 1, rankFormulas.length).setBackgrounds([rankBGs]); // Set rank background colors
  // END - Publish ranks
  
  // START - Publish GCs
  var gcFormulas = [];
  var gcBGs = [];
  for (var g = 0; g < jacket.GCs.length; g++) { // Set GCs
    var currentGC = jacket.GCs[g];
    if (currentGC.has == true) { // If they have the current GC
      gcBGs[g] = COLOR_HAS;
    } else {
      gcBGs[g] = COLOR_EMPTY;
    }
    if (g == 0) {
      var lastCol = COL_BOOTGRAD; // If first, set lastCol to boot grad
      var curentCol = COL_GCSTART; // Current column of rank
      var gcReq = jacket.gcReqs['init'];
    } else {
      var lastCol = colInfo(colInfo(COL_GCSTART, g).colMath).colBefore; // If not first, set lastCol to column letter just prior to current column
      var currentCol = colInfo(COL_GCSTART, g).colMath; // Current of rank
      var gcReq = jacket.gcReqs['knot'];
    }
    var add = '';
    for (var gDTA in currentGC.daysToAdd) {
      add += '+'+currentGC.daysToAdd;
    }
    gcFormulas.push('='+lastCol+ROW+'+'+gcReq+add);
  }
  sheetJacketBuilder.getRange(ROW, colInfo(COL_GCSTART).number, 1, gcFormulas.length).setValues([gcFormulas]); // set GC forumlas
  sheetJacketBuilder.getRange(ROW, colInfo(COL_GCSTART).number, 1, gcFormulas.length).setBackgrounds([gcBGs]); // Set GC background colors
  // END - Publish GCs
  
}

function buildJacket(ID) {
  if (typeof ID != 'number') {throw new Error('buildJacket(): Invalid milpac ID entered. '+ID)} // Ensures that a number was entered into ID variable
  this.ID = ID;
  
  function getBootGrad() { // Gets date of the service record entry that has boot camp graduation.
    var serviceRecord = CAV_getMilpac(this.ID).records.reverse();
    for (var i in serviceRecord) {
      if (serviceRecord[i].entry.search(/grad|complete|graduate|honor|graduate/i) != -1.0) {
        break;
      }
    }
    return new Date(serviceRecord[i].date);
  }
  
  function buildInitialJacket() { // Builds the initial jacket and figures out what ranks and awards they already have. Also figures out what dates they would get each award if they had 0 negative days.
    /**
     * If you are changing what awards/ranks are being used on the tracker
     * such as adding another GC knot buildInitialJacket() is where you will
     * set the base parameters. Also if you are changing the order that ranks
     * or GCs will appear then you will also  need to inspect this function
     * for correctness.
     * 
     * The properties that you need ensure reflects the layout of the Master sheet is:
     *   jacket.rankReqs
     *   jacket.gcReqs
     *   jacket.ranks
     *   jacket.GCs
     * 
     * Their layout should be fairly self explanatory, just enter/remove the values that
     * you need to and ENSURE that they are in the order that they will appear on the
     * Master sheet.
     */
    
    const bootGrad = new Date(getBootGrad());
    var jacket = { // Initializes jacket object and adds 
      bootGrad: bootGrad
    };
    
    jacket.rankReqs = { // TIG required
      'PFC': 30, // PVT to PFC
      'SPC': 60, // PFC to SPC
      'CPL': 120 // SPC to CPL
    };
    
    jacket.gcReqs = { // Day requirements for Good Conduct Medals
      'init': 30, // initial GC
      'knot': 365 // GC Knots
    };
    
    var serviceRecord = CAV_getMilpac(this.ID).records;
    for (var i in serviceRecord) { // Checks for honor graduate
      if (serviceRecord[i].entry.search(/Honor/i) != -1.0) {
        /** 
         * If honor grad, sets PFC TIS requirement to 0 due to their promotion. 
         * Also sets jacket.honorGrad property to true. Later in the function, 
         * if they are a reenlistment then the rankReq (TIS) for PFC will be 
         * reset back to 30. If you want to find where it does this search
         * (Ctrl+F) for PFCREQRESET, it's in all caps.
         */
        jacket.honorGrad = true;
        jacket.rankReqs['PFC'] = 0; 
      }
    }
    
    jacket.ranks = [ // Ranks, in order of appearance on the Master sheet
      {rank: 'PFC', date: dateMath(bootGrad, jacket.rankReqs['PFC']), daysToAdd: []},
      {rank: 'SPC', date:  dateMath(bootGrad, jacket.rankReqs['SPC']), daysToAdd: []},
      {rank: 'CPL', date: dateMath(bootGrad, jacket.rankReqs['CPL']), daysToAdd: []}
    ];
    
    jacket.GCs = [ // Good Conduct Medals, in order of appearance on the Master sheet
      {award: 'Init', date: dateMath(bootGrad, jacket.gcReqs['init']), daysToAdd: []},
      {award: '1B', date: dateMath(bootGrad, (jacket.gcReqs['knot'] * 1)), daysToAdd: []},
      {award: '2B', date: dateMath(bootGrad, (jacket.gcReqs['knot'] * 2)), daysToAdd: []},
      {award: '3B', date: dateMath(bootGrad, (jacket.gcReqs['knot'] * 3)), daysToAdd: []},
      {award: '4B', date: dateMath(bootGrad, (jacket.gcReqs['knot'] * 4)), daysToAdd: []},
      {award: '1S', date: dateMath(bootGrad, (jacket.gcReqs['knot'] * 5)), daysToAdd: []},
      {award: '2S', date: dateMath(bootGrad, (jacket.gcReqs['knot'] * 6)), daysToAdd: []},
      {award: '3S', date: dateMath(bootGrad, (jacket.gcReqs['knot'] * 7)), daysToAdd: []},
      {award: '4S', date: dateMath(bootGrad, (jacket.gcReqs['knot'] * 8)), daysToAdd: []},
      {award: '1G', date: dateMath(bootGrad, (jacket.gcReqs['knot'] * 9)), daysToAdd: []},
      {award: '2G', date: dateMath(bootGrad, (jacket.gcReqs['knot'] * 10)), daysToAdd: []},
      {award: '3G', date: dateMath(bootGrad, (jacket.gcReqs['knot'] * 11)), daysToAdd: []},
      {award: '4G', date: dateMath(bootGrad, (jacket.gcReqs['knot'] * 12)), daysToAdd: []}
    ];
    
    var shortRank = CAV_getMilpac(this.ID).rank.short;
    for (var i in jacket.ranks) { // Goes through each of jacket.ranks and if the trooper is above or at that rank; give the index in jacket.ranks the 'has' property with the value of true
      if (shortRank == 'PVT' || shortRank == 'RCT') {break;}
      jacket.ranks[i].has = true;
      if (jacket.ranks[i].rank == shortRank) {break;}
    }
    
    var GCs = getGCs(this.ID);
    for (var j in jacket.GCs) { // Determines if trooper has specific GC based off of their Milpac. if they do give the index in jacket.GCs the 'has' property with the value of true
      var jacketGC = jacket.GCs[j];
      for (var g in GCs) {
        if (jacketGC.award == GCs[g]) {jacketGC.has = true;}
      }
    }
    
    for (var i in serviceRecord) { // Checks for NCOA
      if (serviceRecord[i].entry.search(/NCOA|NCO Academy/i) != -1.0) {
        for (var q in jacket.ranks) {
          if (jacket.ranks[q].rank == 'CPL') {jacket.ranks[q].NCOA = true;} // Gives CPL rank property 'NCOA' with value of true
        }
      }
    }
    
    return jacket;
  } // End of buildInitialJacket()
  
  var jacket = buildInitialJacket();
  var negativeDays = CAV_negativeDays(this.ID);
  
  // START - Add negative days to GCs
  for (var n in negativeDays) { // Iterates through each negative day that the trooper has
    var nDate = negativeDays[n].startDate; // The start of the negative day
    var nLength = negativeDays[n].length; // Length, in days, of the negative day
    
    for (var gi = 0; gi < jacket.GCs.length; gi++) { // Find first index to start adding days to
      var gDate = new Date(jacket.GCs[gi].date);
      if (nDate < gDate) { // If nDate is greater than GC date, stop at that index and roll it back by 1
        gi--;
        jacket.GCs[gi].daysToAdd.push(nLength); // Adds the nLength to daysToAdd array for the first index in gi
        break;
      } 
    }
    
    
    
    for (; gi < jacket.GCs.length; gi++) { // For each GC that is affected by the negative days. Add the nDays to current date
      var gDate = new Date(jacket.GCs[gi].date);
      jacket.GCs[gi].date = dateMath(gDate, nLength);
    }
  }
  // END - Add negative days to GCs
  
  // START - Add negative days to ranks.
  // Negative days will only be added to those that occur after the reenlistment
  // Also determine if trooper is an reenlisment and assigns the most recent reenlistment date to property jacket.reDate
  var negativeDays = negativeDays.reverse();
  Logger.log(JSON.stringify(negativeDays))
  for (var nR = 0; nR < negativeDays.length; nR++) { // Finds the last reenlistment
    if (negativeDays[nR].endEntry.match(/Re|-7/i) != null) { 
      if (negativeDays[nR].endEntry.match(/ELOA/i) == null) { // If negDay end entry was not ELOA related. set jacket.reDate to the reenlistment date and stop search loop
        Logger.log(JSON.stringify(negativeDays[nR]));
        jacket.reDate = new Date(negativeDays[nR].endDate); 
        jacket.ranks[0].date += (jacket.reDate - jacket.bootGrad); // Assigns the difference between the reenlistment and bootcamp grad dates to the .date property in first index of jacket.ranks
        jacket.rankReqs['PFC'] = 30; // PFCREQRESET | Sets the rank requirement back to 30 days TIS if honor grad checker knocked down the days
        break;
      }
    }
  }
  var negativeDayRanks = negativeDays.slice(0, nR-1);
  
  for (var n in negativeDayRanks) { // For each negative day that occurs after the latest reenlistment
    var nDate = negativeDayRanks[n].startDate;
    var nLength = negativeDays[n].length;
    
    for (var rI = 0; rI < jacket.ranks.length; rI++) { // Finds first index to start adding days to
      var rDate = new Date(jacket.ranks[rI].date);
      if (nDate < rDate) { // If nDate is greater than rank date, stop at that index and roll it back by 1
        rI--; 
        jacket.ranks[rI].daysToAdd.push(nLength); // Adds the nLength to daysToAdd array for the first index in rI
        break;
      } 
    }
    
    for ( ; rI < jacket.ranks.length; rI++) {
      var rDate = new Date(jacket.ranks[rI].date);
      jacket.ranks[rI].date = dateMath(rDate, nLength);
    }   
  }
  // END - Add negative days to ranks.
  
  return jacket;
}

function getGCs(ID) { // Figures out what GC medals the trooper already has
  if (typeof ID != 'number') {throw new Error('getGCs(): Invalid ID, not a number');}
  var awards = CAV_getMilpac(ID).awards;
  var GCs = [];
  
  for (var i in awards) {
    var award = awards[i];
    
    if (awards[i].name.search(/Good Conduct/i) != -1.0) { // If medal is good conduct
      var awardDetail = awards[i].details;
      var knot = '';
      if (awardDetail == '' || typeof awardDetail == 'undefined') {
        knot = 'Init'; // If there is no award details for the GC, assume that it is the initial GC
      } else {
        var match = awardDetail.match(/(1|2|3|4|5).*(Bronze|Silver|Gold).*Knot/i);
        knot = match[1]+match[2][0]; // number obtained and first letter of knot type
      }
      GCs.push(knot);
    }
  }
  
  return GCs;
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
