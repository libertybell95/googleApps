// Scripts that edit the Master sheet. Only Exception is some functions in jacketBuilder.gs

function sortMaster() { // Sorts by rank, then last name.
  const sheetMaster = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Master');
  const COL_RANK = 1; // Column number of ranks
  const COL_LASTNAME = 4; // Column number of last names
  const ROW_FIRSTTROOPER = 4; // Row that first trooper in Master sheet on. (So it doesnt try to sort the titles.
  
  sheetMaster.getRange(ROW_FIRSTTROOPER, 1, sheetMaster.getLastRow()-ROW_FIRSTTROOPER, sheetMaster.getLastColumn()).sort([
    {column: COL_RANK, ascending: true}, // Rank
    {column: COL_LASTNAME, ascending: true} // Last Name
  ]);
}

function checkMaster() { // Checks to see if any troopers are missing or don't belong on Master sheet and performs appropriate actions depending on if they needed to be added or removed
  this.sheetMaster = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Master');
  this.sheetMilpacRef = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('milpacRef');
  this.sheetTransferLog = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('transferLog');
  this.ROW_FIRSTTROOPER = 4; // Row of first trooper on Master sheet.
  this.COL_FIRSTNAME = 3; // Column number of first names on Master sheet.
  
  
  var milpacRef = this.sheetMilpacRef.getRange(2, 1, sheetMilpacRef.getLastRow()).getValues(); // Column with names
  var milpacNames = [];
  for (var i in milpacRef) { // Compiles array of names on milpacRef sheet
    if (milpacRef[i] == '' || typeof milpacRef[i] == 'undefined') {continue;} // Skips row if there is no first name
    milpacNames.push(milpacRef[i][0])
  }
  
  var rawMasterNames = this.sheetMaster.getRange(this.ROW_FIRSTTROOPER, this.COL_FIRSTNAME, this.sheetMaster.getLastRow(), 2).getValues();
  var masterNames = [];
  for (var i in rawMasterNames) { // Compiles array of names of Master sheet
    if (rawMasterNames[i][0] == '' || typeof rawMasterNames[i][0] == 'undefined') {continue;} // Skips row if there is no first name
    masterNames.push(rawMasterNames[i][0]+' '+rawMasterNames[i][1]);
  }
  Logger.log(masterNames);
  
  function logTransfer(name, action) { // Logs each addition/removal of a trooper to/from the Master sheet
    this.sheetTransferLog.insertRowBefore(2);
    this.sheetTransferLog.getRange(2, 1, 1, 3).setValues([[new Date(), name, action]]);
  }
  
  function deleteRow(name) { // Deletes a row from the master sheet based on the name given
    var rawMasterValues = this.sheetMaster.getRange(1, this.COL_FIRSTNAME, this.sheetMaster.getLastRow(), 2).getValues(); // Gets first and last names in a multi-dimensional array
    Logger.log(name);
    var masterNames = [];
    for (var i in rawMasterValues) { // Combines first and last names and pushes it to masterNames array
      masterNames.push(rawMasterValues[i][0]+' '+rawMasterValues[i][1]);
    }
    Logger.log('Name: '+name+' | Row: '+masterNames.indexOf(name)); // For debugging. Trust me, it'll come in handy
    this.sheetMaster.deleteRow(masterNames.indexOf(name)+1); // Deletes row found at the row number that the name was found at
  }
  
  for (var i in masterNames) { // Checks for extra troopers in Master sheet
    var index = milpacNames.indexOf(masterNames[i]);
    if (index == -1.0) { // If trooper is on Master sheet, but not on Milpacs sheet
      deleteRow(masterNames[i]); // Delete troopers row on Master sheet
      logTransfer(masterNames[i],'Removal'); // Log transfer
    }
  }
  
  for (var i in milpacNames) { // Checks for missing troopers in Master sheet
    var index = masterNames.indexOf(milpacNames[i]);
    if (index == -1.0) { // If trooper is on milpacs sheet but not on master sheet
      var nameMatch = milpacNames[i].match(/(\w+)\s(.*)/); // Used to seperate first name (first word), and last name (all after first word).
      this.sheetMaster.insertRowBefore(this.ROW_FIRSTTROOPER); // Creates new row above where first trooper is.
      this.sheetMaster.getRange(4, this.COL_FIRSTNAME, 1, 2).setValues([[nameMatch[1], nameMatch[2]]]); // Inserts first name and last name onto newly created row
      logTransfer(milpacNames[i], 'Addition'); // Logs transfer
    }
  }

  sortMaster();
}
