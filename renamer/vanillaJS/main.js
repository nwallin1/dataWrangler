

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
    output: [],
    previewTableHeadersArray: null,
};

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
 *      @param params.index : Index of the value to change
 *      @param params.originalname : originalname of the column
 *      @param params.newname : newname of the column
 * 
 * @return undefined
 */
function setHeaderColumnName(params)
{
    let columnData = getCsvHeadersArray();
    columnData[params.index] = params.newname;
    setCsvHeadersArray(columnData);
};


function setOutputValue(index, key, value)
{
    globalFile.output.at(index) ? globalFile.output.at(index)[key] = value : globalFile.output[index] = {[key]: value};
};

function getOutput()
{
    return globalFile.output;
}


/*--------- Events Pre Document Load -------------- */
createLimnoODM2VariableNameDataList();
createFullODM2VariableNameDataList();
createUnitDataList();


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
function prepareFileForDatalist(relativePathToText, isLimno, fileType, unitsFile='false', listElementId)
{
    const getFileRequest = new Request(relativePathToText);

    fetch(getFileRequest)
    .then((response) => {
        return response.text();
    }).then((data) => {
        
        //shift() removes first element of the array because it is the header row
        let dataArray = data.split("\n");
        dataArray.shift();

        //Filter out rows that are not needed for Limno
        if(isLimno)
        {
            dataArray = filterRowsForLimno(dataArray);
        }

        dataArray.forEach((value, index, array) => {
            
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
            return value.endsWith("1\r");
        });
};

/* -------------- Data List Creation ----------------- */

/*  Short Summary: Fetches local .csv with odm2 variable names, and converts the list
 *                 of variables into a datalist that is added to the end of the <div id="datalists">
 */
function createLimnoODM2VariableNameDataList()
{
    // let listElementId = getLimnoListElementId();
    prepareFileForDatalist(relativePathToText='data/limno_list/ODM2_varname_limno.txt', isLimno=true, fileType='.txt', unitsFile=false, listElementId=getLimnoListElementId());
};

/*  Short Summary: Fetches local .csv with odm2 variable names, and converts the list
 *                 of variables into a datalist that is added to the end of the <div id="datalists">
 */
function createFullODM2VariableNameDataList()
{
    // let listElementId = getFullListElementId();
    prepareFileForDatalist(relativePathToText='data/full_list/ODM2_varname_full.csv', isLimno=false, fileType='.txt', unitsFile=false, listElementId=getFullListElementId());
};

function createUnitDataList()
{
    prepareFileForDatalist(relativePathToText='data/limno_list/ODM2_units_limno_abbv.txt', isLimno=false, fileType='.txt', unitsFile=true, listElementId=getUnitListElementId());
};

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
    let name = getShortenedListInputAttributes().name;
    let isLimno = document.querySelector(`input[name="${name}"]:checked`).value

    if(isLimno)
    {
        return input.value + '_limno';
    };
    return input.value + '_full';

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
        option.attr('value', value.term);
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

    reader.onload = function(e){
        rawFileData = e.target.result;

        let csvRows = e.target.result.split("\n");
        
        setCsvRows(csvRows);
        setCsvUploaded(true);

        let csvHeadersArray = csvRows[0].replaceAll('\r', '').split(',');

        //Initialize global variables for header arrays
        
        setCsvHeadersArray(csvHeadersArray);
        setPreviewTableHeadersArray(csvHeadersArray);

        createRenameTable(getCsvRows());
        createPreviewTable(getCsvRows());

    };

    reader.readAsText(file);
};

/*  Short Summary: Return id of the datalist element that lists out the possible 
 *                 controlled vocabularies to use
 */
function getControlledVocabularyDataListId()
{
    return 'controlledVocabularyList';
};

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

    //Create an input to select the controlled vocabulary
    let controlledVocabularyInput = createControlledVocabularyInput();
    let controlledVocabularyLabel = createControlledVocabularyLabel();

    //Adds created elements to the <div>
    div.append("<hr><h2>Options</h2>");
    div.append(controlledVocabularyLabel);
    div.append(controlledVocabularyInput);

    //Create an input to select the controlled vocabulary
    let shortenedListYesInput = createShortenedListInput("Yes");
    shortenedListYesInput.attr("checked", "checked");
    let shortenedListNoInput = createShortenedListInput("No");

    let shortenedListYesLabel = createShortenedListLabel("Yes");
    let shortenedListNoLabel = createShortenedListLabel("No");

    let shortenedListQuestionLabel = createLabelElement({'id':'shortenedListLabel'}, text="Is this limnological data? (Selecting 'Yes' will display filtered lists of variable names and units):");

    //Adds created elements to the <div>
    div.append("<br>");
    div.append(shortenedListQuestionLabel);
    div.append("<br>");
    div.append(shortenedListYesLabel);
    div.append(shortenedListYesInput);
    div.append(shortenedListNoLabel);
    div.append(shortenedListNoInput);

    //Create Table Element
    let table = $("<table class='table'></table>");
    
    //Create <thead> with <tr> and <th> elements
    let tableHeaderRow = createRenameTableHead();

    //Append <thead> to <table>
    table.append(tableHeaderRow);

    //Create one <tr> for each column in the .csv file
    //csvDataRows is an array of <tr> elements
    let csvDataRows = createRenameTableData(getCsvHeadersArray());
    
    //Append each <tr> element to the table
    csvDataRows.forEach(function(element){
        this.append(element);
    },table);

    //Append header and table to the <div>
    div.append($('<hr><h2>Column Rename Table</h2>'));
    div.append(table);


    let downloadButtonDiv = $('#downloadButtonDiv');

    //Create download button, which downloads a .csv file with renamed columns
    let renameFileDownloadButton = createButtonElement({'class':'button','type':'button'}, text="Download");
    renameFileDownloadButton.on("click", () => {downloadRenameFile(); });

    let renameFileNameInput = createInputElement({'id':'renameFileNameInput','name':'renameFileNameInput', 'type':'text'});
    let renameFileNameLabel = createLabelElement({'id':'renameFileNameLabel','for':'renameFileNameInput'}, text="New File Name:");

    let descriptionFileNameInput = createInputElement({'id':'descriptionFileNameInput','name':'descriptionFileNameInput', 'type':'text'});
    let descriptionFileNameLabel = createLabelElement({'id':'descriptionFileNameLabel','for':'descriptionFileNameInput'}, text="New File Name:");

    let descriptionFileDownloadButton = createButtonElement({'class':'button','type':'button'}, text="Download");
    descriptionFileDownloadButton.on("click", () => {downloadDescriptionFile(); });

    //Add download button and labels to div
    downloadButtonDiv.append($('<h4>Download File With Renamed Columns</h4>'));
    downloadButtonDiv.append(renameFileNameLabel);
    downloadButtonDiv.append(renameFileNameInput);
    downloadButtonDiv.append(renameFileDownloadButton);

    downloadButtonDiv.append('<br><br>');
    //Add download button and labels to div
    downloadButtonDiv.append($('<h4>Download Description File</h4>'));
    downloadButtonDiv.append(descriptionFileNameLabel);
    downloadButtonDiv.append(descriptionFileNameInput);
    downloadButtonDiv.append(descriptionFileDownloadButton);
};

function createShortenedListInput(value)
{
    //Create input to select controlled vocabulary
    let attributes = getShortenedListInputAttributes(value);

    let shortenedListInput = createInputElement(attributes, text="");

    //Create on change event
    shortenedListInput.on('change', function(e){
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
        return;
    });

    return shortenedListInput;
};

function createShortenedListLabel(value)
{
    let inputElementAttributes = getShortenedListInputAttributes(value);

    let labelElementAttributes = {
        id : 'shortenedListLabel',
        for : inputElementAttributes.id
    }

    return createLabelElement(labelElementAttributes, text=value)
};

function createButtonElement(attributes,text)
{
    return createElementWithValues('button', attributes, text);
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


function getShortenedListInputAttributes(value=undefined)
{
    return {
        id : `shortenedList${value}Input`,
        name : 'shortenedListInput',
        type : 'radio',
        value
    }
};

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
function createRenameTableHead()
{
    //Create thead element
    let thead,tr;

    thead = $("<thead class='thead-light'></thead>");

    //Create <tr> with <th> for the rename table
    tr = createRenameTableHeadRow();
    thead.append(tr);

    return thead;
};

/* Short Summary: Create <tr> element with all necessary <th> elements for the rename table
 * 
 * @return HTMLElement <tr>
 *                      <th></th> [, <th></th>] //N <th> elements, where N is the length of headerElementsArray
 *                     </tr>
 */
function createRenameTableHeadRow()
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
            },
            text: "Depth"
        }
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
function createRenameTableData(csvHeadersArray)
{
    
    let createdRows = [];

    //For every column, create a <tr> element
    csvHeadersArray.forEach(function(element, index){
        let tr,td,textContent, cellName, args;
        tr = $('<tr></tr>');
        tr.attr('data-originalname', element);
        tr.attr('data-index', index);
        tr.attr('id', 'row_' + index);

        //Create data cell for original column name
        td = $('<td></td>').text(element);
        tr.append(td);
        
        
        //Create data cell for variable name selection
        params = {
            "parentRow":tr.attr('id'),
            "index": index,
            "className": "newNameInput" , 
            "optionsListName": getSelectedControlledVocabularyDataListId(),
            "changeEventCallback": handleNewColumnNameInput,
            "defaultValue": undefined
        };
        td = createTableDataCellWithInput(params);

        tr.append(td);

        //Create data cell for definition
        params["cellName"] = "definitionInput_row_" + index;
        params["className"] = "definitionInput";
        params["changeEventCallback"] = undefined; params["defaultValue"] = undefined;
        td = createTableDataCellWithTextArea(params);
        tr.append(td);

        //Create data cell for units
        
        params = {
            "parentRow":tr.attr('id'),
            "index": index,
            "className": "unitsInput" , 
            "optionsListName": getSelectedControlledUnitDataListId(),
            "changeEventCallback": handleNewUnitInput,
            "defaultValue": undefined
        };        

        td = createTableDataCellWithInput(params);
        tr.append(td);

        createdRows.push(tr);
    },createdRows);

    return createdRows;
};

/* Short Summary: Creates a <td> element with child <input> and <label> elements
 *                The <input> is given a list attribute. The list attribute is the id
 *                of a <datalist> element, which contains options to select from.
 *                See w3schools <input> list attribute page (https://www.w3schools.com/tags/att_input_list.asp)
 * 
 * @param params ( Object ) : Contains key-value pairs of parameters
 * @param params.parentRow ( jQuery HTMLElement ) : jQuery reference to <tr> element that the <td><input> elements are under
 * @param params.index  (Number) : Number row that this is part of 
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

    let { parentRow, index, className, optionsListName, changeEventCallback, defaultValue } = params;

    let cellName = className + "_row_" + index;
    td =  $('<td></td>');

    //Add id, name, and parentrow to the input
    input = $('<input></input>').attr('id', cellName).attr('name', cellName).attr('data-parentrow', parentRow);

    //Set class
    input.addClass(className);

    //If there is an optionsListName, set the list attribute
    if(optionsListName) input.attr('list', optionsListName)
    //Otherwise, disable the element from being edited
    else input.attr('disabled', true);

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

    let { parentRow, cellName, changeEventCallback } = params;
    td =  $('<td></td>');
    td.css('width', '25vw');

    textarea = $('<textarea></textarea>').attr('id', cellName).attr('name', cellName).attr('data-parentrow', parentRow);

    // textarea.css('display', 'inline-table');
    // textarea.css('width', 'inherit');

    //Add row index and row name to input element
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
    updateOutput(input);

    //Resize based on input size
    $(input).attr('size', $(input).val().length);
};


function handleNewUnitInput(e)
{
    let input = e.target;
    updatePreviewColumn(input);
};

function updateHeaderName(input)
{
    //Select element from embeded id
    let tr = $('#' + input.dataset.parentrow);
    tr.attr('data-newname', input.value);
    setHeaderColumnName(tr.data());
};

function updateDefinitionColumn(input)
{
    //Update Definition
    //Get selected option element
    let rowNumber = input.id.split("_").pop();
    let option = input.list.options[input.value];

    //Set definition value to definition value of selected option

    //If option is defined, set the definition value to the option's label
    $(`#definitionInput_row_${rowNumber}`)[0].value = option ? `${option.label}` : '';

};

function updateOutput(input)
{
    let parentRow = $(`#${input.dataset.parentrow}`)[0];
    let originalname = parentRow.dataset.originalname;
    let index = parentRow.dataset.index;

    let option = input.list.options[input.value];
    
    // setOutputValue(index,'controlled_vocabulary_variable_term', option.dataset.term );
    
    //TODO finish setting these things in the output

    let previewTableHeadersArray = getPreviewTableHeadersArray();
    setOutputValue(index,'column_name', previewTableHeadersArray[index]);
    
    
    let unitsInputElement = $(`#unitsInput_row_${index}`)[0];
    let units = unitsInputElement.value;
    let unitsString = units ? `_${units}` : '';
    setOutputValue(index,'units', unitsString);

};

function updatePreviewColumn(input)
{
    let parentRow = $(`#${input.dataset.parentrow}`)[0];
    let originalname = parentRow.dataset.originalname;
    let index = parentRow.dataset.index;

    
    //Select Preview Table <th> element
    let th = $(`#previewHeader_${originalname}_${index}`)[0];
    
    let newNameElement = $(`#newNameInput_row_${index}`)[0];
    let newNameString = newNameElement.value;

    let unitsInputElement = $(`#unitsInput_row_${index}`)[0];

    let units = unitsInputElement.value;
    

    let unitsString = units ? `_${units}` : '';

    let newPreviewName = newNameString + unitsString;
    th.innerText = newPreviewName;

    updatePreviewColumnHeadersArray(index, newPreviewName);
};




function updatePreviewColumnHeadersArray(index, newPreviewName)
{
    let previewTableHeadersArray = getPreviewTableHeadersArray();
    previewTableHeadersArray[index] = newPreviewName;
    setPreviewTableHeadersArray(previewTableHeadersArray);
};

/* -------------- Preview Table  ----------------------------- */
/*  Short Summary: Creates a table that will preview the output of the downloaded file
 */

function createPreviewTable(csvRows)
{
    //Select rename table <div>
    let div = $('#previewTableDiv');

    //Clear div
    div.html("");

    //Create Table Element
    let table = $("<table class='table'></table>");

    table.css('display', 'block');

    //Create one <tr> for each column in the .csv file
    //Create <thead> with <tr> and <th> elements
    let tableHeaderRow = createPreviewTableHead(getCsvHeadersArray());

    //Append <thead> to <table>
    table.append(tableHeaderRow);


    //Append header and table to the <div>
    let previewText = $('<hr><h2>Preview</h2>');
    previewText.css('text-align', 'center');

    div.append(previewText);
    div.append(table);
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
    download(data=data,filename=filename);
};

function downloadDescriptionFile()
{
    let data = prepareDescriptionDataForDownload();
    let filename = $('#descriptionFileNameInput')[0].value;
    download(data=data,filename=filename);
};

function prepareDescriptionDataForDownload()
{
    debugger;
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

    let output = JSON.stringify(getOutput(), null, 2);

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

    //Join array of rows into string, reversing String.split("\n");
    let dataString = dataArray.join("\n");

    //Encode and return updated global object
    return encodeURIComponent(dataString)
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