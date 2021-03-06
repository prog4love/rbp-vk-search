import React from 'react';
import PropTypes from 'prop-types';
import { InputGroup, FormControl } from 'react-bootstrap';
import FormInputGroup from './FormInputGroup';

function getValidationState(error, touched, disabled) {
  if (disabled) {
    return null;
  }
  return touched && error ? 'error' : null;
}

const WallOwnerIdField = ({ input, isDisabled, onIdTypeSwitch, meta }) => {
  const { value, onChange } = input;
  const { error, touched } = meta;

  return (
    <FormInputGroup
      id="wall-owner-usual-id"
      label="Wall owner usual id"
      validationState={getValidationState(error, touched, isDisabled)}
    >
      <InputGroup>
        <InputGroup.Addon>
          <input
            checked={!isDisabled}
            onChange={onIdTypeSwitch}
            type="radio"
            name="wallOwnerIdType"
            value="usualId"
          />
        </InputGroup.Addon>
        <FormControl
          name="wallOwnerUsualId"
          onChange={onChange}
          placeholder="123456789"
          // this or textual custom id must be entered
          required={isDisabled === false}
          disabled={isDisabled}
          type="number"
          value={value}
        />
      </InputGroup>
    </FormInputGroup>
  );
};

WallOwnerIdField.propTypes = {
  input: PropTypes.shape({
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
  }).isRequired,
  isDisabled: PropTypes.bool.isRequired,
  onIdTypeSwitch: PropTypes.func.isRequired,
};

// TODO: consider usage of usual FormGroup
// const alt = (
//   <FormGroup
//     controlId="wall-owner-id"
//     validationState={getValidationState(isOwnerSpecified)}
//   >
//     <ControlLabel>
//       {'Wall owner id'}
//     </ControlLabel>
//     <InputGroup>
//       <InputGroup.Addon>
//         <input type="radio" name="wallOwner" />
//       </InputGroup.Addon>
//       <FormControl
//         onChange={onChange}
//         placeholder="id of user or group"
//         type="text"
//         value={value}
//       />
//     </InputGroup>
//     {/* {help && <HelpBlock>{help}</HelpBlock>} */}
//   </FormGroup>
// );

export default WallOwnerIdField;

// One of solution to switch between entering of usual id or short textual id

// <FormGroup>
//   <InputGroup>
//     <InputGroup.Addon>
//       <input type="checkbox" aria-label="..." />
//     </InputGroup.Addon>
//     <FormControl type="text" />
//   </InputGroup>
// </FormGroup>

/* eslint-disable */