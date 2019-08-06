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
}

class Sequencer extends React.Component<SequencerProps, SequencerState> {
  static readonly DEFAULT_VOLUME = 100;
  static readonly DEFAULT_PAN = 0;

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
      volume: Sequencer.DEFAULT_VOLUME,
      pan: Sequencer.DEFAULT_PAN
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle = (id: number, activated: boolean) => {
    let { steps } = this.state;
    steps[id] = activated;
    this.setState({ steps });
  };

  volumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseInt(e.currentTarget.value) || Sequencer.DEFAULT_VOLUME;
    this.setState({ volume });
  };

  panChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pan = parseFloat(e.currentTarget.value) || Sequencer.DEFAULT_PAN;
    this.setState({ pan });
  };

  handleDragOver = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  handleDrop = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files.length !== 0) {
      //TODO: Handle the rest of the files
      const file: File = e.dataTransfer.files[0];
      this.props.audio.updateSoundWithFile(file);
    }
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
      <div
        className={className}
        onDragOver={this.handleDragOver}
        onDrop={this.handleDrop}
      >
        {this.state.steps.map((step, index) => (
          <Step
            key={`${this.props.id}${index}`}
            id={index}
            step={this.props.step}
            toggleFunc={this.toggle}
          />
        ))}
        <div>
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
      </div>
    );
  }
}

export default Sequencer;
