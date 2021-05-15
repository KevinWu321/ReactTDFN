import React from 'react';
//import { Button } from '@material-ui/core';

class Login extends React.Component{
	constructor() {
		super();
		this.state = {
		};
		this.onInput = this.onInput.bind(this);
		this.onLogin = this.onLogin.bind(this);
		this.onRegister = this.onRegister.bind(this);
	}
	
	onInput(event) {
		this.setState({
		[event.target.name]: event.target.value
		});
	}
	
	onLogin() {
		this.props.onLogin(this.state)
	}
	
	onRegister(){
		this.props.onRegister(this.state)
	}
	
	render() {
		return (
		<div>
			<table>
				<tbody>
					<tr>
						<td>
						<input type="text" name="username" placeholder="username" onChange={this.onInput} />
						</td>
					</tr>
					<tr>
						<td>
						<input type="text" name="password" placeholder="password" onChange={this.onInput} />
						</td>
					</tr>
					<tr>
						<td type='button'>
							<button onClick={this.onLogin}>Login</button>
							<button onClick={this.onRegister}>Register</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		);
	}
}


export default Login;