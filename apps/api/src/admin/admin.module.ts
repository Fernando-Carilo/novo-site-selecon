import { Module } from "@nestjs/common";
import { AdminDashboardController } from "./dashboard.controller.js";
import { AdminPermissionsController } from "./permissions.controller.js";
import { AdminUsersController } from "./users.controller.js";
import { UsersService } from "./users.service.js";

@Module({
  controllers: [AdminDashboardController, AdminUsersController, AdminPermissionsController],
  providers: [UsersService],
})
export class AdminModule {}
