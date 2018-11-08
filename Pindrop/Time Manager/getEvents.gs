function getEvents(cal) {//Grabs all events that have occured within the last 7 days and extrapolates pertinent information
  try {CalendarApp.getCalendarById(cal)} catch(error) {throw new Error("Invalid calendar ID")} //Tests for proper calendar ID
  
  function dayMath(days) {
    var date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }
  var startDate = dayMath(-30); //From last 30 days
  var endDate = dayMath(1); //From 1 day ahead. Ensures that it doesn't miss any events for the today
  
  var calendar = CalendarApp.getCalendarById(cal).getEvents(startDate, endDate); //Gets event objects that fall in between date parameters
  
  var events = [];
  for (var i in calendar) {
    var eventTitle = calendar[i].getTitle();
    if (eventTitle.indexOf(">") == -1.0) {continue;} //Checks to ensure that there is a ">" in the event. If not, that event will be ignored 
    events[i] = {
      startTime : calendar[i].getStartTime(),
      endTime : calendar[i].getEndTime(),
      date : calendar[i].getStartTime(),
      category : eventTitle.split(" > ")[0].toLowerCase(),
      name : eventTitle.split(" > ")[1]
    };
  }
  
  return(events);
  /*
  Example:
  events = [
    {date: Mon Nov 05 2018, name: email, news, startTime: 08:00:00 GMT-0600 (CST), endTime: 08:30:00 GMT-0600 (CST), category: productive non-billable},
    {date: Mon Nov 05 2018, name: weekly JIRA Call, startTime: 08:30:00 GMT-0600 (CST), endTime: 09:00:00 GMT-0600 (CST), category: cs meeting}
  ]
  */
}
