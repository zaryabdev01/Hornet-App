import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { CGU_TEXT, PRIVACY_TEXT, IMAGE_RIGHTS_TEXT } from '../constants/legalTexts';
import LegalDocScreen from './LegalDocScreen';

const DOCS = [
  { key: 'cgu',    title: "Conditions d'utilisation",      text: CGU_TEXT },
  { key: 'priv',   title: 'Politique de confidentialité',  text: PRIVACY_TEXT },
  { key: 'image',  title: "Droits d'image et licences",   text: IMAGE_RIGHTS_TEXT },
];

export default function LegalScreen({ onAccept, onRefuse }) {
  const [openDoc, setOpenDoc] = useState(null);

  if (openDoc) {
    return (
      <LegalDocScreen
        title={openDoc.title}
        text={openDoc.text}
        onBack={() => setOpenDoc(null)}
      />
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.inner}>
        {/* Logo */}
        <View style={s.logoWrap}>
          <Image
            source={require('../../assets/logo.jpg')}
            style={s.logoImg}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={s.title}>Accord juridique requis</Text>
        <Text style={s.subtitle}>
          Pour continuer, lis et accepte les documents suivants :
        </Text>

        {/* Doc list */}
        <View style={s.docList}>
          {DOCS.map(doc => (
            <TouchableOpacity
              key={doc.key}
              style={s.docRow}
              onPress={() => setOpenDoc(doc)}
              activeOpacity={0.7}
            >
              <View style={s.docCheck}>
                <Text style={s.docCheckMark}>✓</Text>
              </View>
              <Text style={s.docTitle}>{doc.title}</Text>
              <Text style={s.docArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Buttons */}
        <View style={s.actions}>
          <TouchableOpacity style={s.acceptBtn} onPress={onAccept} activeOpacity={0.85}>
            <Text style={s.acceptBtnText}>Accepter et continuer</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onRefuse} activeOpacity={0.7} style={s.refuseBtn}>
            <Text style={s.refuseBtnText}>Refuser et fermer l'application</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  logoWrap: {
    width: 140,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoImg: {
    width: 140,
    height: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  docList: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 32,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  docCheck: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docCheckMark: {
    color: '#111',
    fontSize: 14,
    fontWeight: 'bold',
  },
  docTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.primary,
  },
  docArrow: {
    color: COLORS.textMuted,
    fontSize: 20,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  acceptBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptBtnText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '700',
  },
  refuseBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  refuseBtnText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
