import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/service";

// TO BE DELETED AFTER SEEDING
@Injectable()
export class AdminService {
  constructor(private readonly userService: UsersService) {}

  // async seedSuperAdmin() {
  //   await this.userService.create({
  //     name: "superadmin",
  //     email: "super@admin.com",
  //     password: "admin",
  //     role: "superadmin",
  //   });
  // }
}
