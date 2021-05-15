import React from 'react';
//import { Button } from '@material-ui/core';

class Menu extends React.Component{
	constructor() {
		super();
		this.state = {
		};
		//this.onInput = this.onInput.bind(this);
		this.onStart = this.onStart.bind(this);
		this.onProfile = this.onProfile.bind(this);
		this.onLeaderboard = this.onLeaderboard.bind(this);
		this.onLogout = this.onLogout.bind(this);
	}
	

	onInput(event) {
		this.setState({
		[event.target.name]: event.target.value
		});
	}
	
	
	onStart(){
		this.props.onStart(this.state)
	}
	
	onProfile(){
		this.props.onProfile(this.state)
	}
	
	onLeaderboard(){
		this.props.onLeaderboard(this.state)
	}
	
	onLogout(){
		this.props.onLogout(this.state)
	}
	
	
	render() {
		return (
		<div>
			<button onClick={this.onStart}>Start</button>
			<button onClick={this.onProfile}>Profile</button>
			<button onClick={this.onLeaderboard}>Leaderboard</button>
			<button onClick={this.onLogout}>Logout</button>

		</div>
		);
	}
}


export default Menu;
