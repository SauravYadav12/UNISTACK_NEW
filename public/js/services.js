$(document).ready(function(){

    $('.req-modal').click(function(){
        $('.viewReq').toggle();
    });

    $('.hideReq').click(function(){
        $('.viewReq').hide()
    });

    //Login Service
    $('#getWeeklyData').click(function(event){
        event.stopPropagation();
        event.preventDefault()
        console.log("Login clicked");
        
        $.ajax({
            url:"/weeklydata",
            type:"GET",
            async: false,
            contentType:"application/json",
            success: function(res){
                console.log("Res", res);
            }
        })
    })

    //Requirement Service
    $("#requirements").on('click', function(event){
        const date = Date.now();
        console.log("Request initiated");
        $.ajax({
            url:"/requirements/reqlist",
            type:"GET",
            contentType:"application/json",
            success: function(res){
                console.log("Res", res);
                console.log(Date.now()-date);
            }
        })

    })
})