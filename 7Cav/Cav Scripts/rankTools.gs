var resultsArray = [];

function rankExtractor_Full(nameArray) {//Does things with ranks
  /*
  Name: rankExtractor_full
  Author: Joshua Bell (joshuakbell@gmail.com)
  Description: Extracts information from an array of trooper ranks/names (Ex: Corporal Kyle Bell)
  
  Input:
    nameArray {array} - Array with each index being a trooper's full rank and name (Ex: Corporal Kyle Bell)
  
  Output:
    result {array} - Array with infomration about each trooper provided in the input. Each index contains an object literal with the following key/value pairs
      fullName {string} - Full rank/name of trooper (Ex: Corporal Kyle Bell)
      trooperName {string} - Trooper name without rank (Ex: Kyle Bell)
      fullRank {string} - Full rank of the trooper (Ex: Corporal)
      shortRank {string} - 3-Digit rank of the trooper (Ex: CPL)
      rankLength {number} - Character length of the troopers fullRank (Ex: 7.0)
  */
  
  if (Array.isArray(nameArray) && typeof nameArray[0] === 'string') {} else {//Checks to make sure that an array has been entered and that first index in that array is a string value
    throw new Error("rankTools: Argument is not an array");
  }
  
  for (var i in nameArray) {
    nameArray[i].replace(/.*(Recruit|Private|Specialist|Corporal|Sergeant|Warrant|Lieutenant|Captain|Major|Colonel|General).*/,rankData);
  }
  
  function rankData(fullMatch, rankMatch) {
    /* 
    Data to assign to rankout:
    fullRank - Full rank identified (Ex: Specialist)
    shortRank - 3-letter abbreviation of the rank (Ex: Specialist is SPC)
    fullLength - character length of full rank
    */
    
    var out = {};
    out.fullName = fullMatch;
    
    switch (rankMatch) {
      case 'Recruit' : // RCT
        out.fullRank = "Recruit";
        out.shortRank = "RCT";
        break;
        
      case 'Private' : // PVT, PFC
        if (fullMatch.search(/First Class/i) != -1.0) { // Private First Class
          out.fullRank = "Private First Class";
          out.shortRank = "PFC";
        } else { // Private
          out.fullRank = "Private";
          out.shortRank = "PVT";
        }
        break;
        
      case 'Specialist': // SPC
        out.fullRank = "Specialist";
        out.shortRank = "SPC";
        break;
        
      case 'Corporal': // CPL
        out.fullRank = "Corporal";
        out.shortRank = "CPL";
        break;
        
      case 'Sergeant': // SGT, SSG, SFC, MSG, 1SG, SGM, CSM
        if (fullMatch.search(/Command Sergeant/i) != -1.0) { // Command Sergeant Major
          out.fullRank = "Command Sergeant Major";
          out.shortRank = "CSM";
        } else if (fullMatch.search(/Sergeant Major/i) != -1.0) { // Sergeant Major
          out.fullRank = "Sergeant Major";
          out.shortRank = "SGM";
        } else if (fullMatch.search(/First Sergeant/i) != -1.0) { // First Sergeant
          out.fullRank = "First Sergeant";
          out.shortRank = "1SG";
        } else if (fullMatch.search(/Master Sergeant/i) != -1.0) { // Master Sergeant
          out.fullRank = "Master Sergeant";
          out.shortRank = "MSG";
        } else if (fullMatch.search(/Sergeant First Class/i) != -1.0) { // Sergeant First Class
          out.fullRank = "Sergeant First Class";
          out.shortRank = "SFC";
        } else if (fullMatch.search(/Staff Sergeant/i) != -1.0) { // Staff Sergeant
          out.fullRank = "Staff Sergeant";
          out.shortRank = "SSG";
        } else {// Sergeant
          out.fullRank = "Sergeant";
          out.shortRank = "SGT";
        }      
        break;
        
      case 'Warrant': // WO1, CW2, CW3, CW4, CW5
        var rankNum = fullMatch.match(/Warrant Officer.(.)/i)[1];
        rankNum = parseInt(rankNum, 10);
        switch (rankNum) {
          case 1:
            out.fullRank = "Warrant Officer 1";
            out.shortRank = "WO1";
            break;
          case 2:
            out.fullRank = "Chief Warrant Officer 2";
            out.shortRank = "CW2";
            break;
          case 3:
            out.fullRank = "Chief Warrant Officer 3";
            out.shortRank = "CW3";
            break;
          case 4:
            out.fullRank = "Chief Warrant Officer 4";
            out.shortRank = "CW4";
            break;
          case 5:
            out.fullRank = "Chief Warrant Officer 5";
            out.shortRank = "CW5";
            break;
        }  
        break;
        
      case 'Lieutenant': //2LT, 1LT, LTC, LTG
        if (fullMatch.search(/General/i) != -1.0) { // Lieutenant General
          out.fullRank = "Lieutenant General";
          out.shortRank = "LTG";
        } else if (fullMatch.search(/Colonel/i) != -1.0) { // Lieutenant Colonel
          out.fullRank = "Lieutenant Colonel";
          out.shortRank = "LTC";
        } else if (fullMatch.search(/First/i) != -1.0) { // First Lieutenant
          out.fullRank = "First Lieutenant";
          out.shortRank = "1LT";
        } else { // Second Lieutenant
          out.fullRank = "Second Lieutenant";
          out.shortRank = "2LT";
        }  
        break;
        
      case 'Captain': // CPT
        out.fullRank = "Captain";
        out.shortRank = "CPT";
        out.fullLength = out.fullRank.length;
        break;
        
      case 'Major': // MAJ
        out.fullRank = "Major";
        out.shortRank = "MAJ";
        out.fullLength = out.fullRank.length;
        break;
        
      case 'Colonel': // COL
        out.fullRank = "Colonel";
        out.shortRank = "COL";
        out.fullLength = out.fullRank.length;
        break;
        
      case 'General': // BG, MG, GEN, GOA
        if (fullMatch.search(/Brigadier/i) != -1.0) { // Brigadier General
          out.fullRank = "Brigadier General";
          out.shortRank = "BG";
        } else if (fullMatch.search(/Major/i) != -1.0) { // Major General
          out.fullRank = "Major General";
          out.shortRank = "MG";
        } else if (fullMatch.search(/Army/i) != -1.0) { // General of the Army
          out.fullRank = "General of the Army";
          out.shortRank = "GOA";
        } else { // General
          out.fullRank = "General";
          out.shortRank = "GEN";
        }  
        break;
    }
    
    out.rankLength = out.fullRank.length; // Character length of the rank (Ex: Private has a length of 7.0)
    out.trooperName = fullMatch.slice(out.rankLength + 1);
    
    compileResults(out);
  }
  
  function compileResults(trooperData) {
    resultsArray.push(trooperData);
  }
  return resultsArray;
}
