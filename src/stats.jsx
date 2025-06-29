import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Helmet } from 'react-helmet';
import { BarChart3, Users, Target, Award, ChevronRight, Menu, X, Mail, Phone, MapPin, TrendingUp, Database, FileText, CheckCircle, NotebookPen, ArrowLeft, Star, Shield, Clock, Zap, Calendar, DollarSign, Package, Filter, Download } from 'lucide-react';
import emailjs from 'emailjs-com';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQi0DvVHmhGJ4Xo_2PX30u5YcGLsZIWFRHyOwE-uAkD-lc6qXk44l0OjCXEgPd-WL3y7st1AFCTGteC/pub?output=csv'

// Ring Chart Component
const RingChart = ({ data, size = 200, strokeWidth = 20 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate total for percentages
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  
  // Generate colors for each segment
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ];

  let currentOffset = 0;
  const segments = Object.entries(data).map(([provider, count], index) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    const strokeDasharray = (percentage / 100) * circumference;
    const strokeDashoffset = circumference - strokeDasharray;
    
    const segment = {
      provider,
      count,
      percentage,   
      strokeDasharray,
      strokeDashoffset: currentOffset,
      color: colors[index % colors.length]
    };
    
    currentOffset += strokeDasharray;
    return segment;
  });

  return (
    <div className="ring-chart-container">
      <svg width={size} height={size} className="ring-chart">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        
        {/* Data segments */}
        {segments.map((segment, index) => (
          <circle
            key={index}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={segment.strokeDasharray}
            strokeDashoffset={segment.strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="ring-segment"
          />
        ))}
        
        {/* Center text */}
        <text
          x={size / 2}
          y={size / 2 - 10}
          textAnchor="middle"
          className="ring-center-text"
          fontSize="24"
          fontWeight="600"
          fill="#1e293b"
        >
          {total}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 15}
          textAnchor="middle"
          className="ring-center-subtext"
          fontSize="12"
          fill="#64748b"
        >
          Payments
        </text>
      </svg>
      
      {/* Legend */}
      <div className="ring-legend">
        {segments.map((segment, index) => (
          <div key={index} className="legend-item">
            <div 
              className="legend-color" 
              style={{ backgroundColor: segment.color }}
            ></div>
            <div className="legend-text">
              <div className="legend-provider">{segment.provider}</div>
              <div className="legend-count">{segment.count} ({segment.percentage.toFixed(1)}%)</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Stats = () => {
  const [selectedMonth, setSelectedMonth] = useState('2025-06'); // Set to June 2025 to match the data
  const [paymentData, setPaymentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalRevenue: 0,
    averageAmount: 0,
    topPackage: '',
    monthlyData: [],
    packageDistribution: {},
    paymentMethods: {},
    growthRate: 0,
    conversionRate: 0
  });
  const [invoiceStatus, setInvoiceStatus] = useState({});
  const [pdfInvoice, setPdfInvoice] = useState({ show: false, payment: null });
  const [pdfUploadStatus, setPdfUploadStatus] = useState({}); // { [index]: { status, link, error } }

  // Fetch payment data from published Google Sheet CSV
  const fetchPaymentData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(SHEET_CSV_URL);
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          console.log('Raw parsed results:', results);
          console.log('Column names:', results.meta.fields);
          console.log('First few rows:', results.data.slice(0, 3));
          
          const data = results.data.filter(row => {
            // Check for different possible timestamp column names
            return row.timestamp || row.Timestamp || row.date || row.Date || row.time || row.Time;
          }).filter(row => {
            // Filter out completely empty rows
            return Object.values(row).some(value => value && value.toString().trim() !== '');
          });
          
          console.log('Filtered data:', data);
          console.log('Data length:', data.length);
          
          setPaymentData(data);
          calculateStats(data);
        },
        error: (error) => {
          console.error('Papa Parse error:', error);
          setError('Failed to parse CSV data');
          useMockData();
        }
      });
    } catch (error) {
      console.error('Error fetching CSV:', error);
      setError('Failed to fetch data from Google Sheets');
      useMockData();
    }
    setLoading(false);
  };


  // Calculate statistics from payment data
  const calculateStats = (data) => {
    const monthlyData = data.filter(payment => {
      // Handle different possible timestamp column names
      const timestamp = payment.timestamp || payment.Timestamp || payment.date || payment.Date || payment.time || payment.Time;
      if (!timestamp) return false;
      
      try {
        // Convert timestamp to YYYY-MM format for comparison
        const paymentDate = new Date(timestamp);
        if (isNaN(paymentDate.getTime())) return false; // Invalid date
        
        // Use local date methods to avoid timezone issues
        const paymentYear = paymentDate.getFullYear();
        const paymentMonth = paymentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
        const paymentMonthStr = `${paymentYear}-${paymentMonth.toString().padStart(2, '0')}`;
        
        return paymentMonthStr === selectedMonth;
      } catch (error) {
        return false;
      }
    });

    const totalPayments = monthlyData.length;
    const totalRevenue = monthlyData.reduce((sum, payment) => {
      // Handle different possible amount column names
      const amountStr = payment.amount || payment.Amount || payment.price || payment.Price || '0';
      const amount = parseInt(amountStr.replace('₹', '').replace(',', '').replace(/[^\d]/g, ''));
      return sum + amount;
    }, 0);

    const averageAmount = totalPayments > 0 ? totalRevenue / totalPayments : 0;

    // Find top package
    const packageCounts = {};
    monthlyData.forEach(payment => {
      // Handle different possible package column names
      const packageName = payment.packageName || payment.PackageName || payment.package || payment.Package || payment.service || payment.Service || payment['Package Name'] || 'Unknown';
      packageCounts[packageName] = (packageCounts[packageName] || 0) + 1;
    });
    const topPackage = Object.keys(packageCounts).reduce((a, b) => 
      packageCounts[a] > packageCounts[b] ? a : b, '');

    // Calculate package distribution
    const packageDistribution = {};
    Object.keys(packageCounts).forEach(pkg => {
      packageDistribution[pkg] = {
        count: packageCounts[pkg],
        percentage: Math.round((packageCounts[pkg] / totalPayments) * 100)
      };
    });

    // Analyze payment methods (UPI providers)
    const paymentMethods = {};
    monthlyData.forEach(payment => {
      // Handle different possible UPI column names
      const upiId = payment.upiId || payment.UpiId || payment.upi || payment.UPI || payment.paymentMethod || payment.PaymentMethod || payment['UPI ID'] || '';
      const upiProvider = upiId.split('@')[1] || 'Unknown';
      paymentMethods[upiProvider] = (paymentMethods[upiProvider] || 0) + 1;
    });

    // Calculate growth rate (compare with previous month)
    const currentMonth = new Date(selectedMonth + '-01');
    const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const previousMonthStr = `${previousMonth.getFullYear()}-${(previousMonth.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const previousMonthData = data.filter(payment => {
      const timestamp = payment.timestamp || payment.Timestamp || payment.date || payment.Date || payment.time || payment.Time;
      if (!timestamp) return false;
      
      try {
        const paymentDate = new Date(timestamp);
        if (isNaN(paymentDate.getTime())) return false;
        
        const paymentYear = paymentDate.getFullYear();
        const paymentMonth = paymentDate.getMonth() + 1;
        const paymentMonthStr = `${paymentYear}-${paymentMonth.toString().padStart(2, '0')}`;
        return paymentMonthStr === previousMonthStr;
      } catch (error) {
        return false;
      }
    });
    
    const previousMonthPayments = previousMonthData.length;
    const growthRate = previousMonthPayments > 0 
      ? ((totalPayments - previousMonthPayments) / previousMonthPayments) * 100 
      : 0;

    // Calculate conversion rate (simplified - assuming QR generation means intent to pay)
    const totalIntentions = data.filter(payment => {
      const timestamp = payment.timestamp || payment.Timestamp || payment.date || payment.Date || payment.time || payment.Time;
      if (!timestamp) return false;
      
      try {
        const paymentDate = new Date(timestamp);
        if (isNaN(paymentDate.getTime())) return false;
        
        const paymentYear = paymentDate.getFullYear();
        const paymentMonth = paymentDate.getMonth() + 1;
        const paymentMonthStr = `${paymentYear}-${paymentMonth.toString().padStart(2, '0')}`;
        const qrTime = payment.qrGeneratedTime || payment.QrGeneratedTime || payment.qrTime || payment.QrTime || payment['QR Generated Time'];
        return paymentMonthStr === selectedMonth && qrTime;
      } catch (error) {
        return false;
      }
    }).length;
    
    const conversionRate = totalIntentions > 0 ? (totalPayments / totalIntentions) * 100 : 0;

    setStats({
      totalPayments,
      totalRevenue,
      averageAmount,
      topPackage,
      monthlyData,
      packageDistribution,
      paymentMethods,
      growthRate,
      conversionRate
    });
  };

  // Handle month selection
  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  // Export data to CSV
  const exportToCSV = () => {
    if (stats.monthlyData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Date', 'Name', 'Email', 'Phone', 'UPI ID', 'Institution', 'Amount', 'Package Name', 'Transaction ID'];
    const csvContent = [
      headers.join(','),
      ...stats.monthlyData.map(payment => [
        new Date(payment.timestamp).toLocaleDateString(),
        payment.name,
        payment.email,
        payment.phone,
        payment.upiId,
        payment.institution,
        payment.amount,
        payment.packageName,
        payment.transactionId
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment_data_${selectedMonth}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Generate month options (current year from January to current month)
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-11
    
    // Start from January of current year
    for (let month = 0; month <= currentMonth; month++) {
      const date = new Date(currentYear, month, 1);
      // Use local date methods to avoid timezone issues
      const value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    
    // Sort by date (newest first)
    return options.sort((a, b) => new Date(b.value + '-01') - new Date(a.value + '-01'));
  };

  // Helper to generate invoice HTML
  const generateInvoiceHTML = (payment) => {
    const logoUrl = window.location.origin + '/images/logo.jpg';
    const company = {
      name: 'Medistat Solutions',
      address: 'Kochi, Kerala, India',
      email: 'medistatsolutions@gmail.com',
      phone: '+91 9744649329',
      gst: 'GSTIN: 32AAICM1234F1Z5',
    };
    // Use the same fallback logic as the table for all fields
    const timestamp = payment.timestamp || payment.Timestamp || payment.date || payment.Date || payment.time || payment.Time;
    const name = payment.name || payment.Name || payment.customerName || payment.CustomerName || payment['Customer Name'] || '';
    const email = payment.email || payment.Email || '';
    const phone = payment.phone || payment.Phone || payment.phoneNumber || payment.PhoneNumber || payment['Phone Number'] || '';
    const packageName = payment.packageName || payment.PackageName || payment.package || payment.Package || payment.service || payment.Service || payment['Package Name'] || '';
    const amount = payment.amount || payment.Amount || payment.price || payment.Price || '';
    const upiId = payment.upiId || payment.UpiId || payment.upi || payment.UPI || payment.paymentMethod || payment.PaymentMethod || payment['UPI ID'] || '';
    const institution = payment.institution || payment.Institution || '';
    const transactionId = payment.transactionId || payment.TransactionId || payment['Transaction ID'] || '';
    const date = timestamp ? new Date(timestamp).toLocaleDateString() : '';
    return `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; padding-top: 70px;">
        <div style="background: #1e40af; color: white; padding: 24px 32px; display: flex; align-items: center;">
          <img src="${logoUrl}" alt="Medistat Logo" style="height: 48px; margin-right: 20px; border-radius: 8px;" />
          <div>
            <div style="font-size: 1.5rem; font-weight: bold;">${company.name}</div>
            <div style="font-size: 0.95rem; opacity: 0.85;">${company.address}</div>
          </div>
        </div>
        <div style="padding: 32px; background: #f8fafc;">
          <h2 style="margin: 0 0 16px 0; color: #1e293b;">Invoice</h2>
          <table style="width: 100%; margin-bottom: 24px; font-size: 1rem;">
            <tr><td><b>Invoice Date:</b></td><td>${date}</td></tr>
            <tr><td><b>Invoice No:</b></td><td>${transactionId}</td></tr>
          </table>
          <h3 style="margin: 0 0 8px 0; color: #3b82f6;">Billed To</h3>
          <table style="width: 100%; margin-bottom: 24px; font-size: 1rem;">
            <tr><td><b>Name:</b></td><td>${name}</td></tr>
            <tr><td><b>Email:</b></td><td>${email}</td></tr>
            <tr><td><b>Phone:</b></td><td>${phone}</td></tr>
            <tr><td><b>Institution:</b></td><td>${institution}</td></tr>
          </table>
          <h3 style="margin: 0 0 8px 0; color: #3b82f6;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 1rem;">
            <tr style="background: #e2e8f0;">
              <th style="padding: 8px; text-align: left;">Package</th>
              <th style="padding: 8px; text-align: left;">Amount</th>
              <th style="padding: 8px; text-align: left;">UPI ID</th>
            </tr>
            <tr>
              <td style="padding: 8px;">${packageName}</td>
              <td style="padding: 8px;">${amount}</td>
              <td style="padding: 8px;">${upiId}</td>
            </tr>
          </table>
          <div style="margin-top: 32px; color: #64748b; font-size: 0.95rem;">
            <b>${company.name}</b> | ${company.email} | ${company.phone}<br/>
            ${company.gst}
          </div>
        </div>
      </div>
    `;
  };

  // Function to send invoice email (generate PDF, send as base64 to backend)
  const sendInvoice = async (payment, idx) => {
    console.log("Sending invoice", payment, idx);
    console.log(payment['Package Name'])    
    setInvoiceStatus((prev) => ({ ...prev, [idx]: 'sending' }));
    setPdfInvoice({ show: true, payment });
    await new Promise((resolve) => setTimeout(resolve, 200));
    const input = document.getElementById('invoice-pdf-preview');
    if (!input) {
      setInvoiceStatus((prev) => ({ ...prev, [idx]: 'error' }));
      setTimeout(() => setInvoiceStatus((prev) => ({ ...prev, [idx]: undefined })), 4000);
      setPdfInvoice({ show: false, payment: null });
      return;
    }
    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const pdfBlob = pdf.output('blob');
      // Convert PDF blob to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });
      // Send to backend
      const response = await fetch('http://localhost:8000/send-invoice-attachment/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: payment.Email,
          to_name: payment.Name,
          subject: `Your Medistat Invoice - ${payment['Package Name'] || ''}`,
          pdf_base64: base64,
          filename: `Medistat_Invoice_${payment['Transaction ID'] || payment.Name || 'invoice'}.pdf`,
        }),
      });
      if (!response.ok) throw new Error('Failed to send email');
      setInvoiceStatus((prev) => ({ ...prev, [idx]: 'sent' }));
      setTimeout(() => setInvoiceStatus((prev) => ({ ...prev, [idx]: undefined })), 4000);
    } catch (error) {
      setInvoiceStatus((prev) => ({ ...prev, [idx]: 'error' }));
      setTimeout(() => setInvoiceStatus((prev) => ({ ...prev, [idx]: undefined })), 4000);
    }
    setPdfInvoice({ show: false, payment: null });
  };

  // Add downloadInvoice function
  const downloadInvoice = (payment) => {
    const html = generateInvoiceHTML(payment);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Medistat_Invoice_${payment.transactionId || payment.name || 'invoice'}.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Add downloadInvoicePDF function
  const downloadInvoicePDF = async (payment, index) => {
    setPdfInvoice({ show: true, payment });
    setPdfUploadStatus((prev) => ({ ...prev, [index]: { status: 'generating' } }));
    setTimeout(async () => {
      const input = document.getElementById('invoice-pdf-preview');
      if (!input) {
        setPdfUploadStatus((prev) => ({ ...prev, [index]: { status: 'error', error: 'Invoice preview not found' } }));
        setPdfInvoice({ show: false, payment: null });
        return;
      }
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const pdfBlob = pdf.output('blob');
      // Upload to backend
      setPdfUploadStatus((prev) => ({ ...prev, [index]: { status: 'uploading' } }));
      const formData = new FormData();
      formData.append('file', pdfBlob, `Medistat_Invoice_${payment.transactionId || payment.name || 'invoice'}.pdf`);
      try {
        const response = await fetch('http://localhost:8000/upload-invoice/', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        setPdfUploadStatus((prev) => ({ ...prev, [index]: { status: 'done', link: data.link } }));
      } catch (err) {
        setPdfUploadStatus((prev) => ({ ...prev, [index]: { status: 'error', error: err.message } }));
      }
      setPdfInvoice({ show: false, payment: null });
    }, 200); // Wait for DOM render
  };

  useEffect(() => {
    fetchPaymentData();
  }, []);

  useEffect(() => {
    calculateStats(paymentData);
  }, [selectedMonth, paymentData]);

  return (
    <>
      <Helmet>
        <title>Medistat Stats | Research Analytics & Service Insights</title>
        <meta name="description" content="Explore Medistat's research analytics, service usage, and performance insights. Trusted by 500+ researchers and students." />
        <meta property="og:title" content="Medistat Stats | Research Analytics & Service Insights" />
        <meta property="og:description" content="Explore Medistat's research analytics, service usage, and performance insights. Trusted by 500+ researchers and students." />
        <meta property="og:image" content="/images/logo.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://medstat-one.vercel.app/stats" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Medistat Stats | Research Analytics & Service Insights" />
        <meta name="twitter:description" content="Explore Medistat's research analytics, service usage, and performance insights. Trusted by 500+ researchers and students." />
        <meta name="twitter:image" content="/images/logo.jpg" />
      </Helmet>
      <div className="dashboard-container">
        <style jsx>{`
          .dashboard-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          .dashboard-header {
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #e2e8f0;
            padding: 0.75rem 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .header-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .header-left {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .logo {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 1.25rem;
            font-weight: 700;
            color: #1f2937;
          }

          .logo-icon {
            width: 28px;
            height: 28px;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 0.875rem;
          }

          .header-title {
            font-size: 1rem;
            font-weight: 600;
            color: #6b7280;
          }

          .header-actions {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .month-selector {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: white;
            padding: 0.375rem 0.75rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .month-selector label {
            font-weight: 500;
            color: #374151;
            font-size: 0.75rem;
          }

          .month-dropdown {
            padding: 0.375rem 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            background-color: white;
            font-size: 0.75rem;
            color: #374151;
            cursor: pointer;
            min-width: 120px;
            transition: all 0.2s;
          }

          .month-dropdown:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .month-dropdown:hover {
            border-color: #9ca3af;
          }

          .dashboard-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1.5rem;
          }

          .page-title {
            color: #1e293b;
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.375rem;
          }

          .page-subtitle {
            color: #64748b;
            font-size: 1rem;
            margin-bottom: 1.5rem;
          }

          .loading {
            text-align: center;
            padding: 3rem;
            color: #64748b;
          }

          .spinner {
            border: 3px solid #e2e8f0;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .error {
            text-align: center;
            padding: 2rem;
            color: #dc2626;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 12px;
            border: 1px solid #fecaca;
            margin: 1.5rem 0;
          }

          .retry-btn {
            margin-top: 0.75rem;
            padding: 0.5rem 1rem;
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.75rem;
            font-weight: 500;
            transition: all 0.2s;
          }

          .retry-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
          }

          .stat-card {
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
          }

          .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }

          .stat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.75rem;
          }

          .stat-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
          }

          .stat-icon.blue {
            background: linear-gradient(135deg, #3b82f6, #1e40af);
            color: white;
          }

          .stat-icon.green {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
          }

          .stat-icon.purple {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: white;
          }

          .stat-icon.orange {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
          }

          .stat-trend {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.75rem;
            font-weight: 500;
            padding: 0.25rem 0.5rem;
            border-radius: 16px;
            background: rgba(16, 185, 129, 0.1);
            color: #059669;
          }

          .stat-trend.negative {
            background: rgba(239, 68, 68, 0.1);
            color: #dc2626;
          }

          .stat-card h3 {
            margin: 0 0 0.375rem 0;
            color: #6b7280;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.375rem;
            line-height: 1;
          }

          .stat-subtitle {
            color: #6b7280;
            font-size: 0.75rem;
            font-weight: 500;
          }

          .dashboard-sections {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .dashboard-section {
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid #e2e8f0;
          }

          .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
          }

          .section-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: #1f2937;
            display: flex;
            align-items: center;
            gap: 0.375rem;
          }

          .section-icon {
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 0.75rem;
          }

          .package-grid {
            display: grid;
            gap: 0.75rem;
          }

          .package-card {
            padding: 0.75rem;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #f9fafb;
            transition: all 0.2s;
          }

          .package-card:hover {
            border-color: #3b82f6;
            background: white;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
          }

          .package-card h4 {
            margin: 0 0 0.375rem 0;
            color: #1f2937;
            font-size: 0.875rem;
            font-weight: 600;
          }

          .package-stats {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .package-count {
            color: #6b7280;
            font-size: 0.75rem;
            font-weight: 500;
          }

          .package-percentage {
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            color: white;
            padding: 0.125rem 0.5rem;
            border-radius: 16px;
            font-size: 0.625rem;
            font-weight: 600;
          }

          .payment-methods {
            display: grid;
            gap: 0.75rem;
          }

          .payment-method {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 1rem;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #f9fafb;
            transition: all 0.2s;
          }

          .payment-method:hover {
            border-color: #3b82f6;
            background: white;
          }

          .provider-name {
            font-weight: 600;
            color: #1f2937;
          }

          .provider-count {
            color: #6b7280;
            font-size: 0.875rem;
            font-weight: 500;
          }

          .table-section {
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid #e2e8f0;
          }

          .table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }

          .export-btn {
            padding: 0.5rem 1rem;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.75rem;
            font-weight: 500;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.375rem;
          }

          .export-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          }

          .table-container {
            overflow-x: auto;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }

          .payment-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.75rem;
          }

          .payment-table th {
            background: #f9fafb;
            padding: 0.75rem;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
            font-size: 0.75rem;
          }

          .payment-table td {
            padding: 0.75rem;
            border-bottom: 1px solid #e5e7eb;
            color: #1f2937;
          }

          .payment-table tr:hover {
            background: #f9fafb;
          }

          .status-badge {
            padding: 0.125rem 0.5rem;
            border-radius: 16px;
            font-size: 0.625rem;
            font-weight: 600;
          }

          .status-badge.completed {
            background: rgba(16, 185, 129, 0.1);
            color: #059669;
          }

          @media (max-width: 1024px) {
            .dashboard-sections {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 768px) {
            .dashboard-header {
              padding: 1rem;
            }
            
            .header-content {
              flex-direction: column;
              gap: 1rem;
            }
            
            .header-actions {
              width: 100%;
              justify-content: center;
            }
            
            .month-selector {
              width: 100%;
              justify-content: center;
            }
            
            .dashboard-content {
              padding: 1rem;
            }
            
            .page-title {
              font-size: 2rem;
            }
            
            .stats-grid {
              grid-template-columns: 1fr;
            }
            
            .package-grid {
              grid-template-columns: 1fr;
            }
            
            .payment-methods {
              grid-template-columns: 1fr;
            }
            
            .table-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 1rem;
            }
          }

          .payment-method:hover {
            border-color: #3b82f6;
            background: white;
          }

          .ring-chart-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1.5rem;
            margin-top: 0.75rem;
            min-height: 220px;
          }

          .ring-chart {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .ring-segment {
            transition: all 0.3s ease;
          }

          .ring-segment:hover {
            stroke-width: 20;
            cursor: pointer;
          }

          .ring-legend {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            flex: 1;
            max-width: 160px;
          }

          .legend-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.375rem;
            border-radius: 6px;
            transition: all 0.2s;
          }

          .legend-item:hover {
            background: #f8fafc;
          }

          .legend-color {
            width: 12px;
            height: 12px;
            border-radius: 3px;
            flex-shrink: 0;
          }

          .legend-text {
            flex: 1;
            min-width: 0;
          }

          .legend-provider {
            font-weight: 600;
            color: #1e293b;
            font-size: 0.75rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .legend-count {
            color: #64748b;
            font-size: 0.625rem;
            margin-top: 0.125rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .chart-section {
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .chart-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1.5rem;
            width: 100%;
            max-width: 400px;
          }
        `}</style>
        
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <div className="logo">
                <div className="p-1 rounded-lg">
                  <img
                    src="/images/logo.jpg"
                    alt="Medistat Logo"
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <span>MediStat Solutions</span>
              </div>
              <div className="header-title">Payment Analytics Dashboard</div>
            </div>
            <div className="header-actions">
              <div className="month-selector">
                <label htmlFor="month-select">Month:</label>
                <select 
                  id="month-select"
                  value={selectedMonth} 
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="month-dropdown"
                >
                  {generateMonthOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          <div className="page-title">Payment Analytics</div>
          <div className="page-subtitle">Comprehensive insights into your payment performance</div>

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading payment data...</p>
            </div>
          )}

          {error && (
            <div className="error">
              <p>Error loading data: {error}</p>
              <button onClick={fetchPaymentData} className="retry-btn">Retry</button>
            </div>
          )}

          {!loading && !error && stats && (
            <>
              {/* Statistics Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon blue">📊</div>
                    <div className="stat-trend">
                      {stats.growthRate > 0 ? '+' : ''}{stats.growthRate.toFixed(1)}%
                    </div>
                  </div>
                  <h3>Total Payments</h3>
                  <div className="stat-value">{stats.totalPayments}</div>
                  <div className="stat-subtitle">vs last month</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon green">💰</div>
                  </div>
                  <h3>Total Revenue</h3>
                  <div className="stat-value">₹{stats.totalRevenue.toLocaleString()}</div>
                  <div className="stat-subtitle">Avg: ₹{stats.averageAmount.toLocaleString()}</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon purple">🏆</div>
                  </div>
                  <h3>Top Package</h3>
                  <div className="stat-value">{stats.topPackage}</div>
                  <div className="stat-subtitle">
                    {stats.packageDistribution[stats.topPackage]?.count || 0} orders
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon orange">📈</div>
                  </div>
                  <h3>Conversion Rate</h3>
                  <div className="stat-value">{stats.conversionRate.toFixed(1)}%</div>
                  <div className="stat-subtitle">QR to Payment</div>
                </div>
              </div>

              {/* Package Distribution & Payment Methods */}
              <div className="dashboard-sections">
                <div className="dashboard-section">
                  <div className="section-header">
                    <div className="section-title">
                      <div className="section-icon">📦</div>
                      Package Distribution
                    </div>
                  </div>
                  <div className="package-grid">
                    {Object.entries(stats.packageDistribution).map(([pkg, data]) => (
                      <div key={pkg} className="package-card">
                        <h4>{pkg}</h4>
                        <div className="package-stats">
                          <span className="package-count">{data.count} orders</span>
                          <span className="package-percentage">{data.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-section">
                  <div className="section-header">
                    <div className="section-title">
                      <div className="section-icon">💳</div>
                      Payment Methods
                    </div>
                  </div>
                  {Object.keys(stats.paymentMethods).length > 0 ? (
                    <div className="chart-content">
                      <RingChart data={stats.paymentMethods} size={220} strokeWidth={18} />
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No payment data available for this month
                    </div>
                  )}
                </div>
              </div>

              {/* Payment History Table */}
              <div className="table-section">
                <div className="table-header">
                  <div className="section-title">
                    <div className="section-icon">📋</div>
                    Payment History
                  </div>
                  <button onClick={exportToCSV} className="export-btn">
                    📥 Export to CSV
                  </button>
                </div>
                
                <div className="table-container">
                  <table className="payment-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Package</th>
                        <th>Amount</th>
                        <th>UPI ID</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.monthlyData.map((payment, index) => {
                        // Handle different possible column names
                        const timestamp = payment.timestamp || payment.Timestamp || payment.date || payment.Date || payment.time || payment.Time;
                        const name = payment.name || payment.Name || payment.customerName || payment.CustomerName || payment['Customer Name'] || '';
                        const email = payment.email || payment.Email || '';
                        const phone = payment.phone || payment.Phone || payment.phoneNumber || payment.PhoneNumber || payment['Phone Number'] || '';
                        const packageName = payment.packageName || payment.PackageName || payment.package || payment.Package || payment.service || payment.Service || payment['Package Name'] || '';
                        const amount = payment.amount || payment.Amount || payment.price || payment.Price || '';
                        const upiId = payment.upiId || payment.UpiId || payment.upi || payment.UPI || payment.paymentMethod || payment.PaymentMethod || payment['UPI ID'] || '';
                        
                        return (
                          <tr key={index}>
                            <td>{timestamp ? new Date(timestamp).toLocaleDateString() : ''}</td>
                            <td>{name}</td>
                            <td>{email}</td>
                            <td>{phone}</td>
                            <td>{packageName}</td>
                            <td>{amount}</td>
                            <td>{upiId}</td>
                            <td>
                              <span className="status-badge completed">Completed</span>
                              <span style={{ display: 'inline-flex', gap: 4, marginLeft: 8 }}>
                                <button
                                  style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', borderRadius: 4, border: 'none', background: '#f59e0b', color: 'white', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                  onClick={() => downloadInvoicePDF(payment, index)}
                                  title="Download Invoice PDF"
                                  disabled={pdfUploadStatus[index]?.status === 'generating' || pdfUploadStatus[index]?.status === 'uploading'}
                                >
                                  <Download size={14} />
                                </button>
                                <button
                                  style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', borderRadius: 4, border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                  onClick={() => sendInvoice(payment, index)}
                                  disabled={invoiceStatus[index] === 'sending'}
                                  title="Send Invoice"
                                >
                                  {invoiceStatus[index] === 'sending' ? 'Sending...' : invoiceStatus[index] === 'sent' ? 'Sent!' : invoiceStatus[index] === 'error' ? 'Error' : (<><span>Send Invoice</span></>)}
                                </button>
                                {pdfUploadStatus[index]?.status === 'done' && pdfUploadStatus[index]?.link && (
                                  <a href={pdfUploadStatus[index].link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#10b981', marginLeft: 4, display: 'none' }}>View PDF</a>
                                )}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Render hidden invoice for PDF generation */}
      {pdfInvoice.show && (
        <div style={{ position: 'fixed', left: '-9999px', top: 0, width: 800, zIndex: -1, background: 'white' }}>
          <div id="invoice-pdf-preview" dangerouslySetInnerHTML={{ __html: generateInvoiceHTML(pdfInvoice.payment) }} />
        </div>
      )}
    </>
  );
};

export default Stats; 