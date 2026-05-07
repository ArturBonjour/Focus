"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateHabitDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_habit_dto_1 = require("./create-habit.dto");
class UpdateHabitDto extends (0, mapped_types_1.PartialType)(create_habit_dto_1.CreateHabitDto) {
}
exports.UpdateHabitDto = UpdateHabitDto;
//# sourceMappingURL=update-habit.dto.js.map