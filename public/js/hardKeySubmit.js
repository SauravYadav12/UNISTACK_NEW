$(document).ready(function(){
    //ctrl+s
    $(document).unbind('keypress');
    $(document).keydown(function(event) {
        
        console.log(event);
        if ((event.which == 115 || event.which == 83) && (event.ctrlKey||event.metaKey)|| (event.which == 19)) {
            event.preventDefault();
            $("form").submit();
            console.log("Form submitted")
            return false;
        }
        return true;
    });

})