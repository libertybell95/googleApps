function copyCleaner() {//Removes "Copy of " from all files in a folder
  var folderID = "1RY7cvfpWq9PrCRi4l6If1Yu7y_hFa-I7"; //ID of the folder, set of characters at end of the folder URL after "/folders/"
  
  var folder = DriveApp.getFolderById(folderID);
  var files = folder.getFiles();
  
  while (files.hasNext()) {
    var file = files.next();
    
    if (file.getName().slice(0,8) == "Copy of ") {
      var fileName = file.getName();
      file.setName(fileName.slice(8, fileName.length));
    }
  } 
}
