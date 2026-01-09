import QRCode from "qrcode";

export async function generateQr(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    });
  } catch (err) {
    console.error("QR generation error:", err);
    throw new Error("Failed to generate QR code");
  }
}
