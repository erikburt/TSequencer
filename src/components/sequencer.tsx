import * as React from "react";
import Step from "./Step";
import "../css/sequencer.css";
import AudioBufferWrapper from "../tools/audioBufferWrapper";

export interface SequencerProps {
  id: number;
  step: number;
  numSteps: number;
  audio: AudioBufferWrapper;
}

export interface SequencerState {
  steps: boolean[];
  toPlay: boolean;
  prevStep: number;
  volume: number;
  pan: number;
}

const Sequencer = (props: SequencerProps) => {
  const { step, audio, id, numSteps } = props;
  const DEFAULT_VOLUME = 100;
  const DEFAULT_PAN = 0;
  const [steps, setSteps] = React.useState([
    ...new Array(numSteps).fill(false),
  ]);
  const [prevStep, setPrevStep] = React.useState(step);

  const toggle = (id: number, activated: boolean) => {
    const newSteps = [...steps];
    newSteps[id] = activated;
    setSteps(newSteps);
  };

  const volumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseInt(e.currentTarget.value) || DEFAULT_VOLUME;
    audio.volume = volume;
  };

  const panChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pan = parseFloat(e.currentTarget.value) || DEFAULT_PAN;
    audio.pan = pan;
  };

  const handleDragOver = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files.length !== 0) {
      //TODO: Handle the rest of the files
      const file: File = e.dataTransfer.files[0];
      audio.updateSoundWithFile(file);
    }
  };

  let className = "sequencer";

  if (steps[step]) {
    className = "seqActive";
    // setPrevStep(step);
    audio.play();
  }

  return (
    <div className={className} onDragOver={handleDragOver} onDrop={handleDrop}>
      {steps.map((elem, index) => (
        <Step
          key={`${id}${index}`}
          id={index}
          step={step}
          toggleFunc={toggle}
        />
      ))}
      <div>
        <span>{audio.filename}</span>
        <input
          className='slider'
          type='range'
          min='1'
          max='120'
          defaultValue={"" + audio.volume}
          id='volumeSlider'
          onInput={volumeChange}
        />
        <input
          className='slider'
          type='range'
          step='.1'
          min='-1'
          max='1'
          defaultValue='0'
          id='panSlider'
          onChange={panChange}
        />
      </div>
    </div>
  );
};

export default Sequencer;
