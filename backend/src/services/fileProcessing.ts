import { FileProcessingResult, UsageRecord, validateUsageRecord, parseJSONL } from '@better-ccusage-ui/shared';

export class FileProcessingService {
  /**
   * Process uploaded JSONL file and extract usage records
   */
  async processFile(file: Express.Multer.File): Promise<FileProcessingResult> {
    const startTime = Date.now();
    const records: UsageRecord[] = [];
    const errors: string[] = [];

    try {
      const content = file.buffer.toString('utf-8');
      const lines = content.trim().split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
          const jsonData = JSON.parse(line);
          const record = validateUsageRecord(jsonData);

          if (record) {
            records.push(record);
          } else {
            errors.push(`Line ${i + 1}: Invalid record structure`);
          }
        } catch (parseError) {
          errors.push(`Line ${i + 1}: JSON parsing error - ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }
      }

      const processingTime = Date.now() - startTime;

      return {
        records,
        totalRecords: records.length,
        processingTime,
        errors,
      };

    } catch (error) {
      errors.push(`File processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);

      return {
        records: [],
        totalRecords: 0,
        processingTime: Date.now() - startTime,
        errors,
      };
    }
  }

  /**
   * Validate JSONL file structure without full processing
   */
  async validateFile(file: Express.Multer.File): Promise<boolean> {
    try {
      const content = file.buffer.toString('utf-8');
      const lines = content.trim().split('\n');

      // Check if file is empty
      if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === '')) {
        return false;
      }

      // Validate each line is valid JSON
      let validLines = 0;
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        try {
          JSON.parse(trimmedLine);
          validLines++;
        } catch {
          return false;
        }
      }

      // File is valid if at least one line contains valid JSON
      return validLines > 0;

    } catch {
      return false;
    }
  }

  /**
   * Get file statistics before processing
   */
  async getFileStats(file: Express.Multer.File): Promise<{
    size: number;
    lineCount: number;
    estimatedRecords: number;
  }> {
    try {
      const content = file.buffer.toString('utf-8');
      const lines = content.trim().split('\n');
      const nonEmptyLines = lines.filter(line => line.trim().length > 0);

      return {
        size: file.size,
        lineCount: lines.length,
        estimatedRecords: nonEmptyLines.length,
      };

    } catch {
      return {
        size: file.size,
        lineCount: 0,
        estimatedRecords: 0,
      };
    }
  }
}