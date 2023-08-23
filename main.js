$(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })

var DateTime = luxon.DateTime;
/**
 * Short Summary: Keep track of global variables
 * 
 * Fields:
 *  csvUploaded: (Boolean) True if a csv file has been uploaded
 *  
 */
var globalFile = {
    csvUploaded: false,
    csvRows: null,
    csvHeadersArray: null,
    output: {
        columns: []
    },
    previewTableHeadersArray: null,
    depthInputDisabled: true,
    hiddenDateTimeRow: null,
    dateTimeFormat: null,
    uploadedFileName: undefined,
    currentDateColumnSelected: undefined,
    currentTimeColumnSelected: undefined
};

function getCurrentTimeColumnSelected()
{
    return globalFile.currentTimeColumnSelected;
}

function getCurrentDateColumnSelected()
{
    return globalFile.currentDateColumnSelected;
}


function setCurrentTimeColumnSelected(value)
{
    globalFile.currentTimeColumnSelected = value;
}

function setCurrentDateColumnSelected(value)
{
    globalFile.currentDateColumnSelected = value;
}

function setUploadedFileName(value)
{
    globalFile.uploadedFileName = value;
}

function getUploadedFileName()
{
    return globalFile.uploadedFileName;
}
function getDateTimeFormat()
{
    return globalFile.dateTimeFormat;
}

function setDateTimeFormat(value)
{
    globalFile.dateTimeFormat = value;
}

function getHiddenDateTimeRow()
{
    return globalFile.hiddenDateTimeRow;
}

function setHiddenDateTimeRow(value)
{
    globalFile.hiddenDateTimeRow = value;
}

function setDepthInputDisabled(value)
{
    globalFile.depthInputDisabled = value;
}

function getDepthInputDisabled()
{
    return globalFile.depthInputDisabled;
}

function setCsvRows(rows)
{
    globalFile.csvRows = rows
}

/* Short Summary: Preferred method of getting global column data object
 * 
 * @return Array[String] : All csv data
 */
function getCsvRows()
{
    return globalFile.csvRows;
};

function setCsvUploaded(bool)
{
    globalFile.csvUploaded = bool;
}

function getCsvUploaded()
{
    return globalFile.csvUploaded;
}

function setCsvHeadersArray(row)
{
    globalFile.csvHeadersArray = row;
}

function getCsvHeadersArray()
{
    return globalFile.csvHeadersArray;
}

function setPreviewTableHeadersArray(row)
{
    globalFile.previewTableHeadersArray = row;
}

function getPreviewTableHeadersArray()
{
    return globalFile.previewTableHeadersArray;
}

/* Short Summary: Update given index with a new name in the global columndata object
 *
 * @param params (object) : Object containing function parameters
 *      @param params.rownumber : rownumber of the value to change
 *      @param params.originalname : originalname of the column
 *      @param params.newname : newname of the column
 * 
 * @return undefined
 */
function setHeaderColumnName(params)
{
    let columnData = getCsvHeadersArray();
    columnData[params.rownumber] = params.newname;
    setCsvHeadersArray(columnData);
};


function setOutputValue(key, value)
{
    globalFile.output[key] = value;
};

function setColumnsOutputValue(rowNumber, key, value)
{
    globalFile.output.columns.at(rowNumber) ? globalFile.output.columns.at(rowNumber)[key] = value : globalFile.output.columns[rowNumber] = {[key]: value};
};

function getDescriptiveOutput()
{
    return globalFile.output;
}


/*--------- Events Pre Document Load -------------- */
createLimnoODM2VariableNameDataList();
createFullODM2VariableNameDataList();
createUnitDataList();
createNoDSTTimeZoneDataList();
createDSTTimeZoneDataList();

if (document.readyState === 'loading') 
{  // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', handleDOMContentLoaded,false);
} 
else 
{  // `DOMContentLoaded` has already fired
    handleDOMContentLoaded();   
}

function handleDOMContentLoaded()
{
    //Add Event Handlers to file input HTML elements
    initializeInputFileElement();

    //Fetch ODM2 Variable Names
    // fetchOdm2VariableNames();

    //Load ODM2 Variables into datalist
    // createODM2VariableNameDataList();
    
};



/**
 * 
 * @param { String } relativePathToText 
 *          Relative path to the text file to be read. Path is relative from the file
 *             this function is in.
 * @param { Bool } isLimno
 *          True if the file should be filtered for limno variables 
 * @param { String } fileType
 *          A string for the file type. Either '.csv' or '.txt'
 * @param { String } listElementId
 *          The id of the datalist element to be created
 * @param { Bool } unitsFile
 *          true if the file is a units file
 */
function prepareFileForDatalist(relativePathToText, isLimno, fileType, unitsFile='false', listElementId, hasHeaderColumn=true, DSTTimeZoneStatus=false)
{
    const getFileRequest = new Request(relativePathToText);

    fetch(getFileRequest)
    .then((response) => {
        return response.text();
    }).then((data) => {

        //shift() removes first element of the array because it is the header row
        let dataArray = data.split("\n");

        if(hasHeaderColumn) dataArray.shift();

        //Filter out rows that are not needed for Limno
        if(isLimno)
        {
            dataArray = filterRowsForLimno(dataArray);
        }

        if(DSTTimeZoneStatus === 'DST')
        {
            dataArray = filterRowsForDST(dataArray);
        }else if(DSTTimeZoneStatus === 'nonDST')
        {
            dataArray = filterRowsForNonDST(dataArray); 
        }

        dataArray.forEach((value, index, array) => {
            if(DSTTimeZoneStatus !== false)
            {
                array[index] = value.split(',')[0]
            }
            else
            {
                switch (fileType) {
                    case '.csv':
                        array[index] = value.split(/"?,(?![\d\w])"?|(?<=,),/, 7);
                        break;
                    case '.txt':
                        value = value.replaceAll('"', '');
                        array[index] = value.split("\t");
                        break;
                    default:
                        break;
                }
            }

            if( unitsFile === true )
            {
                array[index] = {
                    term: array[index][0], 
                    name: array[index][1],
                    unitsTypeCV: array[index][2],
                    unitsLink: array[index][4],
                    unitAbbreviation: array[index][6],
                }
            }
            else if(DSTTimeZoneStatus !== false)
            {
                array[index] = {
                    term: array[index], 
                    name: array[index]
                };
            }
            else
            {
                array[index] = {
                    term: array[index][0], 
                    name: array[index][1], 
                    definition: array[index][2],
                    provenance: array[index][4],
                };
            }
            
        });

        let datalist;
        if( unitsFile === true )
        {
            datalist = createUnitDataListElements(dataArray, id=listElementId);
        }
        else
        {
            datalist = createVariablesDataListElements(dataArray, id=listElementId);
        }

        $('#datalists').append(datalist);
    });
};

/**
 * Short Summary: Returns a filtered array of rows.
 *                  If a row has a 1 at the end of the row, it is included in the array
 * Parameters:
 *  @param dataArray (Array[String]) : Array of rows to filter
 */
function filterRowsForLimno(dataArray)
{            
    //Filter out rows that are not needed
        return dataArray.filter(
        (value, index, array) => 
        {
            return value.endsWith("1\r") || value.endsWith("1");
        });
};

function filterRowsForDST(dataArray)
{            
    //Filter out rows that are not needed
        return dataArray.filter(
        (value, index, array) => 
        {
            return value.endsWith("Y\r") || value.endsWith("Y");
        });
};

function filterRowsForNonDST(dataArray)
{
    return dataArray.filter(
        (value, index, array) => 
        {
            return (value.endsWith("N\r") || value.endsWith("N"));
        });
}

/* -------------- Data List Creation ----------------- */

/*  Short Summary: Fetches local .csv with odm2 variable names, and converts the list
 *                 of variables into a datalist that is added to the end of the <div id="datalists">
 */
function createLimnoODM2VariableNameDataList()
{
    // let listElementId = getLimnoListElementId();
    prepareFileForDatalist(relativePathToText='./data/limno_list/ODM2_varname_limno.txt', isLimno=true, fileType='.txt', unitsFile=false, listElementId=getLimnoListElementId(), hasHeaderColumn=true);
};

/*  Short Summary: Fetches local .csv with odm2 variable names, and converts the list
 *                 of variables into a datalist that is added to the end of the <div id="datalists">
 */
function createFullODM2VariableNameDataList()
{
    // let listElementId = getFullListElementId();
    prepareFileForDatalist(relativePathToText='./data/full_list/ODM2_varname_full.csv', isLimno=false, fileType='.csv', unitsFile=false, listElementId=getFullListElementId(), hasHeaderColumn=true,DSTTimeZoneStatus=false);
};

function createUnitDataList()
{
    prepareFileForDatalist(relativePathToText='./data/limno_list/ODM2_units_limno_abbv.txt', isLimno=false, fileType='.txt', unitsFile=true, listElementId=getUnitListElementId(), hasHeaderColumn=true,DSTTimeZoneStatus=false);
};

function createNoDSTTimeZoneDataList()
{
    prepareFileForDatalist(relativePathToText='./data/timeZones/onlyDSTTimeZones.csv', isLimno=false, fileType='.csv', unitsFile=false, listElementId=getNonDSTTimeZoneListElementId(), hasHeaderColumn=true, DSTTimeZoneStatus='nonDST');
}

function createDSTTimeZoneDataList()
{
    prepareFileForDatalist(relativePathToText='./data/timeZones/onlyDSTTimeZones.csv', isLimno=false, fileType='.csv', unitsFile=false, listElementId=getDSTTimeZoneListElementId(), hasHeaderColumn=true, DSTTimeZoneStatus='DST');
}

/*  Short Summary: Selects the controlled unit input, and returns the value
 * 
 * @return ( String ) : id of the datalist that should be used in the table
 */
function getSelectedControlledUnitDataListId()
{
    //Return value of selected datalist name
    let input = getUnitListElement();

    return input.id;    
}

function getUnitListElement()
{
    let id = getUnitListElementId();
    return $(`#${id}`)[0];
}

function getUnitListElementId()
{
    return 'ODM2_units';
};

function getNonDSTTimeZoneListElementId()
{
    return 'NonDSTTimeZones';
};

function getDSTTimeZoneListElementId()
{
    return 'DSTTimeZones';
};

function getColumnTypeDefaultValue()
{
    return "Normal";
}

function getColumnTypeOptions()
{
    return $('<option value="Multivariable">Multivariable</option><option value="Normal">Normal</option>');
};

function getLimnoListElementId()
{
    return 'ODM2_limno';
};

function getFullListElementId()
{
    return 'ODM2_full';
};

/*  Short Summary: Selects the controlled vocabulary input, and returns the value
 * 
 * @return ( String ) : id of the datalist that should be used in the table
 */
function getSelectedControlledVocabularyDataListId()
{
    //Return value of selected datalist name
    let input = getControlledVocabularyInputElement();

    //Check if the full list or limno list should be used
    let name = getLimnoQuestionInputAttributes().name;
    let isLimno = document.querySelector(`input[name="${name}"]:checked`).value

    if(isLimno)
    {
        return input.value + '_limno';
    };
    return input.value + '_full';

}

function clearHTMLFromElementByID(id)
{
    let el = $(`#${id}`);
    el.html("");
}

function getControlledVocabularyInputElement()
{
    return $('#controlledVocabularyInput')[0];
}

/*  Short Summary: Creates a datalist HTMLElement based on the given array
 *  
 *  @params arr ( Array[String] ) :  Array of elements to add as options in a datalist.
 *                                     arr[0] = [Variable Name, Variable Definition]
 *  @params id (String) : id attribute to be set for the datalist element
 *  
 *  @return HTMLElement <datalist> with <option> elements
 */
function createVariablesDataListElements(arr, id)
{   
    let datalist, option;

    datalist = $('<datalist></datalist>');
    datalist.attr('id', id);

    arr.forEach(function(value, index, array){
        option = $('<option></option');
        option.attr('value', value.term);
        option.attr('id', value.term); 
        option.attr('data-term', value.term);
        option.attr('data-description', value.definition);
        option.attr('data-provenance', value.provenance);
        option.attr('data-name', value.name);
        option.attr('label', value.name);

        //this === datalist
        //Add option to datalist
        this.append(option);
        
    }, datalist);

    return datalist;
};


/*  Short Summary: Creates a datalist HTMLElement based on the given array
 *  
 *  @params arr ( Array[String] ) :  Array of elements to add as options in a datalist.
 *                                     arr[0] = [Variable Name, Variable Definition]
 *  @params id (String) : id attribute to be set for the datalist element
 *  
 *  @return HTMLElement <datalist> with <option> elements
 */
function createUnitDataListElements(arr, id)
{   
    let datalist, option;

    datalist = $('<datalist></datalist>');
    datalist.attr('id', id);

    arr.forEach(function(value, index, array){
        option = $('<option></option');
        option.attr('value', value.unitAbbreviation);
        option.attr('id', value.term); 
        option.attr('data-term', value.term);
        option.attr('data-description', value.unitsTypeCV);
        option.attr('data-provenance', value.unitsLink);
        option.attr('data-name', value.name);
        option.attr('label', value.name);

        //this === datalist
        //Add option to datalist
        this.append(option);
        
    }, datalist);

    return datalist;
};

/* Short Summary: Add event listeners to input file HTML elements
 * 
 * Description: Called from main.js in response to the DOMContentLoaded Event
 *              Initializes event handlers responsible for uploading an input file      
 */
function initializeInputFileElement()
{
    const input = $('#fileInput');
    const button = $('#fileInputButton');

    button.on('click', (e) => {
        if(input){
            input.click();
        }
    });

    input.on("change", handleFiles);
};

/*----------------------- File Handling --------------------------------*/


/* Short Summary: Process an uploaded file, updating the window with file information
 * 
 * Description: Function is called when a file is uploaded or dragged and dropped
 *      
 */
function handleFiles()
{
    const fileList = this.files;
    const file = fileList[0];

    const reader = new FileReader();
    
    setUploadedFileName(fileList[0].name);

    let filenameWithoutExtension = fileList[0].name.split('.')[0];
    $('#renameFileNameInput')[0].value = filenameWithoutExtension + '_renamed.csv';
    $('#descriptionFileNameInput')[0].value = filenameWithoutExtension + '_parameter_descriptions.txt';

    reader.onload = function(e){
        rawFileData = e.target.result;

        let csvRows = e.target.result.split("\n");
        
        setCsvRows(csvRows);
        setCsvUploaded(true);

        let csvHeadersArray = csvRows[0].replaceAll('\r', '').split(',');

        //Initialize global variables for header arrays
        
        setCsvHeadersArray(csvHeadersArray);
        setPreviewTableHeadersArray(csvHeadersArray);

        resetForm();
        
        createQuestionElements();
        createDateTimeSection();
        createRenameTable(getCsvRows());
        createPreviewTable(getCsvRows());

    };

    reader.readAsText(file);
};

function resetForm()
{
    clearHTMLFromElementByID('dateTimeFormDiv');
    clearHTMLFromElementByID('dateFormDiv');
}

/*  Short Summary: Return id of the datalist element that lists out the possible 
 *                 controlled vocabularies to use
 */
function getControlledVocabularyDataListId()
{
    return 'controlledVocabularyList';
};


function createQuestionElements()
{
    let div = $('#questionsDiv');

    //Clear div
    div.html("");

    //Create an input to select the controlled vocabulary
    let controlledVocabularyInput = createControlledVocabularyInput();
    let controlledVocabularyLabel = createControlledVocabularyLabel();

    //Adds created elements to the <div>
    div.append("<hr><h2>Options</h2>");
    div.append(controlledVocabularyLabel);
    div.append(controlledVocabularyInput);


    createLimnoQuestionAndAppendToDiv(div);
    createDepthQuestionAndAppendToDiv(div);

    div.append("<br>");
    
    //Create an input for the COMID
    div.append('<a target="_blank" href="https://docs.google.com/document/d/1JYbkfELCY0MWOWYREPyM61-bHjUl49YmqUwISsjw_tY/edit?usp=sharing">Find your Lake Common Identifier (COMID)</a>');
    div.append("<br>");
    createCOMIDLabelAndAppendToDiv(div);
    createCOMIDInputAndAppendToDiv(div);
    div.append("<br>");
}


function createDateTimeSection()
{
    let div = $('#dateTimeSection');

    //Clear div
    div.html("");
    
    div.append('<hr><h2 class="text-center">Date Time</h2>');

    let dateTimeQuestionDiv = $('<div id="dateTimeQuestionDiv"></div>');
    createDateTimeColumnQuestionAndAppendToDiv(dateTimeQuestionDiv);
    div.append(dateTimeQuestionDiv);

    let dateQuestionDiv = $('<div id="dateQuestionDiv"></div>');
    createDateColumnQuestionAndAppendToDiv(dateQuestionDiv);
    dateQuestionDiv.attr('hidden', true);
    div.append(dateQuestionDiv);

    createDateColumnSelectAndAppendToDiv(div);

    let timeQuestionDiv = $('<div id="timeQuestionDiv"></div>');
    createTimeColumnQuestionAndAppendToDiv(timeQuestionDiv);
    timeQuestionDiv.attr('hidden', true);
    div.append(timeQuestionDiv);

    createTimeColumnSelectAndAppendToDiv(div);

    createDateTimeFormAndAppendToDiv(div); 

}

function createDateTimeFormAndAppendToDiv(div)
{
    let select;

    //Add id, name, and parentrow to the input
    select = $('<select></select>')
        .attr('id', 'dateTimeColumnSelect')
        .attr('name', 'dateTimeColumnSelect')
        .attr('hidden', true);

    let array = getCsvHeadersArray();


    //Default Option
    let optionElementsString = '<option hidden disabled selected value> -- select an option -- </option><option value=""></option>'
    
    //Add one <option> for each column in the table
    optionElementsString += array.reduce((accumulator, currentValue, currentIndex, array) => 
    {
        accumulator += `<option value="${currentValue}_${currentIndex}">${currentValue}</option>`;
        return accumulator;
    },
    initialValue=""
    );

    let optionElements = $(optionElementsString);
    select.append(optionElements);

    let selectLabel = createLabelElement({'id':'dateTimeColumnLabel'}, text="Select DateTime Column.");
    selectLabel.attr('hidden', true);

    //Add an onChange event
    select.on('input', dateTimeColumnSelected);

    div.append("<br>");
    div.append(selectLabel);
    div.append(select);
}

function dateColumnSelected(event)
{
    let selectedColumnId = event.target.value;
    let currentColumn = getCurrentDateColumnSelected();

    if(currentColumn !== undefined)
    {
        //Allow previous column to be selected by Date Column
        $(`#timeColumnSelect > option[value="${currentColumn}"]`).attr('hidden', false);
    }

    setCurrentDateColumnSelected(selectedColumnId);
    hideSelectedRow(selectedColumnId);

    

    $(`#timeColumnSelect > option[value="${selectedColumnId}"]`).attr('hidden', true);

    createDateForm(selectedColumnId);
}

function timeColumnSelected(event)
{
    let selectedColumnId = event.target.value;

    let currentColumn = getCurrentTimeColumnSelected();
    if(currentColumn !== undefined)
    {
        //Allow previous column to be selected by Date Column
        $(`#dateColumnSelect > option[value="${currentColumn}"]`).attr('hidden', false);
    }

    setCurrentTimeColumnSelected(selectedColumnId);
    hideSelectedRow(selectedColumnId);

    //Hide the column with id === selectedColumnId as an option from the Date Format Selector
    $(`#dateColumnSelect > option[value="${selectedColumnId}"]`).attr('hidden', true);

    createTimeForm(selectedColumnId);
}

function dateTimeColumnSelected(event)
{
    let selectedColumnId = event.target.value;

    hideSelectedRow(selectedColumnId);
    createDateTimeForm(selectedColumnId);
}

function hideSelectedRow(selectedColumnId)
{
    let currentHiddenRow = getHiddenDateTimeRow();
    if(currentHiddenRow !== null)
    {
        //show row
        currentHiddenRow.hidden = false;
    }

    //If the option selected was no column, then return
    if(selectedColumnId === "") 
    {
        setHiddenDateTimeRow(null);
        return;   
    }

    //Hide next row
    currentHiddenRow = $(`tr#row_${selectedColumnId.split("_").at(-1)}`)[0];
    setHiddenDateTimeRow(currentHiddenRow);
    currentHiddenRow.hidden = true;
    
}


function destroyDateTimeForm()
{
    let div = $('#dateTimeFormDiv');
    //Clear div
    div.html("");
}


function destroyDateForm()
{
    let div = $('#dateFormDiv');

    //Clear div
    div.html("");
}

function createDateForm(selectedColumnId)
{
    destroyDateForm();

    if(selectedColumnId === "") return;

    let div = $('#dateFormDiv');
    
    //Create Form Element
    let form = $("<form></form>");

    let rowOne = $("<div class='d-flex row'></div>")
    let columnNameFormGroup = $("<div class='form-group col-md-4'></div>");
    let columnNameLabel = $("<label for='dateFormOriginalName'>Date Column Original Name</label>");
    let columnNameInput = $("<input type='text' class='form-control' id='dateFormOriginalName' disabled>");

    let selectedColumnName = selectedColumnId.slice(0, -2);
    columnNameInput.val(selectedColumnName);

    columnNameFormGroup.append(columnNameLabel);
    columnNameFormGroup.append(columnNameInput);
    rowOne.append(columnNameFormGroup);

    let newNameFormGroup = $("<div class='form-group col-md-4'></div>");
    let newNameLabel = $("<label for='dateFormNewName'>Date Column New Name</label>");
    let newNameInput = $("<input type='text' class='form-control' id='dateFormNewName' disabled>");
    newNameInput.val("date");

    newNameFormGroup.append(newNameLabel);
    newNameFormGroup.append(newNameInput);
    rowOne.append(newNameFormGroup);

    form.append(rowOne);


    //Row Two
    let rowTwo = $("<div class='d-flex row'></div>");

    let valueFormGroup = $("<div class='form-group col-md-4'></div>");
    let valueLabel = $("<label for='dateFormValue'>Date Value</label>");
    let valueInput = $("<input type='text' class='form-control' id='dateFormValue' disabled>");
    valueInput.val(getFirstDateValue(selectedColumnId));

    valueFormGroup.append(valueLabel);
    valueFormGroup.append(valueInput);
    rowTwo.append(valueFormGroup);

    let isISOValidDateFormat = testDateFormat(getFirstDateValue(selectedColumnId));

    let formatStatusMessage = $('<h3 id="formatStatusMessage"></h3>');
    if(isISOValidDateFormat)
    {
        //Display text saying format is an understand ISO Date Time Format
        let validText = 'Valid Date Format Detected';
        formatStatusMessage.text(validText);
        formatStatusMessage.addClass('valid-format');
    }
    else
    {
        //This is not an ISO valid dateTime.
        //Need further user input
        let formatFormGroup = $("<div class='form-group col-md-4'></div>");
        let formatLabel = $("<label for=dateFormFormat>Please Input Your Date Format</label>");
        // let formatInput = $("<input type='text' class='form-control' id='dateTimeFormFormat' placeholder='MM/DD/YYY hh/mm/ss'>");
        let formatSelect = $("<select class='form-control' id='dateFormFormat'>");
        addDateFormatOptionsToSelectElement(formatSelect);        
        formatSelect.on('input', function(e){
            if(e.target.value === "Custom")
            {
                $('#formatCustomFormGroup').attr("hidden", false);
                $('#formatStatusMessage').text(""); 
            }
            else
            {
                $('#formatCustomFormGroup').attr("hidden", true);
                //check if input is valid by seeing if the test value matches the selected format
                let testDate = DateTime.fromFormat($('#dateFormValue')[0].value, e.target.value.split('(')[0].trim());
                if(testDate.isValid)
                {
                    //Display text saying format is an understand ISO Date Time Format
                    let validText = 'Valid Date Format Detected';
                    $('#formatStatusMessage').text(validText);
                    formatStatusMessage.addClass('valid-format');
                    formatStatusMessage.removeClass('invalid-format');
                    setDateTimeFormat(e.target.value.split('(')[0].trim());
                }
                else
                {
                    //Display text saying format is an understand ISO Date Time Format
                    let invalidText = 'Format not Detected. Try another format or use the "Custom" Option';
                    formatStatusMessage.addClass('invalid-format');
                    formatStatusMessage.removeClass('valid-format');
                    $('#formatStatusMessage').text(invalidText);
                    setDateTimeFormat(null);
                }
            }
            
        });

        formatFormGroup.append(formatLabel);
        formatFormGroup.append(formatSelect);
        rowTwo.append(formatFormGroup);

        let formatCustomFormGroup = $("<div id='formatCustomFormGroup' hidden class='form-group col-md-4'></div>");
        let formatInputCustom = $("<input type='text' class='form-control' id='dateFormFormatCustom'></input>");
        let formatLabelCustom = $("<label for=dateFormFormatCustom>Custom Date Format</label>");
        let formatHelpTextCustom = $("<small id='dateFormFormatHelpTextCustom' class='form-text text-muted'><a target='_blank' href='https://github.com/moment/luxon/blob/master/docs/parsing.md#table-of-tokens'>Use Values Found In This Table</a><br>Example: yyyy-MM-dd is valid for 2018-05-23</small>");
        formatCustomFormGroup.append(formatLabelCustom);
        formatCustomFormGroup.append(formatInputCustom);
        formatCustomFormGroup.append(formatHelpTextCustom);
        formatCustomFormGroup.append($('<p id="formatCustomStatusMessage"></p>'));
        rowTwo.append(formatCustomFormGroup);

        formatInputCustom.on('input', function(e){
            let testDate = DateTime.fromFormat($('#dateFormValue')[0].value, e.target.value);
            let formatCustomStatusMessage = $('#formatCustomStatusMessage');
            if(testDate.isValid)
            {
                //Display text saying format is an understand ISO Date Time Format
                let validText = 'Valid Date Format Detected';
                formatCustomStatusMessage.addClass('valid-format');
                formatCustomStatusMessage.removeClass('invalid-format');
                formatCustomStatusMessage.text(validText);
                setDateTimeFormat(e.target.value);
            }
            else
            {
                //Display text saying format is an understand ISO Date Time Format
                let invalidText = 'Format not Detected. Try another format.';
                formatCustomStatusMessage.addClass('invalid-format');
                formatCustomStatusMessage.removeClass('valid-format');
                formatCustomStatusMessage.text(invalidText);
                setDateTimeFormat(null);
            }
        });

    }

    rowTwo.append(formatStatusMessage);
    form.append(rowTwo);

    //TODO add information to output file

    div.append($('<br><h2>Date Format</h2>'));
    div.append(form);

    $('#timeQuestionDiv').before(div);
}
/*
 * @param selectedColumnId [String]: The column name that was selected as the "datetime" column
                                        by the user
 */
function createDateTimeForm(selectedColumnId)
{
    destroyDateTimeForm();

    if(selectedColumnId === "") return;

    let div = $('#dateTimeFormDiv');
    
    //Create Form Element
    let form = $("<form></form>");

    let rowOne = $("<div class='d-flex row'></div>")
    let columnNameFormGroup = $("<div class='form-group col-md-4'></div>");
    let columnNameLabel = $("<label for='datetimeFormOriginalName'>Date Time Column Original Name</label>");
    let columnNameInput = $("<input type='text' class='form-control' id='datetimeFormOriginalName' disabled>");

    let selectedColumnName = selectedColumnId.slice(0, -2);
    columnNameInput.val(selectedColumnName);

    columnNameFormGroup.append(columnNameLabel);
    columnNameFormGroup.append(columnNameInput);
    rowOne.append(columnNameFormGroup);

    let newNameFormGroup = $("<div class='form-group col-md-4'></div>");
    let newNameLabel = $("<label for='datetimeFormNewName'>Date Time Column New Name</label>");
    let newNameInput = $("<input type='text' class='form-control' id='datetimeFormNewName' disabled>");
    newNameInput.val("datetime");

    newNameFormGroup.append(newNameLabel);
    newNameFormGroup.append(newNameInput);
    rowOne.append(newNameFormGroup);

    form.append(rowOne);


    //Row Two
    let rowTwo = $("<div class='d-flex row'></div>");

    let valueFormGroup = $("<div class='form-group col-md-4'></div>");
    let valueLabel = $("<label for='datetimeFormValue'>Date Time Value</label>");
    let valueInput = $("<input type='text' class='form-control' id='datetimeFormValue' disabled>");
    valueInput.val(getFirstDateTimeValue(selectedColumnId));

    valueFormGroup.append(valueLabel);
    valueFormGroup.append(valueInput);
    rowTwo.append(valueFormGroup);

    let isISOValidDateTimeFormat = testDateTimeFormat(getFirstDateTimeValue(selectedColumnId));

    let formatStatusMessage = $('<h3 id="formatStatusMessage"></h3>');
    if(isISOValidDateTimeFormat)
    {
        //Display text saying format is an understand ISO Date Time Format
        let validText = 'Valid Date Time Format Detected';
        formatStatusMessage.text(validText);
        formatStatusMessage.addClass('valid-format');
    }
    else
    {
        //This is not an ISO valid dateTime.
        //Need further user input
        let formatFormGroup = $("<div class='form-group col-md-4'></div>");
        let formatLabel = $("<label for=dateTimeFormFormat>Please Input Your Date Time Format</label>");
        // let formatInput = $("<input type='text' class='form-control' id='dateTimeFormFormat' placeholder='MM/DD/YYY hh/mm/ss'>");
        let formatSelect = $("<select class='form-control' id='dateTimeFormFormat'>");
        addDateTimeFormatOptionsToSelectElement(formatSelect);        
        formatSelect.on('input', function(e){
            if(e.target.value === "Custom")
            {
                $('#formatCustomFormGroup').attr("hidden", false);  
                $('#formatStatusMessage').text(""); 
            }
            else
            {
                
                $('#formatCustomFormGroup').attr("hidden", true);
                //check if input is valid by seeing if the test value matches the selected format
                let testDate = DateTime.fromFormat($('#datetimeFormValue')[0].value, e.target.value.split('(')[0].trim());
                if(testDate.isValid)
                {
                    //Display text saying format is an understand ISO Date Time Format
                    let validText = 'Valid Date Time Format Detected';
                    formatStatusMessage.addClass('valid-format');
                    formatStatusMessage.removeClass('invalid-format');
                    $('#formatStatusMessage').text(validText);
                    setDateTimeFormat(e.target.value.split('(')[0].trim());
                }
                else
                {
                    //Display text saying format is an understand ISO Date Time Format
                    let invalidText = 'Format not Detected. Try another format or use the "Custom" Option';
                    formatStatusMessage.addClass('invalid-format');
                    formatStatusMessage.removeClass('valid-format');
                    $('#formatStatusMessage').text(invalidText);
                    setDateTimeFormat(null);
                }
            }
            
        });
        formatFormGroup.append(formatLabel);
        formatFormGroup.append(formatSelect);
        rowTwo.append(formatFormGroup);

        let formatCustomFormGroup = $("<div id='formatCustomFormGroup' hidden class='form-group col-md-4'></div>");
        let formatInputCustom = $("<input type='text' class='form-control' id='dateTimeFormFormatCustom'></input>");
        let formatLabelCustom = $("<label for=dateTimeFormFormatCustom>Custom Date Time Format</label>");
        let formatHelpTextCustom = $("<small id='dateTimeFormFormatHelpTextCustom' class='form-text text-muted'><a target='_blank' href='https://github.com/moment/luxon/blob/master/docs/parsing.md#table-of-tokens'>Use Values Found In This Table</a><br>Example: yyyy-MM-dd HH:mm:ss is valid for 2018-05-23 12:00:00</small>");
        formatCustomFormGroup.append(formatLabelCustom);
        formatCustomFormGroup.append(formatInputCustom);
        formatCustomFormGroup.append(formatHelpTextCustom);
        formatCustomFormGroup.append($('<p id="formatCustomStatusMessage"></p>'));
        rowTwo.append(formatCustomFormGroup);

        formatInputCustom.on('input', function(e){
            let testDate = DateTime.fromFormat($('#datetimeFormValue')[0].value, e.target.value);
            let formatCustomStatusMessage = $('#formatCustomStatusMessage');
            if(testDate.isValid)
            {
                //Display text saying format is an understand ISO Date Time Format
                let validText = 'Valid Date Time Format Detected';
                formatCustomStatusMessage.addClass('valid-format');
                formatCustomStatusMessage.removeClass('invalid-format');
                formatCustomStatusMessage.text(validText);
                setDateTimeFormat(e.target.value);
            }
            else
            {
                //Display text saying format is an understand ISO Date Time Format
                let invalidText = 'Format not Detected. Try another format.';
                formatCustomStatusMessage.addClass('invalid-format');
                formatCustomStatusMessage.removeClass('valid-format');
                formatCustomStatusMessage.text(invalidText);
                setDateTimeFormat(null);
            }
        });

    }

    rowTwo.append(formatStatusMessage);
    form.append(rowTwo);

    //Row Three
    let rowThree = $("<div class='d-flex row'></div>");
    let dstOnlyFormGroup = $("<div id='dstOnlyFormGroup' class='form-group col-md-4'></div>");

    let dstCheckboxLabel = $("<label class='form-check-label' for='dstCheckboxInput'>Does your datetime observe DST?</label>");
    let dstCheckboxInput = $("<input id='dstCheckboxInput' class='form-check-input' type='checkbox' value=''>");

    //Create checkbox to switch  to zoneInput.attr('list', ``${getDSTTimeZoneListElementId()}``);
    dstCheckboxInput.on('change', function(e){
        if(e.target.checked)
        {
            $("#dateTimeFormTimeZone").attr('list', `${getDSTTimeZoneListElementId()}`);
        }
        else{
            $("#dateTimeFormTimeZone").attr('list', `${getNonDSTTimeZoneListElementId()}`);
        }

    });

    dstOnlyFormGroup.append(dstCheckboxLabel);
    dstOnlyFormGroup.append(dstCheckboxInput);
    
    rowThree.append(dstOnlyFormGroup);

    let zoneFormGroup = $("<div class='form-group col-md-4'></div>");
    let zoneLabel = $("<label for='dateTimeFormTimeZone'>Time Zone</label>");
    let zoneInput = $("<input class='form-control' id='dateTimeFormTimeZone'>");
    let zoneTooltip = $(`<button type="button" class="help-button btn" data-toggle="tooltip" data-placement="right" title="For more information on timezone names and details, <a href='https://en.wikipedia.org/wiki/List_of_tz_database_time_zones'>see this link</a>">&#9432;</button>`).tooltip({'html': true, 'delay': { "hide": 2000 }});
    zoneLabel.append(zoneTooltip);
    zoneInput.attr('list', `${getNonDSTTimeZoneListElementId()}`);

    
    zoneFormGroup.append(zoneLabel);
    zoneFormGroup.append(zoneInput);
    rowThree.append(zoneFormGroup);

    form.append(rowThree);

    //TODO add information to output file

    div.append($('<br><h2>Date Time Format</h2>'));
    div.append(form);

    $('#dateTimeSection').after(div);

}//End createDateTimeForm

function addDateTimeFormatOptionsToSelectElement(selectElement)
{
   let optionElements =  $(`
    <option hidden disabled selected value> -- select an option -- </option><option value=""></option>
    <option >yyyy-MM-dd HH:mm:ss (Ex: 2023-04-13 14:52:30)</option>
    <option>yyyy-MM-dd HH:mm (Ex: 2023-04-13 14:52)</option>
    <option>yyyy-MM-dd HH:mm:ss a (Ex: 2023-04-13 14:52:30 pm)</option>
    <option>yyyy-MM-dd HH:mm a (Ex: 2023-04-13 14:52 pm)</option>
    <option>MM/dd/yy hh:mm a (Ex: 04/13/23 2:52 pm)</option>
    <option>MM/dd/yyyy hh:mm a (Ex: 04/13/2023 2:52 pm)</option>
    <option>MM/dd/yy HH:mm (Ex: 04/13/23 14:52)</option>
    <option>MM/dd/yyyy HH:mm (Ex: 04/13/2023 14:52)</option>
    <option>Custom</option>`);
    
    selectElement.append(optionElements);
}

function addDateFormatOptionsToSelectElement(selectElement)
{
   let optionElements =  $(`
    <option hidden disabled selected value> -- select an option -- </option><option value=""></option>
    <option >M/d/y (Ex: 4-30-13)</option>
    <option >yyyy-MM-dd (Ex: 2023-04-13)</option>
    <option>MM/dd/yyyy (Ex: 04/13/2023)</option>
    <option>Custom</option>`);
    
    selectElement.append(optionElements);
}

function getFirstDateValue(columnName)
{
    return getFirstValueOfColumn(columnName);  
}

function getFirstValueOfColumn(columnName)
{
    let index = columnName.at(-1);

    let rows = getCsvRows();
    //Skip Header Row, get first data row
    let firstDataRow = rows.slice(1,2)[0];
    let dateTimeValue = firstDataRow.split(",")[index];

    return dateTimeValue;
}

function getFirstDateTimeValue(columnName)
{
    return getFirstValueOfColumn(columnName);
}


function testDateFormat(dateTimeValue)
{
    //Valid "DateTime" formats include values with only Dates, and no Times
    return testDateTimeFormat(dateTimeValue);
}

function testDateTimeFormat(dateTimeValue)
{

    //Tries to create a DateTime from a string in
    //an ISO Valid DateTime format - https://moment.github.io/luxon/#/parsing?id=iso-8601
    let dateTest = DateTime.fromISO(dateTimeValue);
    return dateTest.isValid;
}

/*  Short Summary: Creates a table with values from an input csv file
 *                 The rename table displays the current column name, and provides
 *                 a way to select a new column name.
 *                 See getRenameTableHeaderElementNames() function for information on the current columns
 *  
 *  @params csvRows {Array[String][String]}  An array containing the rows of the csv file.
 *                                        The first row is always the header row.
 *      
 */
function createRenameTable(csvRows)
{  
    
    //Select rename table <div>
    let div = $('#renameTableDiv');

    //Clear div
    div.html("");

    //Create Table Element
    let table = $("<table class='table'></table>");
    
    //Create <thead> with <tr> and <th> elements
    let tableHeaderRow = createRenameTableColumnHeaders();

    //Append <thead> to <table>
    table.append(tableHeaderRow);

    //Create one <tr> for each column in the .csv file
    //csvDataRows is an array of <tr> elements
    let csvDataRows = createRenameTableColumns(getCsvHeadersArray());
    
    //Append each <tr> element to the table
    csvDataRows.forEach(function(element){
        this.append(element);
    },table);

    //Append header and table to the <div>
    div.append($('<hr><h2>Column Rename Table</h2>'));
    div.append(table);

    csvDataRows.forEach(function(element){
        //Add initial values to output object
        //Need to call updateRenameTableOutput with the newNameInput data cell for each row
        updateRenameTableOutput($(`#newNameInput_${element[0].id}`)[0]);
    })

    

    //Add Event Handlers
    $('#renameDownloadButton').off("click.download").on("click.download", () => {downloadRenameFile(); });
    $('#descriptionDownloadButton').off("click.download").on("click.download", () => {downloadDescriptionFile(); });
    
    //Unhide Div
    let downloadButtonDiv = $('#downloadButtonDiv');
    downloadButtonDiv[0].removeAttribute('hidden');
};


function createLimnoQuestionAndAppendToDiv(div)
{
    let limnoQuestionYesInput = createLimnoQuestionRadioInput(value="Yes");
    limnoQuestionYesInput.attr("checked", "checked");
    let limnoQuestionNoInput = createLimnoQuestionRadioInput(value="No");

    let limnoQuestionYesLabel = createLimnoQuestionRadioLabel("Yes");
    let limnoQuestionNoLabel = createLimnoQuestionRadioLabel("No");

    let limnoQuestionLabel = createLabelElement({'id':'depthQuestionLabel'}, text="Is this limnological data? (Selecting 'Yes' will display filtered lists of variable names and units):");

    //Adds created elements to the <div>
    div.append("<br>");
    div.append(limnoQuestionLabel);
    div.append("<br>");
    div.append(limnoQuestionYesLabel);
    div.append(limnoQuestionYesInput);
    div.append(limnoQuestionNoLabel);
    div.append(limnoQuestionNoInput);
    div.append("<br>");
};

function createDateTimeColumnQuestionAndAppendToDiv(div)
{
    let dateTimeColumnQuestionYesInput = createDateTimeColumnQuestionRadioInput(value="Yes");
    // dateColumnQuestionYesInput.attr("checked", "checked");
    let dateTimeColumnQuestionNoInput = createDateTimeColumnQuestionRadioInput(value="No");

    let dateTimeColumnQuestionYesLabel = createDateTimeColumnQuestionRadioLabel("Yes");
    let dateTimeColumnQuestionNoLabel = createDateTimeColumnQuestionRadioLabel("No");

    let dateTimeColumnQuestionLabel = createLabelElement({'id':'dateTimeColumnQuestionLabel'}, text="Do you have a single column for DateTime? (One column includes values for BOTH date and time.)");

    //Adds created elements to the <div>
    div.append("<br>");
    div.append(dateTimeColumnQuestionLabel);
    div.append("<br>");
    div.append(dateTimeColumnQuestionYesLabel);
    div.append(dateTimeColumnQuestionYesInput);
    div.append(dateTimeColumnQuestionNoLabel);
    div.append(dateTimeColumnQuestionNoInput);
    div.append("<br>");
};

function createDateColumnQuestionAndAppendToDiv(div)
{
    let dateColumnQuestionYesInput = createDateColumnQuestionRadioInput(value="Yes");
    // dateColumnQuestionYesInput.attr("checked", "checked");
    let dateColumnQuestionNoInput = createDateColumnQuestionRadioInput(value="No");

    let dateColumnQuestionYesLabel = createDateColumnQuestionRadioLabel("Yes");
    let dateColumnQuestionNoLabel = createDateColumnQuestionRadioLabel("No");

    let dateColumnQuestionLabel = createLabelElement({'id':'dateColumnQuestionLabel'}, text="Do you have a single column with date values? (Values should include day, month, and year)");

    //Adds created elements to the <div>
    div.append("<br>");
    div.append(dateColumnQuestionLabel);
    div.append("<br>");
    div.append(dateColumnQuestionYesLabel);
    div.append(dateColumnQuestionYesInput);
    div.append(dateColumnQuestionNoLabel);
    div.append(dateColumnQuestionNoInput);
}

function createTimeColumnQuestionAndAppendToDiv(div)
{
    let timeColumnQuestionYesInput = createTimeColumnQuestionRadioInput(value="Yes");
    // dateColumnQuestionYesInput.attr("checked", "checked");
    let timeColumnQuestionNoInput = createTimeColumnQuestionRadioInput(value="No");

    let timeColumnQuestionYesLabel = createTimeColumnQuestionRadioLabel("Yes");
    let timeColumnQuestionNoLabel = createTimeColumnQuestionRadioLabel("No");

    let timeColumnQuestionLabel = createLabelElement({'id':'timeColumnQuestionLabel'}, text="Do you have a single column with time values? (Values should include at least hours. Optionally minutes and seconds)");

    //Adds created elements to the <div>
    div.append("<br>");
    div.append(timeColumnQuestionLabel);
    div.append("<br>");
    div.append(timeColumnQuestionYesLabel);
    div.append(timeColumnQuestionYesInput);
    div.append(timeColumnQuestionNoLabel);
    div.append(timeColumnQuestionNoInput);
}

function createDepthQuestionAndAppendToDiv(div)
{
    let depthQuestionYesInput = createDepthQuestionRadioInput(value="Yes");
    
    let depthQuestionNoInput = createDepthQuestionRadioInput(value="No");
    depthQuestionNoInput.attr("checked", "checked");

    let depthQuestionYesLabel = createDepthQuestionRadioLabel("Yes");
    let depthQuestionNoLabel = createDepthQuestionRadioLabel("No");

    let depthQuestionLabel = createLabelElement({'id':'depthQuestionLabel'}, text="Do you have variables of the same name at different depths?");

    //Adds created elements to the <div>
    div.append("<br>");
    div.append(depthQuestionLabel);
    div.append("<br>");
    div.append(depthQuestionYesLabel);
    div.append(depthQuestionYesInput);
    div.append(depthQuestionNoLabel);
    div.append(depthQuestionNoInput);
};

function createLimnoQuestionRadioInput(value)
{
    let input = createInputElement(getLimnoQuestionInputAttributes(value), text="");
    input.on('change', handleLimnoOnlyInput);

    return input;
};

function createDateTimeColumnQuestionRadioInput(value)
{
    let input = createInputElement(getDateTimeColumnQuestionInputAttributes(value), text="");
    input.on('change', handleDateTimeColumnInput);

    return input;
};

function createDateColumnQuestionRadioInput(value)
{
    let input = createInputElement(getDateColumnQuestionInputAttributes(value), text="");
    input.on('change', handleDateColumnInput);

    return input;
};

function createTimeColumnQuestionRadioInput(value)
{
    let input = createInputElement(getTimeColumnQuestionInputAttributes(value), text="");
    input.on('change', handleTimeColumnInput);

    return input;
};

function createDepthQuestionRadioInput(value)
{
    let input = createInputElement(getDepthQuestionInputAttributes(value), text="");
    input.on('change', handleDepthQuestionInput);

    return input;
};

function handleDepthQuestionInput(e)
{
    //Enable or disable depth based on depth question


    if(e.target.value === 'Yes') 
    {
        showDepthColumn()
        
        return;
    }

    hideDepthColumn();

    return;
}

function showDepthColumn()
{
    let depthInputs = $('[id*="depthInput"');
    setDepthInputDisabled(false);
    addDepthStringsfromPreviewColumnHeadersArray();
    depthInputs.prop('disabled', false);
    $('#tableHeaderDepth').attr('hidden', false);
    depthInputs.attr('hidden', false);
}

function hideDepthColumn()
{
    let depthInputs = $('[id*="depthInput"');
    setDepthInputDisabled(true);
    removeDepthStringsfromPreviewColumnHeadersArray()
    depthInputs.prop('disabled', true);
    $('#tableHeaderDepth').attr('hidden', true)
    depthInputs.attr('hidden', true);
}



function handleLimnoOnlyInput(e){
    //Update 'list' attribute of <input> elements with the class type 'newNameInput

    let currentListBaseName = $('#controlledVocabularyInput')[0].value;

    //If "Yes", show shortened list
    if(e.target.value == "Yes")
    {          

        //Change value from <listname>_full to <listname>_limno
        $('.newNameInput').attr('list', currentListBaseName + '_limno');
        return;
    }

    //Change value from <listname>_limno to <listname>_full
    $('.newNameInput').attr('list', currentListBaseName + '_full');
};

function handleDateTimeColumnInput(e)
{
    if(e.target.value == "Yes")
    {
        hideDateQuestionDiv();  
        hideTimeQuestionDiv();
        hideDateSelect();
        hideDateForm();
        hideTimeSelect();
        hideTimeForm();

        showDateTimeSelect();
        return;
    }

    //CASE: e.target.value == "No"

    hideDateTimeSelect();
    hideDateTimeForm();

    //Display question asking if you have just a Date column
    showDateQuestionDiv();

    //Display question asking if you have just a Time column
    showTimeQuestionDiv();
}

function handleDateColumnInput(e)
{
    if(e.target.value == "Yes")
    {
        showDateSelect();

        return;
    }

    //CASE: e.target.value == "No"
    hideDateSelect();
    hideDateForm();

    //TODO Add some text about what to do if the answer is no
}

function handleTimeColumnInput(e)
{
    if(e.target.value == "Yes")
    {
        showTimeSelect();

        return;
    }

    //CASE: e.target.value == "No"
    debugger;
    hideTimeSelect();
    hideTimeForm();

    //TODO Add some text about what to do if the answer is no

}

function showTimeSelect()
{
    $('#timeColumnSelect').attr('hidden', false);
    $('#timeColumnLabel').attr('hidden', false);
}

function hideTimeSelect()
{
    $('#timeColumnSelect').attr('hidden', true);
    $('#timeColumnLabel').attr('hidden', true);

    $('#timeColumnSelect').val("");

    let yesInput = $('#timeColumnQuestionYesInput')[0];
    if( yesInput.checked === true) yesInput.checked = false;

}

function hideTimeForm()
{
    let currentColumn = getCurrentTimeColumnSelected();
    if(currentColumn !== undefined)
    {
        //Allow previous column to be selected by Date Column
        $(`#dateColumnSelect > option[value="${currentColumn}"]`).attr('hidden', false);
    }

    setCurrentTimeColumnSelected(undefined);
    hideSelectedRow("");
    destroyTimeForm();
}

function destroyTimeForm()
{
    let div = $('#timeFormDiv');
    //Clear div
    div.html("");
}

function createTimeForm(selectedColumnId)
{
    destroyTimeForm();

    if(selectedColumnId === "") return;

    let div = $('#timeFormDiv');
    
    // //Create Form Element
    let form = $("<form></form>");

    let rowOne = $("<div class='d-flex row'></div>")
    let columnNameFormGroup = $("<div class='form-group col-md-4'></div>");
    let columnNameLabel = $("<label for='datetimeFormOriginalName'>Date Time Column Original Name</label>");
    let columnNameInput = $("<input type='text' class='form-control' id='datetimeFormOriginalName' disabled>");

    let selectedColumnName = selectedColumnId.slice(0, -2);
    columnNameInput.val(selectedColumnName);

    columnNameFormGroup.append(columnNameLabel);
    columnNameFormGroup.append(columnNameInput);
    rowOne.append(columnNameFormGroup);

    form.append(rowOne);


    
    // //Row Three
    let rowThree = $("<div class='d-flex row'></div>");
    let dstOnlyFormGroup = $("<div id='dstOnlyFormGroup' class='form-group col-md-4'></div>");

    let dstCheckboxLabel = $("<label class='form-check-label' for='dstCheckboxInput'>Does your datetime observe DST?</label>");
    let dstCheckboxInput = $("<input id='dstCheckboxInput' class='form-check-input' type='checkbox' value=''>");

    //Create checkbox to switch  to zoneInput.attr('list', ``${getDSTTimeZoneListElementId()}``);
    dstCheckboxInput.on('change', function(e){
        if(e.target.checked)
        {
            $("#timeFormTimeZone").attr('list', `${getDSTTimeZoneListElementId()}`);
        }
        else{
            $("#timeFormTimeZone").attr('list', `${getNonDSTTimeZoneListElementId()}`);
        }

    });

    dstOnlyFormGroup.append(dstCheckboxLabel);
    dstOnlyFormGroup.append(dstCheckboxInput);
    
    rowThree.append(dstOnlyFormGroup);

    let zoneFormGroup = $("<div class='form-group col-md-4'></div>");
    let zoneLabel = $("<label for='timeFormTimeZone'>Time Zone</label>");
    let zoneInput = $("<input class='form-control' id='timeFormTimeZone'>");
    let zoneTooltip = $(`<button type="button" class="help-button btn" data-toggle="tooltip" data-placement="right" title="For more information on timezone names and details, <a href='https://en.wikipedia.org/wiki/List_of_tz_database_time_zones'>see this link</a>">&#9432;</button>`).tooltip({'html': true, 'delay': { "hide": 2000 }});
    zoneLabel.append(zoneTooltip);
    zoneInput.attr('list', `${getNonDSTTimeZoneListElementId()}`);

    // zoneInput.on('change', updatePreviewColumn);

    zoneFormGroup.append(zoneLabel);
    zoneFormGroup.append(zoneInput);
    rowThree.append(zoneFormGroup);

    form.append(rowThree);

    //TODO add information to output file

    div.append($('<br><h2>Time Format</h2>'));
    div.append($('<h6>By selecting a time zone in this section, it will add a new column called <strong>"timezone"</strong> to your csv. The existing time column will remain unchanged.</h6>'));
    div.append(form);

    $('#timeColumnSelect').after(div);
    
}

function showDateQuestionDiv()
{
    let dateQuestionDiv = $('#dateQuestionDiv');
    dateQuestionDiv.attr('hidden', false);
}

function hideDateQuestionDiv()
{
    let dateQuestionDiv = $('#dateQuestionDiv');
    dateQuestionDiv.attr('hidden', true);
}

function hideTimeQuestionDiv()
{
    let timeQuestionDiv = $('#timeQuestionDiv');
    timeQuestionDiv.attr('hidden', true);
}

function showTimeQuestionDiv()
{
    let timeQuestionDiv = $('#timeQuestionDiv');
    timeQuestionDiv.attr('hidden', false);
}

function createDateColumnSelectAndAppendToDiv(div)
{
    let select;
    //Add id, name, and parentrow to the input
    select = $('<select></select>')
        .attr('id', 'dateColumnSelect')
        .attr('name', 'dateColumnSelect')
        .attr('hidden', true);

    let array = getCsvHeadersArray();


    //Default Option
    let optionElementsString = '<option hidden disabled selected value> -- select an option -- </option><option value=""></option>'
    
    //Add one <option> for each column in the table
    optionElementsString += array.reduce((accumulator, currentValue, currentIndex, array) => 
    {
        accumulator += `<option value="${currentValue}_${currentIndex}">${currentValue}</option>`;
        return accumulator;
    },
    initialValue=""
    );

    let optionElements = $(optionElementsString);
    select.append(optionElements);

    let selectLabel = createLabelElement({'id':'dateColumnLabel'}, text="Select Date Column.");
    selectLabel.attr('hidden', true);

    //Add an onChange event
    select.on('input', dateColumnSelected);

    div.append("<br>");
    div.append(selectLabel);
    div.append(select);
}

function createTimeColumnSelectAndAppendToDiv(div)
{
    let select;
    //Add id, name, and parentrow to the input
    select = $('<select></select>')
        .attr('id', 'timeColumnSelect')
        .attr('name', 'timeColumnSelect')
        .attr('hidden', true);

    let array = getCsvHeadersArray();


    //Default Option
    let optionElementsString = '<option hidden disabled selected value> -- select an option -- </option><option value=""></option>'
    
    //Add one <option> for each column in the table
    optionElementsString += array.reduce((accumulator, currentValue, currentIndex, array) => 
    {
        accumulator += `<option value="${currentValue}_${currentIndex}">${currentValue}</option>`;
        return accumulator;
    },
    initialValue=""
    );

    let optionElements = $(optionElementsString);
    select.append(optionElements);

    let selectLabel = createLabelElement({'id':'timeColumnLabel'}, text="Select Time Column.");
    selectLabel.attr('hidden', true);

    //Add an onChange event
    select.on('input', timeColumnSelected);

    div.append("<br>");
    div.append(selectLabel);
    div.append(select);
}

function hideDateTimeForm()
{
    hideSelectedRow("");
    destroyDateTimeForm();
}

function hideDateForm()
{
    let currentColumn = getCurrentDateColumnSelected();

    if(currentColumn !== undefined)
    {
        //Allow previous column to be selected by Date Column
        $(`#timeColumnSelect > option[value="${currentColumn}"]`).attr('hidden', false);
    }

    setCurrentDateColumnSelected(undefined);
    hideSelectedRow("");

    destroyDateForm();
}



function hideDateTimeSelect()
{
    $('#dateTimeColumnSelect').attr('hidden', true);
    $('#dateTimeColumnLabel').attr('hidden', true);

    $('#dateTimeColumnSelect').val("");

}

function showDateTimeSelect()
{
    $('#dateTimeColumnSelect').attr('hidden', false);
    $('#dateTimeColumnLabel').attr('hidden', false);
}

function showDateSelect()
{
    $('#dateColumnSelect').attr('hidden', false);
    $('#dateColumnLabel').attr('hidden', false);
}

function hideDateSelect()
{
    $('#dateColumnSelect').attr('hidden', true);
    $('#dateColumnLabel').attr('hidden', true);

    $('#dateColumnSelect').val("");

    let yesInput = $('#dateColumnQuestionYesInput')[0];
    if( yesInput.checked === true) yesInput.checked = false;

}

function createLimnoQuestionRadioLabel(value)
{
    let inputElementAttributes = getLimnoQuestionInputAttributes(value);

    let labelElementAttributes = {
        id : `limnoQuestion${value}Label`,
        for : inputElementAttributes.id
    }

    return createLabelElement(labelElementAttributes, text=value)
};

function createDateTimeColumnQuestionRadioLabel(value)
{
    let inputElementAttributes = getDateTimeColumnQuestionInputAttributes(value);

    let labelElementAttributes = {
        id : `dateTimeColumnQuestion${value}Label`,
        for : inputElementAttributes.id
    }

    return createLabelElement(labelElementAttributes, text=value)
};

function createDateColumnQuestionRadioLabel(value)
{
    let inputElementAttributes = getDateColumnQuestionInputAttributes(value);

    let labelElementAttributes = {
        id : `dateColumnQuestion${value}Label`,
        for : inputElementAttributes.id
    }

    return createLabelElement(labelElementAttributes, text=value)
}

function createTimeColumnQuestionRadioLabel(value)
{
    let inputElementAttributes = getTimeColumnQuestionInputAttributes(value);

    let labelElementAttributes = {
        id : `timeColumnQuestion${value}Label`,
        for : inputElementAttributes.id
    }

    return createLabelElement(labelElementAttributes, text=value)
}

function createDepthQuestionRadioLabel(value)
{
    let inputElementAttributes = getDepthQuestionInputAttributes(value);

    let labelElementAttributes = {
        id : `depthQuestion${value}Label`,
        for : inputElementAttributes.id
    }

    return createLabelElement(labelElementAttributes, text=value)
};

function createButtonElement(attributes,text)
{
    return createElementWithValues('button', attributes, text);
};

function createCOMIDInputAndAppendToDiv(div)
{
    //Create input to select controlled vocabulary
    let attributes = getCOMIDInputAttributes();
    
    let COMIDInput = createInputElement(attributes, text="");

    COMIDInput.on('input', function(e){
        setOutputValue('COMID', e.target.value);
    });

    div.append(COMIDInput);
};


/* Short Summary: Create a <input> element for the controlled vocabulary input. The value of this input element
 *                determines which datalist to display for every element with the 'newNameInput' class name
 *
 * @return (HTMLElement) : <input> with attributes and text values for the controlled vocabulary input.
 *                         There is also an onchange event, that will update all elements with the 'newNameInput'
 *                         with the newly selected value
 *                          
 */
function createControlledVocabularyInput()
{
    //Create input to select controlled vocabulary
    let attributes = getControlledVocabularyInputAttributes();

    let controlledVocabularyInput = createInputElement(attributes, text="");

    //Create on change event
    controlledVocabularyInput.on('change', function(e){
        let newListId = e.target.value;
        //Update 'list' attribute of <input> elements with the class type 'newNameInput
        $('.newNameInput').attr('list', newListId);
    });

    //Select the first element by default
    controlledVocabularyInput[0].value = controlledVocabularyInput[0].list.options[0].value;

    return controlledVocabularyInput;
};

/* Short Summary: Ceate <input> HTML element
 * 
 * @param attributes (Object) : Contains key : value pairs. Each key must be a valid HTML attribute
 * @param text ( String) : A string that will be used a the textContent of the element
 * @return (HTMLElement) : <input> with attributes and text
 */
function createInputElement(attributes, text)
{
    return createElementWithValues('input', attributes, text);
};

/* Short Summary: Return all attributes for the controlled vocabulary <input> element.
 *
 * @return (Object) : Object contains valid HTML attributes as the keys
 */
function getControlledVocabularyInputAttributes(attribute=undefined)
{
    return {
        id : 'controlledVocabularyInput',
        name : 'controlledVocabularyInput',
        type : 'text',
        list : getControlledVocabularyDataListId()
    }
};

function getCOMIDInputAttributes(attribute=undefined)
{
    return {
        id : 'COMIDInput',
        name : 'COMIDInput',
        type : 'text',
    }
};


function getLimnoQuestionInputAttributes(value=undefined)
{
    return {
        id : `shortenedList${value}Input`,
        name : 'shortenedListInput',
        type : 'radio',
        value
    }
};

function getDateColumnQuestionInputAttributes(value=undefined)
{
    return {
        id : `dateColumnQuestion${value}Input`,
        name : 'dateColumnQuestion',
        type : 'radio',
        value
    }
};

function getTimeColumnQuestionInputAttributes(value=undefined)
{
    return {
        id : `timeColumnQuestion${value}Input`,
        name : 'timeColumnQuestion',
        type : 'radio',
        value
    }
};



function getDateTimeColumnQuestionInputAttributes(value=undefined)
{
    return {
        id : `dateTimeColumnQuestion${value}Input`,
        name : 'dateTimeColumnQuestion',
        type : 'radio',
        value
    }
};

function getDepthQuestionInputAttributes(value=undefined)
{
    return {
        id : `depth${value}Input`,
        name : 'depthQuestionInput',
        type : 'radio',
        value
    }
}

/* Short Summary: Create a <label> element for the controlled vocabulary input
 *
 * @return (HTMLElement) : <label> with attributes and text values for the controlled vocabulary input
 */
function createControlledVocabularyLabel()
{
    let inputElementAttributes = getControlledVocabularyInputAttributes();

    let labelElementAttributes = {
        id : 'controlledVocabularyLabel',
        for : inputElementAttributes.id
    }

    return createLabelElement(labelElementAttributes, text="Controlled Vocabulary:");
};


function createCOMIDLabelAndAppendToDiv(div)
{
    let inputElementAttributes = getCOMIDInputAttributes();

    let labelElementAttributes = {
        id : 'COMIDLabel',
        for : inputElementAttributes.id
    }

    div.append(createLabelElement(labelElementAttributes, text="COMID:"));
};


/* Short Summary: Ceate <label> HTML element
 * 
 * @param attributes (Object) : Contains key : value pairs. Each key must be a valid HTML attribute
 * @param text ( String) : A string that will be used a the textContent of the element
 * @return HTMLElement <label>
 */
function createLabelElement(attributes, text)
{
    return createElementWithValues('label', attributes, text);
}

/* Short Summary: Generate rename table header row
 * 
 * @return HTMLElement <thead>
 *                          <tr>
 *                              <th></th>? [, <th></th>] //Any number of <th> elements
 *                          </tr>
 *                      <thead>
 */
function createRenameTableColumnHeaders()
{
    //Create thead element
    let thead,tr;

    thead = $("<thead class='thead-light'></thead>");

    //Create <tr> with <th> for the rename table
    tr = createRenameTableColumnHeaderRow();
    thead.append(tr);

    return thead;
};

/* Short Summary: Create <tr> element with all necessary <th> elements for the rename table
 * 
 * @return HTMLElement <tr>
 *                      <th></th> [, <th></th>] //N <th> elements, where N is the length of headerElementsArray
 *                     </tr>
 */
function createRenameTableColumnHeaderRow()
{
    let tr = $('<tr></tr>');

    let headerElementsArray = getRenameTableHeaderElementNames();

    //Create one <th> element per object in the headerElementsArray. Adds each <th> to tr variable
    headerElementsArray.forEach(createTableHeaderElementAndAppendToTableRow,tr);

    return tr;
};

/* Short Summary: Create <th> element. Appends created <th> element to the given 'this' value
 *                It is expected that the this value is a <tr> element.
 *
 * @this HTMLElement <tr>
 * 
 * @return None
 */
function createTableHeaderElementAndAppendToTableRow(element)
{
    let th = createTableHeaderElement(element.attributes, text=element.text);

    if(element.text === "Column Type")
    {
        let tooltip = $(`<button type="button" class="help-button btn" data-toggle="tooltip" data-placement="right" title="Sample Text">&#9432;</button>`).tooltip();
        th.append(tooltip);
    }
    
    //This is expected to be a tr element
    this.append(th);
};

/* Short Summary: Contains an array of objects, where each object describes a <th> element to be created
 *                for the rename table.
 *                Objects are of the form 
 *                { 
 *                  attributes: {
 *                      key : value //Where key must be a valid HTML attribute
 *                  },
 *                  text: //Text Content to be added to the <th> element
 *                }
 * 
 * @return Array[ Objects ] : Returns an array of objects, where each object defines a <th> element
 *                            to be created. 
 */
function getRenameTableHeaderElementNames()
{
    return [
        {
            attributes: {
                id: "tableHeaderCurrentName",
            },
            text: "Current Name"
        },
        {
            attributes: {
                id: "tableHeaderColumnType"
            },
            text: "Column Type"
        },
        {
            attributes: {
                id: "tableHeaderNewName",
            },
            id: "tableHeaderNewName",
            text: "New Name"
        },
        {
            attributes: {
                id: "tableHeaderDefinition",
            },
            text: "Definition"
        },
        {
            attributes: {
                id: "tableHeaderUnit",
            },
            text: "Unit"
        },
        {
            attributes: {
                id: "tableHeaderDepth",
                hidden: true
            },
            text: "Depth",
        },
    ];
};

/* Short Summary: Creates a <th> element
 * 
 * @param attributes (Object) : Contains key : value pairs. Each key must be a valid HTML attribute
 * 
 * @param text ( String) : A string that will be used a the textContent of the <th> element
 * 
 * @return ( HTMLElement )
 */
function createTableHeaderElement(attributes, text)
{
    return createElementWithValues('th', attributes, text); 
};


/* Short Summary: Create and returns an HTML element with the given attributes and text values
 * 
 * @param element (String) : A valid HTML element
 * @param attributes (Object) : Contains key : value pairs. Each key must be a valid HTML attribute
 * 
 * @param text ( String) : A string that will be used as the text of the element
 * 
 * @return ( HTMLElement )
 */
function createElementWithValues(element, attributes, text)
{
    let elementString = `<${element}></${element}>`;
    return $(elementString).attr(attributes).text(text); 
}

/* Short Summary: Takes in the header row of a csv and turns it into an array of HTMLElement <tr>
 * 
 * @param csvHeadersArray ( Array[String] ) An array containg all of the cells in the header row of an uploaded csv
 *                                  row[0] will be the value of the first cell in the first column,
 *                                  row[1] will be the value of the first cell in the second column
 * @return ( Array [HTMLElement] )
 */
function createRenameTableColumns(csvHeadersArray)
{
    
    let createdRows = [];

    //For every column, create a <tr> element
    csvHeadersArray.forEach(function(element, index){
        let tr = createNormalTypeRow(element, rowNumber=index);

        createdRows.push(tr);
    },createdRows);

    return createdRows;
};

function createNormalTypeRow(element, rowNumber, subrow=false)
{
    let tr,td;

    tr = $('<tr></tr>');
    tr.attr('data-originalname', element);
    tr.attr('data-rownumber', rowNumber);

    let rowType = 'normal';
    
    if(subrow) rowType = 'subrow';

    tr.attr('data-rowtype', rowType);
    tr.attr('id', 'row_' + rowNumber);
    

    //Create data cell for original column name
    td = $('<td></td>').text(element);
    tr.append(td);
    
    //Create data cell for column type selection
    params = {
        "parentRow": tr.attr('id'),
        "rowNumber": rowNumber,
        "className": "columnTypeInput" , 
        "optionsListName": getColumnTypeOptions(),
        "changeEventCallback": handleColumnTypeInput,
        "defaultValue": getColumnTypeDefaultValue(),
        "disabled" : false
    };
    td = createTableDataCellWithSelect(params); 
    tr.append(td);       

    //Create data cell for new name selection
    params = {
        "parentRow":tr.attr('id'),
        "rowNumber": rowNumber,
        "className": "newNameInput" , 
        "optionsListName": getSelectedControlledVocabularyDataListId(),
        "changeEventCallback": handleNewColumnNameInput,
        "defaultValue": undefined,
        "disabled" : false,
        "hidden" : false
    };
    td = createTableDataCellWithInput(params);
    tr.append(td);

    //Create data cell for definition
    params = {
        "parentRow": tr.attr('id'),
        "rowNumber": rowNumber,
        "className" : "definitionInput",
        "changeEventCallback" : undefined,
    };

    td = createTableDataCellWithTextArea(params);
    tr.append(td);

    //Create data cell for units
    
    params = {
        "parentRow":tr.attr('id'),
        "rowNumber": rowNumber,
        "className": "unitsInput" , 
        "optionsListName": getSelectedControlledUnitDataListId(),
        "changeEventCallback": handleNewUnitInput,
        "defaultValue": undefined,
        "disabled" : false,
        "hidden" : false
    };        

    td = createTableDataCellWithInput(params);
    tr.append(td);


    params = {
        "parentRow":tr.attr('id'),
        "rowNumber": rowNumber,
        "className": "depthInput" , 
        "optionsListName": undefined,
        "changeEventCallback": handleNewDepthInput,
        "defaultValue": undefined,
        "disabled" : true,
        "hidden" : false
    };        

    td = createTableDataCellWithInput(params);
    tr.append(td);

    return tr;
}

/* Short Summary: Creates a <td> element with child <input> and <label> elements
 *                The <input> is given a list attribute. The list attribute is the id
 *                of a <datalist> element, which contains options to select from.
 *                See w3schools <input> list attribute page (https://www.w3schools.com/tags/att_input_list.asp)
 * 
 * @param params ( Object ) : Contains key-value pairs of parameters
 * @param params.parentRow ( jQuery HTMLElement ) : jQuery reference to <tr> element that the <td><input> elements are under
 * @param params.rowNumber  (Number) : Number row that this is part of 
 * @param params.className (String) : name to be added as a classname to the <input>
 * @param params.optionsListName ( String ) : id of the <datalist> element to use. The <datalist> element contains
 *                                      options to select from 
 * @param params.changeEventCallback ( Function ) : callback function for the change event of the input
 * @param params.defaultValue (String) : Default value to set the input value to
 * 
 * @return ( HTMLElement )
 */
function createTableDataCellWithInput(params)
{
    let td, input;

    let { parentRow, rowNumber, className, optionsListName, changeEventCallback, defaultValue, disabled, hidden} = params;

    let cellName = className + "_row_" + rowNumber;
    td =  $('<td></td>');

    //Add id, name, and parentrow to the input
    input = $('<input></input>').attr('id', cellName).attr('name', cellName).attr('data-parentrow', parentRow);

    //Set class
    input.addClass(className);

    //If there is an optionsListName, set the list attribute
    if(optionsListName) input.attr('list', optionsListName)

    if(disabled === true)
    {
        input.prop('disabled', true);
    }

    if(hidden === true)
    {
        input.attr('hidden', true);
    }

    //Check if there is a default value
    if(defaultValue)
    {
        input.val(defaultValue);
    }

    //Add an onChange event
    input.on('input', changeEventCallback);

    //Add input as child of td
    td.append(input);

    return td;
};


function createTableDataCellWithSelect(params)
{
    let td, select;

    let { parentRow, rowNumber, className, optionsListName, changeEventCallback, defaultValue, disabled } = params;

    let cellName = className + "_row_" + rowNumber;
    td =  $('<td></td>');

    //Add id, name, and parentrow to the input
    select = $('<select></select>').attr('id', cellName).attr('name', cellName).attr('data-parentrow', parentRow);

    //Set class
    select.addClass(className);

    if(disabled === true) select.prop('disabled', true);

    select.append(optionsListName);

    //Check if there is a default value
    if(defaultValue)
    {
        select.val(defaultValue);
    }

    //Add an onChange event
    select.on('input', changeEventCallback);

    //Add input as child of td
    td.append(select);

    return td;
}


/* Short Summary: Creates a <td> element with child <textarea> element
 *                The <input> is given a list attribute. The list attribute is the id
 *                of a <datalist> element, which contains options to select from.
 *                See w3schools <input> list attribute page (https://www.w3schools.com/tags/att_input_list.asp)
 * 
 * @param params ( Object ) : Contains key-value pairs of parameters
 * @param params.parentRow ( jQuery HTMLElement ) : jQuery reference to <tr> element that the <td><input> elements are under
 * @param params.cellName ( String ) : The name and id of the <input> element within the table cell
 * @param params.changeEventCallback ( Function ) : callback function for the change event of the input
 * 
 * @return ( HTMLElement )
 */
function createTableDataCellWithTextArea(params)
{
    let td, textarea;

    let { parentRow, rowNumber, className, changeEventCallback } = params;
    let cellName = className + "_row_" + rowNumber;
    td =  $('<td></td>');
    td.css('width', '25vw');

    textarea = $('<textarea></textarea>').attr('id', cellName).attr('name', cellName).attr('data-parentrow', parentRow);

    // textarea.css('display', 'inline-table');
    // textarea.css('width', 'inherit');

    //Add row rowNumber and row name to input element
    textarea.on('input', changeEventCallback);
    td.append(textarea);

    return td;
};

/* Short Summary: Function triggered on 'input' event when there is a new column name
 *                This function will update the column name in the table and the column name in the csv header row  
 *
 * @param e (jQuery Event) : Event object from the 'input' event
 * 
 * @return undefined
 */
function handleNewColumnNameInput(e)
{
    let input = e.target;

    updateHeaderName(input);
    updateDefinitionColumn(input);
    updatePreviewColumn(input);
    updateRenameTableOutput(input);

    //Resize based on input size
    $(input).attr('size', $(input).val().length);
};

function handleColumnTypeInput(e)
{
    //TODO this function needs to be changed to handle multiVariable Columns
    let input = e.target;
    let rowId = input.dataset.parentrow;
    let row = $(`#${rowId}`)[0];
    // $(`#${parentID}`)[0].innerHTML = '';

    if(e.target.value === "Normal")
    {
        // changeRowToNormalType(row);
        
    }

    else if(e.target.value === "Multivariable")
    {
        changeRowToMultivariableType(row);
    }
}

function changeRowToNormalType(row)
{
    
    row.dataset.rowtype = 'normal';

    //Remove any subrows
    debugger;
}

function changeRowToMultivariableType(row)
{
    row.dataset.rowtype = 'multivariable';

    //Create one subrow for each unique variable name

    let dataArray = getCsvRows();

    let set = new Set();

    dataArray.forEach( function(value, index, array){
        if(index === 0) return;

        //TODO there are sample values like this - "temp, water". These don't work
        // Well with the value.split(','). Need to fix

        let selectedValue = value.split(',')[this.dataset.rownumber];
        if(selectedValue !== "" && selectedValue !== null && selectedValue !== undefined) set.add(selectedValue.trim());
    }, row);
    
    let iterator = set.entries();

    let count = 0;
    for (const item of iterator){
        let tr = createNormalTypeRow(item[0], `${row.dataset.rownumber}_subrow_${count}`, subrow=true)[0];
        let br = document.createElement("br")
        // row.append(br);
        row.after(tr);

        count = count + 1;
        debugger;

        //TODO continue working on this
        //Maybe transition this to only have one <tr> with a select
        //the select will have a list of the values that you can select
        if(count > 2) return;
    }

    debugger;
}

function handleNewUnitInput(e)
{
    let input = e.target;
    updatePreviewColumn(input);
};

function handleNewDepthInput(e)
{
    let input = e.target;
    updatePreviewColumn(input);
}

function updateHeaderName(input)
{
    //Select element from embeded id
    let tr = $('#' + input.dataset.parentrow)[0];

    let newvalue = input.value;
    if(input.value == "") newvalue = tr.dataset.originalname;

    tr.dataset.newname = newvalue;
    setHeaderColumnName(tr.dataset);
};

function updateDefinitionColumn(input)
{
    //Update Definition
    //Get selected option element
    let rowNumber = input.id.split("_").pop();
    let option = input.list.options[input.value];

    //Set definition value to definition value of selected option
    //If option is defined, set the definition value to the option's label
    $(`#definitionInput_row_${rowNumber}`)[0].value = option ? `${option.dataset.description}` : '';

};

function updateRenameTableOutput(input)
{
    let parentRow = $(`#${input.dataset.parentrow}`)[0];
    let originalname = parentRow.dataset.originalname;
    let rownumber = parentRow.dataset.rownumber;

    let option = input.list.options[input.value];
    
    //TODO finish setting these things in the output

    let previewTableHeadersArray = getPreviewTableHeadersArray();
    setColumnsOutputValue(rownumber,'column_name', previewTableHeadersArray[rownumber]);
    
    let unitsInputElement = $(`#unitsInput_row_${rownumber}`)[0];
    let units = unitsInputElement.value;
    let unitsString = units ? `_${units}` : '';
    setColumnsOutputValue(rownumber,'units', unitsString);

};

function updatePreviewColumn(input)
{
    let parentRow = $(`#${input.dataset.parentrow}`)[0];
    let originalname = parentRow.dataset.originalname;
    let rownumber = parentRow.dataset.rownumber;

    //Select Preview Table <th> element
    let th = $(`#previewHeader_${originalname}_${rownumber}`)[0];
    
    let newNameElement = $(`#newNameInput_row_${rownumber}`)[0];
    let newNameString = newNameElement.value;

    let unitsInputElement = $(`#unitsInput_row_${rownumber}`)[0];
    let units = unitsInputElement.value;
    let unitsString = units ? `_${units}` : '';

    let depth;

    if(getDepthInputDisabled() === false)
    {
        let depthInputElement = $(`#depthInput_row_${rownumber}`)[0];
        depth = depthInputElement.value;
    }

    let depthString = depth ? `_depth${depth}m` : '';

    if(newNameString == "") newNameString = originalname;

    let newPreviewName = newNameString + unitsString + depthString;

    updatePreviewColumnHeadersArray(rownumber, newPreviewName);
    th.innerText = newPreviewName;
};




function updatePreviewColumnHeadersArray(index, newPreviewName)
{
    let previewTableHeadersArray = getPreviewTableHeadersArray();
    previewTableHeadersArray[index] = newPreviewName;
    setPreviewTableHeadersArray(previewTableHeadersArray);
};

function addDepthStringsfromPreviewColumnHeadersArray()
{
    let previewTableHeadersArray = getPreviewTableHeadersArray();

    previewTableHeadersArray.forEach(
        (value, index, array) => {
            let depthInputElement = $(`#depthInput_row_${index}`)[0];
            let depth = depthInputElement.value;
            let depthString = depth ? `_depth${depth}m` : '';

            let th = $(`[id^='previewHeader'][id$='${index}']`)[0];
            th.innerText = value + depthString;
            array[index] = value + depthString;
        }
    );

    setPreviewTableHeadersArray(previewTableHeadersArray);
}

function removeDepthStringsfromPreviewColumnHeadersArray()
{
    let previewTableHeadersArray = getPreviewTableHeadersArray();
    previewTableHeadersArray.forEach(
        (value, index, array) => {
            if(value.includes('depth'))
            {
                let newValue = value.slice(0,value.lastIndexOf("_"));;
                let th = $(`[id^='previewHeader'][id$='${index}']`)[0];
                th.innerText = newValue;
                array[index] = newValue;
            }
        }
    );

    setPreviewTableHeadersArray(previewTableHeadersArray);
}

/* -------------- Preview Table  ----------------------------- */
/*  Short Summary: Creates a table that will preview the output of the downloaded file
 */

function createPreviewTable(csvRows)
{
    //Select rename table <div>
    let div = $('#previewTableDiv');

    div[0].removeAttribute('hidden');

    //Get Table Element
    let table = $("#previewTable");

    //Clear Table
    table[0].innerHTML = "";

    //Create one <tr> for each column in the .csv file
    //Create <thead> with <tr> and <th> elements
    let tableHeaderRow = createPreviewTableHead(getCsvHeadersArray());

    //Append <thead> to <table>
    table.append(tableHeaderRow);

    let tableBodyRows = createPreviewBodyRows(getCsvRows());
    
    tableBodyRows.forEach(
        function(value){
            this.append(value);
        },
        table
    );
}

function createPreviewBodyRows(rows)
{
    let createdTableRows = [];

    //Skip Header Row, get first five data rows
    let firstFiveDataRows = rows.slice(1,6);

    firstFiveDataRows.forEach(createPreviewBodyTableRowElement, createdTableRows)

    return createdTableRows
};

function createPreviewBodyTableRowElement(value, index, array)
{
    let tr = $('<tr></tr>');
    let tdElements = createPreviewBodyTableDataElements(value);

    tdElements.forEach(
        function(value) {
            this.append(value);
        }, tr
    );

    this.push(tr);
}

function createPreviewBodyTableDataElements(row)
{
    let createdTableDataElements = []
    row.split(",").forEach(
        function (value, index, array) {
            let td = $(`<td>${value}</td>`);
            this.push(td);
        }, createdTableDataElements
    );

    return createdTableDataElements;
}

function createPreviewTableHead(csvHeadersArray)
{
    //Create thead element
    let thead,tr;

    thead = $("<thead class='thead-light'></thead>");

    //Create <tr> with <th> for the rename table
    tr = createPreviewTableHeadRow(csvHeadersArray);
    thead.append(tr);

    return thead;
}

/* Short Summary: Create <tr> element with all necessary <th> elements for the preview table
 * 
 * @return HTMLElement <tr>
 *                      <th></th> [, <th></th>] //N <th> elements, where N is the length of previewTableHeadersArray
 *                     </tr>
 */
function createPreviewTableHeadRow(csvHeadersArray)
{
    let tr = $('<tr></tr>');

    let previewTableHeadersArray = [];
    
    csvHeadersArray.forEach( function(value, index) {
        let obj = {};

        obj.attributes = {
            id : `previewHeader_${value}_${index}`
        };
        obj.text = value;

        this.push(obj);
    }, previewTableHeadersArray);

    //Create one <th> element per object in the previewTableHeadersArray. Adds each <th> to tr variable
    previewTableHeadersArray.forEach(createTableHeaderElementAndAppendToTableRow,tr);

    return tr;
};


///############## DOWNLOADING #################### ///
/*  Short Summary: Performs the steps to download information from the rename table
 *                  into a file.
 *      
 */
function downloadRenameFile()
{
    let data = prepareRenameTableDataForDownload();

    let filename = $('#renameFileNameInput')[0].value;

    downloadAsCsv(data=data,filename=filename);
};

function downloadDescriptionFile()
{
    let data = prepareDescriptionDataForDownload();
    let filename = $('#descriptionFileNameInput')[0].value;
    download(data=data,filename=filename);
};

function prepareDescriptionDataForDownload()
{
    /*
       {
        "column_name" : ...,
        "column_units" : ...,
        "depth_value" : ...,
        "depth_units" : ...,
        "controlled_vocabulary_variable_name": ...,
        "controlled_vocabulary_variable_term": ...,
        "controlled_vocabulary_variable-definition": ...,
        "controlled_vocabulary_variable_provenance": ...,
        "controlled_vocabulary_units_abbreviation": ...,
        "controlled_vocabulary_units_term": ...,
        "controlled_vocabulary_units_definition": ...,
        "controlled_vocabulary_units_provenance": ...,
       }

    */

    let output = JSON.stringify(getDescriptiveOutput(), null, 2);

    //Encode and return updated global object
    return encodeURIComponent(output)
};

/*  Short Summary: Fetch data from the rename table, convert the data into a URI string, fetch the desired
 *                 filename, then call download() to download the data into a desired filename
 *      
 */
function prepareRenameTableDataForDownload(){
   
    //Get global data object
    let dataArray = getCsvRows();
    //Get global header object
    let headersArray = getPreviewTableHeadersArray();

    //Join headers array into string
    let headersString = headersArray.join(",")

    //Replace old headers with new headers
    dataArray[0] = headersString;

    //If they have a datetime column: Replace existing datetime column with new format
    if(getHiddenDateTimeRow() !== null && getDateTimeFormat() !== null && getTimeZone() !== "")
    {
        dataArray = replaceDateTimeColumn(dataArray);
        dataArray = addTimeZoneColumn(dataArray);
    }

    //If they have a Time column: Add a timezone column
    else if(getHiddenDateTimeRow() !== null && getTimeZone() !== "")
    {
        dataArray = addTimeZoneColumn(dataArray);
    }
    
    //Join array of rows into string, reversing String.split("\n");
    let dataString = dataArray.join("\n");

    //Encode and return updated global object
    return encodeURIComponent(dataString)
}


function replaceDateTimeColumn(dataArray)
{
    dataArray.forEach( (value, index, array) => {
        if(index === 0) return;
        let splitValue = value.split(",");
        let dateValue = splitValue[0];
        
        let dateTimeFormat = getDateTimeFormat()
        let dateTime = DateTime.fromFormat(dateValue, dateTimeFormat, { zone : getTimeZone()});
        
        //Convert to ISO Standard format yyyy-MM-ddTHH:mm:ss (Ex: 2023-04-13T14:52:30-04:00)
        let newDateTimeValue = dateTime.toISO();
        splitValue[0] = newDateTimeValue;
        value = splitValue.join();
        array[index] = value;
    })
    return dataArray;
}

function addTimeZoneColumn(dataArray)
{
    dataArray.forEach( (value, index, array) => {
        if(index === 0)
        {
            array[index] = value + ',timezone';
            return;
        }
        let timezone = getTimeZone();
        array[index] = value + `,${timezone}`;
    })
    return dataArray;
}

function getTimeZone()
{
    let dateTimeFormTimeZone = $('#dateTimeFormTimeZone');
    if(dateTimeFormTimeZone.length > 0) return dateTimeFormTimeZone[0].value;
    
    let timeFormTimeZone = $('#timeFormTimeZone'); 
    if(timeFormTimeZone.length > 0) return timeFormTimeZone[0].value;

    return undefined;
}

/*  Short Summary: Given data and a filename, download the data into a file of the given name
 *  
 * @param data (String) : URI encoded string returned from encodeURIComponent(string)
 * @param filename (String) : name of the file to download the data into
 */
function download(data, filename) {
    let element = document.createElement('a');

    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + data);

    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }

  /*  Short Summary: Given data and a filename, download the data into a file of the given name
 *  
 * @param data (String) : URI encoded string returned from encodeURIComponent(string)
 * @param filename (String) : name of the file to download the data into
 */
function downloadAsCsv(data, filename) {
    let element = document.createElement('a');

    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + data);

    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }