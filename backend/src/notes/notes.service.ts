import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string, search?: string) {
    return this.prisma.note.findMany({
      where: {
        userId,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  create(userId: string, dto: CreateNoteDto) {
    return this.prisma.note.create({
      data: {
        userId,
        title: dto.title ?? 'Без названия',
        content: dto.content ?? '',
        mood: dto.mood,
        color: dto.color ?? '#6366f1',
        pinned: dto.pinned ?? false,
        tags: dto.tags ?? [],
      },
    });
  }

  async update(userId: string, noteId: string, dto: UpdateNoteDto) {
    await this.ensureOwnership(userId, noteId);
    return this.prisma.note.update({
      where: { id: noteId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.mood !== undefined && { mood: dto.mood }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.pinned !== undefined && { pinned: dto.pinned }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
      },
    });
  }

  async remove(userId: string, noteId: string) {
    await this.ensureOwnership(userId, noteId);
    return this.prisma.note.delete({ where: { id: noteId } });
  }

  private async ensureOwnership(userId: string, noteId: string) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
      select: { userId: true },
    });
    if (!note || note.userId !== userId)
      throw new NotFoundException('Note not found');
    return note;
  }
}
