function createFolders() {//Creates and shares folders for new employees
  var parentFolder = DriveApp.getFolderById("1sn5oWtDwYLO06i1yvKuKOWpJedksOPEu"); //Location where new employee folders will be placed
  
  var activeEmployees = getActiveEmployees();
  
  //Gets list of folders already created
  var existingFolders = parentFolder.getFolders();
  var folders = [];
  while (existingFolders.hasNext()) {
    var folder = existingFolders.next()
    folders.push(folder.getName());
  }
  
  var foldersNeeded = [];
  for (var i in activeEmployees) {//Checks for which employees do not already have a folder
    var search = folders.indexOf(activeEmployees[i][0]);
    if (search == -1.0) {
      foldersNeeded.push(activeEmployees[i]);
    }
  }
  
  for (var i in foldersNeeded) {//Creates new folders and shares with employee
    var newFolder = parentFolder.createFolder(foldersNeeded[i][0]);
    //newFolder.addEditor(foldersNeeded[i][1]); //Commented out during development, to prevent spam of personal email
  }
  
  Logger.log(foldersNeeded);
}
