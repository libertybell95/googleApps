function fileNameTagger(masterFolderID ,textSet, setOperation, setLocation, subFolders) {
  /*
  Name: FileNameTagger
  Author: Joshua Bell (joshuakbell@gmail.com)
  Description: Can remove or add a set of characters to the beginning or end of a set of files contained in a folder
  
  Input:
    0: ID of the folder the function is manipulating, set of characters at end of the folder URL after "/folders/"
    1: Text that will be added or removed
    2: Whether the text will be added or removed (0=Removed, 1=Added)
    3: Whether the text is at the beginning or end of the file name (0=Beginning, 1=End) [Set to 0 if removing]
    4: Whether or not the operation will be performed on the sub folders also. Will only look in 2 levels of sub-folders (0=No, 1=Yes) [Optional, will default to 0]
  */
  
  //masterFolderID = "1RY7cvfpWq9PrCRi4l6If1Yu7y_hFa"; //For debugging use, remove comment lines at beginning of line for use.
  //textSet = "[Local]"; //For debugging use, remove comment lines at beginning of line for use.
  //setOperation = 1; //For debugging use, remove comment lines at beginning of line for use.
  //setLocation = 0; //For debugging use, remove comment lines at beginning of line for use.
  //subFolders = 1; //For debugging use, remove comment lines at beginning of line for use.
  
  //Error Checking
  try {DriveApp.getFolderById(masterFolderID)} catch(error) {throw new Error("Folder ID not found");} //Checks for a proper folder ID
  if (typeof textSet != 'string') {throw new Error("textSet entered incorrectly ("+typeof textSet+")")} //Tests to ensure that textSet is a string
  if (setOperation != 0 && setOperation != 1) {throw new Error("Incorrect operation type given ("+setOperation+")")} //Checks for proper setOperation
  if (setLocation != 0 && setLocation != 1) {throw new Error("Incorrect location type given ("+setLocation+")")} //checks for proper setLocation
  if (subFolders == 'undefined') {subFolders = 0;} //Defaults subFolders input if not given by user
  
  //+++++Compile folder listing - START+++++
  function getSubFolders(parent) {
    parent = parent.getId();
    var childFolder = DriveApp.getFolderById(parent).getFolders();
    var folderArray = [];
    while(childFolder.hasNext()) {
      var child = childFolder.next();
      folderArray.push(child.getId());
      getSubFolders(child);
    }
    return folderArray;
  }
  
  function listFolders(masterFolderID) {
    var parentFolder = DriveApp.getFolderById(masterFolderID);
    var childFolders = parentFolder.getFolders();
    var outputArray = [masterFolderID];
    while(childFolders.hasNext()) {
      var child = childFolders.next();
      outputArray.push(child.getId());
      var array = getSubFolders(child);
      for (var i in array) {outputArray.push(array[i])}
    }
    return outputArray;
  }

  if(subFolders == 1) {var folderArray = listFolders(masterFolderID);} else {var folderArray = [masterFolderID];} 
  //+++++Compile folder listing - END+++++
  
  //+++++File Operation - START+++++
  for (var folderIndex in folderArray) {
    var files = DriveApp.getFolderById(folderArray[folderIndex]).getFiles();
    while (files.hasNext()) {
    var file = files.next();
    var fileName = file.getName();
      if (setOperation == 0) {//Remove text
        fileName = file.getName();
        var nameIndex = fileName.indexOf(textSet);
        if (nameIndex != -1.0) {file.setName(fileName.replace(textSet, ""));} //Ensures that text exists in name before beginning removal
      } else {//Add text
        fileName = file.getName();
        if (setLocation == 0) {//Add to beginning
          file.setName(textSet+" "+fileName);
        } else {//Add to end
          file.setName(fileName+" "+textSet);
        }
      }
    }
  }
  //+++++File Operation - END+++++
}
