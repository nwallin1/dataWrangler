export default class Dropbox
{
    /* Short Summary: Add event listeners to dropbox HTML element
    * 
    * Description: Called from main.js in response to the DOMContentLoaded Event
    *              Initializes event handlers responsible for uploading a file via dropbox
    */
    initializeDropboxElement()
    {
        //Dropbox
        let dropbox;

        dropbox = document.getElementById("dropbox");
        dropbox.addEventListener("dragenter", handleFileDropboxDragenter, false);
        dropbox.addEventListener("dragover", handleFileDropboxDragover, false);
        dropbox.addEventListener("drop", handleFileDropboxDrop, false);
    };

    handleFileDropboxDragenter(event)
    {
        event.stopPropagation();
        event.preventDefault();
    }

    handleFileDropboxDragover(event)
    {
        event.stopPropagation();
        event.preventDefault();
    };

    handleFileDropboxDrop(event)
    {
        event.stopPropagation();
        event.preventDefault();

        const dt = event.dataTransfer;
        handleFiles.call(dt);
    };
};