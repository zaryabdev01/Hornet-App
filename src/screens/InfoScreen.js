import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import LegalDocScreen from './LegalDocScreen';
import { CGU_TEXT, PRIVACY_TEXT, IMAGE_RIGHTS_TEXT } from '../constants/legalTexts';

// ── FAQ ──────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "Qu'est-ce que le frelon asiatique ?",
    a: "Vespa velutina est une espèce de frelon originaire d'Asie du Sud-Est, introduite accidentellement en France en 2004. C'est aujourd'hui une espèce invasive présente dans toute l'Europe, classifiée comme dangereuse pour les abeilles et les écosystèmes apicoles.",
  },
  {
    q: "Comment le reconnaître ?",
    a: "Thorax entièrement brun-noir velouté, abdomen brun avec un seul anneau jaune-orangé à l'extrémité, tête avec face antérieure jaune-orangé. Taille : 25–35 mm. À ne pas confondre avec le frelon européen (thorax roux-jaune, plus coloré).",
  },
  {
    q: "Est-il dangereux pour l'humain ?",
    a: "Sa piqûre est douloureuse mais généralement pas plus dangereuse que celle d'une guêpe, sauf en cas d'allergie. Le danger principal reste la destruction massive des colonies d'abeilles domestiques et sauvages, dont il se nourrit.",
  },
  {
    q: "Que faire si j'en vois un ?",
    a: "Observez à distance. Photographiez-le si possible avec le zoom. Signalez-le via ApiSave. N'essayez pas de le capturer ni de le tuer à la main.",
  },
  {
    q: "Puis-je détruire un nid moi-même ?",
    a: "Non. C'est fortement déconseillé et potentiellement illégal. Seuls des professionnels certifiés (désinsectiseurs, pompiers) sont habilités à détruire un nid. Contactez votre mairie ou les services de protection de l'environnement.",
  },
  {
    q: "Pourquoi prendre une photo ?",
    a: "Une photo nette du thorax et de l'abdomen permet à notre IA BEEALERT de discriminer avec précision entre le frelon asiatique et les espèces similaires. C'est la donnée clé du signalement.",
  },
  {
    q: "Que devient mon signalement ?",
    a: "Il est géolocalisé, analysé par IA, puis partagé sur la carte communautaire (avec des coordonnées approximées pour protéger votre vie privée). Les données peuvent être transmises aux autorités compétentes ou aux apiculteurs de votre zone.",
  },
  {
    q: "Pourquoi ma localisation est-elle utilisée ?",
    a: "Pour situer l'observation sur la carte et permettre aux intervenants de localiser le nid ou l'insecte. Vos coordonnées exactes ne sont jamais affichées publiquement. Seule une position approximée (±1 km) est visible sur la carte communautaire.",
  },
  {
    q: "Comment fonctionne la détection IA ?",
    a: "ApiSave utilise le moteur BEEALERT CORE V13.5+ couplé à Gemini 2.0 Flash (Google). Il analyse la morphologie de l'insecte (forme du thorax, coloration de l'abdomen, taille) et retourne un verdict avec un indice de confiance.",
  },
  {
    q: "Que faire si le résultat semble incorrect ?",
    a: "L'analyse IA est indicative. Si vous doutez du résultat, prenez une seconde photo sous un meilleur angle (vue dorsale, lumière naturelle, net). Vous pouvez aussi contacter un apiculteur local pour confirmation.",
  },
  {
    q: "À qui sont transmises les données ?",
    a: "Vos données (photos, localisation approximée) peuvent être partagées avec les autorités environnementales, les apiculteurs agréés et les chercheurs dans le cadre de la lutte contre les espèces invasives. Elles ne sont jamais revendues ni utilisées à des fins commerciales.",
  },
  {
    q: "Quand faut-il contacter un professionnel ?",
    a: "Dès que vous identifiez un nid, même probable. Ne tardez pas : les nids de frelons asiatiques peuvent atteindre 60 cm de diamètre et héberger jusqu'à 6 000 individus en automne. Contactez votre mairie, les pompiers (18) ou un désinsectiseur agréé.",
  },
];

// ── ABOUT ────────────────────────────────────────────────────────
const ABOUT_SECTIONS = [
  {
    icon: 'target',
    title: 'Notre mission',
    body: "ApiSave est une application citoyenne de surveillance environnementale dédiée au frelon asiatique (Vespa velutina). Notre objectif : mobiliser le plus grand nombre pour cartographier en temps réel la progression de cette espèce invasive et aider les acteurs de terrain à intervenir rapidement.",
  },
  {
    icon: 'cpu',
    title: 'La détection IA',
    body: "Chaque signalement est analysé par BEEALERT CORE V13.5+, notre moteur de détection développé spécifiquement pour discriminer Vespa velutina des espèces similaires. L'analyse repose sur la morphologie réelle de l'insecte (thorax, abdomen, taille) et retourne un verdict avec indice de confiance.",
  },
  {
    icon: 'users',
    title: "Le rôle de l'utilisateur",
    body: "Chaque photo soumise améliore la carte communautaire. Vous êtes un observateur de terrain. Votre signalement peut déclencher une intervention professionnelle, protéger un rucher voisin, ou alerter les autorités locales. Un geste simple, un impact réel.",
  },
  {
    icon: 'database',
    title: 'La donnée au service du vivant',
    body: "Les données collectées (observations, localisations approximées, résultats IA) sont partagées avec les acteurs de la biodiversité : apiculteurs, chercheurs, collectivités. Elles contribuent à mieux comprendre la dynamique d'invasion et à protéger les pollinisateurs.",
  },
  {
    icon: 'shield',
    title: 'Respect de la vie privée',
    body: "ApiSave ne collecte jamais d'informations personnelles identifiables. Vos coordonnées GPS exactes ne sont jamais publiques. Nous respectons le RGPD et les droits de nos utilisateurs. Voir la Politique de confidentialité pour les détails.",
  },
];

// ── NEWS ─────────────────────────────────────────────────────────
const NEWS_ITEMS = [
  {
    date: 'Mai 2026',
    tag: 'MISE À JOUR',
    title: 'Moteur BEEALERT V13.5+ déployé',
    body: "La nouvelle version du moteur de détection améliore la précision sur les cas difficiles (contre-jour, vue partielle, insecte petit dans le cadre). Le taux de détection ROUGE passe à 92 % de confiance.",
    color: COLORS.vert,
  },
  {
    date: 'Avril 2026',
    tag: 'TERRAIN',
    title: "Pic d'activité signalé dans le Sud-Ouest",
    body: "Une augmentation significative des signalements a été observée en Gironde, Dordogne et Lot-et-Garonne. Les premiers nids primaires de la saison 2026 ont été localisés dès début avril. Restez vigilants.",
    color: COLORS.orange,
  },
  {
    date: 'Mars 2026',
    tag: 'PARTENARIAT',
    title: 'Collaboration avec les UNAF',
    body: "ApiSave renforce son partenariat avec des fédérations apicoles locales pour transmettre les signalements géolocalisés aux apiculteurs de terrain. Les données validées ROUGE sont désormais transmises automatiquement.",
    color: COLORS.primary,
  },
];

const LEGAL_DOCS = [
  { title: "Conditions d'utilisation", text: CGU_TEXT },
  { title: 'Politique de confidentialité', text: PRIVACY_TEXT },
  { title: "Droits d'image et licences", text: IMAGE_RIGHTS_TEXT },
];

// ── SUB-SCREENS ───────────────────────────────────────────────────
function FAQScreen({ onBack }) {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <View style={s.subContainer}>
      <SubHeader title="FAQ — Frelon asiatique" onBack={onBack} />
      <ScrollView contentContainerStyle={s.subContent} showsVerticalScrollIndicator={false}>
        <Text style={s.subIntro}>
          Tout ce que vous devez savoir sur le frelon asiatique et l'application ApiSave.
        </Text>
        {FAQ_ITEMS.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[s.faqCard, openIdx === idx && s.faqCardOpen]}
            onPress={() => setOpenIdx(openIdx === idx ? null : idx)}
            activeOpacity={0.8}
          >
            <View style={s.faqRow}>
              <Text style={[s.faqQ, openIdx === idx && { color: COLORS.primary }]}>{item.q}</Text>
              <Feather
                name={openIdx === idx ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={openIdx === idx ? COLORS.primary : COLORS.textDisabled}
              />
            </View>
            {openIdx === idx && (
              <Text style={s.faqA}>{item.a}</Text>
            )}
          </TouchableOpacity>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function AboutScreen({ onBack }) {
  return (
    <View style={s.subContainer}>
      <SubHeader title="À propos d'ApiSave" onBack={onBack} />
      <ScrollView contentContainerStyle={s.subContent} showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={s.aboutHero}>
          <Image
            source={require('../../assets/velutina_small.jpg')}
            style={s.aboutHeroImg}
            resizeMode="cover"
          />
          <View style={s.aboutHeroOverlay}>
            <Text style={s.aboutHeroTitle}>ApiSave</Text>
            <Text style={s.aboutHeroSub}>Surveillance citoyenne · Frelon asiatique</Text>
          </View>
        </View>

        <View style={s.versionRow}>
          <View style={s.versionPill}>
            <Text style={s.versionPillText}>v1.0 · BEEALERT CORE V13.5+</Text>
          </View>
        </View>

        {ABOUT_SECTIONS.map(sec => (
          <View key={sec.title} style={s.aboutCard}>
            <View style={s.aboutCardIcon}>
              <Feather name={sec.icon} size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.aboutCardTitle}>{sec.title}</Text>
              <Text style={s.aboutCardBody}>{sec.body}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={s.contactCard}
          onPress={() => Linking.openURL('mailto:contact@apisave.fr')}
          activeOpacity={0.8}
        >
          <Feather name="mail" size={16} color={COLORS.primary} />
          <Text style={s.contactText}>contact@apisave.fr</Text>
          <Feather name="external-link" size={14} color={COLORS.textDisabled} />
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function NewsScreen({ onBack }) {
  return (
    <View style={s.subContainer}>
      <SubHeader title="Actualités ApiSave" onBack={onBack} />
      <ScrollView contentContainerStyle={s.subContent} showsVerticalScrollIndicator={false}>
        {NEWS_ITEMS.map((item, idx) => (
          <View key={idx} style={[s.newsCard, { borderLeftColor: item.color }]}>
            <View style={s.newsHeader}>
              <View style={[s.newsTagPill, { backgroundColor: item.color + '20', borderColor: item.color + '40' }]}>
                <Text style={[s.newsTag, { color: item.color }]}>{item.tag}</Text>
              </View>
              <Text style={s.newsDate}>{item.date}</Text>
            </View>
            <Text style={s.newsTitle}>{item.title}</Text>
            <Text style={s.newsBody}>{item.body}</Text>
          </View>
        ))}
        <View style={s.newsFooter}>
          <Feather name="bell" size={14} color={COLORS.textDisabled} />
          <Text style={s.newsFooterText}>
            Activez les notifications pour ne rien manquer des alertes dans votre zone.
          </Text>
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function LegalListScreen({ onBack, onOpenDoc }) {
  return (
    <View style={s.subContainer}>
      <SubHeader title="Informations légales" onBack={onBack} />
      <ScrollView contentContainerStyle={[s.subContent, { gap: 10 }]} showsVerticalScrollIndicator={false}>
        {LEGAL_DOCS.map(doc => (
          <TouchableOpacity
            key={doc.title}
            style={s.legalRow}
            onPress={() => onOpenDoc(doc)}
            activeOpacity={0.7}
          >
            <View style={s.legalRowIcon}>
              <Feather name="file-text" size={16} color={COLORS.primary} />
            </View>
            <Text style={s.legalRowTitle}>{doc.title}</Text>
            <Feather name="chevron-right" size={16} color={COLORS.textDisabled} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function SubHeader({ title, onBack }) {
  return (
    <View style={s.subHeader}>
      <TouchableOpacity onPress={onBack} style={s.subBackBtn} activeOpacity={0.7}>
        <Feather name="chevron-left" size={22} color={COLORS.textPrimary} />
      </TouchableOpacity>
      <Text style={s.subHeaderTitle} numberOfLines={1}>{title}</Text>
      <View style={{ width: 36 }} />
    </View>
  );
}

// ── MAIN SCREEN ──────────────────────────────────────────────────
const MENU_ITEMS = [
  {
    group: 'Ressources',
    items: [
      { key: 'faq',   icon: 'help-circle', label: 'FAQ',           subtitle: 'Questions fréquentes sur le frelon asiatique', screen: 'faq' },
      { key: 'news',  icon: 'rss',         label: 'Actualités',    subtitle: 'Dernières nouvelles ApiSave',                  screen: 'news' },
    ],
  },
  {
    group: 'À propos',
    items: [
      { key: 'about', icon: 'info',       label: 'À propos',       subtitle: 'Mission, IA, données citoyennes',              screen: 'about' },
      { key: 'legal', icon: 'book-open',  label: 'Mentions légales', subtitle: 'CGU, confidentialité, droits d\'image',    screen: 'legal' },
    ],
  },
  {
    group: 'Contact',
    items: [
      { key: 'web',   icon: 'globe',  label: 'apisave.fr',  subtitle: 'Site officiel', action: () => Linking.openURL('https://apisave.fr') },
      { key: 'mail',  icon: 'mail',   label: 'Nous contacter', subtitle: 'contact@apisave.fr', action: () => Linking.openURL('mailto:contact@apisave.fr') },
    ],
  },
];

export default function InfoScreen() {
  const [screen, setScreen] = useState(null);
  const [legalDoc, setLegalDoc] = useState(null);

  if (legalDoc) {
    return <LegalDocScreen title={legalDoc.title} text={legalDoc.text} onBack={() => setLegalDoc(null)} />;
  }
  if (screen === 'faq')   return <FAQScreen onBack={() => setScreen(null)} />;
  if (screen === 'about') return <AboutScreen onBack={() => setScreen(null)} />;
  if (screen === 'news')  return <NewsScreen onBack={() => setScreen(null)} />;
  if (screen === 'legal') return (
    <LegalListScreen
      onBack={() => setScreen(null)}
      onOpenDoc={(doc) => setLegalDoc(doc)}
    />
  );

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.pageTitle}>Informations</Text>

      {/* ── Comparaison espèces ─────────────────────────────────── */}
      <Text style={s.speciesSectionTitle}>Espèces à identifier</Text>
      <View style={s.speciesRow}>
        {/* Frelon asiatique */}
        <View style={[s.speciesCard, { borderColor: COLORS.rouge + '55' }]}>
          <Image
            source={require('../../assets/velutina_small.jpg')}
            style={s.speciesImg}
            resizeMode="cover"
          />
          <View style={s.speciesBody}>
            <View style={[s.speciesBadge, { backgroundColor: COLORS.rouge + '20', borderColor: COLORS.rouge + '50' }]}>
              <Text style={[s.speciesBadgeText, { color: COLORS.rouge }]}>⚠ INVASIVE</Text>
            </View>
            <Text style={s.speciesName}>Frelon asiatique</Text>
            <Text style={s.speciesLatin}>Vespa velutina</Text>
            <Text style={s.speciesFeat}>• Thorax brun-noir velouté</Text>
            <Text style={s.speciesFeat}>• Abdomen brun + 1 bande orange</Text>
            <Text style={s.speciesFeat}>• Pattes jaunes distinctives</Text>
            <Text style={s.speciesFeat}>• 25–35 mm</Text>
          </View>
        </View>

        {/* Frelon européen */}
        <View style={[s.speciesCard, { borderColor: COLORS.vert + '55' }]}>
          <Image
            source={require('../../assets/crabro_small.jpg')}
            style={s.speciesImg}
            resizeMode="cover"
          />
          <View style={s.speciesBody}>
            <View style={[s.speciesBadge, { backgroundColor: COLORS.vert + '20', borderColor: COLORS.vert + '50' }]}>
              <Text style={[s.speciesBadgeText, { color: COLORS.vert }]}>EUROPÉEN</Text>
            </View>
            <Text style={s.speciesName}>Frelon européen</Text>
            <Text style={s.speciesLatin}>Vespa crabro</Text>
            <Text style={s.speciesFeat}>• Thorax roux-jaune</Text>
            <Text style={s.speciesFeat}>• Plus coloré, bandes jaunes</Text>
            <Text style={s.speciesFeat}>• Tête plus large et aplatie</Text>
            <Text style={s.speciesFeat}>• 30–40 mm</Text>
          </View>
        </View>
      </View>

      {MENU_ITEMS.map(group => (
        <View key={group.group} style={s.group}>
          <Text style={s.groupTitle}>{group.group}</Text>
          <View style={s.groupCard}>
            {group.items.map((item, idx) => (
              <TouchableOpacity
                key={item.key}
                style={[s.menuRow, idx < group.items.length - 1 && s.menuRowBorder]}
                onPress={item.action ? item.action : () => setScreen(item.screen)}
                activeOpacity={0.7}
              >
                <View style={s.menuIcon}>
                  <Feather name={item.icon} size={17} color={COLORS.primary} />
                </View>
                <View style={s.menuContent}>
                  <Text style={s.menuLabel}>{item.label}</Text>
                  {item.subtitle && <Text style={s.menuSub}>{item.subtitle}</Text>}
                </View>
                <Feather name={item.action ? 'external-link' : 'chevron-right'} size={15} color={COLORS.textDisabled} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Quick FAQ preview */}
      <View style={s.quickFaq}>
        <View style={s.quickFaqHeader}>
          <Feather name="zap" size={14} color={COLORS.primary} />
          <Text style={s.quickFaqTitle}>Le saviez-vous ?</Text>
        </View>
        <Text style={s.quickFaqText}>
          Un nid de frelon asiatique peut contenir jusqu'à 6 000 individus en automne. Une seule reine peut donner naissance à plusieurs nids secondaires dans la même saison.
        </Text>
        <TouchableOpacity onPress={() => setScreen('faq')} activeOpacity={0.75}>
          <Text style={s.quickFaqLink}>Lire la FAQ complète →</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.version}>ApiSave v1.0 · BEEALERT CORE V13.5+ · © 2026</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 48 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 16 },

  // Species comparison
  speciesSectionTitle: {
    fontSize: 11, fontWeight: '700', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 1,
    marginBottom: 10, marginLeft: 2,
  },
  speciesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  speciesCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  speciesImg: {
    width: '100%',
    height: 110,
  },
  speciesBody: {
    padding: 10,
  },
  speciesBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    marginBottom: 6,
  },
  speciesBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  speciesName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 1,
    lineHeight: 16,
  },
  speciesLatin: {
    fontSize: 10,
    fontStyle: 'italic',
    color: COLORS.textMuted,
    marginBottom: 7,
  },
  speciesFeat: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 2,
    lineHeight: 14,
  },

  group: { marginBottom: 22 },
  groupTitle: {
    fontSize: 11, fontWeight: '700', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 1,
    marginBottom: 8, marginLeft: 4,
  },
  groupCard: {
    backgroundColor: COLORS.surface, borderRadius: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.primary + '16',
    alignItems: 'center', justifyContent: 'center',
  },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 1 },
  menuSub: { fontSize: 12, color: COLORS.textMuted },

  quickFaq: {
    backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: COLORS.border,
    borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  quickFaqHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  quickFaqTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  quickFaqText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 10 },
  quickFaqLink: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },

  version: { textAlign: 'center', color: COLORS.textDisabled, fontSize: 11, marginTop: 4 },

  // Sub-screens
  subContainer: { flex: 1, backgroundColor: COLORS.background },
  subHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  subBackBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  subHeaderTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'center' },
  subContent: { padding: 16 },
  subIntro: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 21, marginBottom: 16 },

  // FAQ
  faqCard: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  faqCardOpen: { borderColor: COLORS.primary + '55', backgroundColor: COLORS.primary + '06' },
  faqRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  faqQ: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, lineHeight: 20 },
  faqA: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },

  // About
  aboutHero: { borderRadius: 18, overflow: 'hidden', marginBottom: 16, position: 'relative', height: 160 },
  aboutHeroImg: { width: '100%', height: '100%' },
  aboutHeroOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 16,
  },
  aboutHeroTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  aboutHeroSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  versionRow: { alignItems: 'flex-start', marginBottom: 16 },
  versionPill: {
    backgroundColor: COLORS.primary + '20', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: COLORS.primary + '40',
  },
  versionPillText: { fontSize: 11, fontWeight: '700', color: COLORS.primaryDark },
  aboutCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  aboutCardIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.primary + '16',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  aboutCardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  aboutCardBody: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  contactCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, marginTop: 6,
    borderWidth: 1, borderColor: COLORS.border,
  },
  contactText: { flex: 1, fontSize: 14, color: COLORS.primary, fontWeight: '500' },

  // News
  newsCard: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border,
    borderLeftWidth: 4,
  },
  newsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  newsTagPill: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  newsTag: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  newsDate: { fontSize: 12, color: COLORS.textMuted },
  newsTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  newsBody: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  newsFooter: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: COLORS.background, borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  newsFooterText: { flex: 1, fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },

  // Legal
  legalRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  legalRowIcon: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: COLORS.primary + '16',
    alignItems: 'center', justifyContent: 'center',
  },
  legalRowTitle: { flex: 1, fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
});
