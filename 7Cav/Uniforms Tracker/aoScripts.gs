function checkTroopers(sheet) { // Checks the troopers in an AO sheet to see if any are missing or do not belong
  sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('HHQ'); // DEBUGGING VARIABLE
  this.sheetMilpacRef = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('milpacRef');
  const ROW_FIRSTTROOPER = 5; // Row that first trooper is on
  const COL_TROOPERS = 3; // Column number that trooper names are on (Ex: Column 'C' is 3)
  const AOname = sheet.getName(); // Name of the sheet/AO
  
  const rawMilpacs = this.sheetMilpacRef.getRange(2, 1, this.sheetMilpacRef.getLastRow()-1, this.sheetMilpacRef.getLastColumn()).getValues();
  var milpacNames = [];
  for (var i in rawMilpacs) { // Get array of all troopers from milpacRef that are in the AO (Grabbed from sheet name).
    if (rawMilpacs[i][3] == AOname) {
      milpacNames.push(rawMilpacs[i][0]);
    }
  }
  
  const rawAO = sheet.getRange(ROW_FIRSTTROOPER, COL_TROOPERS, sheet.getLastRow()-ROW_FIRSTTROOPER).getValues();
  var AOnames = [];
  for (var i in rawAO) { // Get array of all troopers on the current sheet.
    var name = rawAO[i][0];
    if (name == '' || name == 'undefined') {continue;} // If no value, skip
    AOnames.push(name);
  }
  
  for (var i in AOnames) { // Checks for extra troopers in AO sheet
    var index = milpacNames.indexOf(AOnames[i]);
    if (index == -1.0) {
      Logger.log(AOnames[i]);
    }
  }
  
  for (var i in milpacNames) { // Checks for missing troopers in AO sheet
    var index = AOnames.indexOf(milpacNames[i]);
    if (index == -1.0) {
      Logger.log(milpacNames[i]);
    }
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

function checkAOs() { // Checks to see what AOs do not have sheets and adds any missing ones
  this.sheetMilpacRef = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('milpacRef');
  
  function getActiveAOs() { // Queries the AO column in milpacRef to see what AO's are currently in use
    var rawValues = this.sheetMilpacRef.getRange(2, 4, this.sheetMilpacRef.getLastRow()-1).getValues();
    var AOs = [];
    for (var i in rawValues) {
      var row = rawValues[i][0];
      if (row == '' || row == 'undefined') {continue;} // If AO is empty then skip row
      if (AOs.indexOf(row) == -1.0) {AOs.push(row);} // If AO is not already in AOs array, then add it
    }
    return AOs; // Returns array of all AOs currently in use
  }
  
  function getSheetList() { // Gets a list of all sheets in the Tracker
    var rawSheets = SpreadsheetApp.getActiveSpreadsheet().getSheets()
    var sheetNames = [];
    for (var i in rawSheets) {
      sheetNames.push(rawSheets[i].getSheetName())
    }
    return sheetNames; // Returns array of the names of all sheets in the tracker
  }
  
  var activeAOs = getActiveAOs();
  var sheetList = getSheetList();
  
  var missingSheets = [];
  for (var a in activeAOs) { // Finds what AOs do not already have sheets and pushes it to missingSheets
    var AO = activeAOs[a];
    if (sheetList.indexOf(AO) == -1.0) {
      missingSheets.push(AO);
    }
  }
  
  var sheetAOTemplate = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('aoTemplate');
  var tracker = SpreadsheetApp.getActiveSpreadsheet();
  
  for (var i in missingSheets) {
    var name = missingSheets[i];
    var newSheet = sheetAOTemplate.copyTo(tracker);
    newSheet.setName(name);
    newSheet.getRange(1, 1).setValue(name);
  }
}
