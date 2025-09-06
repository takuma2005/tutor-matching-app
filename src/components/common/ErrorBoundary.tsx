import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.error('ErrorBoundary caught:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>エラーが発生しました</Text>
          <Text style={styles.subtitle}>アプリを再起動してください。</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666' },
});
