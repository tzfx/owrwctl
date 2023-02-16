import React, {Component} from 'react';

import {Button, View} from 'react-native';

class ModeSelection extends Component {
  state = {
    selected: 'none',
  };
  ModeSelection() {}
  render() {
    return (
      <View>
        <Button title="Redwood" />
        <Button title="Pacific/Mission" />
        <Button title="Elevated" />
        <Button title="Skyline/Delerium" />
        <Button title="Custom Shaping" />
      </View>
    );
  }
}

export default ModeSelection;
