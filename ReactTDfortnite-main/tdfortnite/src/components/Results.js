import React from 'react';
//import { Button } from '@material-ui/core';

class Results extends React.Component{
	constructor() {
		super();
		this.state = {
		};
		this.onInput = this.onInput.bind(this);
		this.onMenu = this.onMenu.bind(this);
	}
	
	onInput(event) {
		this.setState({
		[event.target.name]: event.target.value
		});
	}
	
	onMenu(){
		this.props.onMenu(this.state)
	}
	
	
	render() {
		return(
			<table>
				<tbody>
					<tr>
						<td>You Have Died!</td>
					</tr>
					<tr>
						<td><button onClick={this.onMenu} >Main Menu</button></td>
					</tr>
				</tbody>
			</table>
		)
	}
}



export default Results;