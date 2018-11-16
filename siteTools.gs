function siteTools() {//For those that may stumble up on this code. This is my first project attempting object-oriented programming, enjoy. :)
  
  //Get Session Cookie - START || Fetches xf7cav_session cookie and assigns it to this.cookie
  this.getCookie = function() {
    this.payload = {
      'login' : PropertiesService.getScriptProperties().getProperty('cavEmail'),
      'password' : PropertiesService.getScriptProperties().getProperty('cavPW'),
      'register' : 0
    };
    this.options = {
      'method' : 'post',
      'payload' : this.payload,
      'followRedirects' : false
    };
    
    this.login = UrlFetchApp.fetch('https://7cav.us/login/login', this.options);
    this.cookie = this.login.getAllHeaders()['Set-Cookie'].split(';')[0]+';';
    
    return this.cookie;
  }

  this.getPage = function(URL) {//Retrieves raw HTML of page
    if ((URL.search(/7cav.us/i)) == -1.0) {throw new Error("Invalid Thread URL Entered")} //Checks that URL includes 7cav.us
    
    this.options = {
      'method' : 'get',
      'headers' : {'Cookie': this.getCookie()}
    };
    
    this.HTML = UrlFetchApp.fetch(URL, this.options).getContentText();
    
    return this.HTML;
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

siteTools.prototype.getThreads = function(URL, pageOptions) {//Gets list of threads present on (only will get threads from 1 page, for now)
  /*
  Input:
   URL {string} - URL of forum board to get.
   pageOptions {number} - How the functions will handle pages (Default: 0)
     0 - Only first page
     1 - All pages
     2 - Only last page
  
  Output:
    threads {array} - array of threads. Each index will contain an object literal with thread information
    title {string} -  thread title/name
    id {number} - thread ID to be used when fetching URL
    author {string} - thread author
    startDate {date} - date thread was started
    updateDate {date} - date of threads most recent post
  
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

siteTools.prototype.parseThread = function(URL) {//Extracts certain information from a thread (Only will parse 1 page, for now)
  /*
  Input:
   URL {string} - URL of thread to be parsed
  
  Output:
    title {string} - Thread title
    id {number} - thread ID indicated in the URL
    threadAuthor {string} - Author of thread
    parentForum {string} - Name of parent forum thread is contained in
    dateStart {date} - timestamp for thread start
    posts {array} - Array containing information about each post. Each index will contain an object literal with post information
      author {string} - post Author
      date {date} - timestamp for post
      contents {string} - raw HTML of the post
    dateUpdate {date} - date of last post
  */
  
  if ((URL.search(/\/threads\//)) == -1.0) {throw new Error("Invalid Thread URL Entered: " + URL)}
  
  var threadContents = {};
  this.getPage(URL);
  
  //OUTPUT - title
  threadContents.title = this.HTML.match(/og:title.*="(.*)\"/)[1];
  //OUTPUT - id
  threadContents.id = URL.match(/\.(\d{2,})\//)[1];
  //OUTPUT - threadAuthor
  threadContents.threadAuthor = this.HTML.match(/Discussion in.*username.*?>(.*?)</)[1];
  //OUTPUT - parentForum
  threadContents.parentForum = this.HTML.match(/Discussion in.*?>(.*?)</)[1];
  //OUTPUT - dateStart
  threadContents.dateStart = new Date(parseInt(this.HTML.match(/Discussion in.*?data-time..(.*?)\"/)[1], 10) * 1000);
  
  
  //OUTPU - posts
  threadContents.posts = [];
  var content = this.HTML.match(/SelectQuoteContainer.[\s\S]*?data-diff/g); //Grabs raw HTML of each post (not content graber
  for (var i in content) {//Loops through each posts raw HTML and grabs pertinent information
    var post = {};//Literal that each posts information will be encapsulated in
    post.content = content[i].match(/baseHtml".([\s\S]*?)<div/)[1];//Raw HTML of post content (what you see the user has typed in to make the post)
    post.author = content[i].match(/auto..(.*?)</)[1]; //Cav name of post author (Ex: Smith.J)
    post.date =  new Date(parseInt(content[i].match(/data-time..(.*)...?data-diff/)[1], 10) * 1000); //Date that post was made
    
    threadContents.posts[i] = post;
  }  
  
  //OUTPUT - dateUpdate
  threadContents.dateUpdate = threadContents.posts[(threadContents.posts.length)-1].date;
  
  return threadContents;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

siteTools.prototype.getMilpac = function(URL) {//Gets information about a milpac. Does not require login
  /*
  Description: Gets information about a milpac. Does not require login
  
  Input:
    URL {string} - Milpac URL
    
  Output:
    fullName {string} - Trooper's full name (Ex: John Smith)
    rank {string} - Trooper's rank (Ex: Private First Class)
    primaryBillet {string} - Troopers primary position
    secondaryBillets {array} - Troopers primary position. Returns 'N/A' if trooper does not have any secondary billets [TODO: Parse array of billets]
    enlistedDate {string} - Date trooper enlisted
    promotionDate {string} - Date trooper was last promoted
    serviceRecord {array} - Array containing each service record entry. Each index will be an object literal with infomration about the entry
      date {number} - Date of record
      entry {string} - Record entry
    awards {array} - Array containing each award entry. Each index will be an object literal with information about the award
      date {number} - Date of award entry
      name {string} - Name of award
      details {string} - Details for award entry
  */
  if ((URL.search(/rosters\/profile/)) == -1.0) {throw new Error("Invalid Milpac URL Entered: " + URL)}
  
  var HTML = UrlFetchApp.fetch(URL).getContentText();
  var output = {};
  
  output.fullName = HTML.match(/fullName.[\s\S]*?<dd>(.*)?<\//)[1];
  output.rank = HTML.match(/Rank:.[\s\S]*?dd>(.*?)<\//)[1];
  output.primaryBillet = HTML.match(/primaryPosition.[\s\S]*?dd>(.*)?<\//)[1];
  //output.secondaryBillets = HTML.match()[1]; //TODO
  output.enlistedDate = HTML.match(/enlistedDate.[\s\S]*?dd>(.*)?<\//)[1];
  output.promotionDate = HTML.match(/promotionDate.[\s\S]*?dd>(.*)?<\//)[1];
  
  var rawRecords = HTML.match(/recordList.[\s\S]*?<\/table/)[0].match(/<td.*?recordDate.[\s\S]*?<\/tr>/g);
  output.records = [];
  for (var i in rawRecords) {
    var literal = {};
    literal.date = rawRecords[i].match(/recordDate..(.*)?<\//)[1];
    literal.entry = rawRecords[i].match(/Details..(.*)?<\//)[1];
    
    output.records[i] = literal;
  }
  
  var rawAwards = HTML.match(/awardList.[\s\S]*?<\/table/)[0].match(/<td.*?awardDate.[\s\S]*?<\/tr>/g);
  output.awards = [];
  for (var i in rawAwards) {
    var literal = {};
    literal.date = rawAwards[i].match(/awardDate..(.*)?<\//)[1];
    literal.name = rawAwards[i].match(/<td.*awardTitle..(.*)?<\/td>/)[1];
    literal.details = rawAwards[i].match(/awardDetails..(.*)?<\//)[1];
    
    output.awards[i] = literal;
  }
  
  return output;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

siteTools.prototype.getRoster = function(URL) {
  /*
  Description: gets list of all personnel on a Milpac roster. Does not require login
  
  Input:
    URL {string} - Roster URL
  Output:
   troopers {array} - Array containing information about each trooper. Each index will contain an object literal with each trooper's information
     rankIcon {string} - Image URL for troopers rank
     id {number} - Milpac ID used in troopers Milpac URL
     fullName {string} - Full name with rank of trooper. (Ex: Sergeant John Smith)
     enlistedDate {string} - Date trooper enlisted
     promotionDate {string} - Date trooper was last promoted
     primaryBillet {string} - Trooper's primary billet
  */
  
  //Checks if proper roster URL has been entered
  if ((URL.search(/us\/rosters/)) == -1.0) {throw new Error("Invalid Roster URL Entered")}
  
  var HTML = UrlFetchApp.fetch(URL).getContentText();
  var rawTroopers = HTML.match(/<li.*rosterListItem.[\s\S]*?<\/li>/g);
  
  var troopers = [];
  for (var i in rawTroopers) {
    var trooper = {};
    trooper.rankIcon = rawTroopers[i].match(/src..(.*)?"/)[1];
    trooper.id = rawTroopers[i].match(/href.*?id.(\d+)"/)[1];
    trooper.fullName = rawTroopers[i].match(/href.*\s{1,}(.*)/)[1];
    trooper.enlistedDate = rawTroopers[i].match(/Enlisted..(.*)?</)[1];
    trooper.promotionDate = rawTroopers[i].match(/Promo..(.*)?</)[1];
    trooper.primaryBillet = rawTroopers[i].match(/Custom1..(.*)<\//)[1];
    
    troopers[i] = trooper;
  }
  
  return troopers;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function testing() {
  var tool = new siteTools();
  var out = tool.parseThread("https://7cav.us/threads/s6-imo-assistant-assigned.41354/").dateUpdate;
  //var out = tool.getThreads("https://7cav.us/forums/troop-transfers.35/")[3].test;
  //var out = tool.getRoster("https://7cav.us/rosters/?id=1")[56].fullName;
  //var out = tool.getMilpac("https://7cav.us/rosters/profile?uniqueid=1607").awards[0].date;
  Logger.log(out);
}
