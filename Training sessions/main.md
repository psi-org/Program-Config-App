# About this training

## Introduction
Welcome to the HNQIS 2.0 Configuration Training. We hope you find the sessions of great use!
This training consists of multiple sessions that focus on the HNQIS 2.0 programs configuration and setup.

## Training plan
You will follow a series of guided exercises that will get you through the basics of HNQIS2 programs and let you create new programs in no time!

The exercises are distributed in sessions to help you assimilate the concepts. Also, we've taken special care in detailing the steps so you can follow the process by yourself in case you want to take your time to practice later.

The training sessions are detailed and available below:
- [Session #1: Starting with the Program Config App & HNQIS2](#session-1-starting-with-the-program-config-app--hnqis2)
- [Session #2: Updating checklists & Setting Parents Logic]()
- [Session #3: Customization of HNQIS2 programs (TBD)]()

# Session #1: Starting with the Program Config App & HNQIS2

## Objectives

- To check the available features of the "Program Config App" on its v1.0 so all the participants will be able to use those features in HNQIS checklist configurations.
- To describe the usage of the Unified Configuration Template for building and making changes of HNQIS2 enabled programs hosted in DHIS2 servers.
  
## Agenda

* Welcome & Introduction (RM) [10 min]
* Quick overview of the Unified Configuration Template (ML) [5 min]
* Overview of the Program Config App (FG) [5 min]
* Instructions for the Guided Exercises (ML) [5 min]
* Guided Exercise: Creating a new checklist (ML & FG) [40 min]
* Q&A (ML & FG) [15 min]
* Closure (RM) [10 min]

## Instructions
### Work Environment

**Work server:** [https://236dev.psi-mis.org](https://236dev.psi-mis.org)

**Username:** *\<First letter of your name\>\<Your last name\>*.h2t

**Password:** H2Training2022.

>**NOTE:**
>
>Please make sure you change your password when you Log In for the first time.

**Examples of some usernames:**
* Mario López -> mlopez.h2t
* Fernando Gómez -> fgomez.h2t

### Participant usernames

| Participant  | Username  |
|---|---|
|Abdi Ali Abdi| aabdi.h2t|
|Adam Qodax | aqodax.h2t |
|Aleck Dhliwayo | adhiliwayo.h2t|
|Amber Sheets | asheets.h2t|
|Ana María Espinoza| aespinoza.h2t|
|Cristina Lussiana | clussiana.h2t|
|Frackson Shaba| fshaba.h2t|
|Herald Luwizghie | hluwizghie.h2t|
|James Omutsani | jomutsani.h2t|
|Leslie Bidi | lbidi.h2t|
|Luigi Nunez | lnunez.h2t|
|Rodolfo Melia | rmelia.h2t|
|Ruth Mwende | rmwende.h2t|
|Victor Mutoma | vmutoma.h2t|

## Guided Exercise: Creating a new checklist
To start working on this excercise access to the **Program Config App** from your *Apps Menu*.

This guide consists of 8 steps to help you create a new HNQIS2 enabled program. The steps are the following:
1. [Create a new HNQIS2 program](#1-create-a-new-hnqis2-program)
2. [Download the Unified Configuration Template](#2-download-the-unified-configuration-template)
3. [Edit the Template](#3-edit-the-template)
4. [Save changes](#4-save-changes)
5. [Import the Template](#5-import-the-template)
6. [Validate and Save](#6-validate-and-save)
7. [Set up program (Run Magic)](#7-set-up-program-run-magic)
8. [Assign Org Units & Test the program](#8-assign-org-units--test-the-program)

### 1. Create a new HNQIS2 program
To create a new program with the necessary configurations for HNQIS2 you have to click on the "Add Program" button in the PCA menu bar (gray ![#f8f8f8](https://via.placeholder.com/15/f8f8f8/000000?text=+)) under the DHIS2 menu bar (blue ![#2c6693](https://via.placeholder.com/15/2c6693/000000?text=+)).

![img_ts1_1](https://drive.google.com/uc?export=view&id=1pLYkNwXMpkegmNalw1FmBGqqkMl_7Ynl)

**After clicking the "Add program" button**, a window will prompt you to enter some data, please fill it as described below.

* **Program Data Element Prefix:** HNQIS2 *\<username\>*
* **Name:** Training1 HNQIS2 *\<username\>*
* **Short Name:** Training1 HNQIS2 *\<username\>*
* **Use competency:** *Yes*
* Select **any** Health Area

![img_ts1_2](https://drive.google.com/uc?export=view&id=1quDDRuk35-WjUE04t7Hr-5iUaJuqFmn6)

Once that's done, **click the "Submit"** button to save your configurations and then check that your program appears in the programs listing of the PCA.

![img_ts1_3](https://drive.google.com/uc?export=view&id=1eyqdhAYh64FIFhGTwY7D8eUL5pP1zYao)

>**NOTE:**
>
>Make sure that the program you created has exactly two program stages. We also suggest that you check later the program configurations in the Maintenance App so you can identify some of the key components in a HNQIS2 enabled program.

### 2. Download the Unified Configuration Template

Once you have identified your program in the *List of programs* of the PCA, **click on the > icon** that appears on the far right of your program (next to the program stages count) to access the *List of program stages*.

![img_ts1_4](https://drive.google.com/uc?export=view&id=1-EZtJPTB7bOnBYkK0cV5-1V2zH2VplHi)

The program stages listing has the same layout of the programs listing, the main difference is that the stages display a program stage sections count on the far right.

![img_ts1_5](https://drive.google.com/uc?export=view&id=1sxv6WSQayMKdjNyKS20322xJvKUdU1E_)

You may also notice that in the PCA menu bar the name of the program appears after **Home**, this is the *Navigation Bar*. You can click on **Home** to return to the programs listing, and it can help you identify which part of the app you're currently in.

After you're familiar with the layout yo can proceed to the Assessment stage of the HNQIS2 program, which you can identify as:

```
<Program Data Element Prefix>_Assessment
```

**Click on the > icon** on the far right to access the stage.

>**NOTE:**
>
>Currently the PCA only allows you to access stages that contain program stage sections, so in this version you won't be able to access the Action Plan section.

Once you access the Assessment stage you'll notice a much more different layout in the PCA menu bar. The left-most part of the menu bar still displays the navigation bar, while the other side displays a new set of buttons described below:

* **Validate** or **Validate & Save**: This button will initally display "Validate", but if you make any changes the button will change to "Validate & Save". This button validates all the *metadata in the server* (hence the **Save** when changes are made) used by the program, displaying any errors in a "Validation Errors" section.
* **Set up program** (Magic button): This button generates all the Program Rules logic configured in the Program and Data Elements. This button is only enabled after the validation has passed.
* **Download Template**: Exports the program configurations into the Excel Template and downloads the file.
* **Import Template**: Allows to upload an Excel Template to import configurations into the server.
* **Reload**: Reloads the content of the PCA.

![img_ts1_6](https://drive.google.com/uc?export=view&id=1mRXr0B7jCHuzqy_IPMiCRL8amvFtVtsm)

The sections are rendered in a similar way as the programs and stages, but we'll explore that part later.

To download the template of our new program let's **click on the "Download Template" button** and open the downloaded file.

![img_ts1_7](https://drive.google.com/uc?export=view&id=1thFf1afJVpS0CxCyvPqNOhv5cAduXwsw)

>**NOTE:**
>
>You'll notice that two files are downloaded, this is a small bug in the current version of the PCA. Both files are exactly the same, so you can delete one of those.

### 3. Edit the Template

This template uses four type of elements defined by the value selected in the "Structure" column. The possible values are listed below:

* **Section:** Every row under a section corresponds to that section until a new one is found.

* **label:** The row will be treated as a label.

* **question:** The row will be treated as a question.

* **score:** The row will be treated as a score.

![img_ts1_8](https://drive.google.com/uc?export=view&id=1JCvn9tKYvc0_P5UNqTbpnXrU6a4duFdi)

#### **Steps to complete the checklist in the Excel file**

1. Make sure you're working on the **Template tab** in the Excel file. Then change the "Default" section name to:
    
    ```
    General Information
    ```
2. Add a ***label*** under "General Information" with the following text:
    
    ```
    For this test assessment you will be able to experience the main features of HNQIS 2.0. Please provide the requested information.
    ```
    > **NOTE:**
    >
    > Remember to select ***label*** in the **Structure** column. Consider that the Value Type for labels is ***LONG_TEXT***.
    
    You may have noticed that the **Value Type** column was highlighted in red as soon as you selected ***label***. This is the representation of validation errors in the Template, you will be able to check a list of all those validations in the HNQIS2 General Wiki in the future.

3. Next, we will **add two questions right after the label we just created** considering the following requirements:
    * An *open* "TEXT" ***question*** with the following text:  
        
        ```
        Name of the evaluator
        ```
        Add a Compositive Indicator of **1.1** to this question.

        > **NOTE:**
        >
        > Remember to set the Value Type as ***TEXT*** and make sure that there is no Option Set selected.

    * A mandatory (compulsory) "TEXT" ***question*** with the Option Set "HNQIS - RealSimulated" and the text:
        
        ```
        Is this a Real or Simulated assessment?
        ```
        Add a Compositive Indicator of **1.2** to this question.

        > **NOTE:**
        > * For the ***Compulsory*** column, you can decide wether your questions will be required or not during the assessment. Select "Yes" to make a question mandatory or select "No" (or leave it blank) otherwise.
        >
        > * ***Feedback Text*** and ***Description*** columns are free text fields that can be filled when required but are not required.


4. In some cases, questions in a checklist need to be grouped into different sections so users can identify to which topic the questions belong to. Let's add a new ***Section*** with the name:

    ```
    Facility Evaluation
    ```
    Make sure that this section is right after the ***General Information*** section and that you're not replacing the ***Scores*** section.

    > **NOTE:**
    >
    > The ***Scores*** section should not be modified. We also recommend keeping it after every other section in the checklist.

5. Now, let's add some questions to the ***Facility Evaluation*** section:
    * A critical and compulsory ***question*** with the option set "HNQIS - Yes1No0" with the following text:
        
        ```
        Performs a correct trash disposal according to biological guidelines?
        ```
        - Use "HNQIS - YesNo" as legend for this question.
        - Add a Compositive Indicator of **2.1** to this question.
        - Use **1** for both Numerator and Denominator.
  
    </br>
    
    * A critical but non-compulsory ***question*** with the option set "HNQIS - Yes1No0" with the following text:
        
        ```
        Explains the interpretation of results with reference for the client
        ```
        - Use "HNQIS - YesNo" as legend for this question.
        - Add a Compositive Indicator of **2.2** to this question.
        - Use **1** for both Numerator and Denominator.

    </br>
    
    * A non-critical and non-compulsory ***question*** with the option set "HNQIS - Yes1No0" with the following text:
        
        ```
        Demonstrates confidence and professionalism?
        ```
        - Use "HNQIS - YesNo" as legend for this question.
        - Add a Compositive Indicator of **2.3** to this question.
        - Use **1** for both Numerator and Denominator.

        </br>

        > **NOTE:**
        >
        > When using an Option Set in a question, make sure that the question's Value Type matches the Option Set's. For instance, in this exercise "HNQIS - Yes1No0" has "NUMBER" as Value Type. In the future we plan to add a feature to automate this step.

6. Now we have to add the final touches to our first HNQIS2 checklist. Let's proceed to the "Scores" section and we will add two scores (one for each section we created). Make sure you configure both as described:

    * In the first row under "Scores" select ***score*** in the **Structure column**, and add the following text:
        
        ```
        General Information
        ```
    
        - Add a Compositive Indicator of **1** to this score.
        - Select ***NUMBER*** in the Value Type column.

    * In the next row select ***score*** once again, and add the following text:
        
        ```
        Facility Evaluation
        ```
    
        - Add a Compositive Indicator of **2** to this score.
        - Select ***NUMBER*** in the Value Type column.

    </br>
    
    You may have noticed that our scores in this example are all integer values (1 and 2), and the questions that contribute to those scores are a sequence nested into the score value (2.1, 2.2, 2.3, etc.). You can create a score of for a potential third and fourth sections with the value 3.1 and another for 3.2, and both sections would contribute to a score of 3 **(you aren't limited to integer scores)**. And you can even keep nesting scores as much as you like!

    Questions that contribute to the score 3.1 would follow a sequence like 3.1.1, 3.1.2, 3.1.3, and so on. The same applies to score 3.2, where questions would follow a sequence of 3.2.1, 3.2.2, 3.2.3, etc.

    > **NOTE:**
    > * The Compositive Indicators sequence must be continuous, this means that **there cannot exist any gaps in the Compositive Indicators**. For example: the sequence [ 2.1, 2.2, 2.4 ] is wrong, because 2.3 is missing.
    >
    > * If you want a section to appear in the **Feedback** of an Assessment a score for that section must exist. **Even if there are no scored questions in that section!**

7. Lastly, drag the formula in **cell A3** of your worksheet up until you reach the last row used in **column A** (should be row 13 for this exercise). This step is necessary to generate a *Variable Name* (referred to as **Parent Name**) for each question.

    > **NOTE:**
    >
    > We consider it a good practice to copy the formula all the way to the last row used even if the scores don't have a **Parent Name**.

It should end up looking like this:

![img_ts1_9](https://drive.google.com/uc?export=view&id=1bSLTcTtR0qrdJyX8RspPAa7o8dUfZMDh)

And after all that work, we're done with our configurations and should be able to proceed with the next step!

### 4. Save changes

After editing the Excel file **do not forget to save**.

> **Pro Tip:** We recommend that you save regularily when working on any file so you don't lose any progress. Life can be mean sometimes!

### 5. Import the Template

The next step is to commit our changes to the DHIS2 server, to do this we need to upload our edited file to the PCA. Let's **click on the "Import Template" button** located in the right side of the PCA menu bar.

![img_ts1_10](https://drive.google.com/uc?export=view&id=1ep8_cRYOJz_ZVUn9ZBMjcG2yPUQIpg4j)

A window will appear requesting us to select a configuration file. Let's **click on "Choose File"** to open the File Explorer of our Operating System and **select our edited template**.

![img_ts1_11](https://drive.google.com/uc?export=view&id=178pk92XIx18zEMVLr--2p8JCtiyQCrEZ)

After selecting a file we have to **click on "Import"** which will read the file and display a preview and a summary of our changes before we store our configurations in the server.

![img_ts1_12](https://drive.google.com/uc?export=view&id=10zFoKXODy6I4ET8M38H1QAtPemIk198-)

The summary will display the number of new/updated/removed questions, sections and scores, so please make sure that the summary matches your intended configurations before proceeding.

> **NOTE:**
>
> If you find yourself stuck in any of the steps in the **Import Status** try to reload the page to check if your session is still active.

Now **click on "Close"** to check the preview of your configuration before saving your changes in the server.

You can expand and collapse the sections to check the contents of each one by **clicking on the ˅ icon on the far right of each section**.

The question on each section should be labeled as ***new***, ***updated*** or ***removed***. Also, **each section should display a count of the Data Elements and specify how many of those are new or have been updated**.

![img_ts1_13](https://drive.google.com/uc?export=view&id=17BPzAdyjwvLvctzI8sXJiW7MudN6M35e)

> **NOTE:**
>
> If you remove Data Elements from the program when importing a Template, a new *temporary section* named ***Removed*** will appear. There you're able to check every Data Element that will be removed when you click on **Validate & Save**.

### 6. Validate and Save

After you've checked that all the imported changes are correct, the configurations are ready to be validated and saved in the current server.    

Following the exercise, now you should **click on "Validate & Save"** and the app will display a new window and start a two steps process:

1. The uploaded content will be validated to ensure that all the configurations correct, in order to preserve its integrity. To check the validations that are executed please check [**PCA Validations**](#).    
  After validations have been executed, there will be two possible scenarios:
    - **Validation passed:** there are no errors in the configurations and the metadata is ready to be saved. In this case we continue with the next step.
    - **Validation errors:** there may be one or more errors in the current configurations. A new *temporary section* will be displayed indicating which elements contain errors. In this case we have to fix our configurations and try again.   

2. If all validations passed, a button labeled ***Save*** will be displayed in the window, **clicking it will store the data into the server**.

![img_ts1_14](https://drive.google.com/uc?export=view&id=1zPvpKrbcc93W7NrpgfmyUi7r6SntYWPn)
 
Once you click the **Save** button, the saving process will start and the changes will be stored in the server.  

If all the changes are successfully saved, you will see a new window with a success message. Otherwise an error message will be shown. 

After the changes are saved, the tags that appeared on each Data Element and Section will be removed.

![img_ts1_15](https://drive.google.com/uc?export=view&id=1cGmwxIvQOngm0LpARY5kgvcKma-0F_CO)

> **NOTE:**
>
> Every time you access to the program stage sections listing, the **"Validate & Save"** button will contain the text **"Validate"**. This is because the validation must be executed every time the page is loaded to make sure that the configurations are correct before proceeding to the next step.

### 7. Set up program (Run Magic)

Once the program configurations have been validated and saved, the **"Set up program"** button becomes enabled.  

![img_ts1_16](https://drive.google.com/uc?export=view&id=1QdKYib27FZxQ3dwEIXy3uz_uzMfqjCgF)
  
Now let's **click on "Set up program"** to build the related program rules. This action will create the following components:
* Scores calculation
* Hide/Show Logic
* Labels text assignment
* Mandatory fields behavior
* Competency Class assignment*

\* Competency Class program rules will be created only if the user selected to use this feature for the current checklist.

Once you click the **"Set up program"** button, a window will be displayed on screen indicating the status of the process. Once the process is finished, you can close the window and continue with the next step.

![img_ts1_17](https://drive.google.com/uc?export=view&id=1g36zw2PiGcSqe3POBGPbGhXT0BI7-36q)

### 8. Assign Org Units & Test the program

The last step before we can check the program in the **Tracker Capture App** is to assgin the program to an Org Unit. In the future the Program Config App will be able to assign Org Units without requiring the Maintenance App, but at the moment the feature is not implemented.

After assigning an Org Unit you should be able to test your configurations from both the **Tracker Capture App** and the **Android Capture Application**.

# Session #2: Updating checklists & Setting Parents Logic
 ```
 (WIP)...
 ```

# Session #3: Customization of HNQIS2 programs (TBD)
 ```
 (WIP)...
 ```