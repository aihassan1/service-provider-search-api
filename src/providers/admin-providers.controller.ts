import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ProvidersService } from './providers.service';

@ApiTags('Admin - Providers')
@Controller({
  path: 'admin/providers',
  version: '1',
})
export class AdminProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload and import service providers from Excel file',
    description:
      'Upload an Excel file (.xlsx) containing service provider data. The file will be parsed and all providers will be imported into the database.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel file (.xlsx)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File uploaded and processed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        imported: { type: 'number' },
        failed: { type: 'number' },
        total: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file or file structure',
  })
  async uploadExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    if (
      !file.originalname.endsWith('.xlsx') &&
      !file.originalname.endsWith('.xls')
    ) {
      throw new BadRequestException(
        'Invalid file type. Only Excel files (.xlsx, .xls) are allowed',
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    const result = await this.providersService.importFromExcel(file.buffer);

    return {
      message: 'File processed successfully',
      ...result,
    };
  }

  @Delete('clear')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clear all service providers',
    description:
      'Delete all service providers from the database. This action cannot be undone.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All providers cleared successfully',
  })
  async clearAll() {
    await this.providersService.clearAll();
    return {
      message: 'All service providers have been cleared',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a service provider by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Provider deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Provider not found',
  })
  async remove(@Param('id') id: string) {
    await this.providersService.remove(id);
    return {
      message: 'Service provider deleted successfully',
    };
  }
}
