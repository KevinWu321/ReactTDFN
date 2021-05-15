var stage=null;
var view = null;
var interval=null;
var isDone = false;
var credentials={ "username": "", "password":"" };
var totalMovement = {};
var difficulty = "easy";



function setupGame(){
	stage=new Stage(document.getElementById('stage'), difficulty);
        isDone = false;
	// https://javascript.info/keyboard-events
        document.addEventListener('keydown', moveByKey);
        document.addEventListener('keyup', moveByKey);
        document.getElementById('stage').addEventListener("mousemove", aim);
        document.addEventListener('keydown', reload);
        document.addEventListener('keydown', pauseGame);
        document.getElementById('stage').addEventListener('click', shoot);
}

function startGame(){
	interval=setInterval(function(){
                 var state = stage.step();
                 stage.draw();
                 if (state.isDone){
                        isDone = true;
                        handleFinishGame(state);
                 }
                }, 20);
        
}
function pauseGame(event){
        if (event.key == "p" && !isDone){
                togglePause();
        }
}

function handleFinishGame(state){
        clearInterval(interval);
        interval = null;
        $("#ui_play").hide();
        $("#ui_result").show();
     	
        $.ajax({
                method: "POST",
                url: "/api/auth/update",
				//data: JSON.stringify({"difficulty": state.difficulty, "score": state.score}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password), "difficulty": state.difficulty, "score": state.score, "username": credentials.username },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
                document.getElementById('results').innerHTML = state.isWin ? "You have Won!" : "You have Lost";
                document.getElementById('score').innerHTML = "You got " + state.score + " Points on " + state.difficulty;
        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
                document.getElementById('results').innerHTML = "There was error updating your score";

        });
}

function togglePause(){
        if (interval == null){
                $("#ui_pause_menu").hide();
                $("#ui_play").show();
                startGame();
        } else {
                clearInterval(interval);
                interval=null;
                $("#ui_play").hide();
                $("#ui_pause_menu").show();
        }
}

function reload(event){
	var key = event.key;
	if(key == 'r'){
		stage.player.reload();
	}
}

function moveByKey(event){
	var key = event.key;
	var moveMap = {
		'a': new Pair(-20,0),
		's': new Pair(0,20),
		'd': new Pair(20,0),
		'w': new Pair(0,-20)
	};
	if(key in moveMap){
                totalMovement[key] = event.type == 'keydown';
	}

        var x = 0;
        var y = 0;

        for (key in totalMovement) {
                if (totalMovement[key]){
                        x += moveMap[key].x;
                        y += moveMap[key].y;
                }
        }
        stage.player.setVelocity(new Pair(x,y));
}

function shoot(event){
	//find where the mouse was clicked
	var rect = stage.canvas.getBoundingClientRect();
	var x = event.pageX - rect.left;
	var y = event.pageY - rect.top;
	var velocity = new Pair(x - 410, y - 410);
	stage.player.shoot(velocity);
}

function aim(event){
    var rect = stage.canvas.getBoundingClientRect();
	var x = event.pageX - rect.left;
	var y = event.pageY - rect.top;
        stage.player.direction = new Pair (x,y);
}

function login(){
	credentials =  { 
		"username": $("#username").val(), 
		"password": $("#password").val() 
	};
        document.getElementById("error_msg").innerHTML = "";
        $.ajax({
                method: "POST",
                url: "/api/auth/login",
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
                document.getElementById('profileUser').innerHTML = credentials.username;
                $("#ui_login").hide();
                $("#ui_main_menu").show();


        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
                document.getElementById("error_msg").innerHTML = err.responseJSON.error;
        });
}

function start(){
        $("#ui_main_menu").hide();
        $("#ui_difficulty_menu").show();
}

function leaderboard(){
        /**
         * prob need to do function call to server to get
         * the leaderboard info
         */
        var difficulty = ["hard", "medium", "easy"];
        $("#ui_main_menu").hide();
        $("#ui_leaderboard").show();
        for (var i in difficulty){
                var table = document.getElementById(difficulty[i]+"Table");
                $("#"+difficulty[i]+"Table tr").remove();
                getLeaderBoardInfo(difficulty[i], table);
        }

}


function getLeaderBoardInfo(diff, table){
        $.ajax({
                method: "GET",
                url: "/api/auth/leaderBoard/" + diff,
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password)},
                processData: false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
                for (var i = 0; i < data.length; i++){
                        var row = table.insertRow(i);
                        row.insertCell(0).innerHTML = data[i].username;
                        row.insertCell(1).innerHTML = data[i][diff];
                }
        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
        return;
}

function selectDifficulty(dif){
        $("#ui_difficulty_menu").hide();
        $("#ui_play").show();
        difficulty = dif;
        setupGame();
        startGame();
}

function quit(){
        stage = null;
        clearInterval(interval);
        interval = null;
        $("#ui_pause_menu").hide();
        $("#ui_main_menu").show();
}

function restart(){
        $("#ui_result").hide();
        $("#ui_main_menu").show();
}
// Using the /api/auth/test route, must send authorization header
function test(){
        $.ajax({
                method: "GET",
                url: "/api/auth/test",
                data: {},
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));

        });
}

function registerPage(){
		$("#ui_login").hide();
		$("#ui_register").show();
}

function register(){
	newUser =  { 
		"username": $("#username1").val(), 
		"password": $("#password1").val(),
		"password1": $("#password2").val()
	};

        document.getElementById("error_msg").innerHTML = "";
        document.getElementById("username1").classList.remove("error");
        document.getElementById("password1").classList.remove("error");
        document.getElementById("password2").classList.remove("error");
	if(newUser.password == newUser.password1) {
                $.ajax({
                        method: "POST",
                        url: '/api/reg/register',
                        data: JSON.stringify({}),
                        headers: { "Authorization": "Basic " + btoa(newUser.username + ":" + newUser.password) },
                        processData:false,
                        contentType: "application/json; charset=utf-8",
                        dataType:"json"
                }).done(function(data, text_status, jqXHR){
                        console.log(jqXHR.status+" "+text_status+JSON.stringify(data));

                        $("#ui_register").hide();
                        $("#ui_login").show();

                }).fail(function(err){
                        console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
                        document.getElementById("error_msg").innerHTML = err.responseJSON.error; 
                        document.getElementById("username1").classList.add("error");

                });

	} else {
                document.getElementById("password1").classList.add("error");
                document.getElementById("password2").classList.add("error");
                document.getElementById("error_msg").innerHTML = "Same Password";
	}
}

function changePassword(){
    values = {
        "username": credentials.username,
        "password": $("#password3").val(),
        "password1": $("#password4").val(),
        "password2": $("#password5").val()
    }
	
    document.getElementById("error_msg").innerHTML = "";
    document.getElementById("password3").classList.remove("error");
    document.getElementById("password4").classList.remove("error");
	document.getElementById("password5").classList.remove("error");
 
    if(values.password1 == values.password2){
        $.ajax({
                method: "POST",
                url: '/api/auth/change',
                data: JSON.stringify({ "username" : values.username, "oldPassword" : values.password, "newPassword" : values.password1 }),
        headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
                credentials.password = values.password1
                $("#ui_profile").hide();
                $("#ui_main_menu").show();


        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
                document.getElementById("error_msg").innerHTML = err.responseJSON.error; 
                document.getElementById("username1").classList.add("error");
        });
    }
    else{
        console.log("Password don't match");
		document.getElementById("error_msg").innerHTML = "Passwords Do Not Match"; 
		document.getElementById("password4").classList.remove("error");
		document.getElementById("password5").classList.remove("error");
    }
}

function back(){
        $("#ui_leaderboard").hide();
        $("#ui_main_menu").show();
}

function profile(){
        $("#ui_main_menu").hide();
        $("#ui_profile").show();
}

function mainMenu(){
		$("#ui_profile").hide();
        $("#ui_main_menu").show();
}


$(function(){
        // Setup all events here and display the appropriate UI
        $("#loginSubmit").on('click',function(){ login(); });
        $("#registerSubmit").on('click',function(){ registerPage(); });
        $("#register").on('click',function(){ register(); });
        $("#start").on("click", function(){start();});
        $("#leaderboard").on("click", function(){leaderboard();});
        $("#resume").on("click", function(){togglePause();});
        $("#quit").on("click", function(){quit();});
        $("#restart").on("click", function(){ restart();});
        $("#back").on("click", function(){
                $("#ui_leaderboard").hide();
                $("#ui_main_menu").show();
        });
        $("#backDiff").on("click", function(){  
                 $("#ui_difficulty_menu").hide();
                $("#ui_main_menu").show();
        });
        $("#profile").on("click", function(){ profile();});
        $("#changePassword").on("click", function(){ changePassword();});
        $("#mainMenu").on("click", function(){ mainMenu();});
        $("input[type=submit]").on("click", function() {
                document.getElementById("error_msg").innerHTML = ""; 
        });

        //$("#ui_login").hide();
        $("#ui_play").hide();
        $("#ui_pause_menu").hide();
        $("#ui_register").hide();
        $("#ui_difficulty_menu").hide();
        $("#ui_leaderboard").hide();
        $("#ui_profile").hide();
        $("#ui_result").hide();
        $("#ui_main_menu").hide();
});