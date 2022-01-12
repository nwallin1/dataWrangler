

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
    let div = document.getElementById('inputFileDiv');
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

    th = document.createElement('th');
    th.textContent = "Column Name";
    tr.appendChild(th);

    th = document.createElement('th');
    th.textContent = "Column Unit";
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
    row.forEach(function(element){
        let tr,td;
        tr = document.createElement('tr');
        tr.setAttribute('draggable', 'true');

        td = document.createElement('td');
        td.textContent = element;

        //this === tr
        tr.appendChild(td);
        
        td = document.createElement('td');
        td.textContent = 'random unit';
        tr.appendChild(td);

        tr.addEventListener('dragstart', inputFileRowDragStartEventHandler);
        //this === createdRows  
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
    event.dataTransfer.effectAllowed = "link";
};