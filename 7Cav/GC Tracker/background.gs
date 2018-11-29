function updateMilpacRef() { // Updates milpacRef sheet with current listing of active and ELOA personnel
  const troopers = CAV_getPersonnel();
  var output = [['Name', 'Short Rank', 'Milpac ID', 'AO', 'Roster']];
  var AO;
  
  for (var i = 0; i < troopers.length; i++) {
    var match = troopers[i].primaryBillet.match(/(ELOA|\w\/\d-7|(Starter|Medical).*\s(\d-7))/i);
    
    if (match != null) { // If match grabs any values
      if (match[1] == 'ELOA') { // If  ELOA
        AO = 'ELOA';
      } else if (match[2] == 'Starter') { // If Starter Platoon
        AO = 'SP/'+match[3];
      } else if (match[2] == 'Medical') { // If Medical Platoon (If that makes a comeback)
        AO = 'MP/'+match[3];
      } else{ // If none of the above
        AO = match[1];
      }
    } else { // Battallion staff will also be marked as HHQ
      AO = 'HHQ';
    }
    
    output.push([
      troopers[i].name,
      troopers[i].rank.shortRank,
      troopers[i].id,
      AO,
      troopers[i].roster
    ]);
  }
  
  var sheetMilpacRef = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('milpacRef');
  sheetMilpacRef.getRange(1, 1, sheetMilpacRef.getLastRow(), output[0].length).clearContent();
  sheetMilpacRef.getRange(1, 1, output.length, output[0].length).setValues(output);
}
