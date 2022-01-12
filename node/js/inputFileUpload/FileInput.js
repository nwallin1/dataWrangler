var rows;
var csvUploaded = false;


export default class FileInput
{
    constructor()
    {
        this.rows = [];
        this.csvUploaded = false;
    };

    /* Short Summary: Add event listeners to input file HTML elements
    * 
    * Description: Called from main.js in response to the DOMContentLoaded Event
    *              Initializes event handlers responsible for uploading an input file      
    */
    initializeInputFileElement()
    {
        const input = document.getElementById('fileInput');
        const button = document.getElementById('fileInputButton');

        button.addEventListener('click', (e) => {
            if(input){
                input.click();
            }
        }, false);

        input.addEventListener("change", handleFiles, false);
    };
};