function updateMilpacRef() { // Updates milpacRef sheet with current listing of active personnel
  const troopers = CAV_getPersonnel();
  var output = [['Name', 'Rank', 'Milpac ID', 'AO']];
  
  for (var i = 0; i < troopers.length; i++) {    
    output.push([
      troopers[i].name,
      troopers[i].rank.payGrade+' '+troopers[i].rank.shortRank,
      troopers[i].id,
      troopers[i].AO
    ]);
  }
  
  var sheetMilpacRef = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('milpacRef');
  sheetMilpacRef.getRange(1, 1, sheetMilpacRef.getLastRow(), output[0].length).clearContent();
  sheetMilpacRef.getRange(1, 1, output.length, output[0].length).setValues(output);
}
