/*
 * Author: Nicholas Walling
 * 
 * File Summary: Contains logic to append event handlers to existing HTML elements
 *               that will enable Drag-And-Drop functionality
 *               (https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
 */


export default class DroppableElement
{
    /* Short Summary: Add event listeners to droppable HTML elements
    * 
    * Description: Called from main.js in response to the DOMContentLoaded Event
    *              Initializes event handlers that enables the HTML as a droppable element
    *              (https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API#define_a_drop_zone)      
    */
    initializeDroppableElement()
    {
        //Droppable Element
        let droppable = document.getElementById('droppable-element');

        droppable.addEventListener('dragenter', handleDroppableElementDragenter, false);
        droppable.addEventListener('dragover', handleDroppableElementDragover, false);
        droppable.addEventListener('drop', handleDroppableElementDrop, false);
    };


    /* Short Summary: Set the target element to be droppable
    *
    * Description: Prevents default behavior. The default behavior prevents
    *              the element from being droppable
    * 
    * @param event {DragEvent}: This is the dragenter event
    */
    handleDroppableElementDragenter(event)
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
    handleDroppableElementDragover(event)
    {
        /* 
            Default behavior is to reject the element as a dropzone
            Prevent this default behavior
        */
        event.preventDefault();

        //Set dropEffect to link
        event.dataTransfer.dropEffect = "link";
    };

    /* Short Summary: Process data from the drop
    *
    * Description: 
    * 
    * @param event {DragEvent}: This is the drop event 
    */
    handleDroppableElementDrop(event)
    {
        //TODO
    }
}