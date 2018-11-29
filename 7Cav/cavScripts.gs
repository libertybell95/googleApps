// Functions for calling CavScripts external library

function CAV_getPersonnel() { // Gets an array of all personnel in the defined rosters
  var siteTools = new CavScripts.siteTools();
  
  var rosters = [
    {ID: 1, rosterType: 'Active'},
    {ID: 2, rosterType: 'ELOA'}
  ];
  
  var personnelList = [];
  for (var r in rosters) { // Create a gargantuan array of all troopers in all the rosters defined above
    var rosterTroopers = siteTools.getRoster(rosters[r].ID);
    for (var t in rosterTroopers) {
      if (rosterTroopers[t].rank.shortRank == 'RCT' || rosterTroopers[t].primaryBillet == 'New Recruit') {continue;} // Skips if rank is Recruit (RCT) or is in New Recruits pool
      rosterTroopers[t].roster = rosters[r].rosterType;
      personnelList.push(rosterTroopers[t]);
    }
  }
  
  return personnelList;
}

function CAV_getMilpac(ID) {
  if (typeof ID != 'number') {throw new Error('getMilpac(): Invalid ID number entered. >> '+ID);}
  var out = new CavScripts.siteTools().getMilpac(ID);
  return out;
}

function CAV_negativeDays(ID) {
  if (typeof ID != 'number') {throw new Error('getMilpac(): Invalid ID number entered. >> '+ID);}
  var out = new CavScripts.negativeDays(ID);
  return out;
}
