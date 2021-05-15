import React from 'react';
//import { Button } from '@material-ui/core';

class Instruction extends React.Component{
	constructor() {
		super();
		this.state = {
		};
		//this.onInput = this.onInput.bind(this);
		this.onStart = this.onStart.bind(this);
	}
	

	onInput(event) {
		this.setState({
		[event.target.name]: event.target.value
		});
	}
	
	
	onStart(){
		this.props.onStart(this.state)
	}
	
	
	render() {
		return (
		<div>
            <p>
                If you are on desktop:<br/>
                Move: WASD<br/>
                Shoot: Mouse click<br/>
                Reload: R<br/>
            </p>
            <p>
                If you are on Mobile: <br/>
                Move: Touch and hold <br/>
                Shoot: Tap to shoot<br/>
                Reload: Tap the ammo on the bottom right<br/>
            </p>
			<button onClick={this.onStart}>Start</button>

		</div>
		);
	}
}


export default Instruction;
