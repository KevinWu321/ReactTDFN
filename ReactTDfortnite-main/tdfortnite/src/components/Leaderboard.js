import React from 'react';
//import { Button } from '@material-ui/core';

class Leaderboard extends React.Component{
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
	
	
	createTable = () => {
		let hardTable = []
		let table = []
		// Outer loop to create parent
		for (let i = 0; i<this.props.hard.length; i++) {
			let children = []
			//Inner loop to create children
			children.push(<td key={"hardU" + i}>{this.props.hard[i].username}</td>)
			children.push(<td key={"hardS" + i}>{this.props.hard[i]["score"]}</td>)

			//Create the parent and add the children
			hardTable.push(<tr key={i}>{children}</tr>)
		}
		
		table.push(<table><tbody>{hardTable}</tbody></table>)
		
		
		return table
		}
	
	
	render() {
		return(
			<div>
				<h2>LeaderBoard</h2>
				{this.createTable()[0]}
				<button onClick={this.onMenu} >Main Menu</button>
			</div>
		)
	}
}



export default Leaderboard;