function directoryDuplicator(originFolder, destinationFolder, createFolder, removeCopyTo) {
  /*
  Name: directoryDuplicator
  Author: Joshua Bell (joshuakbell@gmail.com)
  Description: Duplicates a folder and places it in a defined destination folder
  
  Input:
    0: Folder ID to copy from / Origin folder
    1: Destination folder ID
    2: (Optional) Create new folder for copied items and place copied items created folder [0-No, 1-Yes] (Default: No)
    3: (Optional) Remove 'Copy to' from beginning of copied files [0-No, 1-Yes] (Default: Yes)
  */
  //Debugging - START (Remove comments at beginning of lines for use)
  //originFolder = "19JMRI_Nz2FSpyDvaFUl5gHXlXGANY8P2";
  //destinationFolder = "1U4JL5R-xhCQUEbSeb5P6_vwqsRX69MKs";
  //createFolder = 1;
  //removeCopyTo = 1;
  //Debugging - END
  
  //Error Checking & Defaults - START
  try{DriveApp.getFolderById(originFolder)} catch(error) {throw new Error("Origin folder not found");} //Correct origin folder check
  try{DriveApp.getFolderById(destinationFolder)} catch(error) {throw new Error("Destination folder not found");} //Correct destination folder check
  if (createFolder == null) {createFolder = 0;} //createFolder default
  if (removeCopyTo == null) {removeCopyTo = 1;} //removeCopyTo default
  //Error Checking & Defaults - END
  
  originFolder = DriveApp.getFolderById(originFolder);
  destinationFolder = DriveApp.getFolderById(destinationFolder);
  
  //createFolder - START
  if (createFolder == 1) {
    destinationFolder = destinationFolder.createFolder(originFolder.getName());
  }
  //createFolder - END
  
  //Document Copying - START
  var files = originFolder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    var fileName = file.getName();
    if (removeCopyTo == 1) {
      file.makeCopy(fileName, destinationFolder)
    } else {
      file.makeCopy(destinationFolder)
    }
  }
  //Document Coptying - END
}
