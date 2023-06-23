$(document).ready(function(){
    //ctrl+s
    $(window).keypress(function(event) {
        if (!(event.which == 115 && event.ctrlKey) && !(event.which == 19)) return true;
        event.preventDefault();

        $("form").submit();
        console.log("Form submitted")
        return false;
    });

})