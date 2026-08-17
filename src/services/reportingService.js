import { supabase } from './supabaseClient';
import { getDeviceId } from '../utils/deviceId';

function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function uploadReport(entry, base64) {
  if (!supabase) return null;
  try {
    const deviceId = await getDeviceId();

    const lat_exact = entry.locationExact?.latitude ?? entry.location?.latitude;
    const lon_exact = entry.locationExact?.longitude ?? entry.location?.longitude;
    const lat_blurred = entry.location?.latitude;
    const lon_blurred = entry.location?.longitude;

    if (!lat_exact || !lon_exact) return null;

    // Upload image to Storage
    let imageUrl = null;
    if (base64) {
      const fileName = `${deviceId}/${entry.id}.jpg`;
      const bytes = base64ToUint8Array(base64);
      const { data: storageData, error: storageError } = await supabase.storage
        .from('report-images')
        .upload(fileName, bytes, { contentType: 'image/jpeg', upsert: false });

      if (!storageError && storageData) {
        const { data: urlData } = supabase.storage
          .from('report-images')
          .getPublicUrl(storageData.path);
        imageUrl = urlData.publicUrl;
      }
    }

    // Insert report row
    const { data, error } = await supabase
      .from('reports')
      .insert({
        device_id: deviceId,
        lat_exact,
        lon_exact,
        lat_blurred,
        lon_blurred,
        address: entry.city || null,
        verdict_code: entry.verdict_code,
        verdict: entry.verdict_code?.toLowerCase().replace('_', '') || '',
        confiance: entry.confiance || 0,
        motif_principal: entry.motif_principal || '',
        protocole_version: 'V1.8',
        image_url: imageUrl,
      })
      .select('id')
      .single();

    if (error) return null;
    return data.id;
  } catch {
    return null;
  }
}

export async function fetchCommunityReports(limit = 500) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('reports_public')
    .select('id, created_at, lat_blurred, lon_blurred, address, verdict_code, confiance, motif_principal, image_url')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return null;
  return data;
}
