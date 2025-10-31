import * as React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { theme } from '../../theme';

type LogoProps = {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
};

export default function Logo({ size = 'medium', showText = true }: LogoProps) {
  const sizes = {
    small: { width: 40, height: 40, fontSize: 16 },
    medium: { width: 60, height: 60, fontSize: 20 },
    large: { width: 100, height: 100, fontSize: 28 }
  };

  const currentSize = sizes[size];

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/nexaci-logo.png.png')}
        resizeMode="contain"
        style={{ width: currentSize.width * 2, height: currentSize.height * 2, marginBottom: theme.spacing.sm }}
      />

      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.brandName, { fontSize: currentSize.fontSize }]}>NexaCI</Text>
          <Text style={styles.tagline}>Livraison & Démarches,</Text>
          <Text style={styles.tagline}>partout en Côte d'Ivoire</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  textContainer: {
    alignItems: 'center'
  },
  brandName: {
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: theme.spacing.xs
  },
  tagline: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center'
  }
});
