$(document).ready(function(){

    //Login Service
    $('#login').on('submit', function(event){
        const date = Date.now();
        event.stopPropagation();
        event.preventDefault()
        console.log("Login clicked");
        const email = $('#email').val();
        const password = $('#password').val();
        console.log({email,password});
        $.ajax({
            url:"/login/login",
            type:"POST",
            data: {email,password},
            contentType:"application/json",
            success: function(res){
                // console.log("Res", res);
                console.log(Date.now()-date);
            }
        })
    })/

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