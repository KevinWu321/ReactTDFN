import React from 'react';
//import { Button } from '@material-ui/core';

class Profile extends React.Component{
	constructor() {
		super();
		this.state = {
		};
		this.onInput = this.onInput.bind(this);
		this.onMenu = this.onMenu.bind(this);
		this.onChangePassword = this.onChangePassword.bind(this);
	}
	
	onInput(event) {
		this.setState({
		[event.target.name]: event.target.value
		});
	}
	
	onMenu(){
		this.props.onMenu(this.state)
	}
	
	onChangePassword(){
		this.props.onChangePassword(this.state)
	}
	
	
	render() {
		return (
			<table>
				<tbody>
					<tr>
						<td>Username: {this.props.username}</td> 
					</tr>
					<tr>
						<td><input type="text" name="oldPassword" placeholder="old Password" onChange={this.onInput} /></td>
					</tr>
					<tr>
						<td><input type="text" name="newPassword1" placeholder="new Password" onChange={this.onInput} /></td>
					</tr>
					<tr>
						<td><input type="text" name="newPassword2" placeholder="Confirm Password" onChange={this.onInput} /></td>
					</tr>
					<tr>
						<td>
						<button onClick={this.onMenu}>Main Menu</button>
						<button onClick={this.onChangePassword}>Change Password</button>
						</td>
					</tr>
				</tbody>
			</table>
		);
	}
}


export default Profile;