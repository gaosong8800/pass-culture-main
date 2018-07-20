import React from 'react'
import PropTypes from 'prop-types';
import moment from 'moment'

import BasicInput from './BasicInput'

const TimeInput = props => {
  const onInputChange = e => {
    const [hour, minutes] = e.target.value.split(':')
    props.onChange(moment(props.value).hours(hour).minutes(minutes).toISOString())
  }
  console.log(props.value)
  return <BasicInput {...props} onChange={onInputChange} value={props.value ? moment(props.value).tz(props.tz).format('HH:mm') : ''} />
}

TimeInput.propTypes = {
  tz: PropTypes.object.isRequired,
}

export default TimeInput
