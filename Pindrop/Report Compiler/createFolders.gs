function createFolders() {//Creates and shares folders for new employees
  /*
  Name: createFolders
  Author: Joshua Bell (joshuakbell@gmail.com)
  Description: Creates and shares folders for new employees
  */
  
  var parentFolder = DriveApp.getFolderById("1sn5oWtDwYLO06i1yvKuKOWpJedksOPEu"); //Location where new employee folders are located
  var activeEmployees = getActiveEmployees();
  
  //Gets list of folders already created in parentFolder
  var existingFolders = parentFolder.getFolders();
  var folders = [];
  while (existingFolders.hasNext()) {
    var folder = existingFolders.next()
    folders.push(folder.getName());
  }
  
  //Figures out which employees have do not have a employee folder created (based on their name) and adds them to foldersNeeded
  var foldersNeeded = [];
  for (var i in activeEmployees) {
    var search = folders.indexOf(activeEmployees[i][0]);
    if (search == -1.0) {
      foldersNeeded.push(activeEmployees[i]);
    }
  }
  
  //Creates new folders and shares them with employees (add Editor in Google Drive)
  for (var i in foldersNeeded) {
    var newFolder = parentFolder.createFolder(foldersNeeded[i][0]);
    //newFolder.addEditor(foldersNeeded[i][1]); //Commented out during development, to prevent spam of personal email
  }
  
  //Logger.log(foldersNeeded);
}
