import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform } from 'react-native';

const successful = "https://res.cloudinary.com/frankzeal/image/upload/v1745758163/Navo/successful_ha0oeb.png"
const pending = "https://res.cloudinary.com/frankzeal/image/upload/v1745758178/Navo/pending1_nptmnn.png"
const failed = "https://res.cloudinary.com/frankzeal/image/upload/v1745758151/Navo/failed_klyjpn.png"

const generateHTML = (receipt: any) => {
  const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Transaction Receipt</title>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          background-color: white;
          padding: 20px;
          color: #1e3a8a;
        }

        .container {
          max-width: 600px;
          margin: auto;
        }

        .header {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          text-align: center;
        }

        .status-icon {
          width: 48px;
          height: 48px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px auto;
          font-size: 28px;
        }

        .status-successful {
          background-color: #dcfce7;
          border: 2px solid #22c55e;
          color: #22c55e;
        }

        .status-failed {
          background-color: #fee2e2;
          border: 2px solid #ef4444;
          color: #ef4444;
        }

        .status-pending {
          background-color: #fef3c7;
          border: 2px solid #ca8a04;
          color: #ca8a04;
        }

        .amount {
          font-size: 28px;
          font-weight: bold;
          margin: 10px 0;
        }

        .row {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #e5e7eb;
          padding: 8px 0;
          align-items: flex-start;
        }

        .row-title {
          font-weight: 500;
          font-size: 14px;
        }

        .row-value {
          font-weight: 600;
          font-size: 16px;
          max-width: 60%;
          text-align: right;
        }

        .text-green { color: #22c55e; }
        .text-red { color: #ef4444; }
        .text-yellow { color: #ca8a04; }
        .text-blue { color: #1e3a8a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">Transaction Receipt</div>

        <!-- Status Icon -->
        <div style="text-align: center; margin-bottom: 15px">
            <img src=${receipt?.status === "successful" ? successful : receipt?.status === "failed" ? failed : pending}>
        </div>

        <div style="text-align: center;">
          <div style="font-size: 20px; font-weight: bold;">${receipt?.status === "successful" ? "Payment Successful" : receipt?.status === "failed" ? "Payment Failed" : receipt?.status === "reversed" ? "Payment Reversed" : "Payment Pending"}!</div>
          <div style="margin-top: 12px; font-size: 12px;">Amount</div>
          <div class="amount">${receipt?.amount}</div>
          <div style="font-size: 12px; margin-top: 4px;">
            Reference Code: <strong>${receipt?.referenceCode}</strong>
          </div>
        </div>

        <!-- Transaction Details -->
        <div style="margin-top: 24px;">
          <div class="row">
            <div class="row-title">Recipient</div>
            <div class="row-value text-blue">${receipt?.recipient}</div>
          </div>
          <div class="row">
            <div class="row-title">Transaction Type</div>
            <div class="row-value">${receipt?.transactionType}</div>
          </div>
          <div class="row">
            <div class="row-title">Payment Type</div>
            <div class="row-value">${receipt?.paymentType}</div>
          </div>
          ${receipt?.rechargeToken ? `
            <div class="row">
              <div class="row-title">Recharge Token</div>
              <div class="row-value">${receipt?.rechargeToken}</div>
            </div>
          ` : ""}
           ${receipt?.dataPlan ? `
            <div class="row">
              <div class="row-title">Data Plan</div>
              <div class="row-value">${receipt?.dataPlan}</div>
            </div>
          ` : ""}
          <div class="row">
            <div class="row-title">Channel</div>
            <div class="row-value text-blue">${receipt?.channel}</div>
          </div>
          <div class="row">
            <div class="row-title">Status</div>
            <div class="row-value text-green">${receipt?.status}</div>
          </div>
          <div class="row">
            <div class="row-title">Time stamp</div>
            <div class="row-value text-blue">${receipt?.timestamp}</div>
          </div>
          <div class="row">
            <div class="row-title">Category</div>
            <div class="row-value text-blue">${receipt?.category}</div>
          </div>
          <div class="row">
            <div class="row-title">Remark</div>
            <div class="row-value text-blue">${receipt?.remark}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
    `
return html

}

let lastGeneratedPdfUri: string | null = null;

const generatePdfFile = async (receipt: any): Promise<string> => {
  const { uri } = await Print.printToFileAsync({ html: generateHTML(receipt) });
  lastGeneratedPdfUri = uri;
  return uri;
};

export const generateReceiptPDF = async (receipt: any) => {
  const uri = await generatePdfFile(receipt);
  await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
};

export const downloadReceiptPDF = async (receipt: any) => {
  try {
    const uri = lastGeneratedPdfUri || await generatePdfFile(receipt);
    console.log('File created at:', uri);

   if (Platform.OS === 'android') {
      if (Platform.Version >= 29) {
        // Android 10+ — Use SAF to pick Downloads folder
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        
        if (!permissions.granted) {
          return 'Permission denied to access folder';
        }

        // Create a new file in that folder
        const fileName = `receipt_${Date.now()}.pdf`;
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });

        const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          'application/pdf'
        );

        await FileSystem.writeAsStringAsync(newUri, base64, { encoding: FileSystem.EncodingType.Base64 });

        return {
          title: 'File successfully saved to:',
          message: newUri
        };

      } else {
        // Android 9 and below — old method
        const { granted } = await MediaLibrary.requestPermissionsAsync();
        if (!granted) {
          return 'Permission to access media library denied';
        }

        const fileName = `receipt_${Date.now()}.pdf`;
        const downloadPath = FileSystem.documentDirectory + fileName;

        await FileSystem.copyAsync({ from: uri, to: downloadPath });
        const asset = await MediaLibrary.createAssetAsync(downloadPath);

        let album = await MediaLibrary.getAlbumAsync('Download');
        if (!album) {
          await MediaLibrary.createAlbumAsync('Download', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }

        return 'PDF saved to your default Downloads folder';
      }
    } else {
      // On iOS or other platforms, share as fallback
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      return 'Shared successfully';
    }
  } catch (error) {
    console.error('Failed to download receipt:', error);
    throw error;
  }
};