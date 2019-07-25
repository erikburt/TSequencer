import * as React from "react";
import { Component } from "react";
import Step from "./step";
import "../css/sequencer.css";
import AudioBufferWrapper from "../tools/audioBufferWrapper";

export interface SequencerProps {
  id: number;
  stepHeight: number;
  stepWidth: number;
  step: number;
  audio: AudioBufferWrapper;
}

export interface SequencerState {
  numSteps: number;
  steps: boolean[];
  toPlay: boolean;
  prevStep: number;
  volume: number;
  pan: number;

  /*
  audioFile: ...
  pan
   */
}

class Sequencer extends React.Component<SequencerProps, SequencerState> {
  constructor(props: SequencerProps) {
    super(props);

    const { stepHeight, stepWidth } = props;
    const numSteps = stepHeight * stepWidth;
    const steps = new Array(numSteps).fill(false);

    this.state = {
      numSteps,
      steps,
      toPlay: false,
      prevStep: this.props.step,
      volume: 100,
      pan: 0
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle = (id: number, activated: boolean) => {
    let { steps } = this.state;
    steps[id] = activated;
    this.setState({ steps });
  };

  volumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseInt(e.currentTarget.value) || 100;
    this.setState({ volume });
  };

  panChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pan = parseFloat(e.currentTarget.value) || 0;
    this.setState({ pan });
  };

  render() {
    let className = "sequencer";

    if (
      this.state.steps[this.props.step] &&
      this.props.step !== this.state.prevStep
    ) {
      className = "seqActive";
      this.setState({ prevStep: this.props.step });
      this.props.audio.play(this.state.volume, this.state.pan);
    }

    return (
      <div className={className}>
        {this.state.steps.map((step, index) => (
          <Step
            key={`${this.props.id}${index}`}
            id={index}
            step={this.props.step}
            toggleFunc={this.toggle}
          />
        ))}
        <span>{this.props.audio.filename}</span>
        <input
          className="slider"
          type="range"
          min="1"
          max="100"
          defaultValue="100"
          id="volumeSlider"
          onInput={this.volumeChange}
        />
        <input
          className="slider"
          type="range"
          step=".1"
          min="-1"
          max="1"
          defaultValue="0"
          id="panSlider"
          onChange={this.panChange}
        />
      </div>
    );
  }
}

export default Sequencer;
