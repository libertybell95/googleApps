function dateMath(startDate, var2) {
  /**
   * Author: Joshua Bell (joshuakbell@gmail.com) 
   * Description: Calculates either difference in days between 2 dates. 
   *   Or calculates the date for the amount of days after a given date
   * 
   * If var2 is a NUMBER, dateMath() will return the date that is +- the
   * startDate. For example: if startDate is 1 January 2018 and var2 is 
   * 3, then the function will return 4 January 2018 as a Date object.
   * 
   * If var2 is a DATE OBJECT, dateMath() will return the difference
   * between var2 and startDate in days. For Example: if startDate is
   * 01 January 2018 and var2 is 04 January 2018, then the function will
   * return the the number 3.
   * 
   * If a second arguent is entered that is undefined then then function
   * will return an error.
   */
  
  startDate = new Date(startDate);
  if (typeof var2 == 'object' || typeof var2 == 'string') { // Calculated difference if var2 is a date (object or string)
    var date2 = new Date(var2);
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
    return diffDays;
  } else if (typeof var2 == 'number') {
    var result = startDate;
    startDate.setDate(startDate.getDate() + var2);
    return result;
  } else {
    return 'Invalid second argument entered. Try again :)';
  }
}
