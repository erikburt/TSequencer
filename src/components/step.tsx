import * as React from "react";
import styled from "styled-components";

export interface StepProps {
  id: number;
  step: number;
  toggleFunc: (id: number, activated: boolean) => void;
}

export interface StepState {
  activated: boolean;
}

const StyledDiv = styled.div`
  margin: 1px;
  border: 1px solid black;
  width: 14px;
  height: 0;
  padding-bottom: 15px;
`;

const StepDiv = styled(StyledDiv)`
  background: blue;
`;
const EnaDiv = styled(StyledDiv)`
  background: gray;
`;
const DisDiv = styled(StyledDiv)`
  background: white;
`;

const Step = (props: StepProps) => {
  const { id, step, toggleFunc } = props;
  const [activated, setActivated] = React.useState(false);

  const toggle = () => {
    toggleFunc(id, !activated);
    setActivated(!activated);
  };

  return step === id ? (
    <StepDiv onClick={toggle} />
  ) : activated ? (
    <EnaDiv onClick={toggle} />
  ) : (
    <DisDiv onClick={toggle} />
  );
};

export default Step;
