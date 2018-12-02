function siteTools() {//For those that may stumble up on this code. This is my first project attempting object-oriented programming, enjoy. :)
  this.getCookie = function(user, pw) { // Fetches xf7cav_session cookie and assigns it to this.cookie
    var cookieOptions = {};
    
    cookieOptions.payload = {
      'login' : PropertiesService.getScriptProperties().getProperty('cavEmail'), // NOT IN USE
      'password' : PropertiesService.getScriptProperties().getProperty('cavPW'), // NOT IN USE
      'register' : 0
    };
    
    cookieOptions.options = {
      'method' : 'post',
      'payload' : cookieOptions.payload,
      'followRedirects' : false
    };
    
    cookieOptions.login = UrlFetchApp.fetch('https://7cav.us/login/login', cookieOptions.options);
    this.cookie = cookieOptions.login.getAllHeaders()['Set-Cookie'].split(';')[0]+';';
    
    return this.cookie;
  }

  this.getPage = function(URL) {//Retrieves raw HTML of page
    if ((URL.search(/7cav.us/i)) == -1.0) {throw new Error("Invalid Thread URL Entered")} //Checks that URL includes 7cav.us
    
    var options = {
      'method': 'get',
      'headers': {'Cookie': this.getCookie()},
      'followRedirects': true
    };
    
    this.HTML = UrlFetchApp.fetch(URL, options).getContentText();
    
    return this.HTML;
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

siteTools.prototype.getThreads = function(URL, pageOptions) {//Gets list of threads present on (only will get threads from 1 page, for now)
  /**
   * 
   * Input:
   *  URL {string} - URL of forum board to get.
   *  pageOptions {number} - How the functions will handle pages (Default: 0)
   *    0 - Only first page
   *    1 - All pages
   *    2 - Only last page
   * 
   * Output:
   *   threads {array} - array of threads. Each index will contain an object literal with thread information
   *   title {string} -  thread title/name
   *   id {number} - thread ID to be used when fetching URL
   *   author {string} - thread author
   *   startDate {date} - date thread was started
   *   updateDate {date} - date of threads most recent post
   * 
   */
  
  //Tests to make sure that URL is a forum board. Will throw error if trying to get Threads for main website forum
  if ((URL.search(/\/forums\/./)) == -1.0) {throw new Error("Invalid Forum URL Entered: " + URL)}
  
  this.getPage(URL);
  
  var forumContents = [];
  
  var threads = this.HTML.match(/id="thread.[\s\S]*?li>/g);
  Logger.log(threads[12]);
  for (var i in threads) {
    var thread = {};
    //Logger.log(threads[i])
    thread.title = threads[i].match(/previewUrl.*?>(.*)<\/a>/)[1];
    thread.id = threads[i].match(/previewUrl.*?\.(\d{1,})\//)[1];
    thread.author = threads[i].match(/starter..(.*)?<\/a>/)[1];
    thread.test = threads[i].match(/data-time..(\d{1,})/);
    //Logger.log(i);
    //Logger.log(thread.test);
    //thread.date = threads[i].match(/data-time..(.*)..data-diff/);
    //thread.date = thread.date[1];
    //thread.updateDate = threads[i].match(/data-time..(.*)...data-diff/gi);
    
    
    //TODO:
    // Make start date parser. 
    
    forumContents[i] = thread;
  }
  
  return forumContents;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

siteTools.prototype.parseThread = function(URL, pageOptions) {//Extracts certain information from a thread (Only will parse 1 page, for now)
  /**
   * Input:
   *  URL {string} - URL of thread to be parsed
   * 
   * Output:
   *   title {string} - Thread title
   *   id {number} - thread ID indicated in the URL
   *   threadAuthor {string} - Author of thread
   *   parentForum {string} - Name of parent forum thread is contained in
   *   dateStart {date} - timestamp for thread start
   *   posts {array} - Array containing information about each post. Each index will contain an object literal with post information
   *     author {string} - post Author
   *     date {date} - timestamp for post, in UTC
   *     contents {string} - raw HTML of the post
   *   dateUpdate {date} - date of last post
   */
  
  if ((URL.search(/\/threads\//)) == -1.0) {throw new Error("Invalid Thread URL Entered: " + URL)}
  
  var threadContents = {};
  this.getPage(URL);
  
  //OUTPUT - title
  threadContents.title = this.HTML.match(/og:title.*="(.*)\"/)[1];
  //OUTPUT - id
  threadContents.id = URL.match(/\/*(\d+)\//)[1];
  //OUTPUT - threadAuthor
  threadContents.threadAuthor = this.HTML.match(/Discussion in.*username.*?>(.*?)</)[1];
  //OUTPUT - parentForum
  threadContents.parentForum = this.HTML.match(/Discussion in.*?>(.*?)</)[1];
  //OUTPUT - dateStart
  threadContents.dateStart = new Date(parseInt(this.HTML.match(/Discussion in.*?data-time..(.*?)\"/)[1], 10) * 1000);
  
  
  //OUTPU - posts
  threadContents.posts = [];
  var content = this.HTML.match(/SelectQuoteContainer.[\s\S]*?data-diff/g); //Grabs raw HTML of each post (not content graber
  //Logger.log(content[0]);
  for (var i in content) {//Loops through each posts raw HTML and grabs pertinent information
    var post = {};//Literal that each posts information will be encapsulated in
    post.content = content[i].match(/baseHtml".([\s\S]*?)<div class="message/)[1];//Raw HTML of post content (what you see the user has typed in to make the post)
    post.author = content[i].match(/auto..(.*?)</)[1]; //Cav name of post author (Ex: Smith.J)
    post.date =  new Date(parseInt(content[i].match(/data-time..(.*)...?data-diff/)[1], 10) * 1000).toUTCString(); //Date that post was made
    
    threadContents.posts[i] = post;
  }  
  
  //OUTPUT - dateUpdate
  threadContents.dateUpdate = threadContents.posts[(threadContents.posts.length)-1].date;
  
  return threadContents;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

siteTools.prototype.getMilpac = function(ID) {//Gets information about a milpac. Does not require login
  /**
   * Author: Joshua Bell (joshuakbell@gmail.com) 
   * Description: Gets information about a milpac. Does not require login
   * 
   * Input:
   *   ID {number} - Milpac ID number. Found in trooper's milpac URL.
   *   
   * Output:
   *   fullName {string} - Trooper's full name (Ex: John Smith)
   *   rank {string} - Trooper's rank (Ex: Private First Class)
   *   primaryBillet {string} - Troopers primary position
   *   secondaryBillets {array} - Troopers primary position. Returns 'N/A' if trooper does not have any secondary billets [TODO: Parse array of billets]
   *   enlistedDate {string} - Date trooper enlisted
   *   promotionDate {string} - Date trooper was last promoted
   *   records {array} - Array containing each service record entry. Each index will be an object literal with infomration about the entry
   *     date {date} - Date of record entry, in UTC
   *     entry {string} - Record entry
   *   awards {array} - Array containing each award entry. Each index will be an object literal with information about the award
   *     date {date} - Date of award entry, in UTC
   *     name {string} - Name of award
   *     details {string} - Details for award entry
   */
  
  if (typeof ID != 'number') {throw new Error("Invalid Milpac ID entered: " + ID)}
  var HTML = UrlFetchApp.fetch('https://7cav.us/rosters/profile?uniqueid='+ID).getContentText();
  
  var rankTable = {
    'Recruit': 'RCT',
    'Private': 'PVT',
    'Private First Class': 'PFC',
    'Specialist': 'SPC',
    'Corporal': 'CPL',
    'Sergeant': 'SGT',
    'Staff Sergeant': 'SSG',
    'Sergeant First Class': 'SFC',
    'Master Sergeant': 'MSG',
    'First Sergeant': '1SG',
    'Sergeant Major': 'SGM',
    'Command Sergeant Major': 'CSM',
    'Warrant Officer 1': 'WO1',
    'Chief Warrant Officer 2': 'CW2',
    'Chief Warrant Officer 3': 'CW3',
    'Chief Warrant Officer 4': 'CW4',
    'Chief Warrant Officer 5': 'CW5',
    'Second Lieutenant': '2LT',
    'First Lieutenant': '1LT',
    'Captain': 'CPT',
    'Major': 'MAJ',
    'Lieutenant Colonel': 'LTC',
    'Colonel': 'COL',
    'Brigadier General': 'BG',
    'Major General': 'MG',
    'Lieutenant General': 'LTG',
    'General': 'GEN',
    'General of the Army': 'GOA',
  };
  
  var output = {
    fullName: HTML.match(/fullName.[\s\S]*?<dd>(.*)?<\//)[1],
    primaryBillet: HTML.match(/primaryPosition.[\s\S]*?dd>(.*)?<\//)[1],
    //secondaryBillets: HTML.match()[1], //TODO
    enlistedDate: HTML.match(/enlistedDate.[\s\S]*?dd>(.*)?<\//)[1],
    promotionDate: HTML.match(/promotionDate.[\s\S]*?dd>(.*)?<\//)[1]
  };

  var rank = HTML.match(/Rank:.[\s\S]*?dd>(.*?)<\//)[1];
  output.rank = {
    short: rankTable[rank],
    long: rank
  };
  
  var rawRecords = HTML.match(/recordList.[\s\S]*?<\/table/)[0].match(/<td.*?recordDate.[\s\S]*?<\/tr>/g);
  output.records = [];
  for (var i in rawRecords) {
    output.records.push({
      date: new Date(rawRecords[i].match(/recordDate..(.*)?<\//)[1]).toUTCString(),
      entry: rawRecords[i].match(/Details..(.*)?<\//)[1]
    });
  }
  
  var rawAwards = HTML.match(/awardList.[\s\S]*?<\/table/)[0].match(/<td.*?awardDate.[\s\S]*?<\/tr>/g);
  output.awards = [];
  for (var i in rawAwards) {
    output.awards.push({
      date: new Date(rawAwards[i].match(/awardDate..(.*)?<\//)[1]).toUTCString(),
      name: rawAwards[i].match(/<td.*awardTitle..(.*)?<\/td>/)[1],
      details: rawAwards[i].match(/awardDetails..(.*)?<\//)[1]
    });
  }
  
  return output;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

siteTools.prototype.getRoster = function(rosterID) {
  /**
   * Author: Joshua Bell (joshuakbell@gmail.com)
   * Description: gets list of all personnel on a Milpac roster. Does not require login
   * 
   * Input:
   *   URL {string} - Roster URL
   * Output:
   *  troopers {array} - Array containing information about each trooper. Each index will contain an object literal with each trooper's information
   *    rank {object} - Object literal with infomration about the troopers rank.
   *      shortRank {string} - 3 character abbreviation of the rank. (Ex: Specialist is SPC)
   *      longRank {string} - Full spelling of rank. (Ex: Specialist)
   *    name {string} - Troopers name without rank. (Ex: John Smith)
   *    id {number} - Milpac ID used in troopers Milpac URL
   *    fullName {string} - Full name with rank of trooper. (Ex: Sergeant John Smith)
   *    enlistedDate {string} - Date trooper enlisted
   *    promotionDate {string} - Date trooper was last promoted
   *    primaryBillet {string} - Trooper's primary billet
   *    AO {string} - Troopers Area of Operations (Ex: SP/1-7 or A/1-7 or HHQ)
   */
  
  if (typeof rosterID != 'number') {throw new Error('siteTools().getRoster(): invalid roster ID. Number not given');}

  var rankImageTable = { // URL number that rank represents
    '28': {shortRank: 'RCT', payGrade: 'E-1', longRank: 'Recruit'},
    '27': {shortRank: 'PVT', payGrade: 'E-2', longRank: 'Private'},
    '26': {shortRank: 'PFC', payGrade: 'E-3', longRank: 'Private First Class'},
    '25': {shortRank: 'SPC', payGrade: 'E-4A', longRank: 'Specialist'},
    '24': {shortRank: 'CPL', payGrade: 'E-4B', longRank: 'Corporal'},
    '23': {shortRank: 'SGT', payGrade: 'E-5', longRank: 'Sergeant'},
    '22': {shortRank: 'SSG', payGrade: 'E-6', longRank: 'Staff Sergeant'},
    '21': {shortRank: 'SFC', payGrade: 'E-7', longRank: 'Sergeant First Class'},
    '20': {shortRank: 'MSG', payGrade: 'E-8A', longRank: 'Master Sergeant'},
    '19': {shortRank: '1SG', payGrade: 'E-8B', longRank: 'First Sergeant'},
    '18': {shortRank: 'SGM', payGrade: 'E-9A', longRank: 'Sergeant Major'},
    '17': {shortRank: 'CSM', payGrade: 'E-9B', longRank: 'Command Sergeant Major'},
    '16': {shortRank: 'WO1', payGrade: 'W-1', longRank: 'Warrant Officer 1'},
    '15': {shortRank: 'CW2', payGrade: 'W-2', longRank: 'Chief Warrant Officer 2'},
    '14': {shortRank: 'CW3', payGrade: 'W-3', longRank: 'Chief Warrant Officer 3'},
    '13': {shortRank: 'CW4', payGrade: 'W-4', longRank: 'Chief Warrant Officer 4'},
    '12': {shortRank: 'CW5', payGrade: 'W-5', longRank: 'Chief Warrant Officer 5'},
    '11': {shortRank: '2LT', payGrade: 'O-1', longRank: 'Second Lieutenant'},
    '10': {shortRank: '1LT', payGrade: 'O-2', longRank: 'First Lieutenant'},
    '9': {shortRank: 'CPT', payGrade: 'O-3', longRank: 'Captain'},
    '8': {shortRank: 'MAJ', payGrade: 'O-4', longRank: 'Major'},
    '7': {shortRank: 'LTC', payGrade: 'O-5', longRank: 'Lieutenant Colonel'},
    '6': {shortRank: 'COL', payGrade: 'O-6', longRank: 'Colonel'},
    '5': {shortRank: 'BG', payGrade: 'O-7', longRank: 'Brigadier General'},
    '4': {shortRank: 'MG', payGrade: 'O-8', longRank: 'Major General'},
    '3': {shortRank: 'LTG', payGrade: 'O-9', longRank: 'Lieutenant General'},
    '2': {shortRank: 'GEN', payGrade: 'O-10A', longRank: 'General'},
    '1': {shortRank: 'GOA', payGrade: 'O-10B', longRank: 'General of the Army'},
  };
  
  var HTML = UrlFetchApp.fetch('https://7cav.us/rosters/?id='+rosterID).getContentText();
  var rawTroopers = HTML.match(/<li.*rosterListItem.[\s\S]*?<\/li>/g); // Gets batches of 
  
  var troopers = [];
  for (var i in rawTroopers) {
    var rank = rankImageTable[rawTroopers[i].match(/img src.*\/(\d+).jpg/)[1]];
    var fullName = rawTroopers[i].match(/href.*\s{1,}(.*)/)[1].replace(/&#039;/g,"'");
    var primary = rawTroopers[i].match(/Custom1..(.*)<\//)[1];
    
    var priMatch = primary.match(/ELOA|\w\/\d-7|(Starter|Medical).*\s(\d-7)|Retired|Discharged/i);
    var AO;
    if (priMatch != null) { // Finds what AO a person is in based off of their primary billet
      if (priMatch == 'ELOA') { // If trooper is ELOA
        AO = 'ELOA'
      } else if (priMatch[1] == 'Starter') { // If Starter && #-7 is found. Set to SP/#-7
        AO = 'SP/'+priMatch[2];
      } else if (priMatch[1] == 'Medical') { // If Starter && #-7 is found. Set to M/#-7
        AO = 'M/'+priMatch[2];
      } else if (priMatch == 'Discharged' || priMatch == 'Retired') { // If trooper is Discharged or Retired. Set to DISCH
        AO = 'DISCH';
      } else { // If not ELOA, Starter Platoon, Medical Platoon, Retired, or Discharged. Grab their ?/#-7 for AO
        AO = priMatch;
      }    
    } else { // If priMatch doesnt find any signifigant characters (Ex: A/1-7, Discharged, ELOA, Retired, etc...) assume trooper is HHQ
      AO = 'HHQ'; 
    }
    
    
    troopers.push({
      rank: rank,
      name: fullName.slice(rank.longRank.length+1),
      id: rawTroopers[i].match(/href.*?id.(\d+)"/)[1],
      fullName: fullName,
      enlistedDate: rawTroopers[i].match(/Enlisted..(.*)?</)[1],
      promotionDate: rawTroopers[i].match(/Promo..(.*)?</)[1],
      primaryBillet: primary,
      AO: AO
    });
  }
  
  return troopers;
}
