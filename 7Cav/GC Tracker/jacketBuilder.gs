// Functions for building trooper jacket
/*
 * TODO:
 *   -Look into moving reDate depending on rank from just PFC block
 *   -Make item that executes publishJacket on a row in Master sheet.
 *     -Ensure that publishJacket() const variables are correct
 *
 */

function publishJacket(ID, ROW) {
  if (typeof ID != 'number') {throw new Error('publishJacket(): ID wrong number type.'+typeof ID)} // Variable type checking
  if (typeof ROW != 'number') {throw new Error('publishJacket(): ID wrong number type.'+typeof ROW)} // Variable type checking
  
  /*
   * publishJacket() is where all the data compiled in bulidJacket()
   * is put onto a specified row in the Master sheet. The only variable
   * that you will need to inspect if changing the layout of the Master
   * sheet is the variables that are in the ~10 lines following this
   * comment block.
   */
  
  const COL_SPECSTATUS = 'G'; // Column of Special Status.
  const COL_BOOTGRAD = 'H'; // Column of boot camp graduation date.
  const COL_PROMOSTART = 'I'; // Column of first promotion (Usually PFC).
  const COL_GCSTART = 'L'; // Column of first GC medal (Usually the initial).
  const COLOR_HAS = '#00B050'; // Color to indicate they have the item.
  const COLOR_NCOA = '#FF9900'; // Color to indicate NCOA completion.
  const COLOR_EMPTY = '#FFFFFF'; // Color for empty (white).
  var sheetMaster = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Master');
  
  var jacket = buildJacket(ID);
  sheetMaster.getRange(ROW, colInfo(COL_BOOTGRAD).number).setValue(jacket.bootGrad); // Set boot grad date
  
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
      if (typeof jacket.reDate != 'undefined') { // If trooper has a reenlistment
        //Logger.log('JDate: '+typeof jacket.reDate);
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
  sheetMaster.getRange(ROW, colInfo(COL_PROMOSTART).number, 1, rankFormulas.length).setValues([rankFormulas]); // Set rank forumlas
  sheetMaster.getRange(ROW, colInfo(COL_PROMOSTART).number, 1, rankFormulas.length).setBackgrounds([rankBGs]); // Set rank background colors
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
      add += '+'+currentGC.daysToAdd[gDTA];
    }
    gcFormulas.push('='+lastCol+ROW+'+'+gcReq+add);
  }
  sheetMaster.getRange(ROW, colInfo(COL_GCSTART).number, 1, gcFormulas.length).setValues([gcFormulas]); // set GC forumlas
  sheetMaster.getRange(ROW, colInfo(COL_GCSTART).number, 1, gcFormulas.length).setBackgrounds([gcBGs]); // Set GC background colors
  // END - Publish GCs
  
}

function buildJacket(ID) {
  if (typeof ID != 'number') {throw new Error('buildJacket(): Invalid milpac ID entered. '+ID)} // Ensures that a number was entered into ID variable
  this.ID = ID;
  this.GCmilpac = CAV_getMilpac(this.ID);
  CacheService.getScriptCache().put('GC_milpac', JSON.stringify(CAV_getMilpac(this.ID)));
  
  
  function getBootGrad() { // Gets date of the service record entry that has boot camp graduation.
    var serviceRecord = JSON.parse(CacheService.getScriptCache().get('GC_milpac')).records.reverse();
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
      'init': 365, // Initial GC
      'knot': 365 // GC Knots
    };
    
    var serviceRecord = JSON.parse(CacheService.getScriptCache().get('GC_milpac')).records;
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
    
    var shortRank = JSON.parse(CacheService.getScriptCache().get('GC_milpac')).rank.short;
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
    if (nLength == 0.0) {continue;}
    for (var gi = 0; gi < jacket.GCs.length; gi++) { // Find first index to start adding days to
      var gDate = new Date(jacket.GCs[gi].date);
      if (nDate < gDate) { // If nDate is greater than GC date, stop at that index and roll it back by 1
        if (gi != 0.0) {gi--;}
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
  for (var nR = 0; nR < negativeDays.length; nR++) { // Searches for most recent reenlistment
    if (negativeDays[nR].endEntry.match(/Re|-7/i) != null && negativeDays[nR].endEntry.match(/ELOA/i) == null)  {
      /**
       * If a reenlistment is found and negDay end entry is not ELOA Related.
       * set jacket.reDate to the reenlistment date and stop search loop.
       * 
       */
      //Logger.log(jacket.)
      jacket.reDate = new Date(negativeDays[nR].endDate); 
      jacket.ranks[0].date += (jacket.reDate - jacket.bootGrad); // Assigns the difference between the reenlistment and bootcamp grad dates to the .date property in first index of jacket.ranks
      jacket.rankReqs['PFC'] = 30; // PFCREQRESET | Sets the rank requirement back to 30 days TIG if honor grad checker removed TIG requrement
      break;
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
  
  CacheService.getScriptCache().remove('GC_milpac');
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
        var match = awardDetail.match(/(1|2|3|4|5).*(Bronze|Silver|Gold)/i);
        knot = match[1]+match[2][0]; // number obtained and first letter of knot type
      }
      GCs.push(knot);
    }
  }
  
  return GCs;
}
