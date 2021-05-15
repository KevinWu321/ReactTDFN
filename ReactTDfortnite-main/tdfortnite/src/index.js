import {BrowserView, MobileView} from 'react-device-detect';
import React from 'react';
import ReactDOM from 'react-dom';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import Menu from './components/Menu';
import Game from './components/Game';
import Results from './components/Results';
import Instruction from './components/Instruction';
import './index.css';
import $ from 'jquery';

var credentials={ "username": "", "password":"" };

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			errorcode: null,
			hard: [],
			showLogin: true,
			showRegister: false,
			showMenu: false,
			showProfile: false,
			showLeaderboard: false,
			showGame: false,
			showResults: false,
			showInstruction: false,
			gameData: null
		};
		this.login = this.login.bind(this);
		this.register = this.register.bind(this);
		this.showRegister = this.showRegister.bind(this);
		this.showGame = this.showGame.bind(this);
		this.showProfile = this.showProfile.bind(this);
		this.showMenu = this.showMenu.bind(this);
		this.showLeaderboard = this.showLeaderboard.bind(this);
		this.changePassword = this.changePassword.bind(this);
		this.leaderboard = this.leaderboard.bind(this);
		this.getLeaderBoardInfo = this.getLeaderBoardInfo.bind(this);
		this.sendMessage = this.sendMessage.bind(this);
		this.logout = this.logout.bind(this);
		this.showInstruction = this.showInstruction.bind(this);
		this.socket = null;
		this.id = null
	}

	connectToServer() {
		if (this.socket != null){
			return;
		}
		this.socket = new WebSocket(`ws://${window.location.hostname}:8001`)
		this.socket.onopen = (event) =>{
			console.log("connected");
		};
		this.socket.onclose = (event) => {
			console.log("closed code:" + event.code + " reason:" +event.reason + " wasClean:"+event.wasClean);
		};
		this.socket.onmessage = (event) => {
			var message = JSON.parse(event.data)
			if (message.type === "id"){
				this.id = message.id;
				this.setState({ id: message.id })
			}
			
			else if(message.type === "dead"){
				//console.log(this.state.gameData.player.score);
				this.disconnectToServer();
				this.handleFinishGame();
				//update score
			}
			
			else { 
				this.setState({ gameData: message})
				//console.log(message);
			}
		}
	}

	/**
	 * Message to be sent over to the user
	 * @param {} message 
	 */
	sendMessage(message){
		this.socket.send(JSON.stringify(message));
	}

	/**
	 * Disconnect the user when not on game page
	 */
	
	disconnectToServer(){
		if (this.socket != null){
			this.socket.close();
			this.socket = null;
		}
	}
	
	
	handleFinishGame(state){
			this.setState({showGame: !this.state.showGame });
			this.setState({showResults: !this.state.showResults });
			
			$.ajax({
					method: "POST",
					url: "/api/auth/update",
					//data: JSON.stringify({"difficulty": state.difficulty, "score": state.score}),
			headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password),  "score": this.state.gameData.player.score, "username": credentials.username },
					processData:false,
					contentType: "application/json; charset=utf-8",
					dataType:"json"
			}).done( (data, text_status, jqXHR) =>{
					console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
					this.setState({errorcode: null });
			}).fail( (err) =>{
					console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
					this.setState({errorcode: 'Error Updating Score' });

			});
	}

	login(values) {
		this.setState({ values })
		credentials =  { 
			"username": values.username,
			"password": values.password
		};
			$.ajax({
					method: "POST",
					url: "api/auth/login",
					data: JSON.stringify({}),
			headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
					processData:false,
					contentType: "application/json; charset=utf-8",
					dataType:"json"
			}).done( (data, text_status, jqXHR) =>{
					console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
					this.setState({errorcode: null });
					this.setState({showLogin: !this.state.showLogin });
					this.setState({showMenu: !this.state.showMenu });
			}).fail( (err) =>{
					console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
					this.setState({errorcode: "Login Failed." });
			});
	}
	
	logout(){
		this.setState({showLogin: true})
		this.setState({showRegister: false})
		this.setState({showProfile: false})
		this.setState({showMenu: false})
		this.setState({showLeaderboard: false})
		this.setState({showGame: false})
		this.setState({showResults: false})
		this.setState({showInstruction: false})
		this.setState({errorcode: 'Logged out'});
		credentials.username = "";
		credentials.password = "";
	}

	showRegister(){
		//hide login page, show register page
		this.setState({errorcode: null});
		this.setState({showLogin: !this.state.showLogin });
		this.setState({showRegister: !this.state.showRegister });
	}
	
	showMenu(){
		//hide results, show menu
		this.setState({showResults: !this.state.showResults });
		this.setState({showMenu: !this.state.showMenu});
	}
	
	showGame(){
		//hide menu, show game page
		this.connectToServer();
		this.setState({showInstruction: !this.state.showInstruction });
		this.setState({showGame: !this.state.showGame });
	}

	showInstruction(){
		this.setState({showMenu: !this.state.showMenu });
		this.setState({showInstruction: !this.state.showInstruction });
	}

	
	showProfile(){
		//hide menu, show game page
		this.setState({showMenu: !this.state.showMenu });
		this.setState({showProfile: !this.state.showProfile });
	}
	
	showLeaderboard(){
		//hide menu, show game page
		if(!this.state.showLeaderboard){
			this.leaderboard();
		}
		this.setState({showMenu: !this.state.showMenu });
		this.setState({showLeaderboard: !this.state.showLeaderboard });
	}
	
	
	register(values){
		var newUser =  { 
			"username": values.username1, 
			"password": values.password1,
			"password1": values.password2
		};
		
		if(newUser.username == null || newUser.password == null || newUser.password1 == null){
			this.setState({errorcode: "Please Fill In All Forms." });
		}else if(newUser.password === newUser.password1){
			$.ajax({
				method: "POST",
				url: '/api/reg/register',
				data: JSON.stringify({}),
				headers: { "Authorization": "Basic " + btoa(newUser.username + ":" + newUser.password) },
				processData:false,
				contentType: "application/json; charset=utf-8",
				dataType:"json"
			}).done( (data, text_status, jqXHR) =>{
				console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
				this.setState({showRegister: !this.state.showRegister });
				this.setState({showLogin: !this.state.showLogin });
				this.setState({errorcode: "Account Created." });
			}).fail( (err)=>{
				this.setState({errorcode: "Username already taken." });
			});
		}else{
			this.setState({errorcode: "Passwords do not match." });
		}
	}
	
	
	changePassword(values){
		var newValues = {
			"username": credentials.username,
			"password": values.oldPassword,
			"password1": values.newPassword1,
			"password2": values.newPassword2
		}

		if(newValues.password == null || newValues.password1 == null || newValues.password2 == null){
			this.setState({errorcode: "Please Fill In All Forms." });
		}else if(newValues.password1 === newValues.password2){
			$.ajax({
					method: "POST",
					url: '/api/auth/change',
					data: JSON.stringify({ "username" : newValues.username, "oldPassword" : newValues.password, "newPassword" : newValues.password1 }),
			headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
					processData:false,
					contentType: "application/json; charset=utf-8",
					dataType:"json"
			}).done( (data, text_status, jqXHR) =>{
					console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
					credentials.password = newValues.password1
					this.setState({showProfile: !this.state.showProfile});
					this.setState({showMenu: !this.state.showMenu});
					this.setState({errorcode: "Password Changed." });

			}).fail( (err) =>{
					console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
					this.setState({errorcode: "Incorrect Password" });
			});
		}
		else{
			console.log("Password don't match");
			this.setState({errorcode: "Passwords do not match." });
		}
	}
	leaderboard(){
		/**
		 * prob need to do function call to server to get
		 * the leaderboard info
		 */
		var difficulty = ["hard"];

		for (var i in difficulty){
				var table = [];
				this.getLeaderBoardInfo(difficulty[i], table);
		}

}

	getLeaderBoardInfo(diff, table){
		console.log(window.innerWidth)
		console.log(window.innerHeight)
		$.ajax({
				method: "GET",
				url: "/api/auth/leaderBoard/",
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password)},
				processData: false,
				contentType: "application/json; charset=utf-8",
				dataType:"json"
		}).done( (data, text_status, jqXHR) =>{
				console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
				if(diff === "hard"){
					this.setState({ hard: data });
				}
		}).fail( (err) =>{
				console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
		});
		return;
}





	render() {
		if (this.state.showLogin){
			return (
			<div>
				<hr />
				<Login
					onLogin={this.login}
					onRegister={this.showRegister}
				/> <hr/>
				<div>
					{this.state.errorcode}
				</div>
			</div>
			);
		}
		
		else if (this.state.showRegister){
			return (
			<div>
				<hr />
				<Register
					onRegister={this.register}
					onCancel={this.showRegister}
				/> <hr/>
				<div>
					{this.state.errorcode}
				</div>
			</div>
			);
		}
		
		else if (this.state.showMenu){
			return (
			<div>
				<hr />
				<Menu
					onLogout={this.logout}
					socket={this.sendMessage}
					onStart={this.showInstruction}
					onProfile={this.showProfile}
					onLeaderboard={this.showLeaderboard}
				/> <hr/>
				<div>
					{this.state.errorcode}
				</div>
			</div>
			);
		}

		else if (this.state.showProfile){
			return (
			<div>
				<hr />
				<Profile
					username={credentials.username}
					onMenu={this.showProfile}
					onChangePassword={this.changePassword}
				/> <hr/>
				<div>
					{this.state.errorcode}
				</div>
			</div>
			);
		}		

		else if (this.state.showLeaderboard){
			return (
			<div>
				<hr />
				<Leaderboard
					onMenu={this.showLeaderboard}
					hard={this.state.hard}
				/> <hr/>
				<div>
					{this.state.errorcode}
				</div>
			</div>
			);
		}
		else if (this.state.showInstruction){
			return (
				<div>
					<hr />
					<Instruction
						onStart={this.showGame}
					/> <hr/>
					<div>
						{this.state.errorcode}
					</div>
				</div>
				);
		}
		else if (this.state.showGame){
			return (
			<div>
				<BrowserView>
					<Game
						socket={this.sendMessage}
						gameData = {this.state.gameData}
						height={800}
						width={800}
					/>
				</BrowserView>
				<MobileView>
					<Game
						socket={this.sendMessage}
						gameData = {this.state.gameData}
						height={window.innerHeight}
						width={window.innerWidth}
					/>
				</MobileView>
				<div>
					{this.state.errorcode}
				</div>
			</div>
			);
		}
		
		else if (this.state.showResults){
			return (
			<div>
				<Results
					onMenu={this.showMenu}
				/>
				<div>
					{this.state.errorcode}
				</div>
			</div>
			);
		}
		
		else{
			return(null);
		}

	}
	}

ReactDOM.render(<App />, document.getElementById("root"));

export default App;