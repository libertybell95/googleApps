function vitalsCheck(HR, BPS, BPD) {
  /*
  /*
  Name: vitalsCheck
  Author: Joshua Bell (joshuakbell@gmail.com)
  Reference Document: https://docs.google.com/document/d/1S3bOxak-3MGunz_t46ePeMrGgpId1cbQAT5yekX7xa0/edit?usp=sharing
  Description: Checks vitals provided and asseses risk for cardiac arrest in ACE 3 Medical. NOT FOR REAL LIFE APPLICATION, FOR USE IN ARMA 3 ONLY. Built for integration into Google Home Mini smart assistant.
  
  Input:
    0: Heart Rate [Number]
    1: Blood Pressure - Systolic [Number]
    2: Blood Pressure - Diastolic [Number]
    
  Output:
    0: Vitals report. If all signs are normal then function will say all normal. If risk for cardiac arrest is high function will say what components are attributing to the heightened risk. If patient is in cardiac arrest function will command to begin CPR and say what cause patient to go into cardiac arrest [String]
  
  *
  
  var HRLevel; //Heart Rate. Levels are: Very Low, Low, Normal, High, Very High, Extra High
  var BPSLevel; //Blood Pressure (Systolic). Levels are: Very Low, Low, Normal, High, Very High
  var BPDLevel; //Blood Pressure (Diastolic). Levels are: Low, Normal
  var cardiacArrest; //Cardiac Arrest risk | 0: None, 1: Possible, 2: Immediate
  
  //Control varables. For testing only.
  //HR = 180;
  //BPS = 140;
  //BPD = 100;
  
  //else-if chain to establish HRLevel
  if (HR <= 20) {
    HRLevel = "Very Low"; 
  } else if (HR <= 45) {
    HRLevel = "Low"; 
  } else if (HR <= 119) {
    HRLevel = "Normal"; 
  } else if (HR <= 159) {
    HRLevel = "High"; 
  } else if (HR <= 199) {
    HRLevel = "Very High"; 
  } else {
    HRLevel = "Extra High"; 
  }
    
  //else-if chain to establish BPSLevel
  if (BPS <= 20) {
    BPSLevel = "Very Low"; 
  } else if (BPS <= 100) {
    BPSLevel = "Low"; 
  } else if (BPS <= 160) {
    BPSLevel = "Normal"; 
  } else if (BPS <= 259) {
    BPSLevel = "High"; 
  } else {
    BPSLevel = "Very High"; 
  }
  
  //Establish BPDLevel
  if (BPD <= 40) {
    BPDLevel = "Low";
  } else {
    BPDLevel = "Normal";
  }
  
  
  var broadcast = {//Specific mesasges to broadcast. Options: HR, BPS, BPD
    HR: "",
    BPS: "",
    BPD: ""
  };
  
  //Heart Rate checker
  switch (HRLevel) {
    case 'Very Low':
      cardiacArrest = 2;
      broadcast.HR = "Heart rate below 20. ";
      break;
    case 'Low':
      cardiacArrest = 0;
      break;
    case 'Normal':
      cardiacArrest = 0;
      break;
    case 'High':
      cardiacArrest = 1;
      if(HR > 150 && BPS > 145) {//Checks for immediate cardiac arrest
        cardiacArrest = 2;
        broadcast.HR = "Heart rate above 150. ";
        broadcast.BPD = "Systolic above 145. ";
      }
      break;
    case 'Very High':
      cardiacArrest = 1;
      if(HR > 190 && BPD < 40) {//Checks for immediate cardiac arrest
        cardiacArrest = 2;
        broadcast.HR = "Heart rate above 190. ";
        broadcast.BPD = "Diastolic below 40. ";
      }
      break;
    case 'Extra High':
      cardiacArrest = 2;
      broadcast.HR = "Heart rate above 200. ";
      break;
  }
  
  switch (BPSLevel) {
    case 'Very Low':
      cardiacArrest = 2;
      broadcast.BPS = "Systolic below 20. Patient dead. ";
      break;
    case 'Low':
      break;
    case 'Normal':
      if (BPS > 145) {
        cardiacArrest = 1;
      }
      break;
    case 'High':
      break;
    case 'Very High':
      broadcast.BPS = "Systolic Above 260";
      break;
  }
  
  switch (cardiacArrest) {
    case 0:
      var treatment = "All vitals normal";
      break;
    case 1:
      var treatment = "Possible cardiac arrest. Heart "+HRLevel+". Systolic "+BPSLevel;
      break;
    case 2:
      var treatment = "Cardiac arrest. Begin C P R. "+broadcast.HR+broadcast.BPS+broadcast.BPD;
  }
  
  //Debugging, for testing only.
  //Logger.log("Cardiac Arrest: "+cardiacArrest);
  //Logger.log("HR Level: "+HRLevel);
  //Logger.log("BPS Level: "+BPSLevel);
  //Logger.log("BPD Level: "+BPDLevel);
  //Logger.log(treatment);
  
  return(treatment);
}
