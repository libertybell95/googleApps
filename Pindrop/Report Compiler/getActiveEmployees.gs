function getActiveEmployees() {//Gets list of active employees
  /*
  Name: getActiveEmployees
  Author: Joshua Bell (joshuakbell@gmail.com)
  Description: Gets a list of active employees from a table that has the format of:
    Name | Email | Position | Status

  Output:
    0 - <OutputType> | <OutputDescription>
  */
  var sheetEmployeeList = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Employee List"); //Grabs sheet called employee list
  var selection = sheetEmployeeList.getRange(2, 1, sheetEmployeeList.getLastRow(), 4).getValues(); //Ignores title row
  
  var activeEmployees = []; 
  for (var i in selection) {//Creates new list with only active employees. Does not include supervisors
    if(selection[i][3] != 'Active' || selection[i][2] != 'Employee') {continue;}
    selection[i].splice(2, 2);
    activeEmployees.push(selection[i]);
  }
  
  return(activeEmployees);
}
