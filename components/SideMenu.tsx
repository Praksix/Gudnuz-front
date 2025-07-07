import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthContext } from './AuthContext';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface SideMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const SideMenu: React.FC<SideMenuProps> = ({ isVisible, onClose }) => {
  const { user, logout } = useAuthContext();
  const colorScheme = useColorScheme() ?? 'light';
  const slideAnim = React.useRef(new Animated.Value(-screenWidth)).current;

  React.useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnim]);

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const menuItems = [
    {
      id: 'profile',
      title: 'Profil',
      icon: 'person',
      onPress: () => {
        onClose();
        // router.push('/profile');
      },
    },
    {
      id: 'settings',
      title: 'Paramètres',
      icon: 'settings',
      onPress: () => {
        onClose();
        // router.push('/settings');
      },
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications',
      onPress: () => {
        onClose();
        // router.push('/notifications');
      },
    },
    {
      id: 'help',
      title: 'Aide',
      icon: 'help',
      onPress: () => {
        onClose();
        // router.push('/help');
      },
    },
    {
      id: 'about',
      title: 'À propos',
      icon: 'info',
      onPress: () => {
        onClose();
        // router.push('/about');
      },
    },
  ];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.menuContainer,
            {
              transform: [{ translateX: slideAnim }],
              backgroundColor: Colors[colorScheme].background,
            },
          ]}
        >
          <View style={styles.header}>
            <ThemedText type="title" style={styles.menuTitle}>
              Menu
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol
                name="close"
                size={24}
                color={Colors[colorScheme].icon}
              />
            </TouchableOpacity>
          </View>

          {user && (
            <View style={styles.userSection}>
              <View style={styles.userAvatar}>
                <IconSymbol
                  name="person"
                  size={32}
                  color={Colors[colorScheme].icon}
                />
              </View>
              <View style={styles.userInfo}>
                <ThemedText type="defaultSemiBold">{user.username}</ThemedText>
                <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
              </View>
            </View>
          )}

          <View style={styles.menuItems}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemContent}>
                  <IconSymbol
                    name={item.icon as any}
                    size={24}
                    color={Colors[colorScheme].icon}
                    style={styles.menuItemIcon}
                  />
                  <ThemedText style={styles.menuItemText}>{item.title}</ThemedText>
                </View>
                <IconSymbol
                  name="chevron.right"
                  size={20}
                  color={Colors[colorScheme].icon}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <IconSymbol
                name="logout"
                size={24}
                color="#FF3B30"
                style={styles.logoutIcon}
              />
              <Text style={styles.logoutText}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    width: screenWidth * 0.8,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  menuItems: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoutIcon: {
    marginRight: 15,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
}); 