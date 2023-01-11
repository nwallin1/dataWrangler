
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
    debugger;
}