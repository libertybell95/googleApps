# ACE Medical

All functions are designed to help a user easier utilize the [ACE3 Advanced Medical System](https://ace3mod.com/wiki/feature/medical-system.html)

***NOT FOR REAL LIFE APPLICATION. FOR USE IN [ARMA 3](https://arma3.com/) ONLY***

## vitalsCheck()

The vitals check function is used to assess risk for cardiac arrest on a patient

### Input

| Variable Name |  Type   |           Description           |
| :-----------: | :-----: | :-----------------------------: |
|      HR       | Integer |         ACE3 Heart Rate         |
|      BPS      | Integer | ACE3 Blood Pressure (Systolic)  |
|      BPD      | Integer | ACE3 Blood Pressure (Diastolic) |

### Output

The function will assess the vitals of a patient and assign a cardiac risk level. Explanation below:

| Cardiac Arrest Risk Level |                         Description                          |
| :-----------------------: | :----------------------------------------------------------: |
|             0             |            All vitals normal. No action required.            |
|             1             | Possible cardiac arrest if no action taken. Gives HR and BPS risk level. |
|             2             | Patient is currently in *cardiac arrest*. Tells you to begin CPR and echoes patient vitals back to you. |

Risk classifications for each type of vital can be found in this [Google Doc](https://docs.google.com/document/d/1S3bOxak-3MGunz_t46ePeMrGgpId1cbQAT5yekX7xa0/edit?usp=sharing) on page 2 under Risk Classifications
