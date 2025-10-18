import { Router, Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { FileProcessingService } from '../services/fileProcessing';
import { ApiResponse, FileProcessingResult } from '@better-ccusage-ui/shared';

const uploadRouter = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept JSONL files
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.jsonl')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSONL files are allowed'));
    }
  },
});

// Request schema validation
const UploadRequestSchema = z.object({
  // File will be processed via multer
});

// POST /api/upload/process - Process uploaded JSONL file
uploadRouter.post('/process', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      } as ApiResponse<never>);
    }

    const fileProcessingService = new FileProcessingService();
    const result: FileProcessingResult = await fileProcessingService.processFile(req.file);

    if (result.errors.length > 0 && result.records.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Failed to process file',
        message: result.errors.join(', '),
      } as ApiResponse<never>);
    }

    res.json({
      success: true,
      data: result,
      message: `Successfully processed ${result.records.length} records`,
    } as ApiResponse<FileProcessingResult>);

  } catch (error) {
    console.error('File processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse<never>);
  }
});

// POST /api/upload/validate - Validate JSONL content without processing
uploadRouter.post('/validate', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      } as ApiResponse<never>);
    }

    const fileProcessingService = new FileProcessingService();
    const isValid = await fileProcessingService.validateFile(req.file);

    res.json({
      success: true,
      data: { isValid },
      message: isValid ? 'File is valid JSONL' : 'File contains invalid JSONL data',
    } as ApiResponse<{ isValid: boolean }>);

  } catch (error) {
    console.error('File validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse<never>);
  }
});

export { uploadRouter };