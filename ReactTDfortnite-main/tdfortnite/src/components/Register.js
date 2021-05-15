import React from 'react';
//import { Button } from '@material-ui/core';

class Register extends React.Component{
	constructor() {
		super();
		this.state = {
		};
		this.onInput = this.onInput.bind(this);
		this.onRegister = this.onRegister.bind(this);
		this.onCancel = this.onCancel.bind(this);
	}
	
	onInput(event) {
		this.setState({
		[event.target.name]: event.target.value
		});
	}
	
	
	onRegister(){
		this.props.onRegister(this.state)
	}
	
	onCancel(){
		this.props.onCancel(this.state)
	}
	
	render() {
		return (
		<div>
			<table>
				<tbody>
					<tr>
						<td>
						<input type="text" name="username1" placeholder="Username" onChange={this.onInput} />
						</td>
					</tr>
					<tr>
						<td>
						<input type="text" name="password1" placeholder="password" onChange={this.onInput} />
						</td>
					</tr>
					<tr>
						<td>
						<input type="text" name="password2" placeholder="confirm Password" onChange={this.onInput} />
						</td>
					</tr>
					<tr>
						<td>
						<button onClick={this.onRegister}>Register</button>
						<button onClick={this.onCancel}>Cancel</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		);
	}
}


export default Register;