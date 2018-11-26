function negativeDays(milpacID) {// Determine negative days from a Milpac
  var records = new siteTools().getMilpac('https://7cav.us/rosters/profile?uniqueid='+milpacID).serviceRecords.reverse(); // Gets service records and reverses the order so their oldest to newest
  
  var negativeRecords = [];
  var skipCount = 0;
  for (var i in records) {
    var recordEntry = records[i].entry;
    var recordDate = records[i].date;
    if (skipCount > 0) {skipCount--; continue;}
    
    if(recordEntry.search(/(ELOA|Discharge|Discharged|Retire|Retired)/i) != -1.0) { // If start keyword is found (Case insensitive)
      if (recordEntry.search(/Military/i) != -1.0) {skipCount = 1; continue;} // If start keyword is Military ELOA skip that record and it's next one
      var localRecord = records.slice(i); // Make temporary array that contains all records that occur after the index that the start keyword was found at
      for (var q in localRecord) {
        skipCount++;
        if (localRecord[q].entry.search(/(re-en-stated|reenlited|returned|-7)/i) != -1.0) { // If '-7' is found (usually indicates a transfer) add information to negativeRecord
          var date1 = new Date(recordDate);
          var date2 = new Date(localRecord[q].date);
          var timeDiff = Math.abs(date2.getTime() - date1.getTime());
          var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
          
          negativeRecords.push({
            startEntry: recordEntry,
            startDate: recordDate,
            endEntry: localRecord[q].entry,
            endDate: localRecord[q].date,
            length: diffDays
          });
          break;
        }
      }
    }
    
  }
  return negativeRecords;
}

function promotions(milpacID) { // Gets a list of all promotions from a milpac
  milpacID = 111;
  var records = new siteTools().getMilpac('https://7cav.us/rosters/profile?uniqueid='+milpacID).serviceRecords.reverse(); // Gets service records and reverses the order so their oldest to newest
  
  var promoRecords = [];
  for (var i in records) { // Builds an array of all the records that have the paygrade listed in them
    if (records[i].entry.search(/(E|W|O)-\d/i) != -1.0) {promoRecords.push(records[i]);}
  } 
  
  var paygrades = ['E-1','E-2','E-3','E-4','E-5','E-6','E-7','E-8','E-9','W-1','W-2','W-3','W-4','W-5','O-1','O-2','O-3','O-4','O-5','O-6','O-7','O-8','O-9','O-10'];
      Logger.log(promoRecords.length);
  var output = [];
  for (var i = 0; i < promoRecords.length; i++) {
    var rankChange = '';
    var entry = promoRecords[i].entry;
    var date = promoRecords[i].date;
    var grade = promoRecords[i].entry.match(/(E|W|O)-\d/i)[0];
    
    if (i > 0 && i < promoRecords.length-1) { // If not not first or last promo record
      var lastRankIndex = paygrades.indexOf(output[i-1].paygrade);
      var currentRankIndex = paygrades.indexOf(grade);
      
      if (currentRankIndex >= lastRankIndex) {
        rankChange = 'Promotion';
      } else {
        rankChange = 'Reduction';
      }
    } else if (i == 0) { // If first promo record
      rankChange = 'Boot Camp Promotion';
    } else { // if last promo record
      rankChange = 'Current Rank';
    }
    
    output.push({
      date: date,
      entry: entry,
      paygrade: grade,
      rankChange: rankChange
    });
  }
  return output;
}
