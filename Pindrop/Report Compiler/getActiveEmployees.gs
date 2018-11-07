function getActiveEmployees() {//Gets list of active employees
  var sheetEmployeeList = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Employee List");
  var selection = sheetEmployeeList.getRange(2, 1, sheetEmployeeList.getLastRow(), 4).getValues(); 
  
  var activeEmployees = []; 
  for (var i in selection) {//Creates new list with only active employees. Does not include supervisors
    if(selection[i][3] != 'Active' || selection[i][2] != 'Employee') {continue;}
    selection[i].splice(2, 2);
    activeEmployees.push(selection[i]);
  }
  
  return(activeEmployees);
}
