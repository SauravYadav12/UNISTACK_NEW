$(document).ready(function(){
    //ctrl+s
    $(document).unbind('keypress');
    $(document).keydown(function(event) {
        event.preventDefault();
        console.log(event);
        if ((event.which == 115 || event.which == 83) && (event.ctrlKey||event.metaKey)|| (event.which == 19)) {
            $("form").submit();
            console.log("Form submitted")
            return false;
        }
        return true;
    });

})