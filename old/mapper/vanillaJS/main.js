
function handleDOMContentLoaded()
{

    //Add Event Handlers to file input HTML elements
    initializeInputFileElement();

    
    //Add event handlers to dropbox element
    initializeDropboxElement();

    //Add event handlers to droppable element
    initializeDroppableElement();
};

if (document.readyState === 'loading') 
{  // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', handleDOMContentLoaded,false);
} 
else 
{  // `DOMContentLoaded` has already fired
    handleDOMContentLoaded();
}

// -------------- Dropbox Elements
/* Short Summary: Add event listeners to dropbox HTML element
 * 
 * Description: Called from main.js in response to the DOMContentLoaded Event
 *              Initializes event handlers responsible for uploading a file via dropbox
 */
function initializeDropboxElement()
{
    //Dropbox
    let dropbox;

    dropbox = document.getElementById("dropbox");
    dropbox.addEventListener("dragenter", handleFileDropboxDragenter);
    dropbox.addEventListener("dragover", handleFileDropboxDragover);
    dropbox.addEventListener("drop", handleFileDropboxDrop);
};

function handleFileDropboxDragenter(event)
{
    event.stopPropagation();
    event.preventDefault();
}

function handleFileDropboxDragover(event)
{
    event.stopPropagation();
    event.preventDefault();
};

function handleFileDropboxDrop(event)
{
    event.stopPropagation();
    event.preventDefault();

    const dt = event.dataTransfer;
    handleFiles.call(dt);
};


//----------------Droppable Element
/*
 * Author: Nicholas Walling
 * 
 * File Summary: Contains logic to append event handlers to existing HTML elements
 *               that will enable Drag-And-Drop functionality
 *               (https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
 */


/* Short Summary: Add event listeners to droppable HTML elements
 * 
 * Description: Called from main.js in response to the DOMContentLoaded Event
 *              Initializes event handlers that enables the HTML as a droppable element
 *              (https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API#define_a_drop_zone)      
 */
function initializeDroppableElement()
{
    //Droppable Element
    let droppable = document.getElementById('droppable-element');

    droppable.addEventListener('dragenter', handleDroppableElementDragenter);
    droppable.addEventListener('dragover', handleDroppableElementDragover);
    droppable.addEventListener('drop', handleDroppableElementDrop);
};


/* Short Summary: Set the target element to be droppable
 *
 * Description: Prevents default behavior. The default behavior prevents
 *              the element from being droppable
 * 
 * @param event {DragEvent}: This is the dragenter event
 */
function handleDroppableElementDragenter(event)
{
    /* 
        Default behavior is to reject the element as a dropzone
        Prevent this default behavior
    */
    event.preventDefault();
};

/* Short Summary: Set the target element as droppable
 *
 * Description: Prevents default behavior. The default behavior disables the element
 *              from being droppable. Sets the desired dropEffect to link
 * 
 * @param event {DragEvent}: This is the dragover event
 */
function handleDroppableElementDragover(event)
{
    /* 
        Default behavior is to reject the element as a dropzone
        Prevent this default behavior
    */
    event.preventDefault();

    //Set dropEffect to link
    event.dataTransfer.dropEffect = 'link';
};

/* Short Summary: Process data from the drop
 *
 * Description: 
 * 
 * @param event {DragEvent}: This is the drop event 
 */
function handleDroppableElementDrop(event)
{
    const data = event.dataTransfer.getData('text/html');
    event.preventDefault();
}

//----------------------- File Handling


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
        rows = e.target.result.split("\n")
        csvUploaded = true;

        updateInputFileTable(rows);
    };

    reader.readAsText(file);
};

/*  Short Summary: Creates a table with values from an input csv file
 *  
 *  @params rows {Array[String][String]}  An array containing the rows of the csv file.
 *                                        The first row should always be the header row.
 *      
 */
function updateInputFileTable(rows)
{
    //Create Table Element
    let table = document.createElement('table');

    //Create table caption
    let caption = document.createElement('caption');
    caption.textContent = "Table for Input File";

    table.appendChild(caption);
    
    //Create header row
    let headerRow = createInputTableHeaderElement();

    //Append header row
    table.appendChild(headerRow);

    //Create rest of rows
    let dataRows = createInputTableDataElements(rows[0].split(','));
    
    dataRows.forEach(function(element){
        this.appendChild(element);
    },table);

    //Replace HTML in div element with table
    let div = document.getElementById('inputTableDiv');
    div.innerHTML = "";
    div.appendChild(table);
};

/* Gernerates input table header row
 * 
 * @return HTMLElement
 */
function createInputTableHeaderElement()
{
    //Create tr element
    let tr,th;
    tr = document.createElement('tr');
    tr.classList.add('header-row');

    //Column 1
    th = document.createElement('th');
    th.textContent = "Column Name";
    tr.appendChild(th);

    //Column 2
    th = document.createElement('th');
    th.textContent = "Data Type";
    tr.appendChild(th);

    //Column 3
    th = document.createElement('th');
    th.textContent = "Unit";
    tr.appendChild(th);

    //Column 4
    th = document.createElement('th');
    th.textContent = "Target Column";
    tr.appendChild(th);
    return tr;
};

/* Short Summary: Takes in the header row of a csv and turns it into an array or HTMLElement <tr>
 * 
 * @param row {Array[String]} An array containg all of the cells in the header row of an uploaded csv
 *                                  row[0] will be the value of the first cell in the first column,
 *                                  row[1] will be the value of the first cell in the second column
 * @return {Array [HTMLElement]}
 */
function createInputTableDataElements(row)
{
    
    let createdRows = [];

    //For every column, create a <th> element
    row.forEach(function(element, index){
        let tr,td;
        tr = document.createElement('tr');
        tr.setAttribute('draggable', 'true');

        //Create first data cell with column name as the value
        td = document.createElement('td');
        td.textContent = element;
        tr.appendChild(td);

        //Create second data cell with a dropdown of available Data Types
        td = document.createElement('td');
        let label, input, datalist, cellName;
        label = document.createElement('label');
        cellName = "dataTypeInput_col_" + index;
        label.setAttribute('for', cellName);
        label.textContent = "Type: ";

        input = document.createElement('input');
        input.id = cellName;
        input.name = cellName;
        input.setAttribute('list', 'dataTypeList');
        
        td.appendChild(label);
        td.appendChild(input);
        tr.appendChild(td);

        //Create third data cell for unit selection
        td = document.createElement('td');
        label = document.createElement('label');
        cellName = "unitsInput_row_" + index;
        label.setAttribute('for', cellName);
        label.textContent = "Units: ";

        input = document.createElement('input');
        input.id = cellName;
        input.name = cellName;
        input.setAttribute('list', 'unitsList');

        td.appendChild(label);
        td.appendChild(input);
        tr.appendChild(td);

        //Create fourth data cell for column mapping
        td = document.createElement('td');
        label = document.createElement('label');
        cellName = "targetColumnsInput_row_" + index;
        label.setAttribute('for', cellName);
        label.textContent = "Target Column: ";

        input = document.createElement('input');
        input.id = cellName;
        input.name = cellName;
        input.setAttribute('list', 'targetColumnsList');

        td.appendChild(label);
        td.appendChild(input);
        tr.appendChild(td);

        //Make row draggable
        tr.addEventListener('dragstart', inputFileRowDragStartEventHandler);
        tr.addEventListener('dragend', inputFileRowDragEndEventHandler)

        createdRows.push(tr);
    },createdRows);

    return createdRows;
};

/* Short Summary: Initializes information for the element being dragged
 *
 * Description: Sets the data to be transferred as the HTML of the element being dragged
 *              Says that the only effect allowed is to 'link' the source element to the drop element
 * 
 * @param event {DragEvent}: This is the dragstart event handler
 */
function inputFileRowDragStartEventHandler(event)
{
    //Select HTML from target
    let innerHTML = event.target.innerHTML;

    //Add html data to the drag event
    event.dataTransfer.setData("text/html", innerHTML);

    //Set to link drag element and drop element
    //By default effectAllowed = "all" (https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations#drag_effects)
    event.dataTransfer.effectAllowed = "all";
};

function inputFileRowDragEndEventHandler(event)
{
  debugger;    
};

// ---------------- Input File Element
var rows;
var csvUploaded = false;

/* Short Summary: Add event listeners to input file HTML elements
 * 
 * Description: Called from main.js in response to the DOMContentLoaded Event
 *              Initializes event handlers responsible for uploading an input file      
 */
function initializeInputFileElement()
{
    const input = document.getElementById('fileInput');
    const button = document.getElementById('fileInputButton');

    button.addEventListener('click', (e) => {
        if(input){
            input.click();
        }
    });

    input.addEventListener("change", handleFiles);
};

/* Short Summary: Add event listeners to dropbox HTML element
 * 
 * Description: Called from main.js in response to the DOMContentLoaded Event
 *              Initializes event handlers responsible for uploading a file via dropbox
 */
function initializeDropboxElement()
{
    //Dropbox
    let dropbox;

    dropbox = document.getElementById("dropbox");
    dropbox.addEventListener("dragenter", handleFileDropboxDragenter);
    dropbox.addEventListener("dragover", handleFileDropboxDragover);
    dropbox.addEventListener("drop", handleFileDropboxDrop);
};

function handleFileDropboxDragenter(event)
{
    event.stopPropagation();
    event.preventDefault();
}

function handleFileDropboxDragover(event)
{
    event.stopPropagation();
    event.preventDefault();
};

function handleFileDropboxDrop(event)
{
    event.stopPropagation();
    event.preventDefault();

    const dt = event.dataTransfer;
    handleFiles.call(dt);
};