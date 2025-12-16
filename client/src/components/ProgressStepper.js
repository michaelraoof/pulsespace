import React from 'react';
import styled from 'styled-components';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function ProgressStepper({ currentStep, totalSteps, steps }) {
    return (
        <Container>
            <StepsContainer>
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = stepNumber < currentStep;

                    return (
                        <React.Fragment key={index}>
                            <StepItem>
                                <StepCircle isActive={isActive} isCompleted={isCompleted}>
                                    {isCompleted ? (
                                        <CheckCircleIcon style={{ fontSize: '1.5rem', color: 'white' }} />
                                    ) : (
                                        <StepNumber isActive={isActive}>{stepNumber}</StepNumber>
                                    )}
                                </StepCircle>
                                <StepLabel isActive={isActive} isCompleted={isCompleted}>
                                    {step}
                                </StepLabel>
                            </StepItem>
                            {index < steps.length - 1 && (
                                <StepConnector isCompleted={isCompleted} />
                            )}
                        </React.Fragment>
                    );
                })}
            </StepsContainer>
            <ProgressText>
                Step {currentStep} of {totalSteps}
            </ProgressText>
        </Container>
    );
}

export default ProgressStepper;

const Container = styled.div`
  padding: 2rem 2rem 1rem 2rem;
  background: linear-gradient(135deg, rgba(96, 80, 220, 0.05) 0%, rgba(160, 151, 234, 0.05) 100%);
  border-bottom: 1px solid rgba(160, 151, 234, 0.2);
`;

const StepsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 500px;
  margin: 0 auto;

  @media only screen and (max-width: 600px) {
    max-width: 300px;
  }
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const StepCircle = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props =>
        props.isCompleted ? '#6050dc' :
            props.isActive ? '#6050dc' :
                '#e0e0e0'};
  transition: all 0.3s ease;
  box-shadow: ${props =>
        props.isActive ? '0 4px 12px rgba(96, 80, 220, 0.4)' : 'none'};
  transform: ${props => props.isActive ? 'scale(1.1)' : 'scale(1)'};

  @media only screen and (max-width: 600px) {
    width: 2rem;
    height: 2rem;
  }
`;

const StepNumber = styled.span`
  color: ${props => props.isActive ? 'white' : '#9e9e9e'};
  font-weight: 600;
  font-size: 1.1rem;
  font-family: 'Poppins', sans-serif;

  @media only screen and (max-width: 600px) {
    font-size: 0.95rem;
  }
`;

const StepLabel = styled.span`
  font-size: 0.85rem;
  font-weight: ${props => props.isActive ? 600 : 400};
  color: ${props =>
        props.isCompleted ? '#6050dc' :
            props.isActive ? '#6050dc' :
                '#9e9e9e'};
  font-family: 'Poppins', sans-serif;
  text-align: center;
  transition: all 0.3s ease;

  @media only screen and (max-width: 600px) {
    font-size: 0.75rem;
  }
`;

const StepConnector = styled.div`
  width: 60px;
  height: 3px;
  background: ${props => props.isCompleted ? '#6050dc' : '#e0e0e0'};
  margin: 0 0.5rem;
  margin-bottom: 1.8rem;
  transition: all 0.3s ease;

  @media only screen and (max-width: 600px) {
    width: 30px;
  }
`;

const ProgressText = styled.div`
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #6050dc;
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
`;
