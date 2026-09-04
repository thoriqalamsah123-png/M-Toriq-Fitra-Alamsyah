import { KtpOcrResult } from '../types';

export async function extractKtpWithGemini(
  imageBase64: string,
  mimeType = 'image/jpeg'
): Promise<KtpOcrResult> {
  try {
    const response = await fetch('/api/extract-ktp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
        mimeType,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `Gagal OCR KTP: HTTP ${response.status}`);
    }

    const json = await response.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Ekstraksi KTP tidak menghasilkan data valid');
    }

    const d = json.data;
    return {
      success: true,
      nik: d.nik || '',
      nama: d.nama || '',
      tempatTglLahir: d.tempatTglLahir || '',
      jenisKelamin: d.jenisKelamin || 'LAKI-LAKI',
      alamat: d.alamat || '',
      rtRw: d.rtRw || '',
      kelDesa: d.kelDesa || '',
      kecamatan: d.kecamatan || '',
      agama: d.agama || 'ISLAM',
      statusPerkawinan: d.statusPerkawinan || 'BELUM KAWIN',
      pekerjaan: d.pekerjaan || '',
      kewarganegaraan: d.kewarganegaraan || 'WNI',
      berlakuHingga: d.berlakuHingga || 'SEUMUR HIDUP',
      confidenceScore: d.confidenceScore || 95,
      retryCount: json.retryCount ?? 0,
    };
  } catch (error: any) {
    console.error('Error in extractKtpWithGemini:', error);
    throw error;
  }
}
