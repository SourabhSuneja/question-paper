function createContainer() {
  // increment container count
  containerCount++;

  // make add container btn visible so that more containers can be inserted
  addContainerBtn.style.display = "block";

  // also make additional settings box visible
  settingsDiv.style.display = "block";

  // container prefix
  const prefix = "container-" + containerCount + "-";

  // create a parent box
  let promptBox = document.createElement('div');
  promptBox.classList.add('container-prompt');
  promptBox.setAttribute("id", "container-" + containerCount);

  // create a heading
  let heading = document.createElement('h3');
  heading.textContent = "Container " + (containerCount + 1);

  // initialize a blank array in checkedIndices (to store the indices of checked question checkboxes)
  checkedIndices.push([]);

  // create question heading label
  let label = document.createElement('label');
  label.textContent = "Main Question Heading:";
  label.setAttribute("for", prefix + "heading");

  // create an input for container question heading (main question text)
  let input = document.createElement('input');
  input.setAttribute("type", "text");
  input.setAttribute("id", prefix + "heading");
  input.setAttribute("name", prefix + "heading");
  input.classList.add('container-question-input');

  // create a h5 saying "Number of Questions"
  let h5 = document.createElement('h5');
  h5.textContent = "Number of Questions:";
 
  // append these to prompt box
  promptBox.appendChild(heading);
  promptBox.appendChild(label);
  promptBox.appendChild(input);
  promptBox.appendChild(h5);

  // fetch "must include" accordions along with labels and inputs for different qTypes to be included in the container
  promptBox.appendChild(getComponentsForContainer(containerCount));

  
  // append prompt box
  containerWisePromptDiv.appendChild(promptBox);
}
// function end


// function to generate "must include" accordions along with labels and inputs for different qTypes to be included in the container
function getComponentsForContainer(containerCount) {

  // create a parent box
  let parent = document.createElement('div');

  // loop through all available unique qTypes
  uniqueQTypes.forEach((type) => {

    // type prefix
    const typePrefix = type.replace(/[ /]/g, "-").toLowerCase();
 
  // container prefix
    const containerPrefix = "container-" + containerCount + "-";

    // create label for no of questions
    let label = document.createElement('label');
    label.textContent = type + ":";
    label.setAttribute("for", containerPrefix + typePrefix + "-number"); 
    label.classList.add("wrapper-label");

    // hide label in case qType is Match items and user hasn't allowed any match items to be included from any chapter

    let showMatchItemsLabel = false;
    if(type === 'Match items') {
      label.classList.add('mi-labels');
      const checkboxes = document.querySelectorAll('.ch-prompt .include-match-items');
      for(let y=0; y<checkboxes.length; y++) {
          if(checkboxes[y].checked) {
              showMatchItemsLabel = true;
              break;
          }
       }
    }

    if(!showMatchItemsLabel && type === 'Match items') {
        label.style.display = 'none';
    } 
    
    // create a panel div to wrap rest of the content
    let wrapper = document.createElement("div");
    wrapper.classList.add("wrapper");

    // attach a click event handler with the label
    label.addEventListener("click", function() {

        // must include box
    let mustIncludeBox = createMustIncludeBox(containerCount, type, containerPrefix, typePrefix);
    let lastChild = wrapper.lastElementChild;

    // if it's a mergeable questions type, hide the mustIncludeBox
    if(mergeableQTypes.includes(type)) {
        mustIncludeBox.style.display = "none";
    }

        this.classList.toggle("active");
        if(wrapper.style.maxHeight) {
          wrapper.removeChild(lastChild);
          wrapper.style.maxHeight = null;
        } else {
          wrapper.appendChild(mustIncludeBox);
          wrapper.style.maxHeight = wrapper.scrollHeight + "px";
        }

    });
    

    // create input field for no of questions
    let input = document.createElement('input');
    input.classList.add("number-input");
    input.setAttribute("type", "number");
    input.setAttribute("id", containerPrefix + typePrefix + "-number");
    input.setAttribute("name", containerPrefix + typePrefix + "-number");
    input.setAttribute("data-container", containerCount);
    input.setAttribute("data-type", type);
    input.style.backgroundColor = "white";
    input.value = "0";

    // attach change event handler with input to auto-calculate total weightage of questions added
    input.addEventListener('input', computeWeightage);

    // create label for weightage of questions
    let label2 = document.createElement('label');
    label2.textContent = (type === "Match items")? "Weightage per pair matching:" : "Weightage per question:";
    label2.setAttribute("for", containerPrefix + typePrefix + "-weightage"); 

    // create input field for weightage of questions
    let input2 = document.createElement('input');
    input2.classList.add("weightage-input");
    input2.setAttribute("type", "number");
    input2.setAttribute("id", containerPrefix + typePrefix + "-weightage");
    input2.setAttribute("name", containerPrefix + typePrefix + "-weightage");
    input2.setAttribute("data-container", containerCount);
    input2.setAttribute("data-type", type);
    input2.style.backgroundColor = "white";
    input2.value = "0";

    // attach change event handler with input to auto-calculate total weightage of questions added
    input2.addEventListener('input', computeWeightage);

    
    // append to wrapper
    wrapper.appendChild(input);
    wrapper.appendChild(label2);
    wrapper.appendChild(input2);
        

    // append to parent
    parent.appendChild(label);
    parent.appendChild(wrapper);
    

  });
  // forEach ends


  return parent;
}
// end function 


// function to create a must-include question box
function createMustIncludeBox(containerCount, type, containerPrefix, typePrefix) {

  // create a parent node
  const parent = document.createElement('div');
  parent.classList.add('must-include');
  const mustIncludeHeading = document.createElement('div');
  mustIncludeHeading.textContent = "Must include these questions (select the ones you want to be included for sure):";
  mustIncludeHeading.classList.add("must-include-heading");
  parent.appendChild(mustIncludeHeading);

  // loop through index map of this qType and add question checkboxes

  for(let j=0; j<qTypeIndexMap[type].length; j++) {

    const index = qTypeIndexMap[type][j];
    let question = extractStringBeforeJSON(allQuestions[index]);
    // remove options part from the question in case of MCQs
    if(type === 'MCQ') {
       const mcqPattern = /\(Options: (.*) Correct: (.*)\)$/i;
       question = question.replace(mcqPattern, '');
    }
    const inputID = containerPrefix + typePrefix + "-" + "must-include-qindex-" + index;

    // if this question is already checked (already marked as must included) somewhere in any other container, continue to next loop cycle
    if(checkedInOtherContainers(index, containerCount)) {
        continue;
    } 

    // otherwise, create a checkbox
    parent.appendChild(createQCheckbox(question, inputID, index, containerCount, type))


  }
  // loop ends
  
  return parent;
}
// function end

// function to create a question checkbox and label
function createQCheckbox(labelText, inputID, dataQIndex, containerCount, type) {

        // Create a checkbox element
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = inputID;
        checkbox.setAttribute("data-qindex", dataQIndex);
        checkbox.setAttribute("data-container", containerCount);
        checkbox.setAttribute("data-type", type);

        // tick the checkbox, if it was checked earlier
        if(checkedInCurrentContainers(dataQIndex, containerCount)) {
            checkbox.checked = true;
        }

        // attach an event handler with the checkbox
        checkbox.addEventListener("change", function() {
          if(this.checked) {
            checkedIndices[containerCount].push(dataQIndex);
          }
          else {
               let k = checkedIndices[containerCount].indexOf(dataQIndex);
               if(k !== -1) {
                   checkedIndices[containerCount].splice(k, 1);
               }
          }

        });

        // Create a label element
        let label = document.createElement('label');
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(labelText)); 

        // return element
        return label;

}
// function end

// function to check whether a particular question checkbox is checked in any containers other than the current container
function checkedInOtherContainers(qindex, curContainerIndex) {

  // loop through checkedIndices array
  for (let j = 0; j < checkedIndices.length; j++) {
    // don't check in current container
    if (j === curContainerIndex) {
      continue;
    }

    if (checkedIndices[j].includes(qindex)) {
      return true;
    }
  }

  return false;
}
// function ends

// function to check whether a particular question checkbox is checked in the current container
function checkedInCurrentContainers(qindex, curContainerIndex) {
  if(checkedIndices[curContainerIndex].includes(qindex)) {
      return true;
  }

  return false;
}
// function ends

// function to auto calculate the total weightage of questions added to all containers
function computeWeightage() {
  const message = document.getElementById('message');
  const nums = document.querySelectorAll('.container-prompt .number-input');
  const weights = document.querySelectorAll('.container-prompt .weightage-input');
  let total = 0;
  // compute total
  for(let j = 0; j < nums.length; j++) {
      let n = parseInt(nums[j].value);
      let w = parseFloat(weights[j].value);
      n = isNaN(n)? 0 : n;
      w = isNaN(w)? 0 : w;
      total += n * w;
      console.log(total);
  }
  // loop ends
  if(total > 0) {
    message.textContent = "Total weightage: " + total + "M";
    message.style.display = "block";
  } else {
    message.style.display = "none";
  }
}
// function ends
