import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { TABS } from '../constants/branding';

export default function Navigation({ activeTab, onTabChange, offlineCount = 0 }) {
  return (
    <View style={s.navbar}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={s.navItem}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <View style={s.iconWrap}>
              <Feather
                name={tab.featherIcon}
                size={22}
                color={isActive ? COLORS.primary : COLORS.textMuted}
              />
              {tab.key === 'HISTORY' && offlineCount > 0 && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>{offlineCount > 9 ? '9+' : offlineCount}</Text>
                </View>
              )}
            </View>
            <Text style={[s.navLabel, isActive && s.navLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    paddingBottom: 6,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  iconWrap: {
    width: 44,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  navLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 3,
    fontWeight: '500',
  },
  navLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: 3,
    backgroundColor: COLORS.rouge,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
