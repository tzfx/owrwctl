import React, {Component} from 'react';
import {
  Alert,
  Button,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import BTManager from 'react-native-ble-manager';

import {Colors} from 'react-native/Libraries/NewAppScreen';

import ModeSelection from './ModeSelection';
import {ConnectionState} from './ConnectionState';
import ConnectionStatus from './ConnectionStatus';
import {ONEWHEEL_SERVICE_UUID} from './rewheel/ble';

type State = {
  connectionState: ConnectionState;
  devices: any[];
  isConnected: boolean;
  isDarkMode: boolean;
  backgroundStyle: {
    backgroundColor: string;
  };
};

class App extends Component<{}, State> {
  state: Readonly<State> = {
    connectionState: ConnectionState.DISCONNECTED,
    devices: [],
    isConnected: false,
    isDarkMode: false,
    backgroundStyle: {
      backgroundColor: Colors.lighter,
    },
  };

  // Seconds to scan for a valid device.
  private scanDuration = 5;

  private async tryBTScan() {
    this.setState({connectionState: ConnectionState.SCANNING});
    try {
      await BTManager.scan([ONEWHEEL_SERVICE_UUID], this.scanDuration, false);
      console.debug('Scan started.');
      const deviceRefresh = setInterval(
        async () =>
          this.setState({devices: await BTManager.getDiscoveredPeripherals()}),
        (this.scanDuration / 4) * 1000,
      );
      setTimeout(() => {
        console.debug('Scan stopped.');
        clearInterval(deviceRefresh);
        this.setState({connectionState: ConnectionState.DISCONNECTED});
        if (this.state.devices.length === 0) {
          Alert.alert(
            'No devices found',
            'There were no devices found within range.\nMake sure your rewheel is powered on and not connected to another application.',
          );
        }
      }, this.scanDuration * 1000);
    } catch (err) {
      console.error('Failed to scan for bt devices.', err);
    }
  }

  async componentDidMount() {
    // IIFE hack so hooks work...
    (async () => {
      const isDarkMode = useColorScheme() === 'dark';
      const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
      };
      this.setState({backgroundStyle, isDarkMode});
    })().catch(() => {}); // NOOP.

    // Initialize Bluetooth Manager
    try {
      await BTManager.start({showAlert: true});
      console.debug('Bluetooth initialized.');
    } catch (err) {
      console.error('Bluetooth failed to start', err);
    }
  }

  render() {
    return (
      <SafeAreaView style={{...styles.base, ...this.state.backgroundStyle}}>
        <StatusBar
          barStyle={this.state.isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={this.state.backgroundStyle.backgroundColor}
        />
        <View style={this.state.backgroundStyle}>
          <Text style={styles.header}>
            <Text style={styles.green}>Re</Text>Wheel Controller
          </Text>
          <View>
            {this.state.isConnected ? (
              <ModeSelection />
            ) : (
              <View style={styles.fullscreen}>
                <ConnectionStatus
                  style={styles.largest}
                  status={this.state.connectionState}
                />
                <Button
                  title={
                    this.state.connectionState === ConnectionState.DISCONNECTED
                      ? 'Start Scanning'
                      : this.state.connectionState === ConnectionState.SCANNING
                      ? 'Scanning...'
                      : ''
                  }
                  disabled={
                    this.state.connectionState === ConnectionState.SCANNING
                  }
                  onPress={() => this.tryBTScan()}
                />
                <Text>
                  {JSON.stringify(
                    this.state.devices.filter(d => d.name != null),
                    ['name'],
                    2,
                  )}
                </Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  base: {
    fontFamily:
      '-apple-system, ".SFNSText-Regular", "San Francisco", "Roboto", "Segoe UI", "Helvetica Neue", "Lucida Grande", sans-serif',
  },
  fullscreen: {
    marginTop: '10%',
    height: '100%',
    alignItems: 'center',
  },
  large: {fontSize: 36},
  larger: {fontSize: 42},
  largest: {fontSize: 64},
  green: {color: '#56bf81'},
  header: {fontSize: 42, textAlign: 'center'},
});

export default App;
