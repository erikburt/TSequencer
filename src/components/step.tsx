import * as React from "react";
import { Component } from "react";
import "../css/step.css";

export interface StepProps {
  id: number;
  // testID: number;
  step: number;
  toggleFunc: (id: number, activated: boolean) => void;
  // activated: boolean;
}

export interface StepState {
  activated: boolean;
}

class Step extends React.Component<StepProps, StepState> {
  constructor(props: StepProps) {
    super(props);

    this.state = {
      activated: false
    };
  }

  toggle = () => {
    const activated = !this.state.activated;
    this.setState({ activated });
    this.props.toggleFunc(this.props.id, activated);
  };

  render() {
    const { id, step } = this.props;
    const { activated } = this.state;
    let className = "";

    if (step === id) className = "step";
    else if (activated) className = "ena";
    else className = "dis";

    return <div className={className} onClick={this.toggle} />;
  }
}

export default Step;
