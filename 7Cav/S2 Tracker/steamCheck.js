function steamCheck() {//Checks for various information including: SteamID (x64), VAC Ban, Steam Username, Profile Privacy
  var APIkey = "CF756B189CF00EBDC54AE38C2FB3CE76";
  
  var sheetCheck = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Primary"); //Spreadsheet to check. May be converted to an input for the function
  var titleLocation = findTitle(sheetCheck, "SteamID (x64)");
  var keysRaw = sheetCheck.getRange(titleLocation.row + 1, titleLocation.column, sheetCheck.getLastRow() - titleLocation.row).getValues(); //Grabs list of API keys based on location of title
  var keyArray = [];
  
  for (var i = 0; i < keysRaw.length; i++) {keyArray.push(keysRaw[i][0]);} //Takes .getValues object and reformats into single array of API keys
  
  var literal = {}; //Established literal for future steam checkers to build libary
  var sectionLimit = 25; //Amount of steam keys that will be checked in one batch
  var countStart = 0; //Control variable, do not change
  for (var q = 0; q < Math.ceil(keyArray.length / sectionLimit); q++) {
    var currentArray = keyArray.slice(countStart, countStart + sectionLimit); //Cuts steamIDs into manageable sections
    if (currentArray[3] == "") {continue;} //Prevets the loop from processing blank cell sets
    Logger.log(currentArray);
    countStart += 25;
  
    //+++++VAC BAN CHECK - START+++++
    
    var response = UrlFetchApp.fetch("http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key="+APIkey+"&steamids="+currentArray.toString());
    response = response.getContentText();
    response = JSON.parse(response).players;
    
    var steamID;
    for (var i in response) {
      steamID = response[i].SteamId;
      literal[steamID] = {VAC : response[i].VACBanned}; //Establishes a multidimensional literal with the parent key being steam ID and all information about being contained within that literal with their own key
    }
    
    //+++++VAC BAN CHECK - END+++++
    
    //+++++USERNAME & PRIVACY CHECK - Start+++++
    var response = UrlFetchApp.fetch("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key="+APIkey+"&steamids="+currentArray.toString());
    response = response.getContentText();
    response = JSON.parse(response).response.players;
   
    for (var i in response) {
      steamID = response[i].steamid;
      literal[steamID].username = response[i].personaname;
      if (response[i].communityvisibilitystate == 3) {
        literal[steamID].privacy = "Public";
      } else {
        literal[steamID].privacy = "Private";
      }
    }
    
    //+++++USERNAME & PRIVACY CHECK - End+++++
  }
  
  //Utility to convert object into .setValues[][] readable format
  var objKeys = Object.keys(literal);
  
  var valueArray = [];
  for (var i in objKeys) {
    var row = [objKeys[i], "'" + literal[objKeys[i]].username , literal[objKeys[i]].privacy, literal[objKeys[i]].VAC]; //Builds each row that will be outputted. If adding more data to reference this should be your last step to add it's value to this array
    valueArray.push(row);
  }
  
  //Populates steamInfo sheet
  var sheetSteamInfo = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("steamInfo"); //Reference sheet for collected Steam information
  sheetSteamInfo.getRange(2, 1, sheetSteamInfo.getLastRow() - 1, sheetSteamInfo.getLastColumn()).clearContent();
  sheetSteamInfo.getRange(2, 1, valueArray.length, valueArray[0].length).setValues(valueArray);
}
