function identifyReport(folderID, dayWindow) {
  /*
  Name: identifyReport
  Author: Joshua Bell (joshuakbell@gmail.com)
  Description: Identifies which files to include in the report compilier. Each Filename must contain a 6 digit date code (YYMMDD). Ex: 9 November 2018 is 181109
  Input:
    0 - String | Google Drive folder ID to be checked. Must be individual ID
    1 - Integer | Filter to detemine how many days before today will be included

  Output:
    0 - literal | literal of all files within specified folder to include in folder compilier
  */
  //dayWindow = 7; //DEBUGGING VARIABLE
  
  //Grabs fileName, fileID, and name of the folder that the file is contained in of each file in the folder and pushes it as a literal into the fileBatch array
  var folder = DriveApp.getFolderById(folderID).getFiles();
  var fileBatch = [];
  while(folder.hasNext()) {
    var file = folder.next();
    var literal = {
      name : file.getName(),
      id : file.getId(),
      folder: file.getParents().next().getName()
    };
    fileBatch.push(literal);
  }
  
  //Isolates the 6 digit date stamp from each file name and converts it into a Javascript date object. Appends to the file's literal contained witin the fileBatch array
  var currentYear = new Date().getFullYear().toString(); //Current year represented as a string
  for (var i in fileBatch) { 
    var index = fileBatch[i].name.indexOf(currentYear.slice(2)); //Grabs the last 2 digits off of the full year: 2018 -> 18
    if (index == -1.0) {continue;} //Skips if does not have current year in filename
    
    var dateName = fileBatch[i].name.slice(index, index+6); //Finds current year in the fileName and isolates 6 digit date stamp based off year location
    var date = currentYear.slice(0,2)+dateName.slice(0,2)+"-"+dateName.slice(2,4)+"-"+dateName.slice(4,6); //Complicated date formatting
    date = Date.parse(date); //converts YYYY-MM-DD date string into date object
    
    fileBatch[i].date = date; //Appends date to file's literal container in fileBatch array
  }
  
  //Defines date object for date limit
  var dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - dayWindow);
  
  //If file does not meed date limit, it removes it from the fileBatch array
  for (var i in fileBatch) {
    if (fileBatch[i].date <= dateLimit) {fileBatch.splice(i, 1);}
  }
  
  return(fileBatch);
  /*
  Example
  fileBatch = [
    {name : "Report 181105.docx", id : "otWOlGvOCT6fC4fXWCRHc", folder : "1sn5oWtDwYLO06i1yvKuKOWpJedksOPEu", date: -1.0015831},
    {name : "181030 Report.docx", id : "M3wnVC5Eq2w0X8LJiX0wQiOSOOL", folder : "1_fzoHyJx95NVyhuN3DnlGpJNhMcjmkju", date: 1.00518684}
  ]
  */
}
