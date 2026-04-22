import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@ApiTags('notes')
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notes (optional search)' })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(@CurrentUser() user: JwtPayload, @Query('search') search?: string) {
    return this.notesService.findAll(user.sub, search);
  }

  @Post()
  @ApiOperation({ summary: 'Create a note' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateNoteDto) {
    return this.notesService.create(user.sub, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a note' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a note' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notesService.remove(user.sub, id);
  }
}
