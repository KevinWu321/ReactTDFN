import React from 'react';
import Canvas from './Canvas';
//import { Button } from '@material-ui/core';

class Game extends React.Component{
	constructor() {
		super();
		this.state = {
		};
		this.send = this.send.bind(this)
	}
	
	
	send(){
		this.props.socket(JSON.stringify({"message": "bac"}))
	}
	
	//need function to create canvas object using object stored in state
	
	render() {
		return (
		<div>
			<Canvas
				socket={this.props.socket}
				gameData={this.props.gameData}
				height={this.props.height}
				width={this.props.width}
				/>
		</div>
		);
	}
}


export default Game;