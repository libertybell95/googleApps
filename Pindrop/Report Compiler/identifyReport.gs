function identifyReport(folderID, dayWindow) {//Identifies which employee report to use. Sees most recent'
  /*
  Filenames much contain a 6 digit date code (YYMMDD). Ex: 9 November 2018 is 181109
  */
  var folder = DriveApp.getFolderById(folderID).getFiles();
  //dayWindow = 7; //DEBUGGING VARIABLE
  
  var fileBatch = [];
  while(folder.hasNext()) {//Grabs filename and id of each file in the folder
    var file = folder.next();
    var literal = {
      name : file.getName(),
      id : file.getId(),
      folder: file.getParents().next().getName()
    };
    fileBatch.push(literal);
  }
  
  
  //Grabs and assigns date value the file literal
  var currentYear = new Date().getFullYear().toString(); //Current year represented as a string
  for (var i in fileBatch) { 
    var index = fileBatch[i].name.indexOf(currentYear.slice(2));
    if (index == -1.0) {continue;} //Skips if does not have current year in filename
    
    var dateName = fileBatch[i].name.slice(index, index+6);
    var date = currentYear.slice(0,2)+dateName.slice(0,2)+"-"+dateName.slice(2,4)+"-"+dateName.slice(4,6); //Complicated date formatting
    date = Date.parse(date);
    
    fileBatch[i].date = date;
  }
  
  var dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - dayWindow);
  
  for (var i in fileBatch) {
    if (fileBatch[i].date <= dateLimit) {fileBatch.splice(i, 1);}
  }
  
  return(fileBatch);
}
