import { Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';

export interface ParsedProvider {
  providerName: string;
  providerType: string;
  servicesProvided: string;
  specialization: string;
  address: string;
  city: string;
  province: string;
  phoneNumber: string | null;
}

@Injectable()
export class ExcelParserService {
  private readonly logger = new Logger(ExcelParserService.name);

  /**
   * Parse Excel file buffer and extract service provider data
   * @param buffer Excel file buffer
   * @returns Array of parsed service providers
   */
  parseExcelFile(buffer: Buffer): ParsedProvider[] {
    try {
      // Read the workbook from buffer
      const workbook = XLSX.read(buffer, { type: 'buffer' });

      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON with header row
      const rawData: any[] = XLSX.utils.sheet_to_json(worksheet);

      this.logger.log(`Parsed ${rawData.length} rows from Excel file`);

      // Map the Arabic column names to our entity fields
      const providers: ParsedProvider[] = rawData.map((row) => {
        return {
          providerName: this.cleanString(row['مقدم الخدمة']),
          providerType: this.cleanString(row['نوع مقدم الخدمة']),
          servicesProvided: this.cleanString(row['الخدمات المقدمة']),
          specialization: this.cleanString(row['التخصص']),
          address: this.cleanString(row['العنوان']),
          city: this.cleanString(row['المنطقة / المدينة']),
          province: this.cleanString(row['المحافظة']),
          phoneNumber: this.cleanPhoneNumber(row['Tel. no. - التليفون']),
        };
      });

      // Filter out any invalid entries
      const validProviders = providers.filter((p) => {
        return (
          p.providerName &&
          p.providerType &&
          p.servicesProvided &&
          p.specialization &&
          p.address &&
          p.city &&
          p.province
        );
      });

      this.logger.log(
        `Validated ${validProviders.length} providers out of ${providers.length}`,
      );

      return validProviders;
    } catch (error) {
      this.logger.error('Error parsing Excel file', error);
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  }

  /**
   * Clean string values by trimming and removing extra whitespace
   */
  private cleanString(value: any): string {
    if (!value) return '';
    return String(value).trim().replace(/\s+/g, ' ');
  }

  /**
   * Clean and format phone number
   */
  private cleanPhoneNumber(value: any): string | null {
    if (!value) return null;
    const cleaned = String(value).trim();
    return cleaned || null;
  }

  /**
   * Validate Excel file structure
   * @param buffer Excel file buffer
   * @returns true if valid, throws error if invalid
   */
  validateExcelStructure(buffer: Buffer): boolean {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Get the first row (headers)
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      const headers: string[] = [];

      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          headers.push(String(cell.v));
        }
      }

      // Expected headers in Arabic
      const expectedHeaders = [
        'مقدم الخدمة',
        'نوع مقدم الخدمة',
        'الخدمات المقدمة',
        'التخصص',
        'العنوان',
        'المنطقة / المدينة',
        'المحافظة',
        'Tel. no. - التليفون',
      ];

      // Check if all expected headers are present
      const missingHeaders = expectedHeaders.filter(
        (header) => !headers.includes(header),
      );

      if (missingHeaders.length > 0) {
        throw new Error(
          `Missing required columns: ${missingHeaders.join(', ')}`,
        );
      }

      this.logger.log('Excel file structure validated successfully');
      return true;
    } catch (error) {
      this.logger.error('Excel validation failed', error);
      throw error;
    }
  }
}
