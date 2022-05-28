import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schemas/roles.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Role.name, schema: RoleSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    exports: [RolesService],
    providers: [RolesService],
    controllers: [RolesController],
})
export class RolesModule {}
