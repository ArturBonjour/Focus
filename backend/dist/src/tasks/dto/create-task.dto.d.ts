import { TaskPriority, TaskStatus } from '@prisma/client';
export declare class SubtaskDto {
    id: string;
    title: string;
    done: boolean;
}
export declare class CreateTaskDto {
    title: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    deadline?: string;
    tags?: string[];
    subtasks?: SubtaskDto[];
}
export declare function isSubtaskDto(v: unknown): v is SubtaskDto;
