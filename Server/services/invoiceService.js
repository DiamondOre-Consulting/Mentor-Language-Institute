import PDFDocument from "pdfkit";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const formatMonth = (monthNumber) => {
  if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    return "N/A";
  }
  return monthNames[monthNumber - 1];
};

const formatDate = (date) => {
  const value = date instanceof Date ? date : new Date(date);
  return value.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const getCurrencySymbol = (currency = "INR") => {
  if (currency === "INR") return "Rs";
  return currency;
};

const formatCurrency = (amount, currency = "INR") => {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const symbol = getCurrencySymbol(currency);
  try {
    const formatted = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
    return `${symbol} ${formatted}`;
  } catch (error) {
    return `${symbol} ${safeAmount.toFixed(2)}`;
  }
};

export const generateInvoiceNumber = (issuedAt = new Date()) => {
  const datePart = issuedAt.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `INV-${datePart}-${randomPart}`;
};

export const generateInvoicePdfBuffer = ({
  invoiceNumber,
  issuedAt,
  studentName,
  studentEmail,
  classTitle,
  feeMonth,
  totalFee,
  amountPaid,
  currency = "INR",
}) =>
  new Promise((resolve, reject) => {
    const document = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];

    document.on("data", (chunk) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);

    const instituteName =
      process.env.INVOICE_COMPANY_NAME || "Mentor Language Institute";
    const instituteAddress =
      process.env.INVOICE_COMPANY_ADDRESS || "Main Branch";
    const institutePhone = process.env.INVOICE_COMPANY_PHONE || "";
    const instituteEmail =
      process.env.INVOICE_COMPANY_EMAIL ||
      process.env.MAIL_FROM_ADDRESS ||
      "";

    const left = document.page.margins.left;
    const right = document.page.width - document.page.margins.right;
    const pageWidth = right - left;

    const safeTotalFee = Number.isFinite(Number(totalFee)) ? Number(totalFee) : 0;
    const safeAmountPaid = Number.isFinite(Number(amountPaid))
      ? Number(amountPaid)
      : 0;
    const paymentStatus =
      safeTotalFee > 0 && safeAmountPaid >= safeTotalFee
        ? "Paid"
        : safeAmountPaid > 0
          ? "Partial"
          : "Pending";

    document.fillColor("#111").fontSize(20).text(instituteName, left, 50);
    document.fillColor("#555").fontSize(10).text(instituteAddress, left);
    if (institutePhone) {
      document.text(`Phone: ${institutePhone}`, left);
    }
    if (instituteEmail) {
      document.text(`Email: ${instituteEmail}`, left);
    }

    document.fillColor("#111").fontSize(24).text("INVOICE", left, 50, {
      align: "right",
    });
    document
      .fillColor("#555")
      .fontSize(10)
      .text(`Invoice No: ${invoiceNumber}`, { align: "right" });
    document.text(`Invoice Date: ${formatDate(issuedAt)}`, {
      align: "right",
    });

    const dividerY = document.y + 12;
    document
      .strokeColor("#e5e7eb")
      .lineWidth(1)
      .moveTo(left, dividerY)
      .lineTo(right, dividerY)
      .stroke();

    document.y = dividerY + 16;
    const columnGap = 24;
    const columnWidth = (pageWidth - columnGap) / 2;
    const leftColumnX = left;
    const rightColumnX = left + columnWidth + columnGap;
    const infoStartY = document.y;

    document
      .fillColor("#111")
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Bill To", leftColumnX, infoStartY);
    document.font("Helvetica").fillColor("#555").fontSize(10);
    document.text(studentName || "Student", leftColumnX, document.y + 4, {
      width: columnWidth,
    });
    if (studentEmail) {
      document.text(studentEmail, leftColumnX, document.y + 2, {
        width: columnWidth,
      });
    }
    const leftEndY = document.y;

    document.y = infoStartY;
    document
      .fillColor("#111")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Invoice Details", rightColumnX, infoStartY);
    document.font("Helvetica").fillColor("#555").fontSize(10);
    document.text(`Course: ${classTitle || "Course"}`, rightColumnX, document.y + 4, {
      width: columnWidth,
    });
    document.text(`Fee Month: ${formatMonth(feeMonth)}`, rightColumnX, document.y + 2, {
      width: columnWidth,
    });
    document.text(`Currency: ${getCurrencySymbol(currency)}`, rightColumnX, document.y + 2, {
      width: columnWidth,
    });
    const rightEndY = document.y;

    document.y = Math.max(leftEndY, rightEndY) + 16;

    const tableTop = document.y;
    const rowHeight = 26;
    const tableColumns = ["Description", "Fee Month", "Amount"];
    const colRatios = [0.6, 0.2, 0.2];
    const colWidths = colRatios.map((ratio) => ratio * pageWidth);
    const colX = colWidths.reduce((positions, width, index) => {
      const nextX = index === 0 ? left : positions[index - 1] + colWidths[index - 1];
      positions.push(nextX);
      return positions;
    }, []);

    const trimTextToWidth = (text, width) => {
      if (!text) return "";
      if (document.widthOfString(text) <= width) {
        return text;
      }
      const ellipsis = "...";
      let trimmed = text;
      while (trimmed.length > 0 && document.widthOfString(trimmed + ellipsis) > width) {
        trimmed = trimmed.slice(0, -1);
      }
      return trimmed.length ? `${trimmed}${ellipsis}` : ellipsis;
    };

    const drawRow = (y, values, options = {}) => {
      const isHeader = options.isHeader;
      if (isHeader) {
        document.rect(left, y, pageWidth, rowHeight).fill("#f3f4f6");
      }
      document
        .strokeColor("#e5e7eb")
        .lineWidth(1)
        .rect(left, y, pageWidth, rowHeight)
        .stroke();
      document
        .fillColor("#111")
        .font(isHeader ? "Helvetica-Bold" : "Helvetica")
        .fontSize(10);

      const cells = colWidths.map((_, index) => values[index] ?? "");
      cells.forEach((value, index) => {
        const align = index >= 2 ? "right" : "left";
        const padding = 6;
        const cellWidth = colWidths[index] - padding * 2;
        const textValue = trimTextToWidth(String(value ?? ""), cellWidth);
        document.text(textValue, colX[index] + padding, y + 7, {
          width: cellWidth,
          align,
          lineBreak: false,
        });
      });
    };

    drawRow(tableTop, tableColumns, { isHeader: true });
    drawRow(tableTop + rowHeight, [
      classTitle || "Course Fee",
      formatMonth(feeMonth),
      formatCurrency(safeTotalFee, currency),
    ]);

    document.y = tableTop + rowHeight * 2 + 16;

    const summaryWidth = 240;
    const summaryX = right - summaryWidth;
    const summaryY = document.y;
    const summaryRowHeight = 22;

    const drawSummaryRow = (label, value, y, bold = false) => {
      document
        .fillColor("#111")
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(10)
        .text(label, summaryX, y, { width: summaryWidth * 0.55 });
      document
        .fillColor("#111")
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .text(value, summaryX, y, {
          width: summaryWidth,
          align: "right",
        });
    };

    drawSummaryRow("Subtotal", formatCurrency(safeTotalFee, currency), summaryY);
    drawSummaryRow(
      "Amount Paid",
      formatCurrency(safeAmountPaid, currency),
      summaryY + summaryRowHeight
    );
    drawSummaryRow(
      "Status",
      paymentStatus,
      summaryY + summaryRowHeight * 3
    );

    document.y = summaryY + summaryRowHeight * 4 + 24;
    document
      .fillColor("#555")
      .fontSize(9)
      .text(
        "If you have questions about this invoice, please contact the institute.",
        left,
        document.y,
        { align: "center" }
      );

    document
      .fillColor("#777")
      .fontSize(9)
      .text("Thank you for your payment.", { align: "center" });

    document.end();
  });
