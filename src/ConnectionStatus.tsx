import React, {Component} from 'react';

import {Text, TextStyle} from 'react-native';
import {ConnectionState, getEmoji} from './ConnectionState';

type Props = {
  style?: TextStyle;
  status: ConnectionState;
};

class ConnectionStatus extends Component<Props> {
  ConnectionStatus() {}
  render() {
    return <Text style={this.props.style}>{getEmoji(this.props.status)}</Text>;
  }
}

export default ConnectionStatus;
