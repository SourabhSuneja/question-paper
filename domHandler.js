// exam details here
const examDetails = JSON.parse(getParameterByName('ed'));

// function to fill paper header
function fillHeader() {
  const schoolName = document.getElementById('schoolName');
  const examName = document.getElementById('examName');
  const grade = document.getElementById('grade');
  const subject = document.getElementById('subject');
  const duration = document.getElementById('duration');
  const mm = document.getElementById('mm');
  schoolName.textContent = examDetails['schoolName'];
  examName.textContent = examDetails['examName'];
  subject.textContent = "Subject: " + examDetails['subject'];
  grade.textContent = "Class " + examDetails['grade'];
  duration.innerHTML = "Time: " +  convertMinutesToHours(parseInt(examDetails['duration']));
  if(qContainers['settings']['showStudentDetails']) {
      document.getElementById('student-details').style.display = "block";
  }
}

// function to convert mins to hours
function convertMinutesToHours(minutes) {
    if (minutes >= 60) {
        var hours = Math.floor(minutes / 60);
        var remainingMinutes = minutes % 60;
        var hourString = hours > 1 ? "hours" : "hour";
        if (remainingMinutes === 0) {
            return hours + " " + hourString;
        } else {
            return hours + " " + hourString + " " + remainingMinutes + " minutes";
        }
    } else {
        return minutes + " minutes";
    }
}

// function to populate table with selected questions
function fillQuestions(selectedQMap, questions, qContainers) {
  let outerQuestionCounter = 1;

  // populate question paper header
  fillHeader();
  
  // fetch table element
  let table = document.getElementById("qTable");


  // array holding weightages of all containers
  const containerWeights = [];


  // loop through all headings of qContainers
  for(let i = 0; i < qContainers['headings'].length;  i++) {
    let containerHeading = qContainers['headings'][i];
    let weightageText = "";
    let innerQuestionCounter = 1;
    
    // Create a new table row
    let tr = document.createElement("tr");

    // if settings [border] is false, increase spacing before each new container for improved readability
    if(!qContainers['settings']['border']) {
        tr.classList.add("increased-spacing");
}

    // find total container weightage and total number of questions requested for this container
    let totalContainerWeightage = 0;
    let qNumInCaseOfOneQ = 0;
    let qWeightInCaseOfOneQ = 0;
    let qTypeInCaseOfOneQ;
    let quesRequiredForContainer = 0;
    
    
    for(const key in qContainers['qTypes'][i]) {
        const w = qContainers['qTypes'][i][key] * qContainers['weightPerQ'][i][key];
        totalContainerWeightage += w;
        quesRequiredForContainer += qContainers['qTypes'][i][key];
        if(w !== 0) {
             qNumInCaseOfOneQ = qContainers['qTypes'][i][key];
             qWeightInCaseOfOneQ = qContainers['weightPerQ'][i][key];
              qTypeInCaseOfOneQ = key;
        }

    }

    // if questions required for this container is 0, continue to the next container
    if(quesRequiredForContainer === 0) {
        continue;
    }

    // check whether container has a mix of questions
    const areQuesMixed = ((Object.keys(qContainers['qTypes'][i]).filter(key => qContainers['qTypes'][i][key] !== 0).length) > 1); 

    // display total container weightage appropriately
    if(areQuesMixed) {
        weightageText = totalContainerWeightage + "M";
    }
    else if(qWeightInCaseOfOneQ) {
        totalContainerWeightage = (qNumInCaseOfOneQ * qWeightInCaseOfOneQ);
        weightageText = '[' + qNumInCaseOfOneQ + '×' + qWeightInCaseOfOneQ + '=' + totalContainerWeightage + 'M]';
    }

    // push current container weightage into containerWeights array for finding total (max marks) of paper later on
    containerWeights.push(totalContainerWeightage);
    

    // Create three table data cells and add them to the row
    let td1 = document.createElement("td");
    if(qContainers['headings'].length > 1) {
        td1.textContent = "Q." + outerQuestionCounter;
    }
    let td2 = document.createElement("td");
    td2.textContent = containerHeading || generateContainerHeading(areQuesMixed, qTypeInCaseOfOneQ);
    let td3 = document.createElement("td");
    td3.textContent = weightageText;

// make all table cells editable if editable is set to true
       if(qContainers['settings']['editable']) {
        td1.contentEditable = "true";
        td2.contentEditable = "true";
        td3.contentEditable = "true";
}

    // remove all borders from all cells, if settings[border] is false
      if(!qContainers['settings']['border']) {
          td1.classList.add('no-border');
          td2.classList.add('no-border');
          td3.classList.add('no-border');
     }

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);

    // Set font weight of the row to bold
    tr.style.fontWeight = "bold";

    // Append the tr to table
    table.appendChild(tr);

    // get required number of questions of specified types for this question container along with their respective weightage arrays
    const {questions: fetchedQ, weightages: weightageArr, qTypesFetched: qTypesArr} = getQuestionsForContainer(qContainers['qTypes'][i], questions, selectedQMap, qContainers['weightPerQ'][i], qContainers['mustInclude'][i]);

    // if this container contains mergeable qType and doesn't have a mix of questions, and a heading for the container hasn't been supplied explicitly, store a reference to the td containing container heading, so that it can be manipulated directly by the function producing the DOM contents for this qType
    let containerHeadingTd;
    if(!areQuesMixed && mergeableQTypes.includes(qTypeInCaseOfOneQ) && fetchedQ.length === 1 && !containerHeading) {
        containerHeadingTd = td2;
    } else {
        containerHeadingTd = null;
    }


    // creating Fill up Help Box
    // if the container contains only Fill up type questions and a help box is requested in settings, create a help box and prepend it to the container

    if(!areQuesMixed && qTypeInCaseOfOneQ == 'Fill up' && qContainers['settings']['showHelpBoxInFillUp']) {
        const helpBox = getFillUpHelpBox(fetchedQ);
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        const td2 = document.createElement('td');
        const td3 = document.createElement('td');
        td2.appendChild(helpBox);

// make all table cells editable if editable is set to true
       if(qContainers['settings']['editable']) {
        td1.contentEditable = "true";
        td2.contentEditable = "true";
        td3.contentEditable = "true";
}

       // remove all borders from all cells, if settings[border] is false
      if(!qContainers['settings']['border']) {
          td1.classList.add('no-border');
          td2.classList.add('no-border');
          td3.classList.add('no-border');
      }

       // remove top and bottom borders from all td
       td1.style.borderTop = 0;
       td2.style.borderTop = 0;
       td3.style.borderTop = 0;
       td1.style.borderBottom = 0;
       td2.style.borderBottom = 0;
       td3.style.borderBottom = 0;

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        table.appendChild(tr);
    }

       
    // loop through all fetched questions to be inserted in current question container
    for(let j = 0; j < fetchedQ.length; j++) {

      // Create a new table row
      let tr = document.createElement("tr");


      // Create three table data cells and add them to the row
      let td1 = document.createElement("td");

          // determine whether to show the inner question counter or not
      if(!areQuesMixed && mergeableQTypes.includes(qTypeInCaseOfOneQ)) {
          td1.textContent = "";
      } else {
          td1.textContent = innerQuestionCounter + ".";
      }
      let td2 = document.createElement("td");
      td2.appendChild(getQuestionNode(fetchedQ[j], areQuesMixed, qContainers['settings'], questions, qContainers['qTypes'][i], selectedQMap, containerHeadingTd));
      let td3 = document.createElement("td");
      td3.innerHTML = "(" + decimalToFraction(weightageArr[j]) + ")";

        // make all table cells editable if editable is set to true
       if(qContainers['settings']['editable']) {
        td1.contentEditable = "true";
        td2.contentEditable = "true";
        td3.contentEditable = "true";
}

      // remove all borders from all cells, if settings[border] is false
      if(!qContainers['settings']['border']) {
          td1.classList.add('no-border');
          td2.classList.add('no-border');
          td3.classList.add('no-border');
      }

      // remove top and bottom borders from all td
      td1.style.borderTop = 0;
      td2.style.borderTop = 0;
      td3.style.borderTop = 0;
      td1.style.borderBottom = 0;
      td2.style.borderBottom = 0;
      td3.style.borderBottom = 0;

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);

      // Append the tr to table
      table.appendChild(tr);

      
      innerQuestionCounter++;
    }
    // end of questions loop

    // if fetched questions are less than required number, insert blank rows and ask user to enter remaining questions manually
    if(qTypesArr.length < quesRequiredForContainer) {
        const shortfall = quesRequiredForContainer - qTypesArr.length;
        let qNum = qTypesArr.length + 1;

        for(let s=0; s<shortfall; s++) {
            const tr = document.createElement('tr');
            const td1 = document.createElement('td');
            const td2 = document.createElement('td');
            const td3 = document.createElement('td');
            td1.textContent = qNum + '.';
            td2.innerHTML = "Question Deficit: The question bank lacks enough suitable questions for your paper criteria. Please input a question manually or upgrade your question bank.";

            // make all table cells editable if editable is set to true
       if(qContainers['settings']['editable']) {
        td1.contentEditable = "true";
        td2.contentEditable = "true";
        td3.contentEditable = "true";
}

      // remove all borders from all cells, if settings[border] is false
      if(!qContainers['settings']['border']) {
          td1.classList.add('no-border');
          td2.classList.add('no-border');
          td3.classList.add('no-border');
      }

      // remove top and bottom borders from all td
      td1.style.borderTop = 0;
      td2.style.borderTop = 0;
      td3.style.borderTop = 0;
      td1.style.borderBottom = 0;
      td2.style.borderBottom = 0;
      td3.style.borderBottom = 0;

            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            table.appendChild(tr);
            qNum++;
        }
    }
    // end shortfall check condition

    outerQuestionCounter++;
  }
  // end of container loop
  

  // Get the cells in the last row and set their bottom border (only if settings[border] is set to true
if(qContainers['settings']['border']) {
        Array.from(table.rows[table.rows.length - 1].cells).forEach(cell => {
    cell.style.borderBottom = '1px solid black';
        });
}

// if settings[border] is false, remove the very first header table row as well
if(!qContainers['settings']['border']) {
    document.getElementById('header-row').style.display = 'none';
}

  // set Max Marks for entire paper
  document.getElementById('mm').textContent = "MM: " +  containerWeights.reduce((total, current) => total + current, 0) + "M";

  // minor layout adjustments
  adjustMCQOptionsWidth();

  
  // hide question weightages, max marks and duration if settings[hideWeightage] is true (follow a plain worksheet or answer key kind of format)
  if(qContainers['settings']['hideWeightage']) {
      table.classList.add('hide-weightage');
      document.getElementById('mm').style.display = "none";
      document.getElementById('duration').style.display = "none";
  }
  



  }
// end of function


// function to get the required number of questions for a question container (returns array of question strings with JSON Params attached)
function getQuestionsForContainer(obj, questions, selectedQMap, weightageObj, mustIncludeObj) {
    const array = [];
    const weightages = [];
    const qTypesFetched = [];
    for(const key in obj) {
        if(disallowedQTypes.includes(key) || (!selectedQMap[key] && !mustIncludeObj[key]) ) {
          continue;
        }
        const qIndices = selectedQMap[key];
        const qRequired = obj[key];
        const selectedQIndices = extractAndRemove(qIndices, qRequired, mustIncludeObj[key]);

        for(const x of selectedQIndices) {
              // fetch the merged question string from global mergedQuestions object in case of mergeable qTypes, otherwise pull questions from the selected indices in the questions object itself
              if(mergeableQTypes.includes(key)) {
              array.push(mergedQuestions[key]);
              weightages.push(qRequired * weightageObj[key]);
              const arrayTemp = new Array(qRequired).fill(key); 
              qTypesFetched.push(...arrayTemp);
              } else {
              array.push(questions[x]);
              weightages.push(weightageObj[key]);
              qTypesFetched.push(key);
              }
        }
        // inner for loop ends
    }
    // outer for loop ends
    return {"questions": array, "weightages": weightages, "qTypesFetched": qTypesFetched};
}


// function to extract and remove n elements from an array reference
function extractAndRemove(array, n, mustIncludeArr) {
    let extracted = [];
    if(mustIncludeArr && mustIncludeArr.length > 0) {
      extracted = mustIncludeArr.splice(0, n);
    }
    if(extracted.length < n) {
      extracted.push(...array.splice(0, (n - extracted.length)));
    }
    
    return extracted;
}

// function to fetch an HTML question node based on qType
function getQuestionNode(question, areQuesMixed, settings, questions, qTypesReq, selectedQMap, containerHeadingTd) {

    // create a parent container
    const parent = document.createElement('div');

    // extract relevant setting values
    const provideAnsOrSpace = settings['provideAnsOrSpace'];
    const spaceForAns = settings['spaceForAns'];
    const showAns = (settings['provideAnsOrSpace'] === 'ans')? true : false;
    const provideAnsSpace = (settings['provideAnsOrSpace'] === 'space')? true : false;
    const shuffleMCQOptions = settings['shuffleMCQOptions'];
    const useDotPatternInBlanks = settings['useDotPatternInBlanks'];
    const isPaperEditable = settings['editable'];

    // separate question text from JSON parameters
    let questionText = extractStringBeforeJSON(question);
    const questionParams = extractJSONFromString(question);

    // get media related params (media for question)
    const mediaEmbedded = questionParams['mediaEmbedded'];
    const mediaLink = questionParams['mediaLink'];

    // get media related params (media for answer)
    const mediaEmbeddedA = questionParams['mediaEmbeddedA'] || null;
    const mediaLinkA = questionParams['mediaLinkA'] || null;
    

    // get answer (for non-MCQ questions)
    const ansExplanation = questionParams['ansExplanation'];

    // determine question type
    const qType = questionParams['qType'];

    // append full stop in True/False and Fill up based questions
    if(qType == "Fill up" || qType == "True/False") {
    questionText = appendFullStop(questionText);
    // replace underscore pattern with dot pattern in Fill up blanks
        if(qType == "Fill up" && useDotPatternInBlanks) {
             questionText = replaceUnderscoresWithDots(questionText);
        }
    }

    // Regex pattern to identify MCQ-type questions (backward compatibility for questions without qType param)
    const mcqPattern = /\(Options: (.*) Correct: (.*)\)$/i;

    if(qType == 'MCQ' || mcqPattern.test(question)) {
        
        // replace underscores with dots in MCQ blanks, if any
        if(useDotPatternInBlanks) {
              questionText = replaceUnderscoresWithDots(questionText);
        }

        parent.appendChild( DOMHandleMCQ(questionText, mcqPattern, showAns, shuffleMCQOptions, mediaEmbedded, mediaLink, isPaperEditable, settings['showAIBtns']));
    }

    else if(qType == 'True/False') {
        parent.appendChild( DOMHandleTrueFalse(questionText, areQuesMixed, showAns, ansExplanation, provideAnsSpace, spaceForAns, qType, mediaEmbedded, mediaLink, isPaperEditable));
    } 

    else if(qType == 'Fill up' || qType == 'Very Short Answer Type' || qType == 'Short Answer Type' || qType == 'Long Answer Type' || qType == 'Very Long Answer Type' || qType == 'Diagram/Picture/Map Based') {
        parent.appendChild( DOMHandleSingleLineQ(questionText, showAns, ansExplanation, qType, provideAnsSpace, spaceForAns, mediaEmbedded, mediaLink, isPaperEditable, mediaEmbeddedA, mediaLinkA, settings['showAIBtns']));
    }

    else if (qType == 'Match items') {
         parent.appendChild(DOMHandleMatchItems(questionParams, showAns, ansExplanation, qType, provideAnsSpace, spaceForAns, mediaEmbedded, mediaLink, isPaperEditable, questions, qTypesReq['Match items'], settings, selectedQMap['Match items'], areQuesMixed, containerHeadingTd));
    }


    return parent;
    
}
    

// function to handle MCQs and create appropriate HTML node for presentation 

function DOMHandleMCQ(question, mcqPattern, showAns, shuffleMCQOptions, mediaEmbedded, mediaLink, isPaperEditable, showAIBtns) {

    // separate question part, options & correct answer using regex pattern
    const [, optionsPart, correctAnswer] = mcqPattern.exec(question);
    let options = optionsPart.split(/Option [A-D]}\s*/).filter(Boolean).map(option => option.trim());

    // if shuffleMCQOptions is true and the options don't include words, "both", "none", "neither", "either", then shuffle the options
    let regResult = options.some(str => /^(both|none|neither|either)/i.test(str));
    if(shuffleMCQOptions && !regResult) {
        options = shuffleArray(options);
    }

    question = question.replace(mcqPattern, '').trim();

    // create a parent node
    const parent = document.createElement('div');
    parent.style.display = "block";

    // create a question div
    const qHolder = document.createElement('div');
    qHolder.innerHTML = question;
    qHolder.style.paddingBottom = "0.12cm";

    // create a flex container for holding options
    const flexContainer = document.createElement('div');
    flexContainer.style.width = "100%";
    flexContainer.style.display = "flex";


     // append question div to the parent div
    parent.appendChild(qHolder);

    // if AI-based Editing Buttons requested, fetch and attach them
    if(showAIBtns) {
        parent.appendChild(getAIBtns(qHolder));
    }

    // embed image (if any) with the question
    if(mediaEmbedded === 'image' && mediaLink) {
        const img = getImageNode(mediaLink, isPaperEditable);
        qHolder.appendChild(img);
    }


    // Calculate the combined length of all option strings
    const totalOptionLength = options.reduce((acc, option) => acc + option.length, 0);

    // determine class name to be set depending on combined length of options
    if(totalOptionLength > 59) {
        flexContainer.classList.add('option-flex-container-stacked');
    } else {
        flexContainer.classList.add('option-flex-container');
    }
    
  
    // create children (option containers)
    for(let j = 0; j < options.length; j++) {
        const child = document.createElement('div');
        child.classList.add('option-flex-item');
        // if showAns is true, and this child container holds the correct answer, add class tick-mark-choice; 
        if(showAns && decodeHTMLEntities(options[j]) === correctAnswer) {
            child.classList.add('tick-mark-choice'); 
            child.style.position = "relative";
        }
        child.innerHTML = String.fromCharCode(97+j) + ") " + options[j];
        child.style.flexGrow = 1;
        flexContainer.appendChild(child);
    }
    
    // then, append options container
    parent.appendChild(flexContainer)
    return parent;


}


// function to adjust the width of options in MCQ type questions so as to align them with each other

function adjustMCQOptionsWidth() {
    // Select all flex containers
    const flexContainers = document.querySelectorAll('.option-flex-container');

    // Initialize an array to store maximum widths for each position
    const maxWidths = {};

    // Loop through each flex container
    flexContainers.forEach(container => {
        // Select all flex items in the current container
        const flexItems = container.querySelectorAll('.option-flex-item');

        // Loop through each flex item in the current container
        flexItems.forEach((item, index) => {
            // Ensure there is an entry for this position in maxWidths array
            if (!maxWidths[index]) {
                maxWidths[index] = 0;
            }

            // Get the width of the current flex item
            const width = item.offsetWidth;

            // Update maximum width if necessary
            if (width > maxWidths[index]) {
                maxWidths[index] = width;
            }
        });
    });

    // Loop through each flex container again to set widths
    flexContainers.forEach(container => {
        // Select all flex items in the current container
        const flexItems = container.querySelectorAll('.option-flex-item');

        // Loop through each flex item in the current container
        flexItems.forEach((item, index) => {
            // Set the width of the current flex item to the maximum width for its position
            item.style.width = maxWidths[index] + 'px';
        });
    });
}


// function to handle True/False Questions
function DOMHandleTrueFalse(question, areQuesMixed, showAns, answer, provideAnsSpace, spaceForAns, qType, mediaEmbedded, mediaLink, isPaperEditable) {

    // create a grandparent element
    const grandparent = document.createElement('div');
    grandparent.style.width = "100%";

    // create a parent flex container
    const parent = document.createElement('div');
    parent.style.display = "flex";
    parent.style.width = "100%";

    // create two child nodes
    const flexItem1 = document.createElement("div");
    flexItem1.style.flex = "0 0 82%";
    const flexItem2 = document.createElement("div");
    flexItem2.style.flex = "0 0 18%";
    flexItem2.style.textAlign = "right";
    flexItem2.style.paddingRight = "0.03cm";

    // add question in the first child node, and True/False text in the second
    flexItem1.innerHTML = question;
    flexItem2.textContent = "(True/False)";

    // append the child nodes to parent node
    parent.appendChild(flexItem1);

    // if the container in which this question is to be added contains a mix of different question types, append the text "Is it true or false?" to the question itself, otherwise append a True/False tickbox to the right side. If showAns is true, also show answer appropriately
    if(areQuesMixed) {
        flexItem1.innerHTML += " Is it true or false?";
        flexItem1.style.width = "100%";
        flexItem1.style.flexGrow = "1";
        if(provideAnsSpace) {
            flexItem1.innerHTML += " &nbsp;<strong>Ans: </strong>.............";
        }
        else if(showAns) {
            flexItem1.innerHTML += "<br><strong>Answer:</strong> " + getTrueFalseVal(answer);
        } 
    } else {
        parent.appendChild(flexItem2);
        if(showAns) {
            flexItem2.style.position = "relative";
            parent.style.paddingBottom = "0.2cm";
            if(answer.toLowerCase() === "t" || answer.toLowerCase() === "true") {
                flexItem2.classList.add('tick-true');
            } else {
                flexItem2.classList.add('tick-false');
            }
        }
    }

    grandparent.appendChild(parent);

    // embed image (if any) with the question
    if(mediaEmbedded === 'image' && mediaLink) {
        const img = getImageNode(mediaLink, isPaperEditable);
        grandparent.appendChild(img);
    }
   
    return grandparent;

}

// function to handle plain one line questions
function DOMHandleSingleLineQ(question, showAns, answer, qType, provideAnsSpace, spaceForAns, mediaEmbedded, mediaLink, isPaperEditable, mediaEmbeddedA, mediaLinkA, showAIBtns) {

    // create a parent node
    const parent = document.createElement('div');
    parent.style.width = "100%";

    // create a question node
    const qHolder = document.createElement('div');
    qHolder.innerHTML = question;

    // create an answer node
    const ansHolder = document.createElement('div');

    // append to parent
    parent.appendChild(qHolder);

    // if AI-based Editing Buttons requested, fetch and attach them
    if(showAIBtns) {
        parent.appendChild(getAIBtns(qHolder));
    }

    // embed image (if any) with the question
    if(mediaEmbedded === 'image' && mediaLink) {
        const img = getImageNode(mediaLink, isPaperEditable);
        qHolder.appendChild(img);
    }

    // show answer if requested
    if(showAns) {
       ansHolder.innerHTML = "<strong>Answer: </strong>" + ((qType == "Fill up" || qType == "Very Short Answer Type")? "" : "<br>") + answer;
        parent.appendChild(ansHolder);

        // embed image (if any) with the answer
        if(mediaEmbeddedA === 'image' && mediaLinkA) {
            const img = getImageNode(mediaLinkA, isPaperEditable);
            parent.appendChild(img);
    }


    }
    // provide space for answer if requested
    else if(provideAnsSpace) {
        parent.appendChild(getAnsSpaceNode(qType, spaceForAns));
    }
    return parent;
}

// function to handle Match items based questions
function DOMHandleMatchItems(JSONObj, showAns, answer, qType, provideAnsSpace, spaceForAns, mediaEmbedded, mediaLink, isPaperEditable, questions, qRequired, settings, matchItemsMap, areQuesMixed, containerHeadingTd) {

    // fetch the selected match items from the merged object
    const selectedData = getMatchItemsFromMergedObj(JSONObj, qRequired, settings, questions, matchItemsMap, qType);

    let isImageBased = false;
  
    let colA = selectedData['colAItems'];
    let colB = selectedData['colBItems'];
    const colAHeading = selectedData['colAHeading'];
    const colBHeading = selectedData['colBHeading'];
    const question = selectedData['question'];

    // change the container heading, if the container contains only this question alone
    if(containerHeadingTd) {
        containerHeadingTd.textContent = question;
    }
    

    // store answers before shuffling the match items
    answer = {};
    for(let i = 0; i < colA.length; i++) {
        answer[colA[i]] = colB[i];
    }

   // shuffle items of both columns
    colA = shuffleMatchItems(colA, settings['randomiseSelection'], "A");
    colB = shuffleMatchItems(colB, settings['randomiseSelection'], "B");
  

    // create a parent container
    const parent = document.createElement('div');
    parent.style.width = "100%";

    // create a question container and append it to parent (only if this question appears in a mixed question container)
    if(areQuesMixed) {
        const qHolder = document.createElement('div');
        qHolder.innerHTML = question;
        parent.appendChild(qHolder);
    }

    // Create table
     const table = document.createElement('table');
     table.classList.add('match-table');
     const tr = document.createElement('tr');
     const th1 = document.createElement('th');
     const th2 = document.createElement('th');
     const th3 = document.createElement('th');
     const th4 = document.createElement('th');
     const th5 = document.createElement('th');
     th2.textContent = colAHeading;
    th4.textContent = colBHeading;
     tr.appendChild(th1);
     tr.appendChild(th2);
     tr.appendChild(th3);
     tr.appendChild(th4);
     tr.appendChild(th5);
     table.appendChild(tr);

     // table body
     for(let k=0; k<qRequired; k++) {
      const tr = document.createElement('tr');
     const td1 = document.createElement('td');
     const td2 = document.createElement('td');
     const td3 = document.createElement('td');
     const td4 = document.createElement('td');
     const td5 = document.createElement('td');

     if(provideAnsSpace) {
        td5.textContent = "(......)";
     }

     td1.textContent = (k+1) + ".";

     // handle image URLs in match items
     
     if(isValidURL(colA[k])) {
          td2.appendChild(getImageNode(colA[k], isPaperEditable, "15%") );
          isImageBased = true;
     } else {
          td2.textContent = colA[k];
     }

     if(isValidURL(colB[k])) {
          td4.appendChild(getImageNode(colB[k], isPaperEditable, "15%") );
          isImageBased = true;
     } else {
          td4.textContent = colB[k];
     }

     if(isImageBased) {
          td1.style.verticalAlign = "middle";
          td2.style.verticalAlign = "middle";
          td3.style.verticalAlign = "middle";
          td4.style.verticalAlign = "middle";
          td5.style.verticalAlign = "middle";
     }

     td3.textContent = String.fromCharCode(97+k) + ") ";
     tr.appendChild(td1);
     tr.appendChild(td2);
     tr.appendChild(td3);
     tr.appendChild(td4);
     tr.appendChild(td5);
     table.appendChild(tr);

     }

   // append table to parent
   parent.appendChild(table);

  // create answer node, if answers requested
   if(showAns) {
      const ansHolder = document.createElement('div');
      ansHolder.style.paddingTop = "0.4cm";
      ansHolder.innerHTML = "<strong>Answers: <br></strong>";
      for(let k = 0; k < colA.length; k++) {
             const item1 = colA[k];
             const item2 = answer[colA[k]];
             if(item1 !== "Enter manually" && item2 !== "Enter manually") {
                 if(!isImageBased) {
                     ansHolder.innerHTML += item1 + " –> " + item2 + ( (k === colA.length - 1) ? "" : ", " ) ;
                 } else {
                     ansHolder.style.display = "flex";
                     ansHolder.style.alignItems = "center";
                     ansHolder.style.flexWrap = "wrap";
                     ansHolder.appendChild(getSmallImageNode(item1));
                     ansHolder.appendChild(getSmallImageNode(item2));
                 }
             }
         }
   parent.appendChild(ansHolder);
   }
   
    return parent;


}

// function to generate a very small image node to be included in answers of match items
function getSmallImageNode(src, width="6%") {
   // if not a valid src (or, it is simply text), return the text as it is inside a div container
    if(!isValidURL(src)) {
       const div = document.createElement('div');
       div.innerHTML = " -> " + src;
       div.style.marginLeft = "0.2cm";
       return div;
    }
    const image = document.createElement('img');
    image.src = src;
    image.style.width = width;
    image.style.marginLeft = "0.25cm";
    return image;
}

// function to extract the required number of match pairs (items) from the merged match-based question object (when merging is allowed)
function getMatchItemsFromMergedObj(JSONObj, qRequired, settings, questions, matchItemsMap, qType) {

    let returnable;
    let initial;
    let final;
    let question = "Match the following:";
    let colAHeading = "Column A";
    let colBHeading = "Column B";
    const colAItems = [];
    const colBItems = [];
    const selectedItemIndices = [];
    let pointer = JSONObj['pointer'];
    initial = pointer;
    const breakpoints = JSONObj['breakpoints'];
    // find the breakpoint to loop until
    let breakpoint = breakpoints[breakpoints.length - 1];

    for (let i = 0; i < breakpoints.length; i++) {
        if (breakpoints[i] >= (qRequired+pointer)) {
            breakpoint = breakpoints[i];
            break;
        }
    }


    // flag variable just to keep track of whether the loop is in first run
    let firstRun = true;
// variable to keep track of breakpoints crossed
    let bpCrossed = 0;

    // if match items are still remaining (our pointer hasn't reached this breakpoint yet)
    if(pointer < breakpoint) {

        // loop till the selected breakpoint
        for(; pointer<breakpoint; pointer++) {

            // if pointer has reached any new breakpoint and settings don't allow mixing, or we have got the requested no. of items, break the loop
            if( (breakpoints.includes(pointer) && !settings['mergeMatchItems'] && !firstRun) || colAItems.length === qRequired) {
                break;
            }

            // update bpCrossed
            if(!firstRun && breakpoints.includes(pointer)) {
                bpCrossed++;
            }

            // push col items
            colAItems.push(JSONObj['colA'][pointer]);
            colBItems.push(JSONObj['colB'][pointer]);
            selectedItemIndices.push(pointer); 

            // set firstRun to false as the loop has run at least once
            firstRun = false;
        }
        // end for loop
 
        final = pointer;

        // if we haven't crossed any new breakpoints, we can simply pick the question sentence and headings associated with the specific selected items
        if(bpCrossed === 0) {
            let k = findUpperRange(breakpoints, pointer);
            question = JSONObj['questions'][k];
            colAHeading = JSONObj['colAHeadings'][k];
            colBHeading = JSONObj['colBHeadings'][k];
        }


    }
    // end if condition (pointer based)

    // fill empty column items with the text "Enter manually" until the item count reaches the required count (qRequired)
    while(colAItems.length < qRequired) {
        colAItems.push("Enter manually");
        colBItems.push("Enter manually");
    }
    
   
    returnable = {"question": question, "colAHeading": colAHeading, "colBHeading": colBHeading, "colAItems": colAItems, "colBItems": colBItems};

    // re-package new pointer value back into the merged JSON object and store it back as a string to the associated key in the global mergedQuestions object

    let newPointerVal;     if(settings['mergeMatchItems']) {
        newPointerVal = final;
    } else {
        newPointerVal = breakpoints[findUpperRange(breakpoints, pointer)];
}

    JSONObj['pointer'] = newPointerVal;
    mergedQuestions[qType] = "JSONParams:" + JSON.stringify(JSONObj);

   // insert a dummy value in the match items map
    matchItemsMap.push(-1);

    return returnable;

}
// function end

// helper functions for mergedObj handling
function findUpperRange(breakpoints, pointer) {
    let i = 0;
    while(i < breakpoints.length) {
    	if(pointer <= breakpoints[i]) {
    		return i;
    	}
    	i++;
    }
    return i-1;
}


// function to append full stop
function appendFullStop(str) {
    if (!str.endsWith('.')) {
        return str + '.';
    }
    return str;
}

// function to shuffle match items
function shuffleMatchItems(array, dynamicShufflePattern, col) {
    let shuffledArray;
    if(!dynamicShufflePattern) {
        if(col === "A") {
            shuffledArray = fixedShuffle(array, 2);
        } else if(col === "B"){
            shuffledArray = fixedShuffle(array, 1);
        }
    } else {
            shuffledArray = shuffleArray(array);
    }
    return shuffledArray;
}

// function for shuffling on two fixed patterns
function fixedShuffle(array, pattern) {
    const length = array.length;
    const middle = Math.floor(length / 2);
    const shuffledArray = [...array];

    if (pattern === 1) {
        for (let i = 0; i < middle; i++) {
            const temp = shuffledArray[i];
            shuffledArray[i] = shuffledArray[length - 1 - i];
            shuffledArray[length - 1 - i] = temp;
        }
    } else if (pattern === 2) {
        for (let i = 0; i < length - 1; i += 2) {
            const temp = shuffledArray[i];
            shuffledArray[i] = shuffledArray[i + 1];
            shuffledArray[i + 1] = temp;
        }
    }

    return shuffledArray;
}

// function to convert decimals to fractions
function decimalToFraction(decimal) {
    const tolerance = 1.0E-6;
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = decimal;
    
    if (Number.isInteger(decimal)) {
        // If the decimal is a plain integer, return it as it is
        return `${decimal}`;
    }
    
    let fractionStr = "";
    const wholePart = Math.floor(decimal);
    const fractionalPart = decimal - wholePart;
    if (wholePart !== 0) {
        fractionStr = `${wholePart}`;
    }
    
    if (fractionalPart === 0.5) {
        fractionStr += "&#189;";
    } else if (fractionalPart === 0.25) {
        fractionStr += "&#188;";
    } else if (fractionalPart === 0.75) {
        fractionStr += "&#190;";
    } else {
        do {
            const a = Math.floor(b);
            [h1, h2] = [a * h1 + h2, h1];
            [k1, k2] = [a * k1 + k2, k1];
            b = 1 / (b - a);
        } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);
        
        let numerator = h1, denominator = k1;
        if (numerator !== 1) {
            fractionStr += ` ${numerator}`;
        }
        fractionStr += `&#8260;${denominator}`;
    }
    
    return fractionStr;
}

// function to shuffle array using Fisher-Yates method
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}


// function to create answer space node (in case space for answers is to be given along with questions)
function getAnsSpaceNode(qType, spaceForAns) {
    const linesNeeded = spaceForAns[qType];
    const parent = document.createElement('div');
    parent.style.width = "97%";


    if(qType != "Fill up") {
        // minor adjustment to push the very first line a bit down and prepend "Ans: "
        parent.style.paddingTop = "0.2cm";
        parent.innerHTML = "<strong>Ans: </strong>";
    }
    for(let j = 0; j < linesNeeded; j++) {
        const child = document.createElement('div');
        child.style.width = "100%";
        child.style.height = "0.84cm";
        if(qType !== "Diagram/Picture/Map Based") {
            child.style.borderTop = "2px dotted black";
        }
        parent.appendChild(child);
        // reduce the height of last line
        if(j == linesNeeded - 1) {
            child.style.height = "0.12cm";
        }
    }
    return parent;
}

// function to replace underscores pattern with .... in fill ups
function replaceUnderscoresWithDots(str) {
  return str.replace(/_{3,50}/g, function(match) {
    return '...'.repeat(match.length);
  });
}

// function to convert t/T/f/F to True/False
function getTrueFalseVal(val) {
    if(val.toLowerCase() == 't' || val.toLowerCase() == 'true') {
        return "True";
    } else if(val.toLowerCase() == 'f' || val.toLowerCase() == 'false') {
        return "False";
    } else { return val;}
}

// function to check whether a string is a valid URL
function isValidURL(str) {
  // Regular expression to match URL pattern
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  
  return !!pattern.test(str);
}


// function to generate an image node for questions
function getImageNode(src, isPaperEditable, width="40%") {
        const img = document.createElement('img');
        img.setAttribute("src", src);
        img.style.display = "block";
        img.style.width = width;
        img.style.margin = "0.3cm 0";
        // enable dragging, replacement and resizing of image if paper is editable
        if(isPaperEditable) {
            img.classList.add('draggable');
            makeDraggable(img);
            resizeImageOnDoubleClickAndDoubleTap(img);
            changeImageSrcOnLongPress(img);
        }

        return img;
}

// function to create a help box in case of Fill ups when requested
function getFillUpHelpBox(q) {
  // create a container
  const box = document.createElement('div');
  box.style.padding = "0.3cm";
  box.style.margin = "0.2cm auto";
  box.style.width = "70%";
  box.style.border = "1px solid black";
  box.style.borderRadius = "5px";
  box.style.textAlign = "center";
  // extract answers, shuffle them to create hint box
  const JSONObjs = q.map(item => extractJSONFromString(item));
  let hints = JSONObjs.map(item => item.ansExplanation);
  hints = shuffleArray(hints);
  box.innerHTML = hints.join(', ');
  return box;
}

// function to generate container heading (if not supplied)
function generateContainerHeading(areQuesMixed, qType) {
  if(areQuesMixed) {
    return "Answer the following questions:";
  } 
  else {
    switch(qType) {
      case "MCQ": 
        return "Tick the correct option:";
      case "Fill up": 
        return "Fill in the blanks with the correct answers:";
      case "True/False": 
        return "State whether the following statements are True or False:";
      case "Match items": 
        return "Match the following:";
      case "Very Short Answer Type": 
        return "Answer the following very short answer type questions:";
      case "Short Answer Type": 
        return "Answer the following short answer type questions:";
      case "Long Answer Type": 
        return "Answer the following long answer type questions:";
      case "Very Long Answer Type": 
        return "Answer the following very long answer type questions:";
      case "Diagram/Picture/Map Based": 
        return "Diagram-based:";
       default:
         return "Answer the following questions:";
    }
    // end switch
  }
  // end else
}


// function to handle draggable elements
function makeDraggable(element) {
  let isDragging = false;
  let startX, startY;

  // Initialize Hammer.js on the element
  const hammer = new Hammer(element);

  // Listen for panstart, panmove, and panend events
  hammer.on('panstart', onPanStart);
  hammer.on('panmove', onPanMove);
  hammer.on('panend', onPanEnd);

  function onPanStart(e) {
    isDragging = true;
    startX = e.center.x - element.getBoundingClientRect().left;
    startY = e.center.y - element.getBoundingClientRect().top;
  }

  function onPanMove(e) {
    if (isDragging) {
      const newX = e.center.x - startX;
      const newY = e.center.y - startY;
      element.style.left = `${newX}px`;
      element.style.top = `${newY}px`;
    }
  }

  function onPanEnd() {
    isDragging = false;
  }
}

// function to enable resizing of images upon double click
function resizeImageOnDoubleClickAndDoubleTap(imageNode) {
  const sizes = [20, 35, 50, 75, 100]; // Array of percentage sizes
  let currentIndex = 0; // Start with the first size

  imageNode.style.width = sizes[currentIndex] + '%'; // Set initial size

  // Function to cycle through sizes
  function cycleSize() {
    currentIndex = (currentIndex + 1) % sizes.length;
    imageNode.style.width = sizes[currentIndex] + '%';
  }

  // Initialize Hammer.js on the image node
  const hammer = new Hammer(imageNode);

  // Listen for double tap events and call cycleSize
  hammer.on('doubletap', cycleSize);
}

// function to allow user to change the src of an image in a question by long clicking or tapping
function changeImageSrcOnLongPress(imageNode) {
  let delayTimer;

  // Initialize Hammer.js on the image node
  const hammer = new Hammer(imageNode);

  // Listen for press event
  hammer.on('press', onPress);

  function onPress() {
    delayTimer = setTimeout(() => {
      const newSrc = prompt("Enter the new source link for the image:");
      if (newSrc) {
        imageNode.src = newSrc;
      }
    }, 1000);
  }

  // Cancel long press action if press is released before 1 second
  imageNode.addEventListener('pointerup', () => {
    clearTimeout(delayTimer);
  });
}


// function to create AI-based Editing Buttons
function getAIBtns(element) {     
        const div = document.createElement('div');
        div.classList.add('ai-btn-holder');
        div.contentEditable = false;
        const btn = document.createElement('button');
        btn.classList.add('ai-reword-btn');
        btn.textContent = "Re-word Question";
        btn.contentEditable = false;
        btn.addEventListener('click', async function() {
  const overlay = document.getElementById('ai-process-overlay');
  overlay.style.display = "flex";
  element.innerHTML = await reword(element.innerHTML);
  overlay.style.display = "none";
});

        div.appendChild(btn);
        return div;
}
// function ends

// Function to decode HTML entities
function decodeHTMLEntities(str) {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}
