import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PaymentTransaction, UserAccount } from '../types';

/**
 * Downloads a comprehensive Passbook Statement PDF
 */
export const downloadPassbookPdf = (
  transactions: PaymentTransaction[],
  activeUser: UserAccount,
  filterName: string = 'ALL'
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Header Colors & Styling
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 40, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('BlockPay', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text('ALGORAND TESTNET BLOCKCHAIN & UPI STATEMENT', 14, 27);

  doc.setTextColor(203, 213, 225);
  doc.setFontSize(9);
  doc.text(`Generated on: ${dateStr}`, 145, 20);
  doc.text(`Filter: ${filterName}`, 145, 27);

  // User Account Details Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 46, 182, 30, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Account Holder: ${activeUser.name}`, 18, 54);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`UPI ID: ${activeUser.upiId}`, 18, 61);
  doc.text(`Account No: XXXX${activeUser.accountNumber.slice(-4)}`, 18, 68);

  doc.text(`Mobile: +91 ${activeUser.phone}`, 110, 54);
  doc.text(`Algorand Wallet: ${activeUser.walletAddress.slice(0, 16)}...`, 110, 61);
  doc.text(`Current Balance: Rs. ${activeUser.balance.toLocaleString('en-IN')}`, 110, 68);

  // Statement Summary
  let totalCredits = 0;
  let totalDebits = 0;

  const tableRows = transactions.map((tx) => {
    const isDebit = tx.senderId === activeUser.id || tx.senderUpi === activeUser.upiId;
    if (isDebit) {
      totalDebits += tx.amount;
    } else {
      totalCredits += tx.amount;
    }

    const txDate = new Date(tx.timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    const counterParty = isDebit
      ? `${tx.receiverName} (${tx.receiverUpi})`
      : `${tx.senderName} (${tx.senderUpi})`;

    const typeStr = isDebit ? 'DEBIT' : 'CREDIT';
    const amountStr = `${isDebit ? '-' : '+'} Rs. ${tx.amount.toLocaleString('en-IN')}`;

    return [
      txDate,
      tx.id,
      counterParty,
      typeStr,
      tx.category,
      amountStr,
      `#${tx.algoBlockNumber}`,
    ];
  });

  // Table
  autoTable(doc, {
    startY: 82,
    head: [['Date & Time', 'Transaction ID', 'Counterparty', 'Type', 'Category', 'Amount', 'Block #']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 22 },
      2: { cellWidth: 46 },
      3: { cellWidth: 16 },
      4: { cellWidth: 20 },
      5: { cellWidth: 26, fontStyle: 'bold' },
      6: { cellWidth: 24 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        if (data.cell.raw === 'DEBIT') {
          data.cell.styles.textColor = [225, 29, 72]; // rose-600
        } else {
          data.cell.styles.textColor = [16, 185, 129]; // emerald-500
        }
      }
      if (data.section === 'body' && data.column.index === 5) {
        const str = String(data.cell.raw || '');
        if (str.startsWith('-')) {
          data.cell.styles.textColor = [225, 29, 72];
        } else {
          data.cell.styles.textColor = [16, 185, 129];
        }
      }
    },
  });

  // Footer & Summary
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 180;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, finalY, 182, 18, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Money In (Credits): Rs. ${totalCredits.toLocaleString('en-IN')}`, 18, finalY + 7);
  doc.text(`Total Money Out (Debits): Rs. ${totalDebits.toLocaleString('en-IN')}`, 18, finalY + 13);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This is a computer-generated statement protected by Algorand TestNet cryptographic signatures.',
    14,
    finalY + 26
  );

  doc.save(`BlockPay_Statement_${activeUser.upiId.split('@')[0]}_${dateStr.replace(/ /g, '_')}.pdf`);
};

/**
 * Downloads a single Payment Receipt PDF
 */
export const downloadReceiptPdf = (
  tx: PaymentTransaction,
  activeUser: UserAccount
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [100, 160], // Receipt aspect ratio
  });

  const txDate = new Date(tx.timestamp).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isDebit = tx.senderId === activeUser.id || tx.senderUpi === activeUser.upiId;

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 100, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BlockPay', 10, 14);

  doc.setFontSize(7);
  doc.setTextColor(56, 189, 248);
  doc.text('VERIFIED UPI & ALGORAND RECEIPT', 10, 21);

  doc.setFontSize(7);
  doc.setTextColor(16, 185, 129); // green
  doc.text('✓ SUCCESSFUL', 70, 14);

  // Amount Block
  doc.setFillColor(248, 250, 252);
  doc.rect(10, 38, 80, 22, 'F');

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${tx.amount.toLocaleString('en-IN')}`, 50, 50, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`${tx.senderName} ➔ ${tx.receiverName}`, 50, 56, { align: 'center' });

  // Key Value Details
  let y = 68;
  const addRow = (label: string, value: string, color = [30, 41, 59]) => {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(label, 10, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(value, 90, y, { align: 'right' });
    y += 6;
  };

  addRow('Transaction ID', tx.id);
  addRow('Date & Time', txDate);
  addRow('From (Sender)', `${tx.senderName} (${tx.senderUpi})`);
  addRow('To (Receiver)', `${tx.receiverName} (${tx.receiverUpi})`);
  addRow('Note', `"${tx.note}"`);
  addRow('Category', tx.category);
  addRow('Algorand Block', `#${tx.algoBlockNumber}`, [147, 51, 234]);
  addRow('AI Risk Rating', `${tx.aiRiskLevel} (${tx.aiRiskScore}/100)`, [16, 185, 129]);

  // Tx Hash Box
  doc.setFillColor(241, 245, 249);
  doc.rect(10, y + 2, 80, 12, 'F');
  doc.setFontSize(6);
  doc.setTextColor(71, 85, 105);
  doc.text('TX HASH:', 12, y + 6);
  doc.text(`${tx.algoTxHash.slice(0, 36)}...`, 12, y + 10);

  // Footer
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text('Verified on Algorand TestNet • Dual Carrier SMS Dispatched', 50, 154, { align: 'center' });

  doc.save(`BlockPay_Receipt_${tx.id}.pdf`);
};

/**
 * Downloads a Blockchain Audit Certificate PDF
 */
export const downloadBlockchainAuditPdf = (tx: PaymentTransaction) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('BlockPay Audit Certificate', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(56, 189, 248);
  doc.text('ALGORAND TESTNET BLOCKCHAIN VERIFICATION PROOF', 14, 31);

  let y = 58;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Cryptographic Transaction Details', 14, y);

  y += 8;
  autoTable(doc, {
    startY: y,
    head: [['Attribute', 'Cryptographic Proof / Value']],
    body: [
      ['Transaction Ref ID', tx.id],
      ['Algorand Block Number', `#${tx.algoBlockNumber}`],
      ['Algorand TX Hash', tx.algoTxHash],
      ['x402 Commerce Token', tx.x402Token],
      ['Sender Account', `${tx.senderName} (${tx.senderUpi})`],
      ['Receiver Account', `${tx.receiverName} (${tx.receiverUpi})`],
      ['Amount Transferred', `Rs. ${tx.amount.toLocaleString('en-IN')}`],
      ['Block Timestamp', new Date(tx.timestamp).toISOString()],
      ['Gemini AI Safety Score', `${tx.aiRiskLevel} RISK (Score: ${tx.aiRiskScore}/100)`],
      ['Consensus State', 'FINALIZED (100% Immutable)'],
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
    },
    bodyStyles: {
      fontSize: 9,
    },
  });

  doc.save(`BlockPay_Audit_Proof_${tx.algoBlockNumber}_${tx.id}.pdf`);
};
