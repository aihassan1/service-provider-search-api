import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { ProvidersService } from './providers.service';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';
import { UpdateServiceProviderDto } from './dto/update-service-provider.dto';

@ApiTags('Admin - Providers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(RoleEnum.admin)
@Controller({
  path: 'admin/providers',
  version: '1',
})
export class AdminProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new service provider',
    description:
      'Create a single service provider. Requires admin authentication.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Provider created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Admin access required',
  })
  async create(@Body() createDto: CreateServiceProviderDto) {
    const provider = await this.providersService.create(createDto);
    return {
      message: 'Service provider created successfully',
      data: provider,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a service provider',
    description:
      'Update an existing service provider by ID. Requires admin authentication.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Provider updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Provider not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Admin access required',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateServiceProviderDto,
  ) {
    const provider = await this.providersService.update(id, updateDto);
    return {
      message: 'Service provider updated successfully',
      data: provider,
    };
  }

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload and import service providers from Excel file',
    description:
      'Upload an Excel file (.xlsx) containing service provider data. The file will be parsed and all providers will be imported into the database. Requires admin authentication.',
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
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Admin access required',
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
      'Delete all service providers from the database. This action cannot be undone. Requires admin authentication.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All providers cleared successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Admin access required',
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
    description:
      'Delete a specific service provider. Requires admin authentication.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Provider deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Provider not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Admin access required',
  })
  async remove(@Param('id') id: string) {
    await this.providersService.remove(id);
    return {
      message: 'Service provider deleted successfully',
    };
  }
}
