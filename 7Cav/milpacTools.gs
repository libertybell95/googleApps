function negativeDays(milpacID) {
  /**
   * Author: Joshua Bell (joshuakbell@gmail.com)
   * Description: Gets a list of all negative days that a trooper has based off of their milpac service record. Negative days count as any time spend discharged or on (non-military) ELOA
   *
   * Input:
   *   milpacID {number} - Valid Milpac ID. Found in Milpac URL
   * 
   * Output:
   *   this {array} - Array with each index contatining an object literal with information about the negative days.
   *     startEntry {string} - Service record where negative day entry started
   *     startDate {string} - Date when negative day entry started
   *     endEntry {string} - Service record where negative day entry ended
   *     endDate {string} - Date when negative day entry ended
   *     length {number} - Number of days between endDate and startDate
   *
   * Example of output converted to JSON format for milpacID 446: https://pastebin.com/VcmtiAdF
   */
  var records = new siteTools().getMilpac('https://7cav.us/rosters/profile?uniqueid='+milpacID).serviceRecords.reverse(); // Gets service records and reverses the order so their oldest to newest
  
  var startTerms = [ // Start terms to search for, search will be case insensitive.
    'ELOA',
    'Discharge',
    'Discharged',
    'Retire',
    'Retired'
  ];
  
  var endTerms = [ // End terms to search for, search will be case insensitive.
    're-en-stated',
    'reenlisted',
    'returned',
    '-7'
  ];
  
  function getTermRegex(termsArray) { // Creates regular expresssion based off of terms given.
    var regex = "";
    for (var i = 0; i < termsArray.length; i++) { // Appends terms together with a pipe seperating each. If last term, will not put pipe after term
      if (i == termsArray.length-1) {
        regex += termsArray[i];
      } else {
        regex += termsArray[i]+'|';
      }
    }
    regex = new RegExp(regex,'i');  
    return regex;
  }
  
  var negativeRecords = [];
  var skipCount = 0;
  for (var i in records) {
    var recordEntry = records[i].entry;
    var recordDate = records[i].date;
    if (skipCount > 0) {skipCount--; continue;}
    
    if(recordEntry.search(getTermRegex(startTerms)) != -1.0) { // If start keyword is found (Case insensitive)
      if (recordEntry.search(/Military/i) != -1.0) {skipCount = 1; continue;} // If start keyword is Military ELOA skip that record and it's next one
      var localRecord = records.slice(i); // Make temporary array that contains all records that occur after the index that the start keyword was found at
      for (var q in localRecord) {
        skipCount++;
        if (localRecord[q].entry.search(getTermRegex(endTerms)) != -1.0) { // If '-7' is found (usually indicates a transfer) add information to negativeRecord
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

function rankChanges(milpacID) {
  /**
   * Author: Joshua Bell (joshuakbell@gmail.com)
   * Description: Gets a list of all rank changes from a troopers milpac
   *
   * Input:
   *   milpacID {number} - Valid Milpac ID. Found in Milpac URL
   * 
   * Output:
   *   this {array} - Array with each index contatining an object literal with information about each rank change.
   *     date {string} - Date of rank change service record entry
   *     entry {string} - Service record entry of rank change
   *     paygrade {string} - Paygrade of rank change (Ex: E-2)
   *     rankChange {string} - What type of rank change. Possible values are: Boot Camp Promotion, Current Rank, Promotion, Reduction
   *
   * Example of output converted to a JSON format for milpacID 446: https://pastebin.com/iMwgViNf
   */
  
  var records = new siteTools().getMilpac('https://7cav.us/rosters/profile?uniqueid='+milpacID).serviceRecords.reverse(); // Gets service records and reverses the order so their oldest to newest
  var paygrades = ['E-1','E-2','E-3','E-4','E-5','E-6','E-7','E-8','E-9','W-1','W-2','W-3','W-4','W-5','O-1','O-2','O-3','O-4','O-5','O-6','O-7','O-8','O-9','O-10'];
  
  var promoRecords = [];
  for (var i in records) { // Builds an array of all the records that have the paygrade listed in them
    if (records[i].entry.search(/(E|W|O)-\d/i) != -1.0) {promoRecords.push(records[i]);}
  } 
  
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
