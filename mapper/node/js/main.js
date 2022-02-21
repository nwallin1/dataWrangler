
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